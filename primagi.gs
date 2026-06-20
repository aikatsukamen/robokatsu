/** 今週のめちゃマジ注目スペシャルコーデを投稿する */
function exe_primagi_special() {
  const url = 'https://primagi.jp/c862s5ll/special/';
  const options = {
    method: 'GET',
    headers: {
      'x-requested-with': 'XMLHttpRequest',
    },
  };
  const resStr = UrlFetchApp.fetch(url, options).getContentText();
  const json = JSON.parse(resStr);
  json.coordinates = json.coordinates.map((item) => {
    return {
      ...item,
      link: 'https://primagi.jp' + item.link,
    };
  });
  console.log(json);

  let coodiStr = '';
  const media_ids = [];
  for (const cood of json.coordinates) {
    // アップロード
    var blob = UrlFetchApp.fetch(cood.image).getBlob();
    const posted = exePostMediaMastodon(mastodonConfig.mediaUrl, mastodonConfig.BAERERTOKEN, blob);
    media_ids.push(posted.id);

    // コーデ名
    coodiStr += cood.name + 'コーデ\n';
  }
  Utilities.sleep(5 * 1000);

  const content = `今週のめちゃマジ注目スペシャルコーデ\n${json.date}\n\n${coodiStr}\n${mastodonConfig.hashtag}`;
  console.log(content);

  const retryOpt = {
    count: 0,
    limit: 3,
    interval: 1000,
  };
  retry(exetootMastodon, retryOpt, content, media_ids, mastodonConfig.url, mastodonConfig.BAERERTOKEN, mastodonConfig.VISIBILITY);
}

// トリガーを設定
function setTriggerPrimagi() {
  // 古いトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'exe_primagi_special') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  const time = new Date();
  time.setHours(24); // 翌日
  time.setMinutes(1);
  ScriptApp.newTrigger('exe_primagi_special').timeBased().at(time).create();
}
