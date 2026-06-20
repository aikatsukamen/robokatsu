const exe_village_v = () => {
  const list = [];
  const options = {};
  const URL = "https://village-v.co.jp/common/js/topics.json";
  const response = UrlFetchApp.fetch(URL, options)
  const json = JSON.parse(response.getContentText("UTF-8"));

  const link_base = "https://village-v.co.jp";
  const TARGET_STR = ["アイカツ", "aikatsu", "Aikatsu", "AIKATSU"];

  for(let i = 0; i < json.length; i++) {
    if(i > 50) break;
    const item = json[i];
    const name = item.name;
    let isSkip = true;
    for (const target of TARGET_STR) {
      if(name && name.includes(target)) isSkip = false;
    } 
    if(isSkip) continue;

    const url = item.link ? link_base + item.link : "";
    list.push(`${name} ${url}`)
  }

  return list;
}

const __test_exe_village_v = () => {
  console.log(JSON.stringify(exe_village_v(), null, "  "));
}