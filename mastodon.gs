// Mastodonの設定上は500までいける
const MAX_LENGTH = 400;

// Mastodon では URL は実際の長さに関わらず23文字として数えられる
const URL_WEIGHT = 23;
const URL_REGEX = /https?:\/\/\S+/g;

/**
 * Mastodon 上での文字数を返す(URL は実長に関わらず23文字換算)。
 * @param {string} text
 * @returns {number}
 */
const mastodonLength = (text) => {
  if (!text) return 0;
  const urls = text.match(URL_REGEX) || [];
  // 実URL長を引いて23文字に置き換える
  return urls.reduce((len, u) => len - u.length + URL_WEIGHT, text.length);
};

/**
 * マストドンへ投稿する
 */
const tootMastodon = (rawmessage, statusUrl, token, visibility, hashtag) => {
  // Mastodon換算(URL=23文字)で500字を超える場合は分割投稿する
  const allLength = mastodonLength(rawmessage) + mastodonLength(hashtag);
  const postMinNum = Math.ceil(allLength / MAX_LENGTH);
  console.log(`allLength(URL23換算): ${allLength} postMinNum: ${postMinNum}`);

  if (postMinNum === 1) {
    // 換算で収まるのでそのまま投稿(実文字数で切り詰めると有効な投稿まで欠けるため切らない)
    exetootMastodon(rawmessage + hashtag, null, statusUrl, token, visibility);
    return;
  }

  // 500字超えてたら行単位で分割投稿処理
  const lines = rawmessage.split('\n');

  const hashLength = mastodonLength(hashtag);
  let contentList = [];
  contentList[0] = '';
  let postIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const baseLength = mastodonLength(contentList[postIndex]);
    const nextLength = mastodonLength(lines[i]);

    // 元+次+ハッシュタグ+改行ぶんの余裕(4)。いずれも URL23文字換算
    if (baseLength + nextLength + hashLength > MAX_LENGTH - 4) {
      console.log(baseLength + nextLength + hashLength + '文字(URL23換算)で超えるので分割');
      // 次へ
      postIndex++;
      contentList[postIndex] = lines[i] + '\n';
    } else {
      // 連結
      contentList[postIndex] += lines[i] + '\n';
    }
  }

  // 投稿(最大4分割。それ以上は省略)
  for (let i = 0; i < 4; i++) {
    const content = contentList[i];
    if (!content) continue;
    exetootMastodon(content + '\n' + hashtag, null, statusUrl, token, visibility);
  }
  if (contentList.length > 4) {
    exetootMastodon('投稿内容が多いので省略します', null, statusUrl, token, visibility);
  }
};

const exetootMastodon = (content, media_ids, statusUrl, token, visibility) => {
  console.log('[exetootMastodon]');
  // 投稿内容
  const tootBody = {
    status: content,
    in_reply_to_id: null,
    media_ids: media_ids,
    sensitive: null,
    spoiler_text: '',
    visibility: visibility,
  };

  // リクエスト
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(tootBody),
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const response = UrlFetchApp.fetch(statusUrl, options);
  const rescontent = response.getContentText('UTF-8');
  console.log(JSON.stringify(rescontent, null, '  '));

  // Discordにも通知しておく
  discordWebhook(content);
};

/** 画像をアップロードする */
const exePostMediaMastodon = (url, token, blob) => {
  // リクエスト
  const options = {
    method: 'POST',
    payload: {
      // https://docs.joinmastodon.org/methods/statuses/media/
      file: blob,
    },
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  const response = UrlFetchApp.fetch(url, options);
  const rescontent = response.getContentText('UTF-8');
  const result = JSON.parse(rescontent);
  console.log(JSON.stringify(result, null, '  '));

  return result;
};

// 動作テスト
function __test_exePostMediaMastodon() {
  const img = 'https://cdn.primagi.jp/assets/images/item/P02/img_codination_1_main.jpg';
  var blob = UrlFetchApp.fetch(img).getBlob();

  exePostMediaMastodon(mastodonConfig.mediaUrl, mastodonConfig.BAERERTOKEN, blob);
}

function __test_tootMastodon() {
  Logger.log(
    JSON.stringify(
      tootMastodon(
        'テ\nス\nト\nテストカツテストカツ\nテストカツ\nテストカツテストカツ',
        mastodonConfig.url,
        getRequiredProp_('MASTODON_TOKEN'),
        'direct',
        '\n#test',
      ),
      null,
      '  ',
    ),
  );
}
