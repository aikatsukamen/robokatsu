const exe_eeoStore = () => {
  const url = 'https://eeo.today/store/101/title/2784';
  const list = [];
  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  $('.ec-shelfGrid')
    .children()
    .each((i, dom) => {
      const a = $(dom).find('a');
      const title = $(a).find('.ec-shelfGrid__item-title').text().trim();
      const url = $(a).attr('href');
      const word = `${title} ${url}`;
      // console.log(word);
      list.push(word);
    });

  return list;
};

const test_exe_eeoStore = () => {
  const json = exe_eeoStore();

  console.log(JSON.stringify(json));
  console.log(`items: ${json.length}`);
};
