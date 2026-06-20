/**
 * 関数のリトライ。失敗時はExceptionが飛ぶ
 * @param {Function} fn
 * @param {{count: number, limit: number, interval: number}} option
 * @param  {...any} args
 */
const retry = (fn, option, ...args) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fn(...args);
      resolve(data);
    } catch (error) {
      if (option.count >= option.limit) {
        console.error('リトライ超過' + error);
        reject(error);
      } else {
        console.warn('エラー　リトライします ' + error);
        setTimeout(async () => resolve(await retry(fn, { ...option, count: option.count + 1 }, ...args)), option.interval);
      }
    }
  });
};

const retryFetch = (url, option) => {
  console.log(`url=${url} option=${JSON.stringify(option)}`);

  let lastError = null;
  for (let i = 0; i < 5; i++) {
    try {
      const res = UrlFetchApp.fetch(url, option);
      if (res.getResponseCode() === 200) {
        return res;
      } else {
        lastError = 'HTTPステータスコードが200以外: ' + res.getResponseCode() + ', ' + url;
      }
    } catch (e) {
      lastError = e;
      Logger.log(e);
    }
    console.log(`retry url=${url}`);
    Utilities.sleep(3000);
  }
  console.log(`retry over url=${url}`);
  throw lastError + ', ' + url;
};

function saveFile(folderId, filename, str) {
  const folder = DriveApp.getFolderById(folderId);
  const contentType = 'text/plain';
  const charset = 'utf-8';

  var blob = Utilities.newBlob('', contentType, filename).setDataFromString(str, charset);

  // ファイルに保存
  folder.createFile(blob);
}

const cheerio = libpack.cheerio();

/** WebArchiveにURLを保存する */
const saveWebArchiveList = (diffmessage, aikatsuVer) => {
  console.log('[saveWebArchiveList] aikatsuVer=' + aikatsuVer);
  if (
    aikatsuVer !== 'aikatsuNews' &&
    aikatsuVer !== 'bnpnews' &&
    aikatsuVer !== 'planetNews' &&
    aikatsuVer !== 'lantis' &&
    aikatsuVer !== 'aikatsuAnimeNews' &&
    aikatsuVer !== 'prtimes' &&
    aikatsuVer !== 'eeostore' &&
    aikatsuVer !== 'sol-i'
  ) {
    console.log('[saveWebArchiveList] skip');
    return;
  }

  const lines = diffmessage.split('\n');
  for (const line of lines) {
    const urlMatch = line.match(/http.*/);
    if (!urlMatch) continue;
    const url = urlMatch[0];
    saveWebArchive(url);
  }
};

const saveWebArchive = (url) => {
  const save_url = 'https://web.archive.org/save/' + url;
  console.log(save_url);
  try {
    var options = {
      muteHttpExceptions: true, // 404エラーでも処理を継続する
    };
    const responseDataGET2 = UrlFetchApp.fetch(save_url, options);
    const code = responseDataGET2.getResponseCode();
    console.log(save_url + ' ' + code);
  } catch (e) {
    console.error(`[saveWebArchive] エラー=${url}`);
  }
};

const discordWebhook = (content) => {
  try {
    const url = getRequiredProp_('DISCORD_WEBHOOK_URL');
    const body = {
      content: content,
    };

    const options = {
      method: 'post',
      headers: {},
      contentType: 'application/json',
      payload: JSON.stringify(body),
    };

    const res = UrlFetchApp.fetch(url, options);
    console.log(`Discord Webhook status = ${res.getResponseCode()}`);
  } catch (e) {
    console.error(e);
  }
};
