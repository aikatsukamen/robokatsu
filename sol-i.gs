const exe_solInternational = () => {
  const url = 'https://www.sol-i.co.jp/item/?ca=33';
  const list = [];
  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  $('#itemListBox')
    .find('.col')
    .each((i, v) => {
      const product_name = $(v).find('.product_name').text();
      const item_name = $(v).find('.item_name').text();
      const title = item_name ? `${item_name} ${product_name}` : product_name;
      const href = $(v).find('a').attr('href');
      if (!href) return; // リンクが無い項目はスキップ(従来は undefined.replace で TypeError → .each 全体が中断していた)
      const urlpath = href.replace('./', '').replace('&ca=33', '');
      const url = `https://www.sol-i.co.jp/item/${urlpath}`;
      list.push(`${title} ${url}`);
    });
  // console.log(list);

  return list;
};

const test_exe_solInternational = () => {
  const json = exe_solInternational();

  console.log(JSON.stringify(json));
  console.log(`items: ${json.length}`);
};
