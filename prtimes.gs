const exe_prtimes = () => {
  const targetStr = [
    'アイカツ',
    'アイカツ！',
    'アイカツスターズ',
    'アイカツスターズ！',
    'アイカツフレンズ',
    'アイカツフレンズ！',
    'アイカツオンパレード！',
    'アイカツプラネット',
    'アイカツプラネット！',
    '逢来りん',
  ]; //"諸星すみれ", , "二ノ宮ゆい", "ニノミヤユイ", "松永あかね"

  const BASE_URL = 'https://prtimes.jp/topics/keywords/';
  let list = [];
  const options = {};

  for (const keyword of targetStr) {
    try {
      const url = `${BASE_URL}${keyword}`;
      console.log(url);
      const response = UrlFetchApp.fetch(url, options);
      const content = response.getContentText('UTF-8');
      $ = cheerio.load(content);

      $('.container-thumbnail-list > .item-ordinary').each(function (index, detail) {
        const href = $(detail).find('.title-item').find('a').attr('href');
        // const time = $(detail).find(".time-release").text().trim();
        const title = $(detail).find('.title-item').find('a').text().trim();
        const word = `${title} https://prtimes.jp${href}`;
        // console.log(word);

        list.push(word);
      });
    } catch (e) {
      console.log(e);
      console.warn(`[prtimes] ${keyword} のGETでエラー`);
    }
  }

  try {
    const url = `https://prtimes.jp/main/action.php?run=html&page=searchkey&search_word=アイカツ&search_pattern=1`;
    console.log(url);
    const response = UrlFetchApp.fetch(url, options);
    const content = response.getContentText('UTF-8');
    $ = cheerio.load(content);
    let json = {};
    $('script').each((i, v) => {
      const text = $(v).html();
      // console.log(text);
      if (text.includes('アイカツ')) json = JSON.parse(text);
    });
    console.log(json);
    if (json.page) {
      const releaseList = json.props.pageProps.dehydratedState.queries[0].state.data.pages[0].releaseList;
      for (const item of releaseList) {
        // https://prtimes.jp/main/html/rd/p/000000546.000012048.html
        const articlUrl = `https://prtimes.jp${item.releaseUrl}`;
        const companyName = item.companyName;
        const title = item.title;

        const word = `${title} ${articlUrl}`;
        let isTarget = false;
        for (const str of targetStr) {
          if (title.includes(str)) isTarget = true;
        }
        if (isTarget) {
          // console.log(word);
          list.push(word);
        }
      }
    }
  } catch (e) {
    console.log(e);
    console.warn(`[prtimes] searchのGETでエラー`);
  }

  // 重複削除
  list = list.sort().reverse();
  list = [...new Set(list)];

  return list;
};

const test_exe_prtimes = () => {
  const json = exe_prtimes();

  console.log(JSON.stringify(json, null, '  '));
};
