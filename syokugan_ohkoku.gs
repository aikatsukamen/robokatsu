/**
 * 食玩王国 の「アイカツ」検索結果を取得する。
 *   https://syokugan-ohkoku.com/list-shohin.php?id=900
 *
 * 検索は同URLへの POST で行う(パラメータ名 "seatch-text" はサイト側の綴りに合わせている)。
 * GET で開くと全商品(8MB超)が返り GAS では扱いづらいが、POST 検索なら
 * アイカツ関連だけに絞られ 100KB 未満になる。
 *
 * 商品は .item-wrap 単位で、発売日/タイトル/商品URLを持つ。
 * 先行予約・COMING SOON の商品はリストの末尾に並ぶため、全 .item-wrap を走査する。
 *
 * グッズ系なので "発売日 商品名 URL" の形式で返す。
 *
 * @param {String} url 取得対象のURL(未指定なら既定の検索ページ)
 * @returns {String[]} "発売日 商品名 URL" のリスト
 */
const getSyokuganOhkokuList = (url) => {
  const ORIGIN = 'https://syokugan-ohkoku.com/';
  const targetUrl = url || `${ORIGIN}list-shohin.php?id=900`;
  const SEARCH_WORD = 'アイカツ';
  console.log(`[syokuganOhkoku] ${targetUrl}`);

  const list = [];
  const options = {
    method: 'post',
    // サイトの検索フォームは name="seatch-text"(サイト側のtypo)。変更しないこと。
    payload: { 'seatch-text': SEARCH_WORD },
    followRedirects: true,
    muteHttpExceptions: true,
  };

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
    console.warn(`[syokuganOhkoku] 取得失敗 HTTP ${code}`);
    return list;
  }

  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('.item-wrap').each(function (index, el) {
    const title = $(el).find('.item-webtitle').text().replace(/\s+/g, ' ').trim();
    if (!title) return;
    // 検索結果には無関係な商品が混ざらない想定だが、念のためタイトルで絞る
    if (!title.includes(SEARCH_WORD)) return;

    const href = $(el).find('a[href^="item.php"]').first().attr('href') || '';
    if (!href) return; // リンク無しはスキップ
    const itemUrl = ORIGIN + href.replace(/^\.?\//, '');

    // "YYYY/MM/DD発売"
    const date = $(el).find('.item-status-right b').text().replace(/\s+/g, ' ').trim();

    const word = `${date ? `${date} ` : ''}${title} ${itemUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[syokuganOhkoku] ${list.length}件`);
  return list;
};
