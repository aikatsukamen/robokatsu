const getPlanetNewsList = (url) => {
  const list = [];
  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  // 11/5以前の構造
  //  $('.topicsCol_box > dl').each(function(index, value) {
  //    //console.log(index);
  //    //console.log($(value).find('dt')[0].toString());
  //    const day = $(value).find('dt')[0].children[0].data;
  //
  //    const content = $(value).find('dd').text();
  //    const link = $(value).find('dd > a').attr('href');
  //    const fullurl = `${url}/${link}`.replace('://', '★★★★').replace(/\/\//g, '/').replace('★★★★', '://');
  //    const item = `${day} ${content} ${fullurl}`;
  //    //console.log(item);
  //    list.push(item);
  //   });

  // 日付
  const dateList = [];
  $('.topicsList > dt').each(function (index, value) {
    const day = $(value)[0].children[0].data;
    dateList.push(day);
  });

  $('.topicsList > dd').each(function (index, value) {
    const day = dateList[index];

    const content = $(value).text();
    const link = $(value).find('a').attr('href');
    const item = `${day} ${content} ${link}`;
    //console.log(item);
    list.push(item);
  });

  return list;
};

const getPlanetCardList = (url) => {
  const list = [];
  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  $('.lists > .data').each(function (index, data) {
    const cardId = $(data).find('.cardNum').text().trim();
    const cardName = $(data).find('.cardName').text().trim();

    const lv = $(data).find('.dataTable > dl:nth-child(3)').text().trim();

    list.push(`${cardId} ${cardName} ${lv}`);
  });

  return list;
};

function __test_getPlanetNewsList() {
  Logger.log(JSON.stringify(getPlanetNewsList('https://www.aikatsu.com/planet/'), null, '  '));
}

function __test_getPlanetCardList() {
  Logger.log(JSON.stringify(getPlanetCardList('https://www.aikatsu.com/planet/swinglist/index.php?search=true&category=520901'), null, '  '));
}
