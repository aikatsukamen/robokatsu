const getAikatsuAnimeNews = () => {
  const list = [];

  const url = 'https://www.aikatsu.net/portal/topics/';

  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  $('.topics-list>li').each((index, value) => {
    const day = $(value).find('.topics-list-day').text().replace('★', '').trim();
    const content = $(value).find('.topics-list-text').text().trim();
    const linkSuffix = $(value).find('a').attr('href');
    const link = `https://www.aikatsu.net/portal/topics/${linkSuffix}`;
    const item = `${day} ${content} ${link}`;
    list.push(item);
  });

  return list;
};

function __test_getAikatsuAnimeNews() {
  console.log(JSON.stringify(getAikatsuAnimeNews('https://www.aikatsu.net/news/'), null, '  '));
}
