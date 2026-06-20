/**
 * データカードダス「アイカツ！アンコール」公式サイトの新着情報を取得する。
 *   https://dcd.aikatsu.com/encore/
 *
 * ニュース系なので "日付 タイトル URL" の形式で返す。
 * 日付("YYYY.MM.DD")で始まるテキストのリンクを新着情報とみなすため、
 * クラス名に依存せず壊れにくい。
 *
 * @param {String} url 取得対象のURL
 * @returns {String[]} "日付 タイトル URL" のリスト
 */
const getAikatsuEncoreList = (url) => {
  console.log(`[aikatsuEncore] ${url}`);
  const base = 'https://dcd.aikatsu.com/encore/';
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
    // "YYYY.MM.DD タイトル" で始まるリンクを新着情報とみなす
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (!/^\d{4}\.\d{2}\.\d{2}\s/.test(text)) return;

    const href = $(el).attr('href') || '';
    let fullUrl;
    if (href.startsWith('http')) {
      fullUrl = href; // 外部リンク(X など)はそのまま
    } else if (href.startsWith('#')) {
      fullUrl = base + href; // ページ内アンカー
    } else if (href === '' || href.startsWith('javascript')) {
      fullUrl = base;
    } else {
      fullUrl = base + href.replace(/^\.?\//, ''); // 相対パス(pdf 等)
    }

    const word = `${text} ${fullUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[aikatsuEncore] ${list.length}件`);
  return list;
};

const test_aikatsuEncore = () => {
  const json = getAikatsuEncoreList('https://dcd.aikatsu.com/encore/');
  console.log(JSON.stringify(json, null, '  '));
};
