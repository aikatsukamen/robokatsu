const exe_carddasscom = () => {
  const TARGET_STR = ['アイカツ', 'AIKATSU', 'aikatsu', 'Aikatsu'];

  const url = 'https://sec.carddass.com/club/';
  const list = [];
  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  let date = '';
  $('.thirdCol')
    .children()
    .each(function (index, dom) {
      const tagName = $(dom).prop('tagName');
      // console.log(tagName);
      if (tagName === 'H4') {
        date = $(dom).text().trim();
        // console.log(`carddass ${date}`);
      } else {
        // <dl class="clearfix">
        $(dom)
          .find('a')
          .each((i, d) => {
            const url = $(d).attr('href');
            const text = $(d).text();
            const word = `${date} ${text} ${url}`;

            let isTarget = false;
            TARGET_STR.map((v, i) => {
              if (text.includes(v)) isTarget = true;
            });

            if (isTarget) list.push(word);
          });
      }
    });

  return list;
};

const test_exe_carddasscom = () => {
  const json = exe_carddasscom();

  console.log(JSON.stringify(json));
};
