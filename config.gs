/**
 * 秘密情報・環境依存設定の一元管理
 *
 * 値は GitHub には置かず、GAS の「スクリプト プロパティ」に保存する。
 * 設定方法: Apps Script エディタ > プロジェクトの設定(歯車) > スクリプト プロパティ
 *           もしくは下の setupScriptProperties_() を一時的に編集して一度だけ実行する。
 *
 * 必要なキー:
 *   MASTODON_TOKEN      ... Mastodon のアクセストークン(Bearer)
 *   YOUTUBE_API_KEY     ... YouTube Data API キー
 *   DISCORD_WEBHOOK_URL ... Discord Webhook URL
 *   PROXY_AJAX_URL      ... プレバン用 国内踏み台(Lambda Function URL)。末尾は "?url=" まで含める
 *
 * 任意のキー:
 *   MASTODON_BASE_URL   ... Mastodon インスタンスのベースURL(例: https://mastodon.social)。
 *                           未設定時は既定の https://kirakiratter.com を使用。
 *                           他インスタンスを使う場合はこれと MASTODON_TOKEN を差し替える。
 */
const SCRIPT_PROPS = PropertiesService.getScriptProperties();

/**
 * スクリプトプロパティから必須の値を取得する。未設定なら例外を投げる。
 * @param {string} key プロパティ名
 * @returns {string} 値
 */
const getRequiredProp_ = (key) => {
  const value = SCRIPT_PROPS.getProperty(key);
  if (value === null || value === '') {
    throw new Error('スクリプトプロパティ "' + key + '" が未設定です。プロジェクトの設定 > スクリプト プロパティ で設定してください。');
  }
  return value;
};

/**
 * スクリプトプロパティから任意の値を取得する。未設定なら defaultValue を返す。
 * @param {string} key プロパティ名
 * @param {string} [defaultValue] 既定値
 * @returns {string} 値
 */
const getOptionalProp_ = (key, defaultValue) => {
  const value = SCRIPT_PROPS.getProperty(key);
  return value === null || value === '' ? defaultValue || '' : value;
};

/**
 * 【任意・初回セットアップ用】
 * GAS の UI からプロパティを設定する代わりに、ここに一時的に値を貼り付けて
 * この関数を一度だけ手動実行すると、まとめてスクリプトプロパティへ登録できる。
 *
 * 注意: 実行後は必ず各値を空文字に戻すこと(コミット・共有時に漏えいしないため)。
 *       この関数自体に本物の値を入れたままにしない。
 */
function setupScriptProperties_() {
  const props = {
    MASTODON_TOKEN: '',
    YOUTUBE_API_KEY: '',
    DISCORD_WEBHOOK_URL: '',
    PROXY_AJAX_URL: '',
  };
  const filtered = {};
  Object.keys(props).forEach((k) => {
    if (props[k] !== '') filtered[k] = props[k];
  });
  if (Object.keys(filtered).length === 0) {
    console.log('値が入力されていません。setupScriptProperties_ 内の各値を設定してから実行してください。');
    return;
  }
  SCRIPT_PROPS.setProperties(filtered, false);
  console.log('設定しました: ' + Object.keys(filtered).join(', '));
}
