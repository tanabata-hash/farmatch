import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// サイト内メッセージAPI（クローズドチャット）
//
// 通信の秘密を守るため、次のルールを徹底する：
//   ・ログインユーザーが会話の当事者（owner_id / seeker_id）である場合のみ読み書きを許可
//   ・運営者向けの閲覧・一覧・エクスポート機能は設けない
//   ・通知メールにはメッセージ本文を含めない
// ─────────────────────────────────────────────────────────────

const MAX_BODY_LENGTH = 2000;
const MAX_MESSAGES_PER_WINDOW = 20;      // 同一ユーザーの送信上限（10分あたり）
const MESSAGE_WINDOW_MINUTES = 10;
const MAX_NEW_CONVERSATIONS_PER_DAY = 10; // 同一ユーザーの新規会話作成上限（24時間あたり）

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getAuthedUser(supabase, req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// 外部キー制約のため、public.usersに行が無いユーザーは最小限の行を作成しておく
async function ensureUserRow(supabase, authUser) {
  const { data } = await supabase.from("users").select("id").eq("id", authUser.id).maybeSingle();
  if (data) return;
  const meta = authUser.user_metadata || {};
  await supabase.from("users").insert([{
    id: authUser.id, email: authUser.email, name: meta.name || "", role: meta.role || "seeker",
  }]);
}

async function sendNewMessageNotification({ toEmail, targetName }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromAddress || !toEmail) return;
  const siteUrl = process.env.SITE_URL || "https://farmatch.net";
  const safeTarget = String(targetName ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

  // 本文は含めない（通信内容をメールで第三者のサーバーに複製しないため）
  const html = `
    <p>Farmatchで「${safeTarget}」に関する新しいメッセージが届いています。</p>
    <p>内容は、Farmatchにログインし、画面上部の「💬 メッセージ」からご確認ください。</p>
    <p><a href="${siteUrl}">${siteUrl}</a></p>
    <p style="color:#888;font-size:12px">このメールは送信専用です。返信いただいても相手の方には届きません。<br>
    Farmatchは当事者間のやり取りや契約には関与しません。</p>
  `;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to: toEmail,
        subject: "【Farmatch】新着メッセージがあります",
        html,
      }),
    });
  } catch (err) {
    console.error("Resend notification failed:", err.message);
  }
}

function isParticipant(conv, userId) {
  return conv && (conv.owner_id === userId || conv.seeker_id === userId);
}

async function checkSendRateLimit(supabase, userId) {
  const since = new Date(Date.now() - MESSAGE_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase.from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", userId).gte("created_at", since);
  return (count || 0) < MAX_MESSAGES_PER_WINDOW;
}

// 相手に未読メッセージが既にある場合は通知を送らない（連投による通知メールの大量送信を防ぐ）
async function notifyIfFirstUnread(supabase, conv, senderId, newMessageId) {
  const recipientId = conv.owner_id === senderId ? conv.seeker_id : conv.owner_id;
  const { count } = await supabase.from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conv.id).neq("sender_id", recipientId)
    .is("read_at", null).neq("id", newMessageId);
  if ((count || 0) > 0) return;
  const { data: recipient } = await supabase.from("users").select("email").eq("id", recipientId).maybeSingle();
  await sendNewMessageNotification({ toEmail: recipient?.email, targetName: conv.target_name });
}

function validateBody(body) {
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) return { error: "メッセージを入力してください" };
  if (text.length > MAX_BODY_LENGTH) return { error: `メッセージは${MAX_BODY_LENGTH}文字以内で入力してください` };
  return { text };
}

export default async function handler(req, res) {
  const supabase = getServiceClient();
  const authUser = await getAuthedUser(supabase, req);
  if (!authUser) return res.status(401).json({ error: "ログインが必要です" });
  const userId = authUser.id;

  // ── 取得 ─────────────────────────────────────────
  if (req.method === "GET") {
    const conversationId = req.query?.conversationId;

    // 未読件数のみ（ヘッダーのバッジ用）
    if (req.query?.summary === "1") {
      const { data: convs } = await supabase.from("conversations")
        .select("id").or(`owner_id.eq.${userId},seeker_id.eq.${userId}`);
      const ids = (convs || []).map((c) => c.id);
      if (ids.length === 0) return res.status(200).json({ unread: 0 });
      const { count } = await supabase.from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids).neq("sender_id", userId).is("read_at", null);
      return res.status(200).json({ unread: count || 0 });
    }

    // 1つの会話のメッセージ一覧（開いた時点で相手からのメッセージを既読にする）
    if (conversationId) {
      const { data: conv } = await supabase.from("conversations").select("*").eq("id", conversationId).maybeSingle();
      if (!isParticipant(conv, userId)) return res.status(404).json({ error: "会話が見つかりません" });

      await supabase.from("messages").update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId).neq("sender_id", userId).is("read_at", null);

      const { data: msgs, error } = await supabase.from("messages")
        .select("id,sender_id,body,created_at,read_at")
        .eq("conversation_id", conversationId).order("created_at", { ascending: true });
      if (error) return res.status(500).json({ error: error.message });

      const otherId = conv.owner_id === userId ? conv.seeker_id : conv.owner_id;
      const { data: other } = await supabase.from("users").select("name").eq("id", otherId).maybeSingle();
      return res.status(200).json({
        conversation: {
          id: conv.id, target_type: conv.target_type, target_name: conv.target_name,
          my_role: conv.owner_id === userId ? "owner" : "seeker",
          other_name: other?.name || (conv.owner_id === userId ? "希望者" : "オーナー"),
        },
        messages: (msgs || []).map((m) => ({ ...m, is_mine: m.sender_id === userId })),
      });
    }

    // 自分が当事者の会話一覧
    const { data: convs, error } = await supabase.from("conversations")
      .select("*").or(`owner_id.eq.${userId},seeker_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const list = convs || [];
    if (list.length === 0) return res.status(200).json([]);

    const ids = list.map((c) => c.id);
    const otherIds = [...new Set(list.map((c) => (c.owner_id === userId ? c.seeker_id : c.owner_id)))];
    const [{ data: unreadRows }, { data: others }] = await Promise.all([
      supabase.from("messages").select("conversation_id")
        .in("conversation_id", ids).neq("sender_id", userId).is("read_at", null),
      supabase.from("users").select("id,name").in("id", otherIds),
    ]);
    const unreadBy = new Map();
    (unreadRows || []).forEach((r) => unreadBy.set(r.conversation_id, (unreadBy.get(r.conversation_id) || 0) + 1));
    const nameBy = new Map((others || []).map((u) => [u.id, u.name]));

    return res.status(200).json(list.map((c) => {
      const iAmOwner = c.owner_id === userId;
      const otherId = iAmOwner ? c.seeker_id : c.owner_id;
      return {
        id: c.id, target_type: c.target_type, target_name: c.target_name,
        my_role: iAmOwner ? "owner" : "seeker",
        other_name: nameBy.get(otherId) || (iAmOwner ? "希望者" : "オーナー"),
        last_message_at: c.last_message_at,
        unread: unreadBy.get(c.id) || 0,
      };
    }));
  }

  // ── 送信 ─────────────────────────────────────────
  if (req.method === "POST") {
    const { action, conversationId, targetType, targetId, body } = req.body || {};
    const { text, error: bodyError } = validateBody(body);
    if (bodyError) return res.status(400).json({ error: bodyError });
    if (!(await checkSendRateLimit(supabase, userId))) {
      return res.status(429).json({ error: "短時間に送信できる回数の上限を超えました。しばらくしてから再度お試しください。" });
    }
    await ensureUserRow(supabase, authUser);

    let conv = null;

    if (action === "start") {
      if (targetType !== "farm" && targetType !== "house") return res.status(400).json({ error: "対象の種類が不正です" });
      if (!targetId) return res.status(400).json({ error: "対象IDが必要です" });
      const table = targetType === "farm" ? "farms" : "houses";
      const idCol = targetType === "farm" ? "farm_id" : "house_id";

      const { data: target } = await supabase.from(table).select("id,name,owner_id,status").eq("id", targetId).maybeSingle();
      if (!target || target.status === "非公開") return res.status(404).json({ error: "物件が見つかりません" });
      if (!target.owner_id) return res.status(400).json({ error: "この物件はオーナー本人の登録ではないため、メッセージを送信できません" });
      if (target.owner_id === userId) return res.status(400).json({ error: "ご自身が登録した物件にはメッセージを送信できません" });

      const { data: existing } = await supabase.from("conversations")
        .select("*").eq("seeker_id", userId).eq(idCol, targetId).maybeSingle();

      if (existing) {
        conv = existing;
      } else {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase.from("conversations")
          .select("id", { count: "exact", head: true }).eq("seeker_id", userId).gte("created_at", since);
        if ((count || 0) >= MAX_NEW_CONVERSATIONS_PER_DAY) {
          return res.status(429).json({ error: "1日に開始できる会話の上限に達しました。明日以降に再度お試しください。" });
        }
        const { data: created, error: createError } = await supabase.from("conversations").insert([{
          target_type: targetType,
          farm_id: targetType === "farm" ? targetId : null,
          house_id: targetType === "house" ? targetId : null,
          target_name: target.name,
          owner_id: target.owner_id,
          seeker_id: userId,
        }]).select("*").single();
        if (createError) return res.status(500).json({ error: createError.message });
        conv = created;
      }
    } else if (action === "reply") {
      if (!conversationId) return res.status(400).json({ error: "会話IDが必要です" });
      const { data: found } = await supabase.from("conversations").select("*").eq("id", conversationId).maybeSingle();
      if (!isParticipant(found, userId)) return res.status(404).json({ error: "会話が見つかりません" });
      conv = found;
    } else {
      return res.status(400).json({ error: "actionが不正です" });
    }

    const { data: msg, error: insertError } = await supabase.from("messages")
      .insert([{ conversation_id: conv.id, sender_id: userId, body: text }])
      .select("id,created_at").single();
    if (insertError) return res.status(500).json({ error: insertError.message });

    await supabase.from("conversations").update({ last_message_at: msg.created_at }).eq("id", conv.id);
    await notifyIfFirstUnread(supabase, conv, userId, msg.id);

    return res.status(200).json({ ok: true, conversationId: conv.id });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
