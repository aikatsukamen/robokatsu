/**
 * 関数のリトライ。limit 回まで再試行し、超過したら最後の例外を投げる。
 * GAS には setTimeout が無いため Utilities.sleep を使う(同期)。
 */
const retry = (fn, option, ...args) => {
  let lastError;
  for (let attempt = 0; attempt <= option.limit; attempt++) {
    try {
      return fn(...args); // 同期。await 側はそのまま値を受け取れる
    } catch (error) {
      lastError = error;
      if (attempt >= option.limit) break;
      console.warn(`エラー リトライします(${attempt + 1}/${option.limit}) ${error}`);
      Utilities.sleep(option.interval);
    }
  }
  console.error('リトライ超過 ' + lastError);
  throw lastError;
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
