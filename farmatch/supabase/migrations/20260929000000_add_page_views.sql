-- 目的: 管理者向けの簡易アクセス計測（自社DBのみに記録し、外部の解析サービスへは送信しない）
--
-- 記録する内容: 閲覧画面 / パス / 参照元ドメイン / 端末種別 / 国コード / ブラウザのタブ単位のランダムID
-- 記録しない内容: IPアドレス・User-Agent全文・Cookie・ログインユーザーとの紐づけ
--
-- 書き込み・読み取りは /api/track と /api/admin/analytics（service_role）経由のみ。
-- RLSを有効にしポリシーを定義しないことで、anon/authenticatedからは一切アクセスできない。

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  view text not null,
  path text not null,
  referrer_host text,
  device text,
  country text,
  session_id text not null,
  excluded boolean not null default false
);

create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_session_idx on page_views (session_id, created_at);

alter table page_views enable row level security;

revoke all on page_views from anon, authenticated;
grant select, insert, update, delete on page_views to service_role;
