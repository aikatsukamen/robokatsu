# robokatsu

各種サイトをスクレイピングして新着情報を抽出し、スプレッドシートと照合・追記したうえで、
新規分を Mastodon と Discord Webhook に通知する Google Apps Script (GAS) プロジェクトです。

コードは GitHub で管理し、`main` への push / マージを契機に GAS へ自動デプロイします（手動デプロイも可）。
インフラはすべて無料枠（GitHub Actions + clasp）で完結します。

---

## 構成

- ソースは `*.gs` と `appsscript.json`。GAS への反映には [clasp](https://github.com/google/clasp) を使用。
- 秘密情報（トークン類）はコードに書かず、GAS の **スクリプト プロパティ** に保存して `config.gs` 経由で参照します。
  そのため GitHub にも、デプロイ後の GAS ソースにも秘密情報は残りません。
- `main` への push で GitHub Actions が `clasp push` を実行して自動デプロイします。
- デプロイ前に `npm run check`（全 `.gs` の構文チェック + 関数名重複チェック）が自動で走り、問題があれば停止します。
  GAS は全 `.gs` が単一スコープを共有するため、同名関数が後勝ちで上書きされる事故を防ぐ目的です。

### 秘密情報・設定（スクリプト プロパティ）

**必須:**

| キー | 用途 |
| --- | --- |
| `MASTODON_TOKEN` | Mastodon のアクセストークン(Bearer) |
| `YOUTUBE_API_KEY` | YouTube Data API キー |
| `DISCORD_WEBHOOK_URL` | Discord Webhook URL |
| `PROXY_AJAX_URL` | 国内踏み台(Lambda Function URL)。末尾は `?url=` まで含める。プレバン・TSUTAYA など海外IP(GAS)で弾かれるサイトの取得に使用 |

**任意:**

| キー | 用途 |
| --- | --- |
| `MASTODON_BASE_URL` | Mastodon インスタンスのベースURL（例 `https://mastodon.social`）。未設定時は既定の `https://kirakiratter.com` を使用。投稿URL・メディアURLはこの値から導出されるため、他インスタンスを使う場合はこれと `MASTODON_TOKEN` を差し替えるだけでよい |

実際の値（旧コードからの控え）はリポジトリには含めず、ローカルの `secrets.local.txt`（gitignore 済み）に退避してあります。

---

## セットアップ手順

### 0. 事前準備

1. [Apps Script API](https://script.google.com/home/usersettings) を **オン** にする（CI からの push に必須）。
2. 対象 GAS プロジェクトの **スクリプト ID** を控える
   （Apps Script エディタ → 左の「プロジェクトの設定」⚙ → 「ID」欄の **スクリプト ID**）。

### 1. スクリプト プロパティを設定（GAS 側・初回のみ）

Apps Script エディタ → 「プロジェクトの設定」⚙ → 「スクリプト プロパティ」で、
上表の **必須キー**を追加します。値は `secrets.local.txt` を参照してください。
（`MASTODON_BASE_URL` は任意。既定の kirakiratter 以外を使う場合のみ設定）

> 代替手段として `config.gs` の `setupScriptProperties_()` に値を一時的に貼り付けて 1 回だけ実行する方法もあります。
> その場合は実行後に必ず値を空に戻してください。

### 2. ローカル環境（手動デプロイ・開発用）

Node.js 20 以上が必要です。

```bash
npm install            # clasp をローカルに導入
npx clasp login        # ブラウザで Google 認証(初回のみ)。~/.clasprc.json が作られる
cp .clasp.json.example .clasp.json   # scriptId を自分のものに書き換える
```

これで手動デプロイが可能になります。

```bash
npm run deploy   # = clasp push --force （GAS へ反映）
```

#### Dev Container を使う場合（任意）

`.devcontainer/` を同梱しています。VS Code の **Dev Containers** 拡張（または GitHub Codespaces）で
「コンテナーで再度開く」を選ぶと、CI と同じ Node 20 環境が立ち上がり、`npm install` まで自動実行されます。

コンテナ内では `clasp login` のブラウザ自動連携が使いにくいため、`--no-localhost` を付けて認証します。

```bash
npx clasp login --no-localhost   # 表示されたURLを開き、コードを貼り戻す
cp .clasp.json.example .clasp.json   # scriptId を書き換える
npm run deploy
```

> 認証情報(`~/.clasprc.json`)はコンテナのホームに作られます。リビルドすると消えるため、
> その場合は再ログインしてください。

### 3. GitHub Secrets を登録（自動デプロイ用）

リポジトリの **Settings → Secrets and variables → Actions → New repository secret** で 2 つ登録します。

| Secret 名 | 中身 |
| --- | --- |
| `CLASPRC_JSON` | ローカルの `~/.clasprc.json`（`clasp login` で生成）の **中身そのもの** |
| `CLASP_JSON` | ローカルの `.clasp.json`（scriptId を含む）の **中身そのもの** |

`~/.clasprc.json` の中身を表示してコピーする例:

```bash
cat ~/.clasprc.json      # Windows(PowerShell): type $HOME\.clasprc.json
cat .clasp.json
```

> `CLASPRC_JSON` にはリフレッシュトークンが含まれます。機密情報として扱い、定期的にローテーションしてください。

---

## デプロイの動かし方

### 自動デプロイ
`main` ブランチへ push / マージすると `.github/workflows/deploy.yml` が走り、`clasp push` で GAS に反映されます。
（`*.gs` / `appsscript.json` などソース変更時のみ起動します）

### 手動デプロイ
- GitHub 上: **Actions → 「Deploy to GAS」→ Run workflow**。
- ローカル: `npm run deploy`。

---

## 運用上の注意

- **GAS エディタで直接コードを編集しない**こと。リポジトリが正（single source of truth）です。
  直接編集すると次回の `clasp push` で上書きされます。
- 定期実行のトリガーは GAS 側で設定します（`clasp push` はコード反映のみで、トリガーは変更しません）。
  実行関数は `startAikatsuSurvey1`〜`startAikatsuSurvey5` で、それぞれに時間主導トリガーを設定してください。
  特に **`startAikatsuSurvey5`（eeostore / sol-i 専用グループ）** の追加を忘れると、その 2 サイトは取得されません。
- 大量更新時の二重通知を防ぐため、`getList` は通知の前に `SpreadsheetApp.flush()` でシート更新を確定します。
- `appsscript.json` は `clasp push` で GAS のマニフェストを上書きします。本リポジトリの内容は
  ランタイム V8 / タイムゾーン Asia/Tokyo / Cheerio ライブラリ（識別子 `libpack`, version 42）を前提にしています。
  GAS 側でライブラリ構成を変えた場合はこのファイルも合わせて更新してください。

### 新しい監視先を有効化するとき（過去分の一括通知を防ぐ）

新しいサイトを有効化すると、初回実行で既存分すべてが「新規」と判定され大量通知されることがあります。
これを防ぐには、有効化の前に **通知せずシートだけ埋める** シード実行を行います。

1. `main.gs` の `seedWithoutNotify()` 内 `targets` に対象を記入（既定で gamerjp の例を記載）。
2. GAS エディタで `seedWithoutNotify` を 1 回手動実行（現在分がシートに記録され、通知はされない）。
3. 対象を通常の `SURVEY_LIST` に追加（コメント解除）して通常運用に戻す。以降は新規分のみ通知されます。

## トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| `Script API not enabled` | https://script.google.com/home/usersettings で Apps Script API をオン |
| `401 Unauthorized` | ローカルで `clasp login` し直し、`CLASPRC_JSON` を更新 |
| `ENOENT .clasp.json` | Secrets の `CLASP_JSON` が未設定。手順 3 を確認 |
| push は成功するがコードが変わらない | `CLASP_JSON` の scriptId が対象プロジェクトと一致しているか確認 |
| スクリプトプロパティ "XXX" が未設定です | 手順 1 のスクリプト プロパティ設定漏れ |
