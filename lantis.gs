const exe_lantis = () => {
  const targetStr = ['アイカツ', 'AIKATSU', '逢来りん', '松永あかね'];

  // 2025/10 のサイトリニューアル(WordPress化)で news-list.php は廃止され、
  // https://www.lantis.jp/news-list.php → https://lantis.jp/topics/ に転送される。
  const url = 'https://lantis.jp/topics/';
  console.log(`[lantis] ${url}`);
  const list = [];
  const options = {};
  let response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    // 時々403が返ってくるので、1回はリトライする
    Utilities.sleep(1000 * 5);
    response = UrlFetchApp.fetch(url, options);
  }
  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  // 記事は /topics/<種別>/<id>/ という固定パーマリンク(種別: news/event/important 等)。
  // テーマ依存の class 名ではなく、このURL形でアンカーを拾うことでリニューアル耐性を持たせる。
  const seen = {};
  $('a[href*="/topics/"]').each((index, a) => {
    const href = $(a).attr('href');
    if (!href) return;
    // 記事詳細だけを対象にする(一覧 /topics/ やページネーション /topics/page/2/ は除外)
    const m = href.match(/\/topics\/(?!page\/)[a-z]+\/(\d+)\/?$/);
    if (!m) return;
    const id = m[1];
    if (seen[id]) return; // 同一記事が複数アンカーで出るので重複除去
    seen[id] = true;

    // アンカー内テキストから末尾の日付(YYYY.MM.DD)を分離する
    const raw = $(a).text().replace(/\s+/g, ' ').trim();
    const dateMatch = raw.match(/(\d{4}\.\d{2}\.\d{2})\s*$/);
    const date = dateMatch ? dateMatch[1] : '';
    let title = dateMatch ? raw.slice(0, dateMatch.index).trim() : raw;
    // 同一タイトルが2回連結(区切り無し or 空白1つ)で出る場合は1つに畳む
    title = title.replace(/^(.+?) ?\1$/, '$1').trim();

    let isTarget = false;
    targetStr.map((v, i) => {
      if (title.includes(v)) isTarget = true;
    });

    // 出力形式: {日付} {タイトル} {URL}(日付が取れない場合は日付を省く)
    if (isTarget) list.push(`${date ? `${date} ` : ''}${title} ${href}`);
  });

  return list;
};

const test_lantis = () => {
  const json = exe_lantis();

  console.log(JSON.stringify(json));
};
