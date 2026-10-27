/**
 * バンプレストナビサイト(プライズ)の「アイカツ！ シリーズ」の商品一覧を取得する。
 *   https://bsp-prize.jp/search/?ref=title&title=IP00002764
 *
 * 作品タイトルページ(/title/IP00002764/)は15件までしか表示されないため、
 * そこから「この作品の商品をもっと見る」で遷移する検索結果ページを対象にする。
 * 全件が1ページに入っており、並びは登場日の新しい順。
 * (スターズ・アカデミー等もこの作品タイトルに含まれている)
 *
 * 商品1件は .products_item > a で、
 *   href                : /item/<商品ID>/
 *   p.products_name     : 商品名
 *   p.products_date     : 登場日 "2026年11月20日（金）<br />登場予定"
 * を持つ。登場日は「登場予定」「より順次登場予定」の2形式が混在するので、
 * パターンを決め打ちせず原文の空白を整えて使う。
 *
 * @param {String} url 取得対象のURL(未指定なら既定の検索URL)
 * @returns {String[]} "登場日 商品名 URL" のリスト
 */
const getBspPrizeList = (url) => {
  const ORIGIN = 'https://bsp-prize.jp';
  const targetUrl = url || `${ORIGIN}/search/?ref=title&title=IP00002764`;
  console.log(`[bspPrize] ${targetUrl}`);

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
  // その場合だけ、国内の踏み台(PROXY_AJAX_URL)経由で取り直す。
  if (response.getResponseCode() === 403 && ajaxUrl) {
    console.log('[bspPrize] 403のため踏み台経由で再取得');
    response = fetch_(ajaxUrl + encodeURIComponent(targetUrl));
  }

  const code = response.getResponseCode();
  if (code !== 200) {
    console.warn(`[bspPrize] 取得失敗 HTTP ${code}`);
    return list;
  }

  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  $('.products_item').each(function (index, el) {
    const anchor = $(el).find('a[href*="/item/"]').first();
    const href = anchor.attr('href') || '';
    const idMatch = href.match(/\/item\/(\d+)/);
    if (!idMatch) return;
    const itemUrl = `${ORIGIN}/item/${idMatch[1]}/`;

    const title = clean($(el).find('.products_name').text());
    if (!title) return;

    // <br> は text() で詰まってしまうので、先に空白へ置き換えてから読む
    const dateEl = $(el).find('.products_date').first();
    dateEl.find('br').replaceWith(' ');
    const date = clean(dateEl.text());

    const word = `${date ? `${date} ` : ''}${title} ${itemUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[bspPrize] ${list.length}件`);
  return list;
};
