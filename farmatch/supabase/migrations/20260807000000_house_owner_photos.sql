-- farmsと同様に、housesにもオーナー自己登録による写真機能を追加する。
alter table houses add column if not exists owner_photo_url text;
alter table houses add column if not exists photo_urls text[];

grant insert (owner_photo_url, photo_urls) on houses to authenticated;
grant update (owner_photo_url, photo_urls) on houses to authenticated;
grant select (owner_photo_url, photo_urls) on houses to anon, authenticated;
