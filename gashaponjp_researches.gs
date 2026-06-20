/**
 * ガシャポンjp の商品アンケート一覧から「アイカツ」を含む項目を抽出する。
 *   https://gashapon.jp/member/researches/
 *
 * 各アンケートは .item_text 内の a(タイトル + /member/researches/charaenq/NNNN へのリンク)。
 * カテゴリ見出し(li.category_name)は .item_text の外なので自然に除外される。
 * アンケート系なので "タイトル URL" の形式で返す。
 *
 * @param {String} url 取得対象のURL(一覧ページ)
 * @returns {String[]} "タイトル URL" のリスト
 */
const getGashaponResearches = (url) => {
  console.log(`[gashaponResearches] ${url}`);
  const base = 'https://gashapon.jp';
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

  $('.item_text a').each(function (index, a) {
    const title = $(a).text().replace(/\s+/g, ' ').trim();
    if (!title || !title.includes('アイカツ')) return;

    const href = $(a).attr('href') || '';
    const fullUrl = href.startsWith('http') ? href : base + (href.startsWith('/') ? '' : '/') + href;

    const word = `${title} ${fullUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[gashaponResearches] ${list.length}件`);
  return list;
};

const test_gashaponResearches = () => {
  const json = getGashaponResearches('https://gashapon.jp/member/researches/');
  console.log(JSON.stringify(json, null, '  '));
};
