import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ユーザー入力をそのままメールHTMLへ埋め込むとHTMLインジェクション
// （フィッシングリンクの偽装等）が可能になるため、必ずエスケープする。
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function sendOwnerNotificationEmail({ ownerEmail, seekerName, seekerEmail, purpose, message, targetName, targetType }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromAddress) return; // 未設定の場合は通知をスキップ（アプリ内の受信箱では引き続き確認可能）

  const safeName = escapeHtml(seekerName);
  const safeEmail = escapeHtml(seekerEmail);
  const safePurpose = escapeHtml(purpose) || "—";
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const safeTargetName = escapeHtml(targetName);

  const subject = `【Farmatch】「${targetName}」に新しい問い合わせが届きました`;
  const html = `
    <p>Farmatchに掲載中の${targetType === "farm" ? "農地" : "空き家"}「${safeTargetName}」に、新しい問い合わせが届きました。</p>
    <table>
      <tr><td>お名前</td><td>${safeName}</td></tr>
      <tr><td>メール</td><td>${safeEmail}</td></tr>
      <tr><td>目的</td><td>${safePurpose}</td></tr>
    </table>
    <p>メッセージ：</p>
    <blockquote>${safeMessage}</blockquote>
    <p>Farmatchにログインし「マイ登録」＞「問い合わせ」から詳細確認・返信ができます。<br>
    このメールに直接返信すると、問い合わせた方（${safeEmail}）に届きます。</p>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: ownerEmail,
        reply_to: seekerEmail,
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error("Resend email send failed:", err.message);
  }
}

const MAX_INQUIRIES_PER_WINDOW = 5;
const WINDOW_MINUTES = 15;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { targetType, farmId, houseId, name, email, purpose, message, website } = req.body || {};

  // ハニーポット：人間には見えない項目に入力があればbotとみなし、成功したふりをして無言で弾く
  if (website) return res.status(200).json({ ok: true });

  if (!name || !email || (targetType !== "farm" && targetType !== "house")) {
    return res.status(400).json({ error: "name, email, targetTypeは必須です" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "メールアドレスの形式が正しくありません" });
  }
  if ((targetType === "farm" && !farmId) || (targetType === "house" && !houseId)) {
    return res.status(400).json({ error: "対象IDが必要です" });
  }

  const supabase = getServiceClient();
  const ip = getClientIp(req);

  // 同一IPからの短時間の大量送信を防ぐ（実在オーナーへの迷惑メール送信・メール配信枠の枯渇対策）
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);
  if (count >= MAX_INQUIRIES_PER_WINDOW) {
    return res.status(429).json({ error: "送信回数が上限を超えました。しばらくしてから再度お試しください。" });
  }

  const { error: insertError } = await supabase.from("inquiries").insert([{
    target_type: targetType,
    farm_id: targetType === "farm" ? farmId : null,
    house_id: targetType === "house" ? houseId : null,
    name, email, purpose, message, status: "new", ip,
  }]);
  if (insertError) return res.status(500).json({ error: insertError.message });

  const table = targetType === "farm" ? "farms" : "houses";
  const { data: target } = await supabase.from(table).select("name,owner_id").eq("id", targetType === "farm" ? farmId : houseId).single();

  if (target?.owner_id) {
    const { data: owner } = await supabase.from("users").select("email").eq("id", target.owner_id).single();
    if (owner?.email) {
      await sendOwnerNotificationEmail({
        ownerEmail: owner.email,
        seekerName: name, seekerEmail: email, purpose, message,
        targetName: target.name, targetType,
      });
    }
  }

  return res.status(200).json({ ok: true });
}
