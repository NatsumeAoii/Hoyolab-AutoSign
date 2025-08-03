<h1 align="center">
<img width="150" height="150" src="pic/logo.svg" alt=""><br>
Hoyolab-Auto-SignIn
</h1>

<p align="center">
<img src="https://img.shields.io/github/license/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
<img src="https://img.shields.io/github/stars/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
<br><a href="/README_zh-ZH.md">繁体中文<a>     <b>日本語<b>     <a href="/README.md">English</a>     <a href="/README_ru-RU.md">Русский</a>
</p>

HoYoLABのデイリーチェックイン報酬を自動で受け取るための、軽量で安全な無料スクリプトです。
『原神』、『崩壊3rd』、『崩壊：スターレイル』に対応。複数のアカウントもサポートしています。

-----

## 特徴 (Features)

  * **マルチバージョン対応**: あなたのニーズに最適なバージョンを選択できます:
    * **Light**: 超高速・高効率。ほとんどのユーザーに最適です。
    * **Original**: シンプルで分かりやすく、初心者向けです。
    * **Robust**: キャッシュ、リクエストのリトライ、パフォーマンス監視などの高度な機能を搭載し、信頼性を最大限に高めています。
  * **安全**: ご自身のGoogle Apps Scriptにデプロイします。認証情報はあなただけのものです。
  * **無料**: Google Apps Scriptの無料枠のみで動作します。
  * **便利**: クラウドで自動的に実行され、DiscordやTelegramに通知を送信します。

-----

## どのバージョンを選ぶべきか (Which Version to Choose?)

| 機能 | Light | Original | Robust |
| :--- | :---: | :---: | :---: |
| **おすすめのユーザー** | ほとんどのユーザー、速度重視 | 初心者、シンプルさ重視 | パワーユーザー、信頼性重視 |
| **パフォーマンス** | 🚀 高速 (並列) | ✅ 良好 (順次) | ✨ 高速 (順次) |
| **主な特徴** | 効率的、モダン | コードが読みやすい | キャッシュ、リトライ、監視機能 |
| **設定** | 単一の`CONFIG`オブジェクト | 個別の変数 | 高度な`AppConfig`オブジェクト |
| **平均実行時間 (秒)** | 0.5s - 3s | 3s - 5s | 4s - 6s |
| **コードの行数** | 250~ | 150~ | 900~ |

-----

## セットアップ (Setup)

1.  [Google Apps Script](https://script.google.com/home/start)にアクセスし、好きな名前で新しいプロジェクトを作成します。

2.  エディタを選択し、[English ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/English/) / [Chinese ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Chinese/) / [Russia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Russian/) / [Japan ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Japanese/) / [Indonesia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Indonesian/) のコードを貼り付けます。以下の指示に従って設定ファイルを構成し、保存します。

3.  「main」を選択し、上部にある「実行」ボタンをクリックします。

4.  必要な権限を許可し、設定が正しいことを確認します（実行ログに「実行開始 > 完了」と表示されます）。

5.  左側の「トリガー」ボタン/タブをクリックし、右下の「トリガーを追加」ボタンで新しいトリガーを追加します。
    実行する関数を選択: `main`
    イベントのソースを選択: 時間主導型
    時間ベースのトリガーのタイプを選択: 日付ベースのタイマー
    時刻を選択: ピーク時を避けた09:00から15:00の間を推奨します。

-----

## 設定 (Configuration)

```javascript
const profiles = [
  {
    token: "account_mid_v2=1l9XXXXXXXXXX; account_id_v2=28XXXXXXX; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXX; ltmid_v2=1lXXXXXXX_XX; ltuid_v2=28XXXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    accountName: "YOUR NAME"
  }
];
```

> 2023年7月、HoYoLABはトークンのルールを変更し、以前の「ltoken」と「ltuid」から「ltoken_v2」と「ltuid_v2」に切り替えました。

<details>
<summary><b>HoYoLABのCookie設定</b></summary>

**この手順に従ってトークンを取得してください** 1. HoYoLAB ([https://www.hoyolab.com/](https://www.hoyolab.com/)) にアクセスしてログインします。
2. プロフィールページに移動します。
3. 開発者ツールを開きます（F12キーまたはCtrl+Shift+I）。
4. 「ネットワーク」タブに移動します。
5. 「Preserve Log」/「Persist Logs」ボタンをクリックします。

```
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E05.png)   
```

6.  ページを更新します。

7.  メソッドが「GET」である`getGameRecordCard`リクエストをクリックします（あなたのHoYoLab UIDと共に「getGameRecordCard」という名前のはずです）。

8.  「Cookies」タブに移動します。

9.  「account_mid_v2」、「account_id_v2」、「ltoken_v2」、「ltmid_v2」、「ltuid_v2」をコピーします。

</details>

<details>
<summary><b>Discord通知設定</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1.  **discord_notify**

    Discord通知を有効にするかどうか。
    自動チェックイン通知を有効にしたい場合は`true`に設定します。不要な場合は`false`に設定してください。

2.  **myDiscordID** - あなたのDiscordユーザーIDを入力してください。

    チェックインに失敗したときにping通知を受け取るかどうか。
    `23456789012345678`のようなあなたのDiscordユーザーIDをコピーし、「""」内に記入します。
    DiscordユーザーIDを見つけるには、[こちらの記事](https://support.discord.com/hc/ja/articles/206346498)を参照してください。
    ping通知が不要な場合は、「""」内を空のままにしてください。

3.  **discordWebhook** - 通知を送信するサーバーチャンネルのDiscord Webhookを入力してください。

    Discord Webhookを作成するには、[こちらの記事](https://support.discord.com/hc/ja/articles/228383668)を参照してください。
    作成が完了すると、`https://discord.com/api/webhooks/1234567890987654321/PekopekoPekopekoPekopeko06f810494a4dbf07b726924a5f60659f09edcaa1`のようなDiscord Webhook URLが発行されます。
    Webhook URLをコピーして、「""」内に貼り付けます。

</details>

<details>
<summary><b>Telegram通知設定</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1.  **telegram_notify**

    Telegram通知を有効にするかどうか。
    自動チェックイン通知を有効にしたい場合は`true`に設定します。不要な場合は`false`に設定してください。

2.  **myTelegramID** - あなたのTelegram IDを入力してください。

    [@IDBot](https://t.me/myidbot)にメッセージを送り、`/getid`コマンドを使用してあなたのTelegramユーザーIDを確認します。
    `123456780`のようなあなたのTelegram IDをコピーし、「""」内に記入します。

3.  **telegramBotToken** - あなたのTelegramボットトークンを入力してください。

    [@BotFather](https://t.me/botfather)にメッセージを送り、`/newbot`コマンドを使用してTelegramで新しいボットを作成します。
    ボットの作成が完了すると、`110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`のようなTelegramボットトークンが発行されます。
    Telegramボットトークンをコピーして、「""」内に記入します。
    より詳しい手順については、[こちらの記事](https://core.telegram.org/bots/features#botfather)を参照してください。

</details>

-----

## デモ (Demo) (不具合あり)

自動チェックインが成功した場合、「OK」と送信されます。
すでに本日チェックイン済みの場合、「旅人さん/開拓者さん/艦長、今日はもうチェックインしましたよ」と送信されます。

<details>
<summary><b>単一のHoYoLABアカウントでの自動チェックイン（Discord通知とpingあり）</b></summary>
『原神』と『崩壊：スターレイル』の自動チェックインを有効にし、Discord通知とpingを有効にします。

```javascript
/** 例 **/
const profiles = [
  { token: "account_mid_v2=123xyzabcd_hi; account_id_v2=26XXXXX20; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3406; ltmid_v2=123xyzabcd_hi; ltuid_v2=26XXXXX20;", 
    genshin: true, 
    honkai_star_rail: true, 
    honkai_3: false, 
    accountName: "HuTao" }
];

const discord_notify = true
const myDiscordID = "240000800000300040"
const discordWebhook = "https://discord.com/api/webhooks/10xxxxxxxxxxxxxxx60/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

</details>

<details>
<summary><b>2つのHoYoLABアカウントでの自動チェックイン（Telegram通知あり）</b></summary>
accountAで『原神』の自動チェックインを有効にし、accountBで『崩壊3rd』の自動チェックインを有効にし、Telegram通知を有効にします。

```javascript
/** 例 **/
const profiles = [
  { token: "account_mid_v2=123xyzabcd_hi; account_id_v2=26XXXXX20; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3406; ltmid_v2=123xyzabcd_hi; ltuid_v2=26XXXXX20;", 
    genshin: true, 
    honkai_star_rail: false, 
    honkai_3: false, 
    accountName: "accountA" },

  { token: "account_mid_v2=456qwertyu_hi; account_id_v2=28XXXXX42; ltoken_v2=v2_GENSHINXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX5566; ltmid_v2=456qwertyu_hi; ltuid_v2=28XXXXX42;", 
    genshin: false, 
    honkai_star_rail: false, 
    honkai_3: true, 
    accountName: "accountB" }
];

const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

</details>

-----

## 変更履歴 (Changelog)

  * **2025-08-01**: **Light**、**Original**、**Robust**の3バージョンに大幅リファクタリング。コード構造とパフォーマンスを改善し、高度な機能（キャッシュ、リトライなど）を追加（Robust版）。
  * **2024-12-03**: 『未定事件簿』と『ゼンレスゾーンゼロ』のサポートを追加。言語別のコードファイルを追加。
  * **2024-02-02**: コードの可読性と保守性を向上。
  * **2023-05-13**: 複数のHoYoLABアカウントのサポートを追加。
  * **2023-05-12**: Telegram通知サポートを追加。
  * **2023-04-27**: 『崩壊3rd』と『崩壊：スターレイル』のサポートを追加。
  * **2022-12-30**: プロジェクト開始。

-----