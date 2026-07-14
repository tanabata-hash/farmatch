-- フェーズ1: 信頼構築のための任意項目を追加
-- 既存データには影響しない（すべて NULL 許容 / デフォルト値あり）

-- farms: オーナー側の信頼情報
alter table farms add column if not exists owner_verified boolean default false;
alter table farms add column if not exists owner_photo_url text;
alter table farms add column if not exists owner_bio text;
alter table farms add column if not exists reason_for_listing text;
alter table farms add column if not exists photo_urls text[];
alter table farms add column if not exists access_notes text;
alter table farms add column if not exists response_time_estimate text;
alter table farms add column if not exists past_crop_history text;
alter table farms add column if not exists trust_score int default 0;

-- users: シーカー（就農・移住希望者）側の信頼情報
-- 本アプリでは owner/seeker を単一の users テーブル + role 列で管理しているため、
-- 提案書の seekers テーブル案ではなく既存の users テーブルに追加する
alter table users add column if not exists seeker_verified boolean default false;
alter table users add column if not exists seeker_bio text;
alter table users add column if not exists farming_experience text;
alter table users add column if not exists desired_area text;
alter table users add column if not exists desired_crop text;
alter table users add column if not exists budget_range text;
alter table users add column if not exists household_info text;
alter table users add column if not exists municipal_consultation_status text;
