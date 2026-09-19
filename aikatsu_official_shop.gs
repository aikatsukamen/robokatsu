/**
 * 「アイカツ！オフィシャルストア」(バンダイナムコアミューズメント)の
 * NEWS と TOPICS を取得する。
 *   https://bandainamco-am.co.jp/official_shop/aikatsu/
 *
 * 1ページ内に2つのセクションがあり、どちらも新着情報なので1つのリストに統合して返す。
 *   NEWS   : section#news の dl.info_list > div
 *            dt > time[datetime] に日付、dd > a に見出しとリンク
 *   TOPICS : section#topics の ul.topicsList > li
 *            a > p に見出し、.topicsList_info の time[datetime] に日付
 *
 * どちらも日付は time タグの datetime 属性(YYYY-MM-DD)を使う。
 * 表示上は "2026.9.19" だが、datetime 属性の方が桁が揃っていて並べたときに読みやすい。
 *
 * @param {String} url 取得対象のURL(未指定ならストアのトップ)
 * @returns {String[]} "日付 見出し URL" のリスト(NEWS → TOPICS の順)
 */
const getAikatsuOfficialShopList = (url) => {
  const ORIGIN = 'https://bandainamco-am.co.jp';
  const targetUrl = url || `${ORIGIN}/official_shop/aikatsu/`;
  console.log(`[aikatsuOfficialShop] ${targetUrl}`);

  const list = [];
  const options = { followRedirects: true, muteHttpExceptions: true };

  const fetch_ = (fetchUrl) => {
    try {
      return UrlFetchApp.fetch(fetchUrl, options);
    } catch (e) {
      // 時々失敗するので1回だけリトライする
      Utilities.sleep(1000 * 5);
      return UrlFetchApp.fetch(fetchUrl, options);
    }
  };

  let response = fetch_(targetUrl);

  // 国外IPを弾くサイトだと GAS からの直アクセスが 403 になる。
  // その場合だけ、pbandai や animate と同じく国内の踏み台経由で取り直す。
  if (response.getResponseCode() === 403 && ajaxUrl) {
    console.log('[aikatsuOfficialShop] 403のため踏み台経由で再取得');
    response = fetch_(ajaxUrl + encodeURIComponent(targetUrl));
  }

  const code = response.getResponseCode();
  if (code !== 200) {
    console.warn(`[aikatsuOfficialShop] 取得失敗 HTTP ${code}`);
    return list;
  }

  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const toAbsolute = (href) => (href.indexOf('http') === 0 ? href : `${ORIGIN}${href}`);

  const push_ = (date, title, href) => {
    if (!title || !href) return;
    const word = `${date ? `${date} ` : ''}${title} ${toAbsolute(href)}`;
    if (!list.includes(word)) list.push(word);
  };

  // NEWS
  $('#news dl > div').each(function (index, el) {
    const anchor = $(el).find('dd a').first();
    push_(clean($(el).find('time').attr('datetime')), clean(anchor.text()), clean(anchor.attr('href')));
  });

  // TOPICS
  $('#topics li').each(function (index, el) {
    const anchor = $(el).find('a').first();
    // 見出しは a の中の p。img の alt は空なので使えない。
    push_(clean($(el).find('time').attr('datetime')), clean(anchor.find('p').first().text()), clean(anchor.attr('href')));
  });

  console.log(`[aikatsuOfficialShop] ${list.length}件`);
  return list;
};
