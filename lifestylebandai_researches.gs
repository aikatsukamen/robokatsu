/**
 * ライフスタイルバンダイの商品アンケート一覧から「アイカツ」を含む項目を抽出する。
 *   https://bandai-lifestyle.jp/member/researches/
 *
 * 各項目は li.pg-enqueteList > .pg-enqueteList__txt(タイトル)。
 * 「回答する」リンクは javascript:void(0) で直URLが無いため、リンクには一覧ページURLを使う。
 * アンケート系なので "タイトル URL" の形式で返す。
 *
 * @param {String} url 取得対象のURL(一覧ページ)
 * @returns {String[]} "タイトル URL" のリスト
 */
const getLifestyleBandaiResearches = (url) => {
  console.log(`[lifestyleResearches] ${url}`);
  const list = [];

  let response;
  try {
    response = UrlFetchApp.fetch(url, { followRedirects: true });
  } catch (e) {
    // 時々失敗するので1回だけリトライする
    Utilities.sleep(1000 * 5);
    response = UrlFetchApp.fetch(url, { followRedirects: true });
  }
  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('li.pg-enqueteList').each(function (index, li) {
    // タイトルは全角スペース区切り。\s には全角スペースも含まれるので半角に正規化
    const title = $(li).find('.pg-enqueteList__txt').text().replace(/\s+/g, ' ').trim();
    if (!title || !title.includes('アイカツ')) return;

    // 各アンケートに直URLが無い(回答リンクは javascript:void(0))ため、一覧ページURLを使う
    const word = `${title} ${url}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[lifestyleResearches] ${list.length}件`);
  return list;
};

const test_lifestyleBandaiResearches = () => {
  const json = getLifestyleBandaiResearches('https://bandai-lifestyle.jp/member/researches/');
  console.log(JSON.stringify(json, null, '  '));
};
