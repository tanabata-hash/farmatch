-- 目的1: 「非公開」ステータスのバイパス修正
-- farms/housesには元々2つのSELECTポリシーが重複して存在していた。
--   - "public farms/houses viewable": status <> '非公開' （意図通りの制限）
--   - "Public read access": true （無条件許可）
-- RLSは同一コマンドの複数permissiveポリシーをORで結合するため、
-- 後者が存在する限り「非公開」設定は実質無効化されていた。
-- 実機検証（テスト行をstatus='非公開'で作成しanonキーでSELECT）で
-- 実際に取得できてしまうことを確認済み。冗長な方を削除して修正する。
drop policy if exists "Public read access" on farms;
drop policy if exists "Public read access" on houses;

-- 目的2: オーナー自己登録機能の有効化
-- "owners manage own farms/houses" ポリシー（auth.uid() = owner_id、cmd=ALL）は
-- 元から正しく設定されていたが、テーブルレベルのINSERT/UPDATE権限が
-- anon/authenticatedのどちらにも一切付与されておらず、常にGRANTチェックの
-- 時点で弾かれるため完全に無効(inert)だった。
-- ログイン済みユーザー(authenticated)のみに、安全な列だけを対象とした
-- 列レベルのINSERT/UPDATE権限を付与し、既存ポリシーを実際に機能させる。
--
-- 除外した列（admin/信頼スコア/システム専用のため、Admin API(service_role)経由でのみ変更可能）：
--   id, is_premium, plan, published_at, created_at, updated_at,
--   owner_verified, trust_score, chiban, nosin_ku, chimoku（farms、地番など機微情報）,
--   subsidy_info, near_farm_ids（houses、事務局が精査する情報）

alter table farms add column if not exists preferred_contact_method text;
alter table houses add column if not exists preferred_contact_method text;

grant insert (
  owner_id, name, region, location, status, description, tags, lat, lng,
  preferred_contact_method,
  area_label, rent_label, farm_type, crops, water_source, access_info,
  score_water, score_sun, score_soil, score_climate, score_access,
  owner_bio, reason_for_listing, access_notes, response_time_estimate,
  past_crop_history, owner_photo_url, photo_urls
) on farms to authenticated;

grant update (
  name, region, location, status, description, tags, lat, lng,
  preferred_contact_method,
  area_label, rent_label, farm_type, crops, water_source, access_info,
  score_water, score_sun, score_soil, score_climate, score_access,
  owner_bio, reason_for_listing, access_notes, response_time_estimate,
  past_crop_history, owner_photo_url, photo_urls
) on farms to authenticated;

grant insert (
  owner_id, name, region, location, status, description, tags, lat, lng,
  preferred_contact_method, area_label, rent_label, house_type
) on houses to authenticated;

grant update (
  name, region, location, status, description, tags, lat, lng,
  preferred_contact_method, area_label, rent_label, house_type
) on houses to authenticated;

-- 新規列は列レベル権限のみのテーブルに追加しても自動ではSELECT許可されないため
-- （テーブルレベルGRANTがある場合と異なる）、公開表示用に明示的に許可する。
grant select (preferred_contact_method) on farms to anon, authenticated;
grant select (preferred_contact_method) on houses to anon, authenticated;
