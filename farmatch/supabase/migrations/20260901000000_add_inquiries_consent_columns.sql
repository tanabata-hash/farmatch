-- 問い合わせ（メッセージ）送信時に利用規約第6条（メッセージ機能及び通信の秘密）への
-- 同意を得たことの記録として、同意日時と当時の規約バージョンを保存する。
-- 過去に送信された既存行はNULLのままとし、遡って同意したことにはしない。

alter table inquiries add column if not exists consented_at timestamptz;
alter table inquiries add column if not exists terms_version text;
