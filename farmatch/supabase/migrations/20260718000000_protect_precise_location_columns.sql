-- 農地・住宅の正確な座標(lat/lng)・地番等を匿名/一般ユーザーから完全に隠し、
-- 公開画面には決定的にぼかした座標(public_lat/public_lng)のみを提供する。
-- 管理画面の書き込みはservice role経由のサーバーAPIに一本化し、
-- anon/authenticatedのfarms/housesへの直接書き込み権限は撤去する。

-- 1. ぼかし座標列の追加
alter table farms add column if not exists public_lat double precision;
alter table farms add column if not exists public_lng double precision;
alter table houses add column if not exists public_lat double precision;
alter table houses add column if not exists public_lng double precision;

-- 2. IDベースの決定的オフセット関数（約±440m）
create or replace function fuzz_offset(seed text, salt text)
returns double precision as $$
  select ((abs(hashtext(seed || salt)) % 10000) / 10000.0 - 0.5) * 0.008;
$$ language sql immutable;

-- 3. lat/lng変更時にぼかし座標を自動計算するトリガー
create or replace function set_public_coords()
returns trigger as $$
begin
  if new.lat is not null and new.lng is not null then
    new.public_lat := new.lat + fuzz_offset(new.id::text, 'lat');
    new.public_lng := new.lng + fuzz_offset(new.id::text, 'lng');
  else
    new.public_lat := null;
    new.public_lng := null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists farms_set_public_coords on farms;
create trigger farms_set_public_coords
before insert or update of lat, lng on farms
for each row execute function set_public_coords();

drop trigger if exists houses_set_public_coords on houses;
create trigger houses_set_public_coords
before insert or update of lat, lng on houses
for each row execute function set_public_coords();

-- 4. 既存行のバックフィル
update farms set public_lat = lat + fuzz_offset(id::text,'lat'), public_lng = lng + fuzz_offset(id::text,'lng')
  where lat is not null and lng is not null;
update houses set public_lat = lat + fuzz_offset(id::text,'lat'), public_lng = lng + fuzz_offset(id::text,'lng')
  where lat is not null and lng is not null;

-- 5. 匿名/認証ユーザーからの書き込み権限を撤去（管理操作はservice role経由のAPIに一本化）
revoke insert, update, delete on farms from anon, authenticated;
revoke insert, update, delete on houses from anon, authenticated;

-- 6. 機微な列（正確な座標・地番等）への列レベルSELECTを撤去し、安全な列のみ明示的に許可
revoke select on farms from anon, authenticated;
grant select (
  id, owner_id, name, region, location, area_sqm, area_label, farm_type, status,
  rent_label, rent_amount, water_source, access_info, crops, tags, description,
  score_water, score_sun, score_soil, score_climate, score_access, is_premium, plan,
  published_at, created_at, updated_at, owner_verified, owner_bio, reason_for_listing,
  response_time_estimate, past_crop_history, owner_photo_url, photo_urls, access_notes,
  trust_score, public_lat, public_lng
) on farms to anon, authenticated;

revoke select on houses from anon, authenticated;
grant select (
  id, owner_id, name, region, location, house_type, status, area_label, rent_label,
  rent_amount, subsidy_info, tags, near_farm_ids, description, plan, created_at,
  updated_at, public_lat, public_lng
) on houses to anon, authenticated;
