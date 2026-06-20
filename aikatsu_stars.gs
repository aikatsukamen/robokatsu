/**
 * 公式に取りに行く
 * @param {String} targetUrl 取得対象弾のURL
 * @returns {String[]} カードリスト
 */
const getStarsCardList = (url) => {
  let cardList = [];
  const response = UrlFetchApp.fetch(url);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  // カードリストを取得する
  $('.card').each(function (index, card) {
    let id = $(card).find('span').text().trim();
    id = id.replace(/\s/g, ' '); // プロモ識別のPとID間のスペースがまばらなので1文字で統一
    let name = $(card).find('img').attr('alt');
    cardList.push(id + ' ' + name);
  });

  return cardList;
};

/**
 * ニュースを公式に取りに行く
 * @param {String} targetUrl 取得対象のURL
 * @returns {String[]} ニュースリスト
 */
const getStarsNewsList = (url) => {
  let newsList = [];
  const response = UrlFetchApp.fetch(url);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);
  // カードリストを取得する
  $('.topicsCol-box > dl').each(function (index, newsDetail) {
    $(newsDetail).find('dt > span').empty();
    let date = $(newsDetail).find('dt').text();
    let message = $(newsDetail).find('dd').text();
    let fullUrl = $(newsDetail).find('dd > a').attr('href');

    newsList.push(`${date} ${message} ${fullUrl}`);
  });

  return newsList;
};
