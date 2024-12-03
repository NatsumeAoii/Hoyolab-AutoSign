<p align="center">
    <img width="150" height="150" src="pic/logo.svg" alt=""><br>
    Hoyolab-Auto-SignIn
</p>

<p align="center">
    <img src="https://img.shields.io/github/license/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
    <img src="https://img.shields.io/github/stars/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
    <br><a href="/README_zh-ZH.md">繁体中文</a>　<b>日本語</b> <a href="/README_en.md">English</a>　<a href="/README_ru-RU.md">Русский</a>
</p>

軽量、安全、無料で自動的にHoYoLABの日々のチェックイン報酬を収集するスクリプトです。  
Genshin Impact、Honkai Impact 3rd、Honkai: Star Railに対応しており、複数アカウントに対応しています。

## 特徴
* **軽量** - スクリプトは最小限の設定で動作し、コードの長さは約110行です。
* **安全** - スクリプトはGoogle Apps Scriptに自己ホストでき、データ漏洩の心配がありません。
* **無料** - Google Apps Scriptは現在無料のサービスです。
* **シンプル** - スクリプトはブラウザなしで実行でき、DiscordまたはTelegramで自動的に通知を送信します。

## 設定
1. [Google Apps Script](https://script.google.com/home/start) にアクセスし、カスタム名で新しいプロジェクトを作成します。
2. エディタを選択し、[コード](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-disc_tele.gs) を貼り付けて、設定ファイルを構成し保存します。
3. 「main」を選択し、上部の「実行」ボタンをクリックします。
   
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E04.png)
4. 必要な権限を付与し、設定が正しいことを確認します（実行開始 > 完了）。
5. 左側の「トリガー」ボタンをクリックし、右下の「新しいトリガーを追加」ボタンで新しいトリガーを追加します。  
   実行する関数を選択：main  
   イベントソースを選択：時間ベース  
   時間ベースのトリガータイプを選択：日次タイマー  
   推奨する時間帯：09:00から15:00のオフピーク時間を選んでください。

## 設定例

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

> HoYoLABは2023年7月にトークンのルールを変更し、以前の「ltoken」と「ltuid」から「ltoken_v2」と「ltuid_v2」に切り替えました。  

> [!重要]
> HoYoLABはCookieをHttpOnlyCookieに変更しました。getToken.jsコードを使用してCookieを読み取ることはできなくなりました。  
> アカウント_mid_v2、account_id_v2、ltoken_v2、ltmid_v2、ltuid_v2を手動でコピーしてトークンを取得してください。

<details>
<summary><b>HoYoLAB Cookie設定</b></summary>

**トークンの取得手順**  
1. HoYoLAB（https://www.hoyolab.com/）にアクセスし、ログインします。
2. プロフィールページに移動します。
3. 開発者ツールを開きます（F12またはCtrl+Shift+I）。
4. 「ネットワーク」タブに移動します。
5. 「ログを保持する」ボタンをクリックします。
      
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E05.png)  
6. ページをリロードします。
7. 「getGameRecordCard」リクエスト（HTTPメソッドが「GET」のもの）をクリックします。
      
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E06.png)  
8. 「Cookie」タブに移動します。
9. 「account_mid_v2」、「account_id_v2」、「ltoken_v2」、「ltmid_v2」、「ltuid_v2」をコピーします。
      
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E07.png)  

</details>

<details>
<summary><b>Discord通知設定（<a href="https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-discord.gs">Discordバージョンのみ</a>）</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1. **discord_notify**

   Discord通知を有効にするかどうか。  
   自動チェックイン通知を有効にする場合はtrue、無効にする場合はfalseに設定します。

2. **myDiscordID** - DiscordのユーザーIDを入力してください。

   チェックインが失敗した場合に通知を受け取りたい場合に使用します。  
   [このリンク](https://support.discord.com/hc/en-us/articles/206346498)を参照して、DiscordのユーザーIDを取得します。

3. **discordWebhook** - 通知を送信するDiscordサーバーのウェブフックURLを入力してください。

   [このリンク](https://support.discord.com/hc/en-us/articles/228383668)を参照してDiscordウェブフックを作成します。  

</details>

<details>
<summary><b>Telegram通知設定（<a href="https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-telegram.gs">Telegramバージョンのみ</a>）</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1. **telegram_notify**

   Telegram通知を有効にするかどうか。  
   自動チェックイン通知を有効にする場合はtrue、無効にする場合はfalseに設定します。

2. **myTelegramID** - TelegramのユーザーIDを入力してください。

   [@IDBot](https://t.me/myidbot)にメッセージを送って、/getidコマンドを使いTelegramのユーザーIDを確認します。

3. **telegramBotToken** - Telegramボットのトークンを入力してください。

   [@BotFather](https://t.me/botfather)にメッセージを送って、新しいボットを作成し、ボットのトークンを取得します。  
   詳細については[こちらの記事](https://core.telegram.org/bots/features#botfather)を参照してください。

</details>

## デモ
自動チェックインが成功した場合、「OK」と表示されます。  
すでにその日チェックインしている場合は、「Traveler/Trailblazer/Captain, you've already checked in today」というメッセージが表示されます。

<details>
<summary><b>Discord通知とPingを使った単一HoYoLABアカウントの自動チェックイン。</b></summary>
Genshin ImpactとHonkai: Star Railの自動チェックインを有効にし、Discord通知とPingを使用します。

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

![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E02.png)

</details>

<details>
<summary><b>Telegram通知を使った二つのHoYoLABアカウントの自動チェックイン。</b></summary>
アカウントAでGenshin Impact、アカウントBでHonkai Impact 3rdを使用し、Telegram通知を有効にします。

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
![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E03.png)

</details>

## Changelog
- 2022-12-30: プロジェクト開始。
- 2023-04-27: Honkai Impact 3rd と Honkai: Star Rail のサポートを追加。
- 2023-04-27: Discord通知の切り替え機能を追加。
- 2023-05-12: トークン取得プロセスを更新（[#2](https://github.com/canaria3406/hoyolab-auto-sign/pull/2)）。
- 2023-05-12: Telegram通知サポートを追加（[#3](https://github.com/canaria3406/hoyolab-auto-sign/pull/3)）。
- 2023-05-13: 複数のHoYoLABアカウントのサポートを追加（[#4](https://github.com/canaria3406/hoyolab-auto-sign/pull/4)）。
- 2024-02-02: 可読性、保守性の向上と、DiscordおよびTelegram通知を1つのコードで実装した実験的バージョンを追加。
- 2024-12-03: Tears of Themis と Zenless Zone Zero のサポートを追加し、いくつかの国に特化した言語を追加。