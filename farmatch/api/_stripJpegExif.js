// スマートフォンで撮影した写真にはEXIFメタデータとして撮影時の正確なGPS座標が
// 埋め込まれていることが多い。オーナーが現地写真をそのままアップロードすると、
// 農地・住居のfarms/houses.lat/lngをぼかして公開している対策（public_lat/public_lng）
// が写真経由で無意味化してしまうため、公開前にAPP1（EXIF/XMP）セグメントを除去する。
//
// JPEGはSOI(FFD8)に続けてAPPn/DQT/SOF等のマーカーセグメントが並び、SOS(FFDA)以降が
// 圧縮画像データとなる。APP1(FFE1)セグメントだけを取り除き、それ以外のバイト列は
// 一切変更しないことで画質・構造を壊さずにメタデータのみ削除する。
export function stripJpegExif(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer; // JPEGではない場合はそのまま返す
  }
  const segments = [buffer.subarray(0, 2)]; // SOI
  let offset = 2;
  const n = buffer.length;
  while (offset < n - 1) {
    if (buffer[offset] !== 0xff) {
      segments.push(buffer.subarray(offset));
      offset = n;
      break;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      segments.push(buffer.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }
    if (marker === 0xda) {
      segments.push(buffer.subarray(offset));
      offset = n;
      break;
    }
    if (offset + 4 > n) {
      segments.push(buffer.subarray(offset));
      offset = n;
      break;
    }
    const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
    const segEnd = offset + 2 + length;
    if (segEnd > n || length < 2) {
      segments.push(buffer.subarray(offset));
      offset = n;
      break;
    }
    if (marker !== 0xe1) {
      segments.push(buffer.subarray(offset, segEnd));
    }
    offset = segEnd;
  }
  return Buffer.concat(segments);
}
