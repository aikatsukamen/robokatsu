const exe_lantis = () => {
  const targetStr = ['アイカツ', 'AIKATSU', '逢来りん', '松永あかね'];

  const url = 'https://www.lantis.jp/news-list.php';
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
  $ = cheerio.load(content);

  $('#news-list')
    .find('.news-body')
    .find('h4')
    .each(function (index, detail) {
      const href = $(detail).find('a').attr('href');
      const title = $(detail).text();
      const word = `${title} https://www.lantis.jp/${href}`;
      // console.log(word);

      let isTarget = false;
      targetStr.map((v, i) => {
        if (title.includes(v)) isTarget = true;
      });

      if (isTarget) list.push(word);
    });

  return list;
};

const test_lantis = () => {
  const json = exe_lantis();

  console.log(JSON.stringify(json));
};
