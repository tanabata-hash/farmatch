// サイト内メッセージ（オーナーと就農・移住希望者の双方向のやり取り）の処理本体。
//
// Vercel Hobbyプランのサーバーレス関数数の上限に収めるため、独立したエンドポイントは作らず、
// api/my/inquiries.js から ?resource=conversations で呼び出される（先頭が _ のファイルは
// 関数として公開されない）。認証は呼び出し元でSupabaseセッションを検証済みで、userIdが渡される。
//
// 重要：テーブルへの直接アクセス権限は誰にも付与していないため、「当事者だけが読める」ことは
// このファイルの当事者チェック（loadParticipantConversation）で担保している。
// 運営者向けにメッセージ本文を閲覧するAPI・画面は意図的に設けていない（通信の秘密の尊重）。

const MAX_BODY_LENGTH = 2000;
const SEND_LIMIT = 20;               // 送信者ごと：SEND_WINDOW_MIN分あたりの最大送信数
const SEND_WINDOW_MIN = 10;
const NEW_CONVERSATION_LIMIT = 10;   // 問い合わせ者ごと：24時間あたりの新規スレッド上限
const NOTIFY_THROTTLE_MIN = 15;      // 同じ人が連投した場合に通知メールを間引く間隔
const SITE_URL = "https://www.farmatch.net";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function roleOf(conv, userId) {
  if (conv.owner_id && conv.owner_id === userId) return "owner";
  if (conv.seeker_id && conv.seeker_id === userId) return "seeker";
  return null;
}

// クライアントへ返すスレッド情報（未読判定を含む）
function toClientConversation(conv, userId) {
  const role = roleOf(conv, userId);
  const lastRead = role === "owner" ? conv.owner_last_read_at : conv.seeker_last_read_at;
  const unread = !!conv.last_sender_role && conv.last_sender_role !== role &&
    (!lastRead || new Date(lastRead) < new Date(conv.last_message_at));
  return {
    id: conv.id,
    target_type: conv.target_type,
    farm_id: conv.farm_id,
    house_id: conv.house_id,
    target_name: conv.target_name,
    seeker_name: conv.seeker_name,
    role,
    unread,
    last_message_preview: conv.last_message_preview,
    last_message_at: conv.last_message_at,
    created_at: conv.created_at,
  };
}

// スレッドを取得し、呼び出し者が当事者であることを確認する。
// 存在しない場合と当事者でない場合は同じ結果（null）にして、スレッドの存在を推測させない。
async function loadParticipantConversation(supabase, id, userId) {
  const { data: conv } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
  if (!conv || !roleOf(conv, userId)) return null;
  return conv;
}

async function notifyRecipient(supabase, conv, senderRole) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromAddress) return; // 未設定の場合は通知をスキップ（サイト内では引き続き確認可能）

  const recipientId = senderRole === "seeker" ? conv.owner_id : conv.seeker_id;
  if (!recipientId) return;
  const { data: recipient } = await supabase.from("users").select("email").eq("id", recipientId).maybeSingle();
  if (!recipient?.email) return;

  const senderLabel = senderRole === "seeker"
    ? `${conv.seeker_name || "利用者"}さん`
    : "オーナー";
  const safeTarget = escapeHtml(conv.target_name);
  const subject = `【Farmatch】「${conv.target_name}」についてメッセージが届きました`;
  // 本文・送信者のメールアドレスはメールに含めない（サイト内で確認してもらう）
  const html = `
    <p>Farmatchの${conv.target_type === "farm" ? "農地" : "空き家"}「${safeTarget}」について、${escapeHtml(senderLabel)}からメッセージが届きました。</p>
    <p>内容は、Farmatchにログインし、画面右上の「💬 メッセージ」からご確認・ご返信ください。</p>
    <p><a href="${SITE_URL}">${SITE_URL}</a></p>
    <p style="font-size:12px;color:#666">このメールは送信専用です。返信してもメッセージは相手に届きません。</p>
  `;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromAddress, to: recipient.email, subject, html }),
    });
  } catch (err) {
    console.error("Resend message notification failed:", err.message);
  }
}

// メッセージを1件追加し、スレッドの最終更新・未読状態を更新して、相手に通知する。
async function appendMessage(supabase, conv, userId, role, rawBody) {
  const body = String(rawBody ?? "").replace(/\r\n/g, "\n").trim();
  if (!body) return { status: 400, error: "メッセージを入力してください" };
  if (body.length > MAX_BODY_LENGTH) {
    return { status: 400, error: `メッセージは${MAX_BODY_LENGTH}文字以内で入力してください` };
  }

  const windowStart = new Date(Date.now() - SEND_WINDOW_MIN * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", userId)
    .gte("created_at", windowStart);
  if ((count || 0) >= SEND_LIMIT) {
    return { status: 429, error: "短時間に送信できる件数を超えました。しばらくしてからお試しください。" };
  }

  // 直前のメッセージ（同じ人の連投時に通知メールを間引くため、挿入前に取得する）
  const { data: prev } = await supabase
    .from("messages")
    .select("sender_role,created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: msg, error } = await supabase
    .from("messages")
    .insert([{ conversation_id: conv.id, sender_id: userId, sender_role: role, body }])
    .select()
    .single();
  if (error || !msg) return { status: 500, error: error?.message || "送信に失敗しました" };

  await supabase.from("conversations").update({
    last_message_at: msg.created_at,
    last_message_preview: body.replace(/\s+/g, " ").slice(0, 80),
    last_sender_role: role,
    [`${role}_last_read_at`]: msg.created_at, // 送信者本人にとっては既読
  }).eq("id", conv.id);

  const throttled = prev && prev.sender_role === role &&
    Date.now() - new Date(prev.created_at).getTime() < NOTIFY_THROTTLE_MIN * 60 * 1000;
  if (!throttled) await notifyRecipient(supabase, conv, role);

  return { message: msg };
}

export async function handleConversations(req, res, supabase, userId) {
  const id = typeof req.query?.id === "string" ? req.query.id : null;
  if (id && !UUID_RE.test(id)) return res.status(400).json({ error: "idの形式が正しくありません" });

  // ── スレッド一覧（自分が当事者のもの） ──
  if (req.method === "GET" && !id) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`owner_id.eq.${userId},seeker_id.eq.${userId}`)
      .not("last_sender_role", "is", null)
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json((data || []).map(c => toClientConversation(c, userId)));
  }

  // ── スレッド1件（メッセージ全件）を取得し、既読にする ──
  if (req.method === "GET" && id) {
    const conv = await loadParticipantConversation(supabase, id, userId);
    if (!conv) return res.status(404).json({ error: "メッセージが見つかりません" });
    const role = roleOf(conv, userId);

    const { data: msgs, error } = await supabase
      .from("messages")
      .select("id,sender_role,body,created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .limit(1000);
    if (error) return res.status(500).json({ error: error.message });

    const client = toClientConversation(conv, userId);
    if (client.unread) {
      await supabase.from("conversations")
        .update({ [`${role}_last_read_at`]: new Date().toISOString() })
        .eq("id", id);
    }
    return res.status(200).json({
      conversation: { ...client, unread: false },
      messages: (msgs || []).map(m => ({ ...m, mine: m.sender_role === role })),
    });
  }

  // ── 新規スレッドを開始して最初のメッセージを送る（問い合わせ者側） ──
  if (req.method === "POST" && !id) {
    const { targetType, targetId, body } = req.body || {};
    if (targetType !== "farm" && targetType !== "house") {
      return res.status(400).json({ error: "targetTypeが正しくありません" });
    }
    if (!UUID_RE.test(String(targetId || ""))) {
      return res.status(400).json({ error: "対象の指定が正しくありません" });
    }

    const table = targetType === "farm" ? "farms" : "houses";
    const { data: target } = await supabase
      .from(table).select("id,name,owner_id,status").eq("id", targetId).maybeSingle();
    if (!target || target.status === "非公開") {
      return res.status(404).json({ error: "この掲載は見つからないか、現在非公開です" });
    }
    if (!target.owner_id) {
      return res.status(400).json({ error: "この掲載はサイト内メッセージに対応していません。問い合わせフォームをご利用ください。" });
    }
    if (target.owner_id === userId) {
      return res.status(400).json({ error: "ご自身の掲載にはメッセージを送れません" });
    }

    const listingColumn = targetType === "farm" ? "farm_id" : "house_id";
    let { data: conv } = await supabase
      .from("conversations").select("*").eq("seeker_id", userId).eq(listingColumn, targetId).maybeSingle();

    if (!conv) {
      const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("seeker_id", userId)
        .gte("created_at", dayStart);
      if ((count || 0) >= NEW_CONVERSATION_LIMIT) {
        return res.status(429).json({ error: "本日、新しく問い合わせできる件数の上限に達しました。明日以降にお試しください。" });
      }

      const { data: profile } = await supabase.from("users").select("name").eq("id", userId).maybeSingle();
      const insert = await supabase.from("conversations").insert([{
        target_type: targetType,
        farm_id: targetType === "farm" ? targetId : null,
        house_id: targetType === "house" ? targetId : null,
        target_name: target.name,
        owner_id: target.owner_id,
        seeker_id: userId,
        seeker_name: (profile?.name || "").slice(0, 50),
      }]).select().single();

      if (insert.error) {
        // 同時送信で一意制約に当たった場合は、既存のスレッドを使う
        const { data: existing } = await supabase
          .from("conversations").select("*").eq("seeker_id", userId).eq(listingColumn, targetId).maybeSingle();
        if (!existing) return res.status(500).json({ error: insert.error.message });
        conv = existing;
      } else {
        conv = insert.data;
      }
    }

    const result = await appendMessage(supabase, conv, userId, "seeker", body);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(200).json({ conversationId: conv.id });
  }

  // ── 既存スレッドへ返信（オーナー・問い合わせ者の双方） ──
  if (req.method === "POST" && id) {
    const conv = await loadParticipantConversation(supabase, id, userId);
    if (!conv) return res.status(404).json({ error: "メッセージが見つかりません" });
    const result = await appendMessage(supabase, conv, userId, roleOf(conv, userId), req.body?.body);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
