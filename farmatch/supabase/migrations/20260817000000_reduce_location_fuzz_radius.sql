-- 地図マーカーの位置ずれを縮小する。
-- 従来はlat/lngを軸ごと最大約±440mランダムにぼかしていたが、
-- 体感のズレが大きすぎるとの指摘があったため、約±120m/軸まで縮小する。
-- 所有者の正確な農地位置を秘匿するプライバシー保護自体は維持する。

create or replace function fuzz_offset(seed text, salt text)
returns double precision as $$
  select ((abs(hashtext(seed || salt)) % 10000) / 10000.0 - 0.5) * 0.0022;
$$ language sql immutable;

-- 既存行のpublic_lat/public_lngを新しいぼかし幅で再計算
update farms set public_lat = lat + fuzz_offset(id::text,'lat'), public_lng = lng + fuzz_offset(id::text,'lng')
  where lat is not null and lng is not null;
update houses set public_lat = lat + fuzz_offset(id::text,'lat'), public_lng = lng + fuzz_offset(id::text,'lng')
  where lat is not null and lng is not null;
