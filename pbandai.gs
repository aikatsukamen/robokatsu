// 国内踏み台(Lambda Function URL)はスクリプトプロパティ PROXY_AJAX_URL から取得
// 末尾は "?url=" まで含めた値を設定する
const ajaxUrl = getOptionalProp_('PROXY_AJAX_URL', '');

/**
 * 商品情報を取りに行く
 * @param {String} url 取得対象のURL
 * @returns {String[]} リスト
 */
const getPBandaiItemList = (url) => {
  let list = [];

  const options = {
    method: 'get',
    followRedirects: true,
  };
  const newUrl = ajaxUrl + encodeURIComponent(url);
  console.log('newUrl: ' + newUrl);
  const response = UrlFetchApp.fetch(newUrl, options);
  const content = response.getContentText('SHIFT-JIS');

  const $ = cheerio.load(content);
  console.log($('title').text());

  $('#searchMainList')
    .find('li')
    .each(function (index, detail) {
      const itemName = $(detail).find('.search-title').text(); // 商品名
      const href = $(detail).find('a').attr('href');
      if (!href) return; // リンク無し項目はスキップ(従来は undefined.replace で TypeError → .each 全体が中断)
      const itemurl = href.replace(/\?.*/, ''); // 商品URL
      // 相対なので、フルパスにする
      const fullurl = 'https://' + `p-bandai.jp/${itemurl}`.replace(/\/\//g, '/');

      list.push(`${itemName} ${fullurl}`);
    });
  return list;
};

/**
 * 商品情報を取りに行く。アイカツスタイルのページ
 * @param {String} targetUrl 取得対象のURL
 * @returns {String[]} リスト
 */
const getPBandaiItemList2 = (url) => {
  // C2: アイカツ！デザインマート BY アイカツ！スタイルのショップID
  const BASE = 'https://p-bandai.jp/chara_bst_search?text=&C1=&C2=S0085&C3=&C5=all&C6=&p=0&n=100&page=0';
  let list = [];

  const headers = {
    Cookie: getPBandaiCookie(),
  };
  const options = {
    method: 'get',
    headers: headers,
    followRedirects: true,
  };

  const newUrl = ajaxUrl + encodeURIComponent(BASE);
  console.log('newUrl: ' + newUrl);
  const response = UrlFetchApp.fetch(newUrl, options);

  const json = JSON.parse(response.getContentText());

  for (const item of json.records) {
    const itemName = item.title;
    const fullUrl = `https://p-bandai.jp/item/item-${item.url}`;

    list.push(`${itemName} ${fullUrl}`);
  }

  return list;
};

const getBandaiLifeStyle = () => {
  let list = [];

  const url = 'https://bandai-lifestyle.jp/products/';
  const payload = {
    search: 'アイカツ',
  };

  const options = {
    method: 'post',
    payload: payload,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  if (code !== 200) {
    // 504等で一時的に落ちることがある。巨大なエラーHTML本文をそのまま例外/ログに乗せず、
    // 短い例外にして retry に委ねる(最終的に getList の catch で握られ、その回はスキップされる)。
    throw new Error(`bandai-lifestyle HTTP ${code}`);
  }
  const content = response.getContentText('UTF-8');
  const $ = cheerio.load(content);

  $('.productsListCol>li').each(function (index, item) {
    const url_base = 'https://bandai-lifestyle.jp/products/';
    let href = $(item).find('.imgCol').find('a').attr('href');
    const url = href ? `${url_base}${href}` : '';
    let name = $(item).find('.imgCol').find('img').attr('alt');
    console.log(`${name} ${url}`);

    list.push(`${name} ${url}`);
  });

  return list;
};

const getPBandaiCookie = () => {
  const nowYear = new Date().getFullYear();
  const nowMonth = `0${new Date().getMonth() + 1}`.slice(-2);
  const nowDay = new Date().getDate();
  const str = `_CBCA=a%3A1%3A%7Bs%3A3%3A%22rdt%22%3Bs%3A8%3A%22${nowYear}${nowMonth}${nowDay}%22%3B%7D`;
  console.log(str);
  return str;
};

/**
 * 海外IPからプレバンにアクセスした時のCookieを取得する
 */
const getPBandaiCookieByGet = () => {
  const url = 'https://p-bandai.jp/contents/global/';
  const options = {
    method: 'get',
    followRedirects: true,
  };
  const response = UrlFetchApp.fetch(url, options);

  const headers = response.getAllHeaders();
  let cookies = [];

  if (typeof headers['Set-Cookie'] !== 'undefined') {
    // Set-Cookieヘッダーが2つ以上の場合はheaders['Set-Cookie']の中身は配列
    cookies = typeof headers['Set-Cookie'] == 'string' ? [headers['Set-Cookie']] : headers['Set-Cookie'];
    Logger.log(JSON.stringify(cookies, null, '  '));

    for (var i = 0; i < cookies.length; i++) {
      // Set-Cookieヘッダーからname=valueだけ取り出し、セミコロン以降の属性は除外する
      cookies[i] = cookies[i].split(';')[0];
    }
  } else {
    console.log('Set-Cookieがない');
    console.log(JSON.stringify(headers, null, '  '));
    console.log(response.getContentText());
  }

  const cookie = cookies.join(';');
  console.log(cookie);

  return cookie;
};

function __test_getPBandaiCookie() {
  const url = 'https://p-bandai.jp/chara/c2017/?page=0&n=150&C5=all';
  const cookieStr = getPBandaiCookieByGet();

  const options = {
    method: 'get',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      Cookie: cookieStr,
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
    },
    followRedirects: true,
  };
  Logger.log(JSON.stringify(options, null, '  '));
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText('SHIFT-JIS');
  const $ = cheerio.load(content);
  Logger.log($('title').text());
}

function __test_getPBandaiItemList1() {
  Logger.log(JSON.stringify(getPBandaiItemList('https://p-bandai.jp/chara/c2017/?page=1&n=20&C5=all&sort=1'), null, '  '));
}

function __test_getPBandaiItemList2() {
  Logger.log(JSON.stringify(getPBandaiItemList2('https://p-bandai.jp/search/?keyword=&cate=S0085&disp=p&sort=n&page=0'), null, '  '));
}
