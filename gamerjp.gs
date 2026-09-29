/**
 * gamer.ne.jp のアイカツ関連ニュースを取得する。
 *
 * gamer.ne.jp は Cloudflare のbot対策により、GASや国内踏み台から
 * 直接スクレイピングすると403で弾かれる(UA変更でもTLSフィンガープリントで判定される)。
 * そのため Google News RSS (site:gamer.ne.jp アイカツ) を経由して取得する。
 *   - タイトルに「アイカツ」を含むものだけ採用(無関係なGamer記事を除外)
 *   - source は基本 "Gamer"
 *
 * URLは出力しない。RSSのlinkは Google News 経由のリダイレクトURLで、
 * 同じ記事でも取得のたびに値が変わるため、URLを含めると同じ記事が
 * 何度も新着として通知されてしまう。
 *
 * @returns {String[]} "日付 タイトル" のリスト
 */
const exe_gamerjp = () => {
  const list = [];
  const RSS_URL =
    'https://news.google.com/rss/search?q=site:gamer.ne.jp%20%E3%82%A2%E3%82%A4%E3%82%AB%E3%83%84&hl=ja&gl=JP&ceid=JP:ja';

  const response = UrlFetchApp.fetch(RSS_URL, { muteHttpExceptions: true, followRedirects: true });
  const code = response.getResponseCode();
  if (code !== 200) {
    console.warn(`[gamerjp] RSS取得失敗 HTTP ${code}`);
    return list;
  }

  const doc = XmlService.parse(response.getContentText('UTF-8'));
  const channel = doc.getRootElement().getChild('channel');
  if (!channel) {
    console.warn('[gamerjp] channelが無い');
    return list;
  }

  for (const item of channel.getChildren('item')) {
    const titleEl = item.getChild('title');
    const titleRaw = titleEl ? titleEl.getText() : '';
    // アイカツ無関係のGamer記事を除外
    if (!titleRaw.includes('アイカツ')) continue;

    // 念のためGamer記事に限定(source要素があれば)
    const sourceEl = item.getChild('source');
    const source = sourceEl ? sourceEl.getText() : '';
    if (source && source !== 'Gamer') continue;

    const pubEl = item.getChild('pubDate');
    const pub = pubEl ? pubEl.getText() : '';

    // Google News RSS は古い記事をランダムに混ぜてくる。
    // pubDate が現在時刻から2日前の記事は読み捨てる(日付が取れない場合は従来通り採用)。
    if (pub) {
      const pubTime = new Date(pub).getTime();
      const CUTOFF_MS = 2 * 24 * 60 * 60 * 1000;
      if (!isNaN(pubTime) && Date.now() - pubTime > CUTOFF_MS) {
        console.log(`[gamerjp] 2日以上前の記事のためスキップ: ${pub} / ${titleRaw}`);
        continue;
      }
    }

    const date = pub ? Utilities.formatDate(new Date(pub), 'Asia/Tokyo', 'yyyy.MM.dd') : '';

    // タイトル末尾の " - Gamer" を除去
    const title = titleRaw.replace(/\s*-\s*Gamer\s*$/, '').trim();

    const word = `${date} ${title}`;
    if (!list.includes(word)) list.push(word);
  }

  return list;
};