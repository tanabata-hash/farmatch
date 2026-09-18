-- inquiriesテーブルへのアクセスは常にVercelのサーバー関数（service_role）経由
-- （/api/inquiries.js, /api/my/inquiries.js, /api/admin/inquiries.js,
-- /api/admin/inquiry-message.js）のみで行われ、ブラウザから直接
-- supabase.from("inquiries")を呼ぶ箇所はアプリケーションコード上に存在しない。
-- 他の管理系テーブル（matches/subscriptions等）と同じ「RLS有効・ポリシー0件・
-- service_roleのみ明示GRANT」の方針に揃え、anon/authenticatedからの直接アクセスを
-- 明示的に禁止する。

alter table inquiries enable row level security;
revoke all on inquiries from anon, authenticated;
grant select, insert, update, delete on inquiries to service_role;
