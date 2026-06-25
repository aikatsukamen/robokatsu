const exe_gashapon_jp = () => {
  const list = [];
  const options = {};
  const URL_BASE = "https://gashapon.jp/schedule/?ym=";
  const TARGET_STR = ["アイカツ", "aikatsu", "Aikatsu", "AIKATSU"];

  const dates = [];

  const d = new Date();
  d.setDate(1);
  for(let i = 0; i < 3;i++) {
    const y = d.getFullYear();
    const m = `00${d.getMonth() + 1}`.slice(-2);
    dates.push(`${y}${m}`);
    d.setMonth(d.getMonth() + 1);
  }

  for(const date of dates) {
    const url = `${URL_BASE}${date}`;
    console.log(url);
    const response = UrlFetchApp.fetch(url, options)
    const content = response.getContentText("UTF-8")
    $ = cheerio.load(content);

    $(".pg-data__schedule").find(".c-card__list").each((i, v) => {
      const title = $(v).find(".c-card__name").text();
      const href = $(v).find(".c-card__link").attr("href");
      if (!href) return; // リンク無し項目はスキップ(従来は undefined.replace で TypeError → .each 全体が中断)
      const url = "https://gashapon.jp" + href.replace("../", "/");

      let isTarget = false;
      for(const targetWord of TARGET_STR) {
        if(title.includes(targetWord)) isTarget = true;
      }

      if(isTarget) list.push(`${title} ${url}`);

      // console.log(`${title} ${url} ${price}`);
    });
  }

  console.log(list);
  return list;
}
