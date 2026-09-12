/**
 * アニメイトオンラインショップ の「アイカツ」検索結果を取得する。
 *   https://www.animate-onlineshop.jp/products/list.php?sci=0&smt=アイカツ&ss=5&sl=100&nf=1...
 *
 * GAS の UrlFetchApp から直接アクセスすると 403 になる。GAS の送信元は海外IPで、
 * このサイトは国外IPを弾いているため。pbandai と同じく AWS 東京リージョン(ap-northeast-1)の
 * 踏み台(PROXY_AJAX_URL)を経由し、国内IPからのアクセスにすることで回避する。
 *
 * 主なクエリパラメータ:
 *   smt = 検索語 / sl = 表示件数(100が最大) / ss = 並び順
 *   ss=5 は「登録[新しい]」。検索ヒットは1600件超あるので全件は見ず、
 *   新しく登録されたものから100件を見て差分を取る。
 *
 * 商品1件は li 単位で、h3 > a に商品名と商品ページのリンクを持つ。
 * リンクは /pn/<URLエンコードされた商品名>/pd/<商品ID>/ という形式だが、
 * 商品名部分が変わるとURLも変わってしまい同一商品を新着として誤検知するため、
 * 商品IDだけを取り出して /pd/<商品ID>/ の短い形に組み直す(こちらでも200が返る)。
 *
 * 発売日は p.release に入っているが、"発売日：2026/11/16 発売" のような日付と
 * "発売日：2026年11月中 発売" のような月単位のぼかし表記が混在する(後者が約半数)。
 * グッズ系なので "発売日 商品名 URL" の形式で返す。
 *
 * @param {String} url 取得対象のURL(未指定なら既定の検索URL)
 * @returns {String[]} "発売日 商品名 URL" のリスト
 */
const getAnimateList = (url) => {
  const ORIGIN = 'https://www.animate-onlineshop.jp';
  const targetUrl =
    url ||
    `${ORIGIN}/products/list.php?sci=0&smt=%E3%82%A2%E3%82%A4%E3%82%AB%E3%83%84&ss=5&sl=100&nf=1&spc=&scc=&ssy=&ssm=&sey=&sem=`;

  // 国内IPからのアクセスにするため、AWS東京リージョンの踏み台
  // (Lambda Function URL, スクリプトプロパティ PROXY_AJAX_URL)を経由する。
  // 未設定の環境では直アクセスにフォールバックする(海外IPからだと403になる)。
  const fetchUrl = ajaxUrl ? ajaxUrl + encodeURIComponent(targetUrl) : targetUrl;
  console.log(`[animate] ${fetchUrl}`);

  const list = [];
  const options = { followRedirects: true, muteHttpExceptions: true };

  let response;
  try {
    response = UrlFetchApp.fetch(fetchUrl, options);
  } catch (e) {
    // 時々失敗するので1回だけリトライする
    Utilities.sleep(1000 * 5);
    response = UrlFetchApp.fetch(fetchUrl, options);
  }

  const code = response.getResponseCode();
  if (code !== 200) {
    console.warn(`[animate] 取得失敗 HTTP ${code}`);
    return list;
  }

  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('li').each(function (index, el) {
    // 商品ページへのリンクを持つ li だけが商品。ナビ等の li はここで落ちる。
    const anchor = $(el).find('h3 a[href*="/pd/"]').first();
    const href = anchor.attr('href') || '';
    if (!href) return;

    const idMatch = href.match(/\/pd\/(\d+)/);
    if (!idMatch) return;
    const itemUrl = `${ORIGIN}/pd/${idMatch[1]}/`;

    const title = anchor.text().replace(/\s+/g, ' ').trim();
    if (!title) return;

    // "発売日：2026/11/16 発売" → "2026/11/16"
    // "発売日：2026年11月中 発売" → "2026年11月中"
    // 日付形式とぼかし表記が混在するのでパターンを決め打ちせず、
    // ラベルと末尾の「発売」だけ落として原文のまま使う。
    const date = $(el)
      .find('.release')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^発売日[：:]\s*/, '')
      .replace(/\s*発売$/, '')
      .trim();

    const word = `${date ? `${date} ` : ''}${title} ${itemUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[animate] ${list.length}件`);
  return list;
};