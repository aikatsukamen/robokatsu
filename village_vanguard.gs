// JSON文字列リテラル内の生の制御文字(改行など)を \uXXXX にエスケープしてからパースする。
// village-v の topics.json は文字列内に生の制御文字を含み、厳格な JSON.parse が失敗するため。
const parseJsonLenient_ = (text) => {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    const code = text.charCodeAt(i);
    if (inString && code <= 0x1f) {
      out += '\\u' + ('000' + code.toString(16)).slice(-4);
      continue;
    }
    out += ch;
  }
  return JSON.parse(out);
};

const exe_village_v = () => {
  const list = [];
  const options = {};
  const URL = "https://village-v.co.jp/common/js/topics.json";
  const response = UrlFetchApp.fetch(URL, options);
  const json = parseJsonLenient_(response.getContentText("UTF-8"));

  const link_base = "https://village-v.co.jp";
  const TARGET_STR = ["アイカツ", "aikatsu", "Aikatsu", "AIKATSU"];

  for(let i = 0; i < json.length; i++) {
    // if(i > 50) break;
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