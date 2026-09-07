/**
 * データカードダス「アイカツ！アンコール」のプロモーションカードを取得する。
 *   https://dcd.aikatsu.com/encore/cardlist/?search=true&series=629901
 *
 * 取得対象は「カードID 表面の画像URL」。
 * カード名も取得対象に含めたいが、現在の一覧にはカード名のテキストが存在しない
 * (各カードにあるのは画像・表面/裏面・入手方法のみ)。存在しないものを別の
 * テキストで代用すると誤ったデータを通知することになるため、名前は出力しない。
 * カード名が表示されるようになったら、そのDOMを確認したうえで追加すること。
 *
 * ■ 検索の仕組み
 *   カードリストは検索条件を1つ以上指定しないと1枚も返らない
 *   (条件なしだと「検索条件を1つ以上指定してください。」と表示されるだけ)。
 *   series=629901 が弾数セレクトの「プロモーションカード」にあたる。
 *
 * ■ 抽出方法
 *   カード画像は /encore/images/cardlist/card/<カードID>.webp という固定パスで、
 *   裏面は同じIDに _b が付く(<カードID>_b.webp)。
 *   class名はサイト改修で変わりやすいので、この画像パスを手がかりに抽出する。
 *   1枚のカードにつきサムネイルと拡大表示で同じ画像が複数回出るため、IDで重複排除する。
 *
 *   ページャは javascript:void(0) でJS制御のため、全件がHTMLに含まれる。
 *
 * @param {String} url 取得対象のURL(未指定ならプロモーションカードの検索結果)
 * @returns {String[]} "カードID 表面の画像URL" のリスト
 */
const getAikatsuEncorePromoList = (url) => {
  const ORIGIN = 'https://dcd.aikatsu.com';
  const targetUrl = url || `${ORIGIN}/encore/cardlist/?search=true&series=629901`;
  console.log(`[aikatsuEncorePromo] ${targetUrl}`);

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
    console.warn(`[aikatsuEncorePromo] 取得失敗 HTTP ${code}`);
    return list;
  }

  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  const seen = {};
  $('img[src*="/cardlist/card/"]').each(function (index, img) {
    const src = $(img).attr('src') || '';
    if (!src) return;

    // ファイル名からカードIDを取り出す。裏面(_b)は表面と同じカードなのでスキップ。
    const file = src.split('/').pop().split('?')[0];
    const cardId = file.replace(/\.\w+$/, '');
    if (!cardId) return;
    if (/_b$/.test(cardId)) return;
    if (seen[cardId]) return;
    seen[cardId] = true;

    // 相対パスで書かれていても絶対URLにする
    let imageUrl;
    if (src.startsWith('http')) {
      imageUrl = src;
    } else if (src.startsWith('//')) {
      imageUrl = 'https:' + src;
    } else if (src.startsWith('/')) {
      imageUrl = ORIGIN + src;
    } else {
      imageUrl = `${ORIGIN}/encore/cardlist/${src.replace(/^\.\//, '')}`;
    }

    const word = `${cardId} ${imageUrl}`;
    if (list.indexOf(word) < 0) list.push(word);
  });

  console.log(`[aikatsuEncorePromo] ${list.length}件`);
  return list;
};

const test_aikatsuEncorePromo = () => {
  const json = getAikatsuEncorePromoList();
  console.log(JSON.stringify(json, null, '  '));
};
