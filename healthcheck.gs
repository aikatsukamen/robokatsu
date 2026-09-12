/**
 * ヘルスチェック(定期テスト)
 *
 * サイト構造の変更で取得できなくなった(0件になった)ことを検出するための仕組み。
 * 各所に散らばっていた test_* / __test_* を、このファイルに集約している。
 *
 * ■ 定期実行
 *   healthcheckAll() を週1回のトリガー(時間主導型 > 週タイマー)で実行する。
 *
 * ■ 判定
 *   - 0件            → 異常(サイト構造の変更が疑われる)
 *   - 例外/疎通エラー → 異常(500やタイムアウト等)
 *   - 1件以上        → 正常
 *
 * ■ 通知
 *   異常があったときだけ Discord に通知する(Mastodon には流さない)。
 *   通知には discordWebhook() を直接使う。postMastodon() 系は使わないこと。
 */

/**
 * ヘルスチェック対象。
 * SURVEY_LIST_* をそのまま使うと本番の巡回対象と自動で一致するため、
 * 監視先の追加漏れが起きない。
 *
 * ただし以下は対象から除外する。
 *   - youtube系: APIキーを使う都合で本番と同じ引数組み立てが必要。かつ
 *     APIクォータを消費するため、週1のヘルスチェックでは対象外とする。
 */
const HEALTHCHECK_EXCLUDE_VERSIONS = ['youtubeActivity', 'youtubeActivity2', 'youtubePlaylistItems'];

/**
 * aikatsuVer に対応する取得処理を呼ぶ。
 * main.gs の getList() 内の switch と同じ対応関係を保つこと。
 *
 * @param {String} aikatsuVer 種別
 * @param {String} targetUrl 対象URL
 * @returns {String[]} 取得結果
 */
const healthcheckFetch_ = (aikatsuVer, targetUrl) => {
  switch (aikatsuVer) {
    case 'aikatsuNews':
      return getAikatsuNewsList(targetUrl);
    case 'stars':
      return getStarsCardList(targetUrl);
    case 'starsNews':
      return getStarsNewsList(targetUrl);
    case 'friends':
      return getFriendsCardList(targetUrl);
    case 'friendsNews':
      return getFriendsNewsList(targetUrl);
    case 'onparade':
      return getOnparadeCardList(targetUrl);
    case 'onparadeNews':
      return getOnparadeNewsList(targetUrl);
    case 'planet':
      return getPlanetCardList(targetUrl);
    case 'planetNews':
      return getPlanetNewsList(targetUrl);
    case 'pBandai':
      return getPBandaiItemList(targetUrl);
    case 'pBandai2':
      return getPBandaiItemList2(targetUrl);
    case 'bandaiLifeStyle':
      return getBandaiLifeStyle();
    case 'village-v':
      return exe_village_v();
    case 'lantis':
      return exe_lantis();
    case 'aikatsuAnimeNews':
      return getAikatsuAnimeNews();
    case 'prtimes':
      return exe_prtimes();
    case 'carddass':
      return exe_carddasscom();
    case 'eeostore':
      return exe_eeoStore();
    case 'sol-i':
      return exe_solInternational();
    case 'bnpnews':
      return exe_bnpictures();
    case 'gamerjp':
      return exe_gamerjp();
    case 'gashaponjp':
      return exe_gashapon_jp();
    case 'gashapononline':
      return exe_gashapon_online();
    case 'bandaiCandy':
      return getBandaiCandyList(targetUrl);
    case 'aikatsuEncore':
      return getAikatsuEncoreList(targetUrl);
    case 'aikatsuEncorePromo':
      return getAikatsuEncorePromoList(targetUrl);
    case 'aikatsuCalendar':
      return getAikatsuCalendarList(targetUrl);
    case 'syokuganOhkoku':
      return getSyokuganOhkokuList(targetUrl);
    case 'tsutayaEvent':
      return getTsutayaEventList(targetUrl);
    case 'lifestyleResearches':
      return getLifestyleBandaiResearches(targetUrl);
    case 'gashaponResearches':
      return getGashaponResearches(targetUrl);
    case 'rakutenShop':
      return getRakutenShopList(targetUrl);
    default:
      return null; // 未対応(呼び出し側で「未対応」として扱う)
  }
};

/**
 * ヘルスチェック対象の一覧を作る。
 * @returns {Object[]} {labelName, aikatsuVer, url} の配列
 */
const healthcheckTargets_ = () => {
  const all = []
    .concat(SURVEY_LIST_1, SURVEY_LIST_2, SURVEY_LIST_3, SURVEY_LIST_4, SURVEY_LIST_5, SURVEY_LIST_6, SURVEY_LIST_7);

  const targets = [];
  const seen = {};
  all.forEach((t) => {
    if (!t || !t.aikatsuVer) return;
    if (HEALTHCHECK_EXCLUDE_VERSIONS.indexOf(t.aikatsuVer) >= 0) return;
    // 同一種別・同一URLの重複は1回だけ実行する
    const key = `${t.aikatsuVer}\t${t.url || ''}`;
    if (seen[key]) return;
    seen[key] = true;
    targets.push({ labelName: t.labelName || t.aikatsuVer, aikatsuVer: t.aikatsuVer, url: t.url || '' });
  });
  return targets;
};

/**
 * 全監視先を順にテストし、異常があれば Discord に通知する。
 * 週1回のトリガーから実行する想定。
 */
const healthcheckAll = () => {
  const targets = healthcheckTargets_();
  console.log(`[healthcheck] 対象 ${targets.length}件`);

  const ngList = [];
  const okList = [];

  targets.forEach((t) => {
    let result;
    try {
      result = healthcheckFetch_(t.aikatsuVer, t.url);
    } catch (e) {
      // 疎通エラー・500・タイムアウト等。stack を残して原因を追えるようにする
      const detail = e && e.message ? e.message : String(e);
      console.error(`[healthcheck] NG(例外) ${t.labelName}: ${e && e.stack ? e.stack : e}`);
      ngList.push(`❌ ${t.labelName} … 取得エラー(${detail})`);
      return;
    }

    if (result === null) {
      console.warn(`[healthcheck] 未対応 ${t.labelName}(${t.aikatsuVer})`);
      ngList.push(`⚠️ ${t.labelName} … ヘルスチェック未対応(${t.aikatsuVer})`);
      return;
    }

    if (!Array.isArray(result) || result.length === 0) {
      console.warn(`[healthcheck] NG(0件) ${t.labelName}`);
      ngList.push(`❌ ${t.labelName} … 0件(サイト構造の変更が疑われます)`);
      return;
    }

    console.log(`[healthcheck] OK ${t.labelName} ${result.length}件`);
    okList.push(`${t.labelName}(${result.length})`);
  });

  const summary = `ヘルスチェック結果: 正常 ${okList.length} / 異常 ${ngList.length}(全${targets.length}件)`;
  console.log(`[healthcheck] ${summary}`);

  if (ngList.length === 0) {
    console.log('[healthcheck] 異常なしのため通知しない');
    return;
  }

  // 異常時のみ Discord へ通知する(Mastodon には流さない)
  // Discord の文字数上限(2000)に収まるよう、長い場合は分割して送る
  const header = `⚠️ **ロボカツ ヘルスチェック**\n${summary}\n`;
  notifyHealthcheckToDiscord_(header, ngList);
};

/**
 * 異常一覧を Discord に通知する。2000文字を超えないよう分割する。
 * @param {String} header 先頭に付けるメッセージ
 * @param {String[]} lines 異常の明細
 */
const notifyHealthcheckToDiscord_ = (header, lines) => {
  const LIMIT = 1900; // 2000上限に対し余裕を持たせる
  let buf = header;
  lines.forEach((line) => {
    if ((buf + line + '\n').length > LIMIT) {
      discordWebhook(buf);
      buf = '';
    }
    buf += line + '\n';
  });
  if (buf) discordWebhook(buf);
};

// ---------------------------------------------------------------------------
// 以下、各所に散らばっていた個別テスト。手動で1件だけ確認したいときに使う。
// ---------------------------------------------------------------------------

const test_aikatsuEncore = () => {
  const json = getAikatsuEncoreList('https://dcd.aikatsu.com/encore/news/');
  console.log(JSON.stringify(json, null, '  '));
};

const test_aikatsuEncorePromo = () => {
  const json = getAikatsuEncorePromoList('https://dcd.aikatsu.com/encore/cardlist/?search=true&series=629901');
  console.log(JSON.stringify(json, null, '  '));
};

const test_aikatsuCalendar = () => {
  const json = getAikatsuCalendarList('https://aikatsu-info.github.io/aikatsu-calendar/data/items.json');
  console.log(JSON.stringify(json, null, '  '));
};

const test_bandaiCandy = () => {
  const json = getBandaiCandyList('https://www.bandai.co.jp/candy/characters/character338/index.html');
  console.log(JSON.stringify(json, null, '  '));
};

const test_exe_bnpictures = () => {
  console.log(JSON.stringify(exe_bnpictures(), null, '  '));
};

const test_exe_carddasscom = () => {
  const json = exe_carddasscom();
  console.log(JSON.stringify(json));
};

const test_exe_eeoStore = () => {
  const json = exe_eeoStore();
  console.log(JSON.stringify(json));
  console.log(`items: ${json.length}`);
};

const test_exe_gamerjp = () => {
  console.log(JSON.stringify(exe_gamerjp(), null, '  '));
};

const test_gashaponResearches = () => {
  const json = getGashaponResearches('https://gashapon.jp/member/researches/');
  console.log(JSON.stringify(json, null, '  '));
};

const test_lantis = () => {
  const json = exe_lantis();
  console.log(JSON.stringify(json));
};

const test_lifestyleBandaiResearches = () => {
  const json = getLifestyleBandaiResearches('https://bandai-lifestyle.jp/member/researches/');
  console.log(JSON.stringify(json, null, '  '));
};

const test_neowing1 = () => {
  const json = neowing('https://www.neowing.co.jp/product/LACA-15971');
  console.log(JSON.stringify(json, null, '  '));
};

const test_neowing2 = () => {
  const json = neowing('https://www.neowing.co.jp/product/LACA-15972');
  console.log(JSON.stringify(json, null, '  '));
};

const test_exe_prtimes = () => {
  const json = exe_prtimes();
  console.log(JSON.stringify(json, null, '  '));
};

const test_rakutenShop = () => {
  const json = getRakutenShopList('https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%82%A4%E3%82%AB%E3%83%84/?s=4&sid=356830');
  console.log(JSON.stringify(json, null, '  '));
};

const test_exe_solInternational = () => {
  const json = exe_solInternational();
  console.log(JSON.stringify(json));
  console.log(`items: ${json.length}`);
};

const test_syokuganOhkoku = () => {
  const json = getSyokuganOhkokuList('https://syokugan-ohkoku.com/list-shohin.php?id=900');
  console.log(JSON.stringify(json, null, '  '));
};

const test_tsutayaEvent = () => {
  const json = getTsutayaEventList('https://shibuyatsutaya.tsite.jp/event/?article_tag=aikatsu');
  console.log(JSON.stringify(json, null, '  '));
};

const test_exe_village_v = () => {
  console.log(JSON.stringify(exe_village_v(), null, '  '));
};
