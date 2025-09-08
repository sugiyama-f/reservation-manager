// lib/time.ts
const TZ_OFFSET_MINUTES = 9 * 60; // Asia/Tokyo = UTC+9

/** ローカル日付文字列(date, time) を JST基準の ISO (UTC相当) に変換 */
export function toTokyoISO(dateStr: string, timeStr: string): string {
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(dateStr + "T" + timeStr + ":00");

  // JST基準でのUNIX時間に変換
  const utcMs = dt.getTime() - dt.getTimezoneOffset() * 60_000;
  const jstMs = utcMs - TZ_OFFSET_MINUTES * 60_000;

  return new Date(jstMs).toISOString();
}

/** ISO文字列を JST の hh:mm 表示に変換 */
export function isoToTokyoTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ISO文字列を JST の yyyy-mm-dd に変換 */
export function isoToTokyoDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
}
