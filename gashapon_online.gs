const exe_gashapon_online = () => {
  const list = [];
  const options = {};
  const URL = "https://parks2.bandainamco-am.co.jp/category/GASHAPON_NEW_PREORDE/";
  const response = UrlFetchApp.fetch(URL, options)
  const content = response.getContentText("UTF-8")
  $ = cheerio.load(content);

  const TARGET_STR = ["アイカツ", "aikatsu", "Aikatsu", "AIKATSU"];

  $(".item-list>li").each((i, v) => {
    const title = $(v).find(".item-list-item-name").text().trim();
    const url = $(v).find(".item-list-item-name > a").attr("href");
    const price = $(v).find(".item-list-item-price").text().trim().replace(",","");

    let isTarget = false;
    for(const targetWord of TARGET_STR) {
      if(title.includes(targetWord)) isTarget = true;
    }

    if(isTarget) list.push(`${title} ${url}`);

    // console.log(`${title} ${url} ${price}`);
  });

  return list;
}
