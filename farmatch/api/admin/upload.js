import { createClient } from "@supabase/supabase-js";
import { requireAdminPassword } from "./_authGuard.js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024;

export default async function handler(req, res) {
  if (!(await requireAdminPassword(req, res))) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, contentType, dataBase64 } = req.body || {};
  if (!filename || !contentType || !dataBase64) {
    return res.status(400).json({ error: "filename, contentType, dataBase64 required" });
  }
  if (!ALLOWED_TYPES.includes(contentType)) {
    return res.status(400).json({ error: "対応していない画像形式です（jpeg/png/webpのみ）" });
  }

  const buffer = Buffer.from(dataBase64, "base64");
  if (buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: "ファイルサイズは3MB以下にしてください" });
  }

  const ext = (filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = getServiceClient();
  const { error: uploadError } = await supabase.storage
    .from("farm-photos")
    .upload(path, buffer, { contentType, upsert: false });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data } = supabase.storage.from("farm-photos").getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl });
}
