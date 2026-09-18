import { createClient } from "@supabase/supabase-js";
import { requireAdminPassword } from "./_authGuard.js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const ALLOWED_REASONS = ["通報対応", "規約違反の調査", "緊急対応", "法令に基づく対応"];

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// 問い合わせ本文を個別に取得するエンドポイント。利用規約第6条（メッセージ機能及び
// 通信の秘密）第3項の各号に該当する場合に限り、理由を選択したうえで本文を確認できる。
// 取得の都度 message_access_logs に日時・理由・IPを記録する（同条第5項）。
export default async function handler(req, res) {
  if (!(await requireAdminPassword(req, res))) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, reason } = req.query;
  if (!id || !ALLOWED_REASONS.includes(reason)) {
    return res.status(400).json({ error: "idと有効なreasonが必要です" });
  }

  const supabase = getServiceClient();
  const { data: inquiry, error: fetchError } = await supabase
    .from("inquiries")
    .select("message")
    .eq("id", id)
    .single();
  if (fetchError || !inquiry) return res.status(404).json({ error: "見つかりません" });

  const { error: logError } = await supabase.from("message_access_logs").insert([{
    inquiry_id: id, reason, ip: getClientIp(req),
  }]);
  if (logError) console.error("message_access_logs insert failed:", logError.message);

  return res.status(200).json({ message: inquiry.message });
}
