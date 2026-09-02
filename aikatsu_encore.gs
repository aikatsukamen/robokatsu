/**
 * データカードダス「アイカツ！アンコール」公式サイトの新着情報を取得する。
 *   一覧: https://dcd.aikatsu.com/encore/news/
 *
 * ニュース系なので "日付 タイトル URL" の形式で返す。
 *
 * サイト全面リニューアルにより、以下のように構造が変わった。
 *   旧: リンクテキストが "YYYY.MM.DD タイトル" 形式
 *   新: li.newsColItem > a.newsLink 配下に
 *       h3.text(タイトル) と time.date(YYYY.MM.DD) が分かれて入る
 * 旧方式(リンクテキストの先頭が日付)では一致せず0件になるため、新構造で抽出する。
 *
 * トップページ(/encore/)は新着5件のみだが、一覧ページ(/encore/news/)は
 * ページャがJS制御で全件がHTMLに含まれるため、一覧を取得すれば全件拾える。
 *
 * @param {String} url 取得対象のURL(未指定ならニュース一覧)
 * @returns {String[]} "日付 タイトル URL" のリスト
 */
const getAikatsuEncoreList = (url) => {
  const ORIGIN = 'https://dcd.aikatsu.com';
  const base = `${ORIGIN}/encore/`;
  const targetUrl = url || `${base}news/`;
  console.log(`[aikatsuEncore] ${targetUrl}`);

  const list = [];
  const options = { followRedirects: true, muteHttpExceptions: true };

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
    console.warn(`[aikatsuEncore] 取得失敗 HTTP ${code}`);
    return list;
  }

  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('.newsColItem').each(function (index, el) {
    const link = $(el).find('a.newsLink').first();
    const href = link.attr('href') || '';
    if (!href) return; // リンク無しはスキップ

    let fullUrl;
    if (href.startsWith('http')) {
      fullUrl = href; // 外部リンク(X など)はそのまま
    } else if (href.startsWith('//')) {
      fullUrl = 'https:' + href; // プロトコル相対
    } else if (href.startsWith('/')) {
      // ルート相対("/encore/news/001.php" 形式)。base に単純結合すると
      // /encore/encore/... となり壊れるため、オリジンに結合する。
      fullUrl = ORIGIN + href;
    } else {
      // 相対パス("../pdf/xxx.pdf" 等)。ブラウザと同じく「取得したページのURL」を基準に解決する。
      // 固定の /encore/ を基準にすると ".." が1階層余分に効いてURLが壊れる。
      const pageDir = targetUrl.replace(/[?#].*$/, '').replace(/\/[^/]*$/, '/');
      let path = pageDir + href.replace(/^\.\//, '');
      const m = path.match(/^(https?:\/\/[^/]+)(\/.*)$/);
      if (m) {
        const segs = [];
        m[2].split('/').forEach(function (seg) {
          if (seg === '..') segs.pop();
          else if (seg !== '.') segs.push(seg);
        });
        path = m[1] + segs.join('/');
      }
      fullUrl = path;
    }

    const title = $(el).find('h3.text').text().replace(/\s+/g, ' ').trim();
    if (!title) return;

    // "YYYY.MM.DD"
    const date = $(el).find('time.date').text().replace(/\s+/g, ' ').trim();

    const word = `${date ? `${date} ` : ''}${title} ${fullUrl}`;
    if (!list.includes(word)) list.push(word);
  });

  console.log(`[aikatsuEncore] ${list.length}件`);
  return list;
};
