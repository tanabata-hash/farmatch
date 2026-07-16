-- 管理者ログインのレート制限用テーブル
-- サーバー側(service role)からのみ読み書きし、クライアントからの直接アクセスは想定しない

create table if not exists admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_ip_created_at_idx
  on admin_login_attempts (ip, created_at);

alter table admin_login_attempts enable row level security;
-- ポリシーを一切定義しないことで、anon/authenticatedからは読み書き不可(service_roleのみアクセス可)にする

revoke all on admin_login_attempts from anon, authenticated;
