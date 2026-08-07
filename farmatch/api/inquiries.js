import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function sendOwnerNotificationEmail({ ownerEmail, seekerName, seekerEmail, purpose, message, targetName, targetType }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromAddress) return; // 未設定の場合は通知をスキップ（アプリ内の受信箱では引き続き確認可能）

  const subject = `【Farmatch】「${targetName}」に新しい問い合わせが届きました`;
  const html = `
    <p>Farmatchに掲載中の${targetType === "farm" ? "農地" : "空き家"}「${targetName}」に、新しい問い合わせが届きました。</p>
    <table>
      <tr><td>お名前</td><td>${seekerName}</td></tr>
      <tr><td>メール</td><td>${seekerEmail}</td></tr>
      <tr><td>目的</td><td>${purpose || "—"}</td></tr>
    </table>
    <p>メッセージ：</p>
    <blockquote>${(message || "").replace(/\n/g, "<br>")}</blockquote>
    <p>Farmatchにログインし「マイ登録」＞「問い合わせ」から詳細確認・返信ができます。<br>
    このメールに直接返信すると、問い合わせた方（${seekerEmail}）に届きます。</p>
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
  if ((targetType === "farm" && !farmId) || (targetType === "house" && !houseId)) {
    return res.status(400).json({ error: "対象IDが必要です" });
  }

  const supabase = getServiceClient();

  const { error: insertError } = await supabase.from("inquiries").insert([{
    target_type: targetType,
    farm_id: targetType === "farm" ? farmId : null,
    house_id: targetType === "house" ? houseId : null,
    name, email, purpose, message, status: "new",
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
