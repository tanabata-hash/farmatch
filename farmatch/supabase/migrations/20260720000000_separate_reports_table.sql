-- 通報(不適切な内容の通報)を問い合わせ(inquiries)から完全に分離し、
-- 管理画面での混同や、通報データが問い合わせと同じ権限モデルに引きずられる問題を解消する。

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  farm_id uuid references farms(id) on delete set null,
  house_id uuid references houses(id) on delete set null,
  message text not null,
  status text not null default 'new',
  ip text,
  created_at timestamptz not null default now()
);

-- 既存のinquiries内の通報データを移行してからinquiries側を削除
insert into reports (target_type, farm_id, house_id, message, status, ip, created_at)
select target_type, farm_id, house_id, message, status, ip, created_at
from inquiries
where purpose = '不適切な内容の通報';

delete from inquiries where purpose = '不適切な内容の通報';

-- IPベースのレート制限（inquiriesと同じロジック）
create or replace function reports_rate_limit()
returns trigger as $$
declare
  client_ip text;
  recent_count int;
begin
  client_ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  client_ip := nullif(trim(client_ip), '');
  new.ip := client_ip;

  if client_ip is not null then
    select count(*) into recent_count
    from reports
    where ip = client_ip and created_at > now() - interval '10 minutes';

    if recent_count >= 3 then
      raise exception 'Too many submissions from this network. Please try again later.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists reports_rate_limit_trigger on reports;
create trigger reports_rate_limit_trigger
before insert on reports
for each row execute function reports_rate_limit();

-- 権限: anon/authenticatedは新規通報の投稿(INSERT)のみ可能。閲覧・更新・削除は不可。
-- 管理はservice_role経由の管理者APIに一本化する。
alter table reports enable row level security;

drop policy if exists "anon can insert reports" on reports;
create policy "anon can insert reports" on reports
  for insert to anon, authenticated
  with check (true);

grant insert on reports to anon, authenticated;
grant select, update, delete on reports to service_role;
