/**
 * 楽天市場のショップ内検索(アイカツ)から商品を抽出する。
 *   https://search.rakuten.co.jp/search/mall/アイカツ/?s=4&sid=356830  (s=4: 新着順)
 *
 * 商品リンクは item.rakuten.co.jp/<shop>/<code>/。
 * クラス名はCSSモジュールのハッシュ値で変わりやすいため、URLパターンで抽出する(壊れにくい)。
 * 同一商品に画像リンク(テキスト無し)と商品名リンクがあるので、URLごとに最長テキスト=商品名を採用。
 * グッズ系なので "商品名 URL" の形式で返す。
 *
 * @param {String} url 取得対象のURL(検索結果ページ)
 * @returns {String[]} "商品名 URL" のリスト
 */
const getRakutenShopList = (url) => {
  console.log(`[rakutenShop] ${url}`);
  const list = [];

  // 既定UAだと弾かれる場合があるためブラウザ相当のヘッダを付ける
  const options = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    },
    muteHttpExceptions: true,
    followRedirects: true,
  };

  let response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    // 時々失敗するので1回だけリトライする
    Utilities.sleep(1000 * 5);
    response = UrlFetchApp.fetch(url, options);
  }
  const code = response.getResponseCode();
  if (code !== 200) {
    console.warn(`[rakutenShop] HTTP ${code}`);
    return list;
  }
  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  // 同一商品URLごとに最も長いテキスト(=商品名)を採用する(画像リンクはテキスト無しなので除外)
  const titleByUrl = {};
  $('a[href*="item.rakuten.co.jp"]').each(function (i, a) {
    const href = ($(a).attr('href') || '').split('?')[0]; // トラッキングのクエリは除去
    if (!href) return;
    const text = $(a).text().replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (!titleByUrl[href] || text.length > titleByUrl[href].length) {
      titleByUrl[href] = text;
    }
  });

  Object.keys(titleByUrl).forEach((href) => {
    list.push(`${titleByUrl[href]} ${href}`);
  });

  console.log(`[rakutenShop] ${list.length}件`);
  return list;
};

const test_rakutenShop = () => {
  const json = getRakutenShopList('https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%82%A4%E3%82%AB%E3%83%84/?s=4&sid=356830');
  console.log(JSON.stringify(json, null, '  '));
};
