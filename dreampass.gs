/**
 * ドリパスから取得
 * ポイントとかファン数とか順位
 * @param {string} id 映画ID
 */
const getDreamPassData = (id) => {
  if (!id) throw new Error('id指定して');

  const url = `https://www.dreampass.jp/${id}`;
  console.log(`[getDreamPassData] url=${url}`);

  // データ取得
  const options = {
    method: 'get',
    followRedirects: true,
  };

  const response = retryFetch(url, options);
  const content = response.getContentText('UTF-8');

  // これが出る時は50xなのでここに引っかかることは無さそう
  if (content.match("We're sorry, but something went wrong")) {
    console.log(`sorryが出た url=${url}`);
    Utilities.sleep(1000);
    getDreamPassData(id);
    return;
  }

  const $ = cheerio.load(content);

  const title = $('.hMovie').text().trim();
  if (!title) throw new Error('取得失敗！' + id);
  console.log(title);

  const rank = Number($('.current_rank').text().trim());
  const point = Number($('.pointNum').text().trim().replace(/,/g, ''));

  const usersCount = $('#usersCount').text().trim();
  const requestsCount = $('#requestsCount').text().trim().replace(/,/g, '');
  const funsCount = $('[id^=funsCount]').text().trim().replace(/,/g, '');
  const funsPostCount = $('[id^=funsPostCount]').text().trim().replace(/,/g, '');

  // 書き込み
  const data = [new Date(), rank, point, usersCount, requestsCount, funsCount, funsPostCount];

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(`ドリパス-${title}`);
  sheet.appendRow(data);
};

const startDrePass = () => {
  ['m349381'].map((id) => {
    getDreamPassData(id);
  });
};
