-- 前回のマイグレーション(20260718000000)でanon/authenticatedのfarms/housesアクセスを
-- 列レベルに制限した際、service_role(管理者APIが使うサーバー側の特権ロール)の
-- テーブルレベル権限も意図せず失われていたことが判明したため、明示的に復元する。
-- service_roleはRLSをバイパスするが、テーブルへの基本GRANTは別物であり、
-- 明示的な権限が無いと "permission denied for table ..." エラーになる。

grant select, insert, update, delete on farms to service_role;
grant select, insert, update, delete on houses to service_role;
grant select, insert, update, delete on users to service_role;
grant select, update on inquiries to service_role;
