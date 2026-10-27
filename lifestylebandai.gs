/**
 * ライフスタイルバンダイ の商品一覧から「アイカツ」の検索結果を取得する。
 *   https://bandai-lifestyle.jp/products/
 *
 * 検索は同URLへの POST(search=アイカツ)で行う。
 * 発売年の絞り込み(ym)は未指定だと当年扱いになるため、ALL を明示している。
 *
 * 商品は .c-card 単位で、.c-card__link に商品ページへのリンク、
 * .c-card__txtTtl に商品名、.c-card__txtDate に発売日を持つ。
 * グッズ系なので "発売日 商品名 URL" の形式で返す。
 *
 * (以前は pbandai.gs に同居していたが、サイトが別なので切り出した)
 *
 * @returns {String[]} "発売日 商品名 URL" のリスト
 */
const getBandaiLifeStyle = () => {
  let list = [];

  const url = 'https://bandai-lifestyle.jp/products/';
  const payload = {
    search: 'アイカツ',
    // 発売年の絞り込み。未指定だと当年(例: ym=2026)扱いになり、
    // 翌年発売の商品が出ないことがあるため、全期間(ALL)を明示する。
    ym: 'ALL',
  };

  const options = {
    method: 'post',
    payload: payload,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  if (code !== 200) {
    // 504等で一時的に落ちることがある。巨大なエラーHTML本文をそのまま例外/ログに乗せず、
    // 短い例外にして retry に委ねる(最終的に getList の catch で握られ、その回はスキップされる)。
    throw new Error(`bandai-lifestyle HTTP ${code}`);
  }
  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('.c-card').each(function (index, item) {
    const url_base = 'https://bandai-lifestyle.jp/products/';
    const link = $(item).find('.c-card__link');
    const href = link.attr('href');
    if (!href) return; // リンク無しはスキップ
    const url = `${url_base}${href.replace(/^\.?\//, '')}`;

    // 商品名はテキスト側を優先し、無ければ画像のaltで代替する
    let name = $(item).find('.c-card__txtTtl').text().replace(/\s+/g, ' ').trim();
    if (!name) name = ($(item).find('.c-card__img').attr('alt') || '').replace(/\s+/g, ' ').trim();
    if (!name) return;

    // 発売日("2026.11.23" のほか "2027.01.中旬" のような表記もあるため文字列のまま扱う)
    const date = $(item).find('.c-card__txtDate').text().replace(/\s+/g, ' ').trim();

    const word = `${date ? `${date} ` : ''}${name} ${url}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[bandaiLifeStyle] ${list.length}件`);
  return list;
};
