function exe_neowing() {
  const SHEET_NAME = 'neowing';
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  const data = sheet.getRange(1, 1).getValue();
  console.log(data);
  if (data) {
    console.log('スキップ');
    return;
  }

  const url = 'https://www.neowing.co.jp/product/LACA-15972';
  const list = neowing(url);
  if (!list) {
    console.log('[exe_neowing] 未定だった');
    return;
  }
  sheet.getRange(1, 1).setValue('done');

  // 画像アップロード
  const blob = UrlFetchApp.fetch(list.imgurl).getBlob();
  const posted = exePostMediaMastodon(mastodonConfig.mediaUrl, mastodonConfig.BAERERTOKEN, blob);
  const media_ids = [posted.id];

  const content = list.content;
  console.log(content);
  exetootMastodon(content, media_ids, mastodonConfig.url, mastodonConfig.BAERERTOKEN, mastodonConfig.VISIBILITY);
}

const neowing = (url) => {
  const options = {};
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('UTF-8');
  $ = cheerio.load(content);

  const title = $('.product_info>h1').text().trim();
  if (title.includes('未定')) return null;
  const imgurl = 'https:' + $('.product_large_thumb>a').attr('href');

  let track = '';
  $('.tracklist')
    .find('.track-title')
    .each((i, v) => {
      track += $(v).text().trim() + '\n';
    });

  return { content: `${title}\n\n ・収録曲\n${track}`, imgurl: imgurl };
};

const test_neowing1 = () => {
  const json = neowing('https://www.neowing.co.jp/product/LACA-15971');
  console.log(JSON.stringify(json, null, '  '));
};

const test_neowing2 = () => {
  const json = neowing('https://www.neowing.co.jp/product/LACA-15972');
  console.log(JSON.stringify(json, null, '  '));
};
