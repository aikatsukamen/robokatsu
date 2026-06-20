/**
 * 渋谷TSUTAYA のイベント一覧(アイカツ タグ)を取得する。
 *   https://shibuyatsutaya.tsite.jp/event/?article_tag=aikatsu
 *
 * イベント(ニュース)系なので "日付 タイトル URL" の形式で返す。
 * サーバサイドレンダリング(生HTMLに要素が含まれる)なので cheerio で解析する。
 * 各イベントは a.cardItem__link に、日付/タイトルはその中の
 * .cardItem__contents__date / .cardItem__contents__title に入っている。
 *
 * @param {String} url 取得対象のURL
 * @returns {String[]} "日付 タイトル URL" のリスト
 */
const getTsutayaEventList = (url) => {
  console.log(`[tsutayaEvent] ${url}`);
  const base = 'https://shibuyatsutaya.tsite.jp';
  const list = [];

  // 海外IP(GASサーバ)からは403になるため、国内踏み台(PROXY_AJAX_URL)経由で取得する。
  // PROXY_AJAX_URL は末尾が "?url=" の踏み台URL。未設定なら直接アクセス。
  const proxy = getOptionalProp_('PROXY_AJAX_URL', '');
  const fetchUrl = proxy ? proxy + encodeURIComponent(url) : url;

  let response;
  try {
    response = UrlFetchApp.fetch(fetchUrl, { followRedirects: true });
  } catch (e) {
    // 時々失敗するので1回だけリトライする
    Utilities.sleep(1000 * 5);
    response = UrlFetchApp.fetch(fetchUrl, { followRedirects: true });
  }
  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('a.cardItem__link').each(function (index, el) {
    const href = $(el).attr('href');
    if (!href) return;

    // 日付("2025.12.20(土) - " 等) 末尾のハイフンは除去
    const date = $(el)
      .find('.cardItem__contents__date')
      .text()
      .replace(/\s+/g, ' ')
      .replace(/-\s*$/, '')
      .trim();
    const title = $(el).find('.cardItem__contents__title').text().replace(/\s+/g, ' ').trim();
    if (!title) return;

    // URLを絶対パスに正規化
    const fullUrl = href.startsWith('http') ? href : base + (href.startsWith('/') ? '' : '/') + href;

    const word = `${date} ${title} ${fullUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[tsutayaEvent] ${list.length}件`);
  return list;
};

const test_tsutayaEvent = () => {
  const json = getTsutayaEventList('https://shibuyatsutaya.tsite.jp/event/?article_tag=aikatsu');
  console.log(JSON.stringify(json, null, '  '));
};
