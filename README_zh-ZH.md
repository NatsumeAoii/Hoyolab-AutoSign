<h1 align="center">
    <img width="150" height="150" src="pic/logo.svg" alt=""><br>
    Hoyolab-Auto-SignIn
</h1>

<p align="center">
    <img src="https://img.shields.io/github/license/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
    <img src="https://img.shields.io/github/stars/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
    <br><a href="/README_zh-tw.md">繁體中文</a>　<b>English</b>　<a href="/README_ru-RU.md">Русский</a>
</p>

一个轻量级、安全且免费的脚本，自动领取 HoYoLAB 每日签到奖励。  
支持原神、崩坏3、崩坏：星穹铁道、多账户支持。

## 功能
* **轻量化** - 脚本只需最少配置，代码约110行。
* **安全** - 脚本可部署到 Google Apps Script，无需担心数据泄露。
* **免费** - Google Apps Script 当前为免费服务。
* **简单** - 脚本无需浏览器运行，可通过 Discord 或 Telegram 自动通知。

## 设置
1. 进入 [Google Apps Script](https://script.google.com/home/start)，创建一个新项目并命名。
2. 选择编辑器，粘贴 ([代码](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-disc_tele.gs)) 。根据下方指示配置并保存。
3. 选择“main”，点击顶部“运行”按钮。
   
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E04.png)
4. 授予必要权限，确认配置正确 (Execution started > completed)。
5. 点击左侧“触发器”按钮 / 选项卡，点击右下角“添加触发器”。  
   选择运行函数：main  
   选择事件源：时间驱动  
   选择时间触发器类型：每日计时器  
   选择一天中的时间：建议选择非高峰时间，如 09:00 到 15:00 之间。

## 配置

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

> HoYoLAB 于 2023 年 7 月更改了令牌规则，从之前的 "ltoken" 和 "ltuid" 改为 "ltoken_v2" 和 "ltuid_v2"。

> [!重要]  
> HoYoLAB 的 Cookie 已更改为 HttpOnly。无法通过 getToken.js 代码读取 Cookie。  
> 请手动复制 Cookie 获取 account_mid_v2、account_id_v2、ltoken_v2、ltmid_v2 和 ltuid_v2。

<details>
<summary><b>HoYoLAB Cookie 设置</b></summary>

   **按照以下步骤获取令牌**  
   1. 访问 HoYoLAB (https://www.hoyolab.com/) 并登录。
   2. 转到个人资料页面。
   3. 打开开发者工具 (F12 或 Ctrl+Shift+I)。
   4. 转到“网络”选项卡。
   4. 点击“保留日志” / “保留日志”按钮。
      
      ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E05.png)  
   6. 刷新页面。
   7. 点击方法为“GET”的 getGameRecordCard 请求 (请求名为“getGameRecordCard”，带有 HoYoLab UID)。
      
      ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E06.png)  
   8. 转到“Cookie”选项卡。
   9. 复制 "account_mid_v2"、"account_id_v2"、"ltoken_v2"、"ltmid_v2" 和 "ltuid_v2"。
      ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E07.png)  

</details>

<details>
<summary><b>Discord 通知设置 (仅适用于 <a href="https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-discord.gs">Discord 版本</a>)</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1. **discord_notify**

   是否启用 Discord 通知。  
   如果启用自动签到通知，设置为 true；否则设置为 false。

2. **myDiscordID** - 填写您的 Discord 用户 ID。

   如果签到失败，是否希望在 Discord 中收到提醒。  
   复制您的 Discord 用户 ID，如 `23456789012345678` 并填入引号。  
   可参考 [此文章](https://support.discord.com/hc/en-us/articles/206346498) 获取用户 ID。  
   如果不希望提醒，请留空引号。

3. **discordWebhook** - 填写 Discord Webhook URL。

   可参考 [此文章](https://support.discord.com/hc/en-us/articles/228383668) 创建 Webhook。  
   创建完成后，将收到一个 Webhook URL，如 `https://discord.com/api/webhooks/1234567890987654321/PekopekoPekopekoPekopeko06f810494a4dbf07b726924a5f60659f09edcaa1`。  
   复制该 URL 并粘贴到引号中。

</details>

<details>
<summary><b>Telegram 通知设置 (仅适用于 <a href="https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-telegram.gs">Telegram 版本</a>)</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1. **telegram_notify**

   是否启用 Telegram 通知。  
   如果启用自动签到通知，设置为 true；否则设置为 false。

2. **myTelegramID** - 填写您的 Telegram 用户 ID。

   通过向 [@IDBot](https://t.me/myidbot) 发送 `/getid` 指令获取 Telegram 用户 ID。  
   复制您的 Telegram ID，如 `123456780` 并填入引号。

3. **telegramBotToken** - 填写 Telegram Bot Token。

   通过向 [@BotFather](https://t.me/botfather) 发送 `/newbot` 指令创建新 Bot。  
   创建完成后，将收到一个 Bot Token，如 `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`。  
   复制该 Token 并填入引号中。  
   详细步骤请参考 [此文章](https://core.telegram.org/bots/features#botfather)。

</details>

## 演示
自动签到成功，将发送“OK”。  
如果今日已签到，将发送“旅行者/开拓者/舰长，您今天已签到”。

<details>
<summary><b>单个 HoYoLAB 账户自动签到，并通过 Discord 通知和提醒。</b></summary>
启用原神和崩坏：星穹铁道自动签到，启用 Discord 通知，在 Discord 中提醒。

```javascript
/** 示例 **/
const profiles = [
  { token: "account_mid_v2=123xyzabcd_hi; account_id_v2=26XXXXX20; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3406; ltmid_v2=123xyzabcd_hi; ltuid_v2=26XXXXX20;", 
    genshin: true, 
    honkai_star_rail: true, 
    honkai_3: false, 
    accountName: "胡桃" }
];

const discord_notify = true
const myDiscordID = "240000800000300040"
const discordWebhook = "https://discord.com/api/webhooks/10xxxxxxxxxxxxxxx60/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```
![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E02.png)

</details>

<details>
<summary><b>两个 HoYoLAB 账户自动签到，并通过 Telegram 通知。</b></summary>
账号A启用原神自动签到，账号B启用崩坏3自动签到，启用 Telegram 通知。

```javascript
/** 示例 **/
const profiles = [
  {

 token: "account_mid_v2=1l9XXXXXXXXXX; account_id_v2=28XXXXXXX; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXX; ltmid_v2=1lXXXXXXX_XX; ltuid_v2=28XXXXXX;", 
    genshin: true, 
    honkai_star_rail: false, 
    honkai_3: false, 
    accountName: "鐘離" },
  { token: "account_mid_v2=1l9XXXXXXXXXX; account_id_v2=28XXXXXXX; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXX; ltmid_v2=1lXXXXXXX_XX; ltuid_v2=28XXXXXX;", 
    genshin: false, 
    honkai_star_rail: false, 
    honkai_3: true, 
    accountName: "布洛妮娅" }
];

const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```
![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E03.png)

</details>

## 更新日志
- 2022-12-30: 项目启动。  
- 2023-04-27: 增加对崩坏3与崩坏：星穹铁道的支持。  
- 2023-04-27: 增加了 Discord 通知开关。  
- 2023-05-12: 更新获取 Token 流程 ([#2](https://github.com/canaria3406/hoyolab-auto-sign/pull/2))。  
- 2023-05-12: 增加了 Telegram 通知支持 ([#3](https://github.com/canaria3406/hoyolab-auto-sign/pull/3))。  
- 2023-05-13: 增加了对多账号的支持 ([#4](https://github.com/canaria3406/hoyolab-auto-sign/pull/4))。  
- 2024-02-02: 改进了可读性、可维护性，并增加了实验版本，可同时支持 Discord 和 Telegram 通知。  
- 2024-12-03: 增加对《未定事件簿》和《绝区零》的支持，同时针对部分国家提供语言特定版本。 
