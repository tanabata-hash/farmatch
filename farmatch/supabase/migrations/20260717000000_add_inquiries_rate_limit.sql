-- 問い合わせ・通報フォームのスパム/なりすまし対策（IPベースのレート制限）
-- ログイン不要のまま、同一ネットワークからの過度な連続送信をDBレベルでブロックする

alter table inquiries add column if not exists ip text;

create or replace function inquiries_rate_limit()
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
    from inquiries
    where ip = client_ip and created_at > now() - interval '10 minutes';

    if recent_count >= 3 then
      raise exception 'Too many submissions from this network. Please try again later.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists inquiries_rate_limit_trigger on inquiries;
create trigger inquiries_rate_limit_trigger
before insert on inquiries
for each row execute function inquiries_rate_limit();
