/**
 * 非公式「アイカツ！カレンダー」(aikatsu-info/aikatsu-calendar)の items.json を監視する。
 *   https://aikatsu-info.github.io/aikatsu-calendar/data/items.json
 *
 * GitHub Pages で配信されている JSON をそのまま取得する。
 * (raw.githubusercontent.com でも同じ内容が取れるが、配信物である Pages 側を見る)
 *
 * ■ データ構造
 *   トップレベルが配列で、1要素が1イベント。
 *     id / cat / published / addedAt / eventDate / eventLabel / title / detail / src / url
 *   このうち title・eventLabel・url は全件にある。
 *   eventDate は null になることがある(誕生日・記念日など毎年繰り返す項目は
 *   eventDate ではなく recur に "03-03" 形式で入る)ため、日付表示には
 *   全件そろっている eventLabel を使う。
 *
 * ■ 重複排除はしない
 *   JSONの1要素がそのまま1イベントなので、HTMLのように同じものが複数回出ることはない。
 *   実際には eventLabel・title・url が完全一致し detail だけ違う項目が存在するが
 *   (元データ側の重複登録)、文字列で潰すと別項目が偶然一致したときに通知が消えるため、
 *   1要素=1件のまま出す。
 *
 * @param {String} url 取得対象のURL(未指定なら items.json)
 * @returns {String[]} "イベント日 タイトル URL" のリスト
 */
const getAikatsuCalendarList = (url) => {
  const targetUrl = url || 'https://aikatsu-info.github.io/aikatsu-calendar/data/items.json';
  console.log(`[aikatsuCalendar] ${targetUrl}`);

  const list = [];
  const options = { followRedirects: true, muteHttpExceptions: true };

  let response;
  try {
    response = UrlFetchApp.fetch(targetUrl, options);
  } catch (e) {
    // 時々失敗するので1回だけリトライする
    Utilities.sleep(1000 * 5);
    response = UrlFetchApp.fetch(targetUrl, options);
  }

  const code = response.getResponseCode();
  if (code !== 200) {
    console.warn(`[aikatsuCalendar] 取得失敗 HTTP ${code}`);
    return list;
  }

  // JSONが壊れていた場合に例外で落とさず、0件として healthcheck に拾わせる
  let items;
  try {
    items = JSON.parse(response.getContentText('UTF-8'));
  } catch (e) {
    console.warn(`[aikatsuCalendar] JSONパース失敗: ${e}`);
    return list;
  }

  if (!Array.isArray(items)) {
    console.warn('[aikatsuCalendar] 配列ではないので中断');
    return list;
  }

  items.forEach(function (item) {
    if (!item || !item.title) return;

    // 改行やタブが入ると1件1行の形式が崩れるので潰しておく
    const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    const label = clean(item.eventLabel || item.eventDate);
    const title = clean(item.title);
    const itemUrl = clean(item.url);

    const word = `${label ? `${label} ` : ''}${title}${itemUrl ? ` ${itemUrl}` : ''}`;
    list.push(word);
  });

  console.log(`[aikatsuCalendar] ${list.length}件`);
  return list;
};
