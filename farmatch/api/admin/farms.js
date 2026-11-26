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
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const records = Array.isArray(body) ? body : [body];
    const { data, error } = await supabase.from("farms").insert(records).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const { error } = await supabase.from("farms").update(updates).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id, mode } = req.query;
    // 自治体収集データ（owner_id が null の運営登録データ）を一括削除
    if (mode === "municipality") {
      const { data: targets, error: selErr } = await supabase
        .from("farms")
        .select("id")
        .is("owner_id", null);
      if (selErr) return res.status(500).json({ error: selErr.message });
      const ids = (targets || []).map(r => r.id);
      if (ids.length > 0) {
        // 外部キー参照（inquiries / reports）を先に解除または削除
        for (let i = 0; i < ids.length; i += 100) {
          const chunk = ids.slice(i, i + 100);
          await supabase.from("inquiries").delete().in("farm_id", chunk);
          await supabase.from("reports").delete().in("farm_id", chunk);
          const { error: delErr } = await supabase.from("farms").delete().in("id", chunk);
          if (delErr) return res.status(500).json({ error: delErr.message });
        }
      }
      return res.status(200).json({ ok: true, deletedCount: ids.length });
    }

    // オーナー登録データの重複（同一 owner_id + name + region）を検出し、最新1件を残して削除
    if (mode === "duplicates") {
      const { data: rows, error: selErr } = await supabase
        .from("farms")
        .select("id,owner_id,name,region,location,created_at")
        .not("owner_id", "is", null)
        .order("created_at", { ascending: false });
      if (selErr) return res.status(500).json({ error: selErr.message });
      const seen = new Set();
      const dupIds = [];
      for (const r of rows || []) {
        const key = `${r.owner_id}::${(r.name || "").trim()}::${(r.region || "").trim()}`;
        if (seen.has(key)) dupIds.push(r.id);
        else seen.add(key);
      }
      if (dupIds.length > 0) {
        await supabase.from("inquiries").delete().in("farm_id", dupIds);
        await supabase.from("reports").delete().in("farm_id", dupIds);
        const { error: delErr } = await supabase.from("farms").delete().in("id", dupIds);
        if (delErr) return res.status(500).json({ error: delErr.message });
      }
      return res.status(200).json({ ok: true, deletedCount: dupIds.length, deletedIds: dupIds });
    }

    if (!id) return res.status(400).json({ error: "id required" });
    await supabase.from("inquiries").delete().eq("farm_id", id);
    await supabase.from("reports").delete().eq("farm_id", id);
    const { error } = await supabase.from("farms").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
