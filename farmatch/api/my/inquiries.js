import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getAuthedUserId(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

// ログイン中のオーナー本人が、自分が登録したfarms/housesに届いた問い合わせのみを
// 閲覧・ステータス更新できるエンドポイント。/api/admin/inquiries.jsと違い
// adminパスワードではなくSupabaseセッションで本人確認し、所有物件に紐づく
// 問い合わせだけに範囲を絞る。
export default async function handler(req, res) {
  const userId = await getAuthedUserId(req);
  if (!userId) return res.status(401).json({ error: "ログインが必要です" });

  const supabase = getServiceClient();

  const [{ data: myFarms }, { data: myHouses }] = await Promise.all([
    supabase.from("farms").select("id,name").eq("owner_id", userId),
    supabase.from("houses").select("id,name").eq("owner_id", userId),
  ]);
  const farmIds = (myFarms || []).map(f => f.id);
  const houseIds = (myHouses || []).map(h => h.id);
  const nameById = new Map([
    ...(myFarms || []).map(f => [f.id, f.name]),
    ...(myHouses || []).map(h => [h.id, h.name]),
  ]);

  if (req.method === "GET") {
    if (farmIds.length === 0 && houseIds.length === 0) return res.status(200).json([]);
    const orParts = [];
    if (farmIds.length > 0) orParts.push(`farm_id.in.(${farmIds.join(",")})`);
    if (houseIds.length > 0) orParts.push(`house_id.in.(${houseIds.join(",")})`);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .or(orParts.join(","))
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const withNames = (data || []).map(inq => ({
      ...inq,
      target_name: nameById.get(inq.farm_id || inq.house_id) || "",
    }));
    return res.status(200).json(withNames);
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: "id and status required" });

    const { data: inq, error: fetchError } = await supabase
      .from("inquiries")
      .select("id,farm_id,house_id")
      .eq("id", id)
      .single();
    if (fetchError || !inq) return res.status(404).json({ error: "見つかりません" });
    const owns = (inq.farm_id && farmIds.includes(inq.farm_id)) ||
                 (inq.house_id && houseIds.includes(inq.house_id));
    if (!owns) return res.status(403).json({ error: "権限がありません" });

    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
