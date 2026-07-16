-- admin_login_attemptsテーブルはRLS有効化のみでservice_roleへの明示的GRANTがなく、
-- login.js・管理API群からのレート制限用INSERT/SELECTがエラーとして黙って失敗し続けていた
-- (farms/housesで発覚したのと同種の問題)。service_roleへの権限を明示的に付与する。

grant select, insert, delete on admin_login_attempts to service_role;
