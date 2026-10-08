import { createClient } from "@supabase/supabase-js";
import { requireAdminPassword } from "./_authGuard.js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export default async function handler(req, res) {
  if (!(await requireAdminPassword(req, res))) return;

  const supabase = getServiceClient();

  if (req.method === "GET") {
    // 利用規約第6条（メッセージ機能及び通信の秘密）に基づき、一覧では本文(message)を返さない。
    // 本文は /api/admin/inquiry-message.js で理由選択のうえ個別取得する。
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
