/** アイカツプラネットのLINEアカウントの友達登録数 */
function getLineFriendsNum() {
  const url = 'https://timeline.line.me/user/_dZ-8K1cpbOYiSUWiZLYhFWECOWeBVlkZ-Skngqk';

  const response = UrlFetchApp.fetch(url);

  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);
  const friendsNum = $('.posts').find('span:nth-child(1)').text().replace(',', '');
  Logger.log(friendsNum);

  const postNum = $('.posts').find('span:nth-child(2)').text().replace('posts', '');

  const data = [new Date(), friendsNum, postNum];

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('アイカツLINE友達');
  sheet.appendRow(data);
}
