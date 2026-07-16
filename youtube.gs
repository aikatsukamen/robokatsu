/**
 * API Activity
 * @param {String} targetUrl 取得対象のURL
 * @returns {String[]} 動画リスト
 */
const getYoutubeActivityList = (url) => {
  let list = [];

  const response = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  // console.log(JSON.stringify(response, null, '  '));
  for (let item of response.items) {
    const title = item.snippet.title;
    const thumnailUrl = item.snippet.thumbnails.default.url;
    //Logger.log(thumnailUrl);
    const temp = thumnailUrl.match(/.*\/([\-0-9a-zA-Z_]+)\/[a-z]+\.jpg/);
    //Logger.log(temp);
    const itemUrl = temp ? `https://www.youtube.com/watch?v=${temp[1]}` : '';

    const msg = `${title} ${itemUrl}`;
    // ときどき同じ動画のactivityが重複するので二重通知を防止する
    if (!list.includes(msg)) list.push(msg);
  }
  return list;
};

/**
 * タイトルにアイカツ系を含む動画のみを抽出するYouTube監視
 * @param {String} targetUrl 取得対象のURL
 * @returns {String[]} 動画リスト
 */
const getYoutubeActivityList2 = (url) => {
  const list = [];

  const TARGET_LIST = ["アイカツ", "AIKATSU", "STAR☆ANIS", "Aikatsu", "aikatsu", "わか", "ふうり", "るか"];

  const response = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  for (let item of response.items) {
    const title = item.snippet.title;
    if (!title) continue;
    if (!TARGET_LIST.find(target => title.includes(target))) continue;

    const thumnailUrl = item.snippet.thumbnails.default.url;
    //Logger.log(thumnailUrl);
    const temp = thumnailUrl.match(/.*\/([\-0-9a-zA-Z_]+)\/[a-z]+\.jpg/);
    //Logger.log(temp);
    const itemUrl = temp ? `https://www.youtube.com/watch?v=${temp[1]}` : '';

    const msg = `${title} ${itemUrl}`;
    // ときどき同じ動画のactivityが重複するので二重通知を防止する
    if (!list.includes(msg)) list.push(msg);
  }
  return list;
};

/**
 * API PlaylistItems
 * @param {String} targetUrl 取得対象のURL
 * @returns {String[]} 動画リスト
 */
const getYoutubePlaylistItemsList = (url) => {
  let list = [];

  const response = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  console.log(JSON.stringify(response, null, '  '));
  for (let item of response.items) {
    list.push(item.snippet.title);
  }

  return list;
};

function __test_getYoutubeActivityList() {
  Logger.log(
    JSON.stringify(
      getYoutubeActivityList('https://www.googleapis.com/youtube/v3/activities?part=snippet&channelId=UCDOJkSTUNY3_NKawpkPvjHg&maxResults=20&key=' + getRequiredProp_('YOUTUBE_API_KEY')),
      null,
      '  ',
    ),
  );
}
