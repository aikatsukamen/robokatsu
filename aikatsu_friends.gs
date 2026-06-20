/**
 * 公式に取りに行く
 * @param {String} url 取得対象弾のURL
 * @returns {String[]} カードリスト
 */
const getFriendsCardList = (url) => {
  let cardList = [];
  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);
  // カードリストを取得する
  $('#lists > .data').each(function (index, cardDetail) {
    let id = $(cardDetail).find('.cardNum').text().trim();
    let name = $(cardDetail).find('.cardName').text().trim();
    cardList.push(id + ' ' + name);
  });

  return cardList;
};

/**
 * ニュースを公式に取りに行く
 * @param {String} url 取得対象のURL
 * @returns {String[]} ニュースリスト
 */
const getFriendsNewsList = (url) => {
  let newsList = [];
  const response = UrlFetchApp.fetch(url);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  $('.topicsCol_box > a').each(function (index, newsDetail) {
    // console.log(index);

    $(newsDetail).find('dt > span').empty();
    let date = $(newsDetail).find('dt').text();
    let message = $(newsDetail).find('dd').text();
    let link = $(newsDetail).attr('href');

    newsList.push(`${date} ${message} ${link}`);
  });

  return newsList;
};

function __test_getFriendsCardList() {
  Logger.log(JSON.stringify(getFriendsCardList('https://www.aikatsu.com/friends/cardlist/?search=true&category=458009'), null, '  '));
}

function __test_getFriendsNewsList() {
  Logger.log(JSON.stringify(getFriendsNewsList('https://www.aikatsu.com/friends/'), null, '  '));
}
