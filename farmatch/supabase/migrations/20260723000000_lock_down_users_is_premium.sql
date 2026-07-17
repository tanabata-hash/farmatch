-- usersテーブルのis_premium列に anon/authenticated への INSERT/UPDATE 列権限が付与されており、
-- RLSポリシー「Users can update own row」(auth.uid() = id、列制限なし)と組み合わさることで、
-- ログイン済みユーザーが自分自身のis_premiumを直接trueに書き換え、
-- 課金なしにプレミアム機能を利用できてしまう権限昇格の脆弱性が存在した。
--
-- is_premiumはデフォルトfalseであり、今後の正規の更新は決済処理(Stripe Webhook等)を
-- 経由するservice_roleからのみ行う設計とし、クライアントからの直接書き込みを撤去する。

revoke insert (is_premium), update (is_premium) on users from anon, authenticated;
