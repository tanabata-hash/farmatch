-- サイト内メッセージ機能（クローズドチャット）
-- 物件オーナーと就農・移住希望者が、1物件×1希望者の「会話」単位で直接やり取りする。
--
-- 設計方針：
--   ・電気通信事業法上の「通信の秘密」を守るため、メッセージ本文を読み書きできるのは
--     会話の当事者2人のみ。API（/api/messages）がログインユーザーが当事者であることを
--     確認した場合に限り、service_role経由で読み書きする。
--   ・anon/authenticatedからの直接アクセスは全面禁止（他テーブルと同じ方針）。
--   ・管理画面（/api/admin/*）からはメッセージ本文を参照しない。

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('farm','house')),
  farm_id uuid references farms(id) on delete set null,
  house_id uuid references houses(id) on delete set null,
  target_name text not null,              -- 物件削除後も会話一覧に表示できるよう名称を保持
  owner_id uuid not null references users(id) on delete cascade,
  seeker_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  check (owner_id <> seeker_id)
);

-- 同じ希望者が同じ物件に会話を重複作成しないようにする
create unique index if not exists conversations_unique_farm
  on conversations (seeker_id, farm_id) where farm_id is not null;
create unique index if not exists conversations_unique_house
  on conversations (seeker_id, house_id) where house_id is not null;
create index if not exists conversations_owner_idx on conversations (owner_id, last_message_at desc);
create index if not exists conversations_seeker_idx on conversations (seeker_id, last_message_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_idx on messages (conversation_id, created_at);
create index if not exists messages_sender_recent_idx on messages (sender_id, created_at desc);

alter table conversations enable row level security;
alter table messages enable row level security;

revoke all on conversations from anon, authenticated;
revoke all on messages from anon, authenticated;
grant select, insert, update, delete on conversations to service_role;
grant select, insert, update, delete on messages to service_role;

-- 旧・問い合わせフォーム（メール転送型）は廃止。テーブルは空のまま残し、クライアントからの権限を撤去する。
revoke all on inquiries from anon, authenticated;
