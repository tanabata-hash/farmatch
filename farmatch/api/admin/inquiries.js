import { createClient } from "@supabase/supabase-js";
import { requireAdminPassword } from "./_authGuard.js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// 利用規約第5条の3（お問い合わせフォーム）第3項の各号に対応する確認理由。
const ALLOWED_MESSAGE_REASONS = [
  "当事者からの通報・調査依頼（当事者の同意あり）",
  "法令に基づく場合",
  "生命・身体・財産の保護のための緊急対応",
  "技術上やむを得ない場合（障害の調査・復旧等）",
];

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// 問い合わせ本文を個別に取得する。利用規約第5条の3（お問い合わせフォーム）第3項の
// 各号に該当する場合に限り、理由を選択したうえで本文を確認できる。取得の都度
// message_access_logs に日時・理由・確認者名・IPを記録する（同条第4項）。
// Vercelの関数数上限のため、新規のAPIファイルを追加せず ?resource=message として
// このファイルに同居させている（api/my/inquiries.jsのconversations分岐と同じ方針）。
async function handleMessageResource(req, res, supabase) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id, reason, accessedBy } = req.query;
  const trimmedAccessedBy = typeof accessedBy === "string" ? accessedBy.trim() : "";
  if (!id || !ALLOWED_MESSAGE_REASONS.includes(reason)) {
    return res.status(400).json({ error: "idと有効なreasonが必要です" });
  }
  // フロントの入力必須チェックに加え、サーバー側でも確認者名の入力を必須とする
  // （利用規約第5条の3第4項「確認した者」の記録をフロントだけの制御にしない）。
  if (!trimmedAccessedBy) {
    return res.status(400).json({ error: "確認者名の入力が必要です" });
  }

  const { data: inquiry, error: fetchError } = await supabase
    .from("inquiries")
    .select("message")
    .eq("id", id)
    .single();
  if (fetchError || !inquiry) return res.status(404).json({ error: "見つかりません" });

  const { error: logError } = await supabase.from("message_access_logs").insert([{
    inquiry_id: id, reason, accessed_by: trimmedAccessedBy, ip: getClientIp(req),
  }]);
  if (logError) console.error("message_access_logs insert failed:", logError.message);

  return res.status(200).json({ message: inquiry.message });
}

export default async function handler(req, res) {
  if (!(await requireAdminPassword(req, res))) return;

  const supabase = getServiceClient();

  if (req.query.resource === "message") {
    return handleMessageResource(req, res, supabase);
  }

  if (req.method === "GET") {
    // 利用規約第5条の3（お問い合わせフォーム）に基づき、一覧では本文(message)を返さない。
    // 本文は ?resource=message で理由選択のうえ個別取得する。
    const { data, error } = await supabase
      .from("inquiries")
      .select("id,target_type,farm_id,house_id,name,email,purpose,status,ip,created_at")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: "id and status required" });
    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
