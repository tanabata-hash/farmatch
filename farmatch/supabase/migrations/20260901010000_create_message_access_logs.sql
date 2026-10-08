-- 管理画面から問い合わせ（メッセージ）本文を確認した記録を残すためのテーブル。
-- 利用規約第6条（メッセージ機能及び通信の秘密）第5項に基づき、確認の都度
-- 日時・理由・確認した者（accessed_by、確認者が申告する氏名）を記録する。
-- 管理画面は共有パスワード認証で個人を機械的には識別できないため、確認者名は
-- 本人の自己申告として入力必須にしたうえで記録し、あわせてIPアドレスも残す。
-- anon/authenticatedからは一切アクセスさせず、service_role経由（/api/admin/*）のみで
-- 読み書きする、他の管理系テーブルと同じ方針。

create table if not exists message_access_logs (
  id bigint generated always as identity primary key,
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  reason text not null,
  accessed_by text not null,
  accessed_at timestamptz not null default now(),
  ip text
);

alter table message_access_logs enable row level security;
revoke all on message_access_logs from anon, authenticated;
grant select, insert on message_access_logs to service_role;
