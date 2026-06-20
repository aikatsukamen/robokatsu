/**
 * バンダイ キャンディ公式サイトの「キャラクター別 商品一覧」を取得する。
 * 例: アイカツ！シリーズ (character338)
 *   https://www.bandai.co.jp/candy/characters/character338/index.html
 *
 * グッズ系なので "商品名 URL" の形式で返す。
 * 商品リンク(/candy/products/YYYY/xxxx.html)だけを対象にするため、
 * クラス名に依存せず URL パターンで抽出している(壊れにくい)。
 *
 * @param {String} url 取得対象のURL
 * @returns {String[]} "商品名 URL" のリスト
 */
const getBandaiCandyList = (url) => {
  console.log(`[bandaiCandy] ${url}`);
  const list = [];
  const options = { followRedirects: true };

  let response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    // 時々失敗するので1回だけリトライする
    Utilities.sleep(1000 * 5);
    response = UrlFetchApp.fetch(url, options);
  }
  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('a').each(function (index, el) {
    const href = $(el).attr('href');
    // 商品ページ(/products/YYYY/数字.html)へのリンクだけを商品とみなす
    if (!href || !/products\/\d{4}\/\d+\.html/.test(href)) return;

    // 商品名(+発売日)。お気に入りリンクは別要素なので含まれないが、念のため除去
    const title = $(el)
      .text()
      .replace(/\s+/g, ' ')
      .replace(/お気に入り/g, '')
      .trim();
    if (!title) return;

    // URLを絶対パスに正規化
    let fullUrl;
    if (href.startsWith('http')) {
      fullUrl = href;
    } else if (href.startsWith('/')) {
      fullUrl = 'https://www.bandai.co.jp' + href;
    } else {
      fullUrl = 'https://www.bandai.co.jp/candy/' + href.replace(/^\.?\//, '');
    }

    const word = `${title} ${fullUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[bandaiCandy] ${list.length}件`);
  return list;
};

const test_bandaiCandy = () => {
  const json = getBandaiCandyList('https://www.bandai.co.jp/candy/characters/character338/index.html');
  console.log(JSON.stringify(json, null, '  '));
};
