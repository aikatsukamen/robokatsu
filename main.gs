// {
//   "url": "起動スクリプトにわたすURL",
//   "preMessage": "投稿時、捕捉として頭につけるテキスト",
//   "sheetName": "スプレッドシートのシート名",
//   "aikatsuVer": "起動スクリプトの種類",
//   "labelName": "投稿時 {xxx} に更新あり ってつけるやつ"
// },
const SURVEY_LIST_1 = [
  {
    url: 'https://www.lantis.jp/news-list.php',
    preMessage: 'https://www.lantis.jp/news-list.php \n',
    sheetName: 'Lantis',
    aikatsuVer: 'lantis',
    labelName: 'Lantisニュース',
  },
  {
    url: 'https://www.aikatsu.net/news/',
    preMessage: '',
    sheetName: 'アイカツアニメ',
    aikatsuVer: 'aikatsuAnimeNews',
    labelName: 'アイカツアニメニュース',
  },
  {
    url: 'https://www.bandai.co.jp/candy/characters/character338/index.html',
    preMessage: '',
    sheetName: 'バンダイキャンディ',
    aikatsuVer: 'bandaiCandy',
    labelName: 'バンダイキャンディ アイカツ！',
  },
  {
    url: 'https://dcd.aikatsu.com/encore/',
    preMessage: '',
    sheetName: 'アイカツアンコール',
    aikatsuVer: 'aikatsuEncore',
    labelName: 'アイカツ！アンコール',
  },
  {
    // gamer.ne.jp は Cloudflare で直取得不可のため Google News RSS 経由(exe_gamerjp 内で取得)
    url: '',
    preMessage: '',
    sheetName: 'GamerJp',
    aikatsuVer: 'gamerjp',
    labelName: 'gamer.ne.jp アイカツニュース',
  },
];

const SURVEY_LIST_2 = [
  {
    url: 'https://www.googleapis.com/youtube/v3/activities?part=snippet&channelId=UCT4XcmNk6uWgw2OpRCm0EgQ&maxResults=20',
    preMessage: 'https://www.youtube.com/@aikatsu_channel/videos \n',
    sheetName: 'アイカツチャンネル',
    aikatsuVer: 'youtubeActivity',
    labelName: 'Youtube アイカツチャンネル',
  },
  {
    url: 'https://www.googleapis.com/youtube/v3/activities?part=snippet&channelId=UCDOJkSTUNY3_NKawpkPvjHg&maxResults=20',
    preMessage: 'https://www.youtube.com/user/aikatsuTV/videos \n',
    sheetName: 'アイチューブ',
    aikatsuVer: 'youtubeActivity',
    labelName: 'Youtube アイチューブ',
  },
  {
    url: 'https://sec.carddass.com/club/',
    preMessage: '',
    sheetName: 'カードダスドットコム',
    aikatsuVer: 'carddass',
    labelName: 'カードダスドットコム',
  },
  {
    url: 'https://www.bn-pictures.co.jp/news/',
    preMessage: '',
    sheetName: 'バンダイナムコピクチャーズ',
    aikatsuVer: 'bnpnews',
    labelName: 'バンダイナムコピクチャーズニュース',
  },
];

const SURVEY_LIST_3 = [
  {
    url: 'https://prtimes.jp/main/action.php?run=html&page=searchkey&search_word=%E3%82%A2%E3%82%A4%E3%82%AB%E3%83%84&search_pattern=1',
    preMessage: '',
    sheetName: 'PRTimes',
    aikatsuVer: 'prtimes',
    labelName: 'PRTimes',
  },
  {
    url: '',
    preMessage: '',
    sheetName: 'ガシャポンjp',
    aikatsuVer: 'gashaponjp',
    labelName: 'ガシャポンjp',
  },
  {
    url: '',
    preMessage: '',
    sheetName: 'ガシャポンオンライン',
    aikatsuVer: 'gashapononline',
    labelName: 'ガシャポンオンライン',
  },
  {
    url: 'https://shibuyatsutaya.tsite.jp/event/?article_tag=aikatsu',
    preMessage: '',
    sheetName: 'TSUTAYAイベント',
    aikatsuVer: 'tsutayaEvent',
    labelName: 'TSUTAYAイベント',
  },
  {
    url: 'https://bandai-lifestyle.jp/member/researches/',
    preMessage: '',
    sheetName: 'ライフスタイルバンダイアンケート',
    aikatsuVer: 'lifestyleResearches',
    labelName: 'ライフスタイルバンダイ アンケート',
  },
  {
    url: 'https://gashapon.jp/member/researches/',
    preMessage: '',
    sheetName: 'ガシャポンjpアンケート',
    aikatsuVer: 'gashaponResearches',
    labelName: 'ガシャポンjp アンケート',
  },
];

const SURVEY_LIST_4 = [
  // {
  //   "url": "https://p-bandai.jp/chara/c2017/?page=1&n=150&C5=all&sort=1",
  //   "preMessage": "",
  //   "sheetName": "プレバン アイカツシリーズ",
  //   "aikatsuVer": "pBandai",
  //   "labelName": "プレミアムバンダイ アイカツ！シリーズ"
  // },
  {
    // "url": "https://p-bandai.jp/search/?keyword=&cate=S0085&disp=p&sort=n&page=0",
    url: '',
    preMessage: '',
    sheetName: 'プレバン アイカツスタイル',
    aikatsuVer: 'pBandai2',
    labelName: 'プレミアムバンダイ アイカツ！スタイル',
  },
  {
    // "url": "https://p-bandai.jp/search/?keyword=&cate=S0085&disp=p&sort=n&page=0",
    url: '',
    preMessage: '',
    sheetName: 'バンダイライフスタイル',
    aikatsuVer: 'bandaiLifeStyle',
    labelName: 'バンダイライフスタイル',
  },
  {
    // "url": "https://p-bandai.jp/search/?keyword=&cate=S0085&disp=p&sort=n&page=0",
    url: '',
    preMessage: '',
    sheetName: 'ヴィレヴァン',
    aikatsuVer: 'village-v',
    labelName: 'ヴィレヴァン',
  },
];

// 更新時に大量項目が追加されやすいサイトは、他サイトの実行を圧迫しないよう
// 専用グループ(startAikatsuSurvey5)に分離する。頻度は Survey1 と同じ5分周期。
const SURVEY_LIST_5 = [
  {
    url: 'https://eeo.today/store/101/title/2784',
    preMessage: '',
    sheetName: 'eeostore',
    aikatsuVer: 'eeostore',
    labelName: 'eeostore',
  },
  {
    url: 'https://www.sol-i.co.jp/item/?ca=33',
    preMessage: '',
    sheetName: 'ソルインターナショナル',
    aikatsuVer: 'sol-i',
    labelName: 'ソルインターナショナル アイカツシリーズ',
  },
];

// 楽天市場 専用(独立トリガー startAikatsuSurvey6。8時・9時の 0/10/30 分のみ実行)
const SURVEY_LIST_6 = [
  {
    url: 'https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%82%A4%E3%82%AB%E3%83%84/?s=4&sid=356830',
    preMessage: '',
    sheetName: '楽天市場',
    aikatsuVer: 'rakutenShop',
    labelName: '楽天市場 アイカツ',
  },
];

// Mastodon の設定。他インスタンスを使う人は MASTODON_BASE_URL と MASTODON_TOKEN を
// 差し替えるだけで利用できる(投稿URL/メディアURLは baseUrl から導出される)。
const mastodonConfig = {
  // インスタンスのベースURL。スクリプトプロパティ MASTODON_BASE_URL で指定(未設定なら既定値)。
  // 例: https://mastodon.social
  get baseUrl() {
    return getOptionalProp_('MASTODON_BASE_URL', 'https://kirakiratter.com');
  },
  // ステータス投稿エンドポイント
  get url() {
    return `${this.baseUrl}/api/v1/statuses`;
  },
  // メディア(画像)アップロードエンドポイント
  get mediaUrl() {
    return `${this.baseUrl}/api/v2/media`;
  },
  // アクセストークンはスクリプトプロパティ MASTODON_TOKEN から取得(参照時に評価)
  get BAERERTOKEN() {
    return getRequiredProp_('MASTODON_TOKEN');
  },
  '//': '公開範囲 direct, private, unlisted or public',
  VISIBILITY: 'public',
  hashtag: '\n#robokatsu',
};

const youtubeConfig = {
  // APIキーはスクリプトプロパティ YOUTUBE_API_KEY から取得(参照時に評価)
  get apiKey() {
    return getRequiredProp_('YOUTUBE_API_KEY');
  },
};

const retryOption = {
  count: 0,
  limit: 3,
  interval: 1000,
};

const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

const checkExecute = () => {
  const date = new Date();
  const nowHour = date.getHours();
  const nowMinutes = date.getMinutes();

  // 実行時間帯
  const EXEC_HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const EXEC_MINUTES = [0, 5, 10, 30, 55];

  if (!EXEC_HOURS.includes(nowHour)) {
    console.log('実行時間帯ではないためスキップ');
    return false;
  }
  if (!EXEC_MINUTES.includes(nowMinutes)) {
    console.log('実行分ではないためスキップ');
    return false;
  }

  return true;
};

// 同一関数の多重起動だけを防ぐガード付き実行。
// シートはサイトごとに分かれているので別トリガー同士は同時実行してよい(別keyなので互いをブロックしない)。
// ただし同じ関数が前回実行中に再起動すると同じ差分を二重通知しうるので、それだけ防ぐ。
const runSurvey_ = async (key, list) => {
  const lockKey = 'RUNNING_' + key;
  const now = Date.now();
  const prev = Number(getOptionalProp_(lockKey, '0'));
  // 前回開始から10分以内で終了印が残っている = まだ実行中とみなしスキップ
  if (prev && now - prev < 10 * 60 * 1000) {
    console.log(`[${key}] 前回の実行が継続中のためスキップ`);
    return;
  }
  SCRIPT_PROPS.setProperty(lockKey, String(now));
  try {
    for (const target of list) {
      await getList(target.url, target.aikatsuVer, target.sheetName, target.labelName, target.preMessage);
    }
  } finally {
    SCRIPT_PROPS.deleteProperty(lockKey);
  }
};

// これを実行する(各 startAikatsuSurvey* に時間主導トリガーを設定)
async function startAikatsuSurvey1() {
  if (!checkExecute()) return;
  await runSurvey_('SURVEY1', SURVEY_LIST_1);
}

async function startAikatsuSurvey2() {
  if (!checkExecute()) return;
  await runSurvey_('SURVEY2', SURVEY_LIST_2);
}

async function startAikatsuSurvey3() {
  if (!checkExecute()) return;
  await runSurvey_('SURVEY3', SURVEY_LIST_3);
}

// eeostore / sol-i 専用(大量更新でも他グループを圧迫しないよう分離)
async function startAikatsuSurvey5() {
  if (!checkExecute()) return;
  await runSurvey_('SURVEY5', SURVEY_LIST_5);
}

// 初回有効化時など、過去分を通知せずにシートだけ埋める(GASエディタから手動で1回だけ実行)。
// 手順: ①下の targets に対象を書く ②seedWithoutNotify を実行(通知されずシートだけ更新される)
//       ③対象を通常の SURVEY_LIST に追加(コメント解除)して通常運用に戻す
// ※第6引数 true が「通知抑制(シートだけ更新)」の指定。
function seedWithoutNotify() {
  const targets = [
    { url: '', aikatsuVer: 'gamerjp', sheetName: 'GamerJp', labelName: 'gamer.ne.jp アイカツニュース', preMessage: '' },
  ];
  for (const t of targets) {
    getList(t.url, t.aikatsuVer, t.sheetName, t.labelName, t.preMessage, true);
  }
}

async function startAikatsuSurvey4() {
  // if(!checkExecute()) return;
  const date = new Date();
  const nowHour = date.getHours();
  const nowMinutes = date.getMinutes();

  // 実行時間帯
  const EXEC_HOURS = [8, 9, 10, 11, 12, 13, 17, 18, 19];
  const EXEC_MINUTES = [0, 5, 10, 30];

  if (!EXEC_HOURS.includes(nowHour)) {
    console.log('実行時間帯ではないためスキップ');
    return false;
  }
  if (!EXEC_MINUTES.includes(nowMinutes)) {
    console.log('実行分ではないためスキップ');
    return false;
  }

  await runSurvey_('SURVEY4', SURVEY_LIST_4);
}

// 楽天市場 専用。8時・9時の 0/10/30 分のみ実行する。
async function startAikatsuSurvey6() {
  const date = new Date();
  const nowHour = date.getHours();
  const nowMinutes = date.getMinutes();

  const EXEC_HOURS = [8, 9];
  const EXEC_MINUTES = [0, 10, 30];

  if (!EXEC_HOURS.includes(nowHour)) {
    console.log('実行時間帯ではないためスキップ');
    return;
  }
  if (!EXEC_MINUTES.includes(nowMinutes)) {
    console.log('実行分ではないためスキップ');
    return;
  }

  await runSurvey_('SURVEY6', SURVEY_LIST_6);
}

// 特定のやつだけ実行する
function __test_startAikatsuSurvey() {
  const num = 0;
  getList(SURVEY_LIST_1[num].url, SURVEY_LIST_1[num].aikatsuVer, SURVEY_LIST_1[num].sheetName, SURVEY_LIST_1[num].labelName, SURVEY_LIST_1[num].preMessage);
}

/**
 * 指定されたURLから得られるリストを取得して差分があればカツする
 * @param {String} targetUrl 取得対象のURL
 * @param {String} aikatsuVer アイカツバージョン stars friends friendsNews
 * @param {String} sheetName リストを保存するJSONファイル名
 * @param {String} labelName 表示名
 */
const getList = async (targetUrl, aikatsuVer, sheetName, labelName, preMessage, suppressNotify) => {
  console.log(`[${labelName}] 取得開始 ${targetUrl} ${aikatsuVer}`);
  let flag = {
    isFileLoaded: false,
    isListUpdated: false,
  };

  let oldList = [];
  let newList = [];
  let diffmessage = '';

  // 取得済みのリストを読み込む
  let sheet = spreadsheet.getSheetByName(sheetName);

  // シートが存在するかチェック
  if (!sheet) {
    console.log(`[${labelName}] シートが無いので作成: ${sheetName}`);
    sheet = spreadsheet.insertSheet(sheetName);
  }

  try {
    const lastcolumn = sheet.getLastColumn();
    const lastrow = sheet.getLastRow();
    const range = sheet.getRange(1, 1, lastrow, lastcolumn).getValues();
    oldList = range.map((item) => item.join());
    flag.isFileLoaded = true;
  } catch (e) {
    console.warn(`[${labelName}] データが読めなかった。[sheet]${sheetName}`);
  }

  try {
    // 指定されたバージョンに応じたリストを読み込む
    switch (aikatsuVer) {
      case 'aikatsuNews':
        newList = await retry(getAikatsuNewsList, retryOption, targetUrl);
        break;
      case 'stars':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getStarsCardList, retryOption, targetUrl);
        break;
      case 'starsNews':
        newList = await retry(getStarsNewsList, retryOption, targetUrl);
        break;
      case 'friends':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getFriendsCardList, retryOption, targetUrl);
        break;
      case 'friendsNews':
        newList = await retry(getFriendsNewsList, retryOption, targetUrl);
        break;
      case 'onparade':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getOnparadeCardList, retryOption, targetUrl);
        break;
      case 'onparadeNews':
        newList = await retry(getOnparadeNewsList, retryOption, targetUrl);
        break;
      case 'planetNews':
        newList = await retry(getPlanetNewsList, retryOption, targetUrl);
        break;
      case 'planet':
        newList = await retry(getPlanetCardList, retryOption, targetUrl);
        break;
      case 'pBandai':
        newList = await retry(getPBandaiItemList, retryOption, targetUrl);
        break;
      case 'pBandai2':
        newList = await retry(getPBandaiItemList2, retryOption, targetUrl);
        break;
      case 'bandaiLifeStyle':
        newList = await retry(getBandaiLifeStyle, retryOption);
        break;
      case 'village-v':
        newList = await retry(exe_village_v, retryOption);
        break;
      case 'youtubeActivity':
        diffmessage = preMessage;
        newList = await retry(getYoutubeActivityList, retryOption, targetUrl + '&key=' + youtubeConfig.apiKey);
        break;
      case 'youtubePlaylistItems':
        diffmessage = preMessage;
        newList = await retry(getYoutubePlaylistItemsList, retryOption, targetUrl + '&key=' + youtubeConfig.apiKey);
        break;
      case 'lantis':
        diffmessage = preMessage;
        newList = await retry(exe_lantis, retryOption);
        break;
      case 'aikatsuAnimeNews':
        newList = await retry(getAikatsuAnimeNews, retryOption);
        break;
      case 'prtimes':
        diffmessage = '';
        newList = await retry(exe_prtimes, retryOption);
        break;
      case 'carddass':
        diffmessage = preMessage;
        newList = await retry(exe_carddasscom, retryOption);
        break;
      case 'eeostore':
        diffmessage = preMessage;
        newList = await retry(exe_eeoStore, retryOption);
        break;
      case 'sol-i':
        diffmessage = preMessage;
        newList = await retry(exe_solInternational, retryOption);
        break;
      case 'bnpnews':
        diffmessage = preMessage;
        newList = await retry(exe_bnpictures, retryOption);
        break;
      case 'gamerjp':
        diffmessage = preMessage;
        newList = await retry(exe_gamerjp, retryOption);
        break;
      case 'gashaponjp':
        diffmessage = '';
        newList = await retry(exe_gashapon_jp, retryOption);
        break;
      case 'gashapononline':
        diffmessage = '';
        newList = await retry(exe_gashapon_online, retryOption);
        break;
      case 'bandaiCandy':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getBandaiCandyList, retryOption, targetUrl);
        break;
      case 'aikatsuEncore':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getAikatsuEncoreList, retryOption, targetUrl);
        break;
      case 'tsutayaEvent':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getTsutayaEventList, retryOption, targetUrl);
        break;
      case 'lifestyleResearches':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getLifestyleBandaiResearches, retryOption, targetUrl);
        break;
      case 'gashaponResearches':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getGashaponResearches, retryOption, targetUrl);
        break;
      case 'rakutenShop':
        diffmessage = `${targetUrl}\n`;
        newList = await retry(getRakutenShopList, retryOption, targetUrl);
        break;
      default:
        console.warn('未定義のバージョン指定');
        return;
    }

    console.log(`[${labelName}] newList: ${newList.length}件 oldList: ${oldList.length}件`);

    // 取得したリストの書き込み
    if (newList.length > 0) {
      console.log(`[${labelName}] データ書き込み: ${sheet.getSheetName()}`);
      const concatArray = Array.from(new Set([...newList, ...oldList])).map((v) => [v]);
      console.log(`[${labelName}] データ書き込み: ${concatArray.length}件`);
      // Spreadsheets サービスは同時アクセス等で時々タイムアウトするため書き込みをリトライする。
      // flush は使わない(ドキュメント単位の強制同期となり、別シートへ書く他トリガーの
      // 同時実行と競合するため)。重複通知は startAikatsuSurvey* の多重起動ガードで防ぐ。
      for (let attempt = 1; ; attempt++) {
        try {
          sheet.getRange(1, 1, concatArray.length, 1).setValues(concatArray);
          break;
        } catch (e) {
          console.warn(`[${labelName}] シート書き込み失敗(${attempt}回目): ${e}`);
          if (attempt >= 3) throw e;
          Utilities.sleep(3000);
        }
      }
    }

    // 差分抽出
    if (flag.isFileLoaded) {
      console.log(`[${labelName}] 差分チェック`);
      newList.map(function (item) {
        if (!oldList.includes(item)) {
          // 増えたもの
          diffmessage += `${item}\n`;
          flag.isListUpdated = true;
        }
      });
      console.log(`[${labelName}] 投稿メッセージ: ${diffmessage}`);
    }

    // 差分を投稿する
    // 旧ファイルが取れて、更新あった時だけカツする
    if (flag.isFileLoaded && flag.isListUpdated && suppressNotify) {
      // シードモード: 新規分はシートに記録済み(上で書き込み)。通知だけスキップする。
      console.log(`[${labelName}] シードモード: 新規分を記録し通知はスキップ`);
    } else if (flag.isFileLoaded && flag.isListUpdated) {
      console.log(`[${labelName}] 更新あり`);
      const katsu_content = `${labelName}に更新あり。\n${diffmessage}`;
      retry(tootMastodon, retryOption, katsu_content, mastodonConfig.url, mastodonConfig.BAERERTOKEN, mastodonConfig.VISIBILITY, mastodonConfig.hashtag);

      saveWebArchiveList(diffmessage, aikatsuVer);
    } else if (flag.isFileLoaded) {
      console.log(`[${labelName}] 更新なし`);
    } else {
      console.log(`[${labelName}] 初回取得なので通知せず終了`);
    }

    return true;
  } catch (e) {
    console.error(JSON.stringify(e, null, '  '));
    return false;
  }
};