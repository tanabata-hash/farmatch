-- matches / subscriptions テーブルは、アプリケーションコードから一切参照されていない未使用テーブルだが、
-- anon/authenticatedにSELECT/INSERT/UPDATE/DELETEが全開放されたままになっていた。
-- 現状はRLS有効化・ポリシー0件のため実害はないが（デフォルト拒否）、
-- 将来ポリシーが1つでも追加された時点で全操作が意図せず露出する「時限爆弾」状態のため、
-- 他の全テーブルと同じ方針でanon/authenticatedからの権限を明示的に撤去しておく。
-- （テーブル自体は将来の機能拡張のために残す）

revoke all on matches from anon, authenticated;
revoke all on subscriptions from anon, authenticated;
