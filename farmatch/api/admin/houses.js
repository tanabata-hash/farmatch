import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export default async function handler(req, res) {
  const adminPw = req.headers["x-admin-password"];
  if (!adminPw || adminPw !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getServiceClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("houses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const records = Array.isArray(body) ? body : [body];
    const { data, error } = await supabase.from("houses").insert(records).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const { error } = await supabase.from("houses").update(updates).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id required" });
    const { error } = await supabase.from("houses").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
