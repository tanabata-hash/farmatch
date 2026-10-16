-- サイト内メッセージ機能（オーナーと就農・移住希望者の双方向のやり取り）。
--
-- 設計方針
-- ・スレッド（conversations）と個々のメッセージ（messages）の2テーブル構成。
--   1つの掲載（農地/住まい）× 1人の問い合わせ者 = 1スレッド。
-- ・読み書きはすべてサーバーAPI（service_role）経由に限定し、anon/authenticatedには
--   一切の権限を与えない（RLS有効＋ポリシーなし＋権限を明示的にrevoke）。
--   当事者以外が読めないことは、API側の当事者チェックで担保する。
-- ・メッセージは「記録として残す」ため、service_roleにもUPDATE/DELETEを付与しない
--   （INSERTとSELECTのみ）。スレッドの削除は、管理者がSQLエディタで行う場合に限る。
-- ・掲載や利用者のアカウントが削除されても記録が消えないよう、参照先は
--   on delete set null とし、掲載名・表示名はスレッド作成時点の値を保存する。

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('farm', 'house')),
  farm_id uuid references farms(id) on delete set null,
  house_id uuid references houses(id) on delete set null,
  target_name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  seeker_id uuid references auth.users(id) on delete set null,
  seeker_name text not null default '',
  last_message_at timestamptz not null default now(),
  last_message_preview text not null default '',
  last_sender_role text check (last_sender_role in ('owner', 'seeker')),
  owner_last_read_at timestamptz,
  seeker_last_read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('owner', 'seeker')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- 同じ掲載に対して、同じ問い合わせ者のスレッドは1つだけ
create unique index if not exists conversations_seeker_farm_uniq
  on conversations (seeker_id, farm_id) where farm_id is not null and seeker_id is not null;
create unique index if not exists conversations_seeker_house_uniq
  on conversations (seeker_id, house_id) where house_id is not null and seeker_id is not null;

create index if not exists conversations_owner_idx on conversations (owner_id, last_message_at desc);
create index if not exists conversations_seeker_idx on conversations (seeker_id, last_message_at desc);
create index if not exists messages_conversation_idx on messages (conversation_id, created_at);
create index if not exists messages_sender_idx on messages (sender_id, created_at);

-- 直接アクセスを全面的に禁止（RLS有効・ポリシーなし・権限なし）
alter table conversations enable row level security;
alter table messages enable row level security;

revoke all on conversations from anon, authenticated;
revoke all on messages from anon, authenticated;

-- サーバーAPI（service_role）にのみ必要最小限の権限を付与。
-- Supabaseの既定ではservice_roleに全権限が付くことがあるため、いったん外してから付与し直す。
-- messagesはINSERTとSELECTのみ（記録の改ざん・削除をAPIから行えないようにする）。
revoke all on conversations from service_role;
revoke all on messages from service_role;
grant select, insert, update on conversations to service_role;
grant select, insert on messages to service_role;
