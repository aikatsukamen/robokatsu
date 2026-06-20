/**
 * ニュースを公式に取りに行く
 * @param {String} targetUrl 取得対象のURL
 * @returns {String[]} ニュースリスト
 */
const getAikatsuNewsList = (url) => {
  const newsList = [];
  const response = UrlFetchApp.fetch(url);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  $('.ai_topics-inner > dl').each(function (index, newsDetail) {
    $(newsDetail).find('dt > span').empty();
    let date = $(newsDetail).find('dt').text();
    let message = $(newsDetail).find('dd').text();
    let link = $(newsDetail).find('dd > a').attr('href');
    // 旧カツのURLは相対なので、フルパスにする
    const fullUrl = url.match(/.*\//)[0] + link;

    newsList.push(`${date} ${message} ${fullUrl}`);
  });

  return newsList;
};

function __test_getAikatsuNewsList() {
  Logger.log(JSON.stringify(getAikatsuNewsList('http://www.aikatsu.com/aikatsu.php'), null, '  '));
}
