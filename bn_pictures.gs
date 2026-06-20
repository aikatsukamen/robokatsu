const exe_bnpictures = () => {
  const list = [];
  /** title, title_nameに含まれてたら抽出 */
  const TARGET_STR = ['アイカツ', 'aikatsu'];
  /** title_nameの抽出対象。完全一致 */
  const TITLE_NAME_TARGET = ['バンダイナムコピクチャーズ'];

  const URL = 'https://www.bn-pictures.co.jp/api/sunrize.php';

  const res = UrlFetchApp.fetch(URL, {
    method: 'post',
    payload: {
      news: 'news',
    },
  });
  const json = JSON.parse(res.getContentText());
  // console.log(json);
  if (json.status !== 'yes') return list;
  const data = json.data;

  for (const items of data) {
    for (const item of items) {
      const { category_name, date, id, links, pdf_url, tag, title, title_name } = item;
      let isTarget = false;
      for (const t of TARGET_STR) {
        if (title.includes(t)) isTarget = true;
        if (title_name.includes(t)) isTarget = true;
      }
      for (const t of TITLE_NAME_TARGET) {
        if (!title.includes('採用情報') && title_name === t) isTarget = true;
      }

      if (isTarget) {
        const url = pdf_url ? pdf_url : `https://www.bn-pictures.co.jp/news/news_detail.html?id=${id}`;
        const titleStr = title.replace('<br />', '').replace('\r', '').replace('\n', '');
        const word = `${date} ${titleStr} ${url}`;

        if (!list.includes(word)) list.push(word);
      }
    }
  }

  return list.sort().reverse();
};

const __test_exe_bnpictures = () => {
  console.log(JSON.stringify(exe_bnpictures(), null, '  '));
};
