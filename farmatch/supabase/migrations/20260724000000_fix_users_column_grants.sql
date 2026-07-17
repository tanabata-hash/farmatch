-- 前回のマイグレーション(20260723000000)は is_premium 列に対してのみ
-- REVOKE INSERT/UPDATE (is_premium) を行ったが、public.users には
-- anon/authenticated へのテーブルレベルINSERT/UPDATE/SELECT/DELETE権限が
-- 別途存在しており、テーブルレベル権限が列レベルREVOKEより優先されるため
-- 実際には効果がなかった（is_premiumが引き続き書き換え可能なままだった）。
--
-- RLSポリシー（Users can update own row 等）は auth.uid() = id という
-- 行単位の制限のみで、列は一切制限していない。この組み合わせにより
-- ログイン済みユーザーが自分自身のis_premium（および他の信頼フラグ列）を
-- 直接書き換えられる権限昇格の脆弱性が残っていた。
--
-- farms/houses/reportsと同じ「テーブルレベル権限を撤去し、安全な列のみ
-- 明示的に許可し直す」方式に統一し、根本的に修正する。

revoke insert, update, delete on users from anon, authenticated;

-- 閲覧は自分の全プロフィールを見られる必要があるため全列を維持（既存のselect("*")と一致）
-- 書き込みは実際にアプリが使用する列のみに限定する。
-- is_premium・seeker_verified・municipal_consultation_status は信頼/課金フラグであり、
-- 将来service_role経由（決済処理等）でのみ更新する設計とし、クライアントには許可しない。
grant insert (
  id, email, name, role, bio,
  farming_experience, desired_area, desired_crop, household_info
) on users to anon, authenticated;

-- upsert(ON CONFLICT DO UPDATE)はidを含む全列に対してUPDATE権限を要求するため、
-- idもUPDATE許可リストに含める（実測で確認済み）。
grant update (
  id, email, name, role, bio,
  farming_experience, desired_area, desired_crop, household_info
) on users to anon, authenticated;
