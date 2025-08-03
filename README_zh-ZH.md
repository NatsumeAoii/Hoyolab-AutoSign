<h1 align="center">
<img width="150" height="150" src="pic/logo.svg" alt=""><br>
Hoyolab-Auto-SignIn
</h1>

<p align="center">
<img src="https://img.shields.io/github/license/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
<img src="https://img.shields.io/github/stars/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
<br><b>繁体中文</b>     <a href="/README_jp-JP.md">日本語</a>     <a href="/README.md">English</a>     <a href="/README_ru-RU.md">Русский</a>
</p>

一个轻量、安全且免费的脚本，可自动领取 HoYoLAB 每日签到奖励。
支持《原神》、《崩坏3》和《崩坏：星穹铁道》。支持多个账户。

-----

## 特性 (Features)

  * **多版本支持**: 选择最适合您需求的版本：
    * **Light**: 极速高效，适合大多数用户。
    * **Original**: 简单直观，适合初学者。
    * **Robust**: 包含缓存、请求重试和性能监控等高级功能，可靠性最高。
  * **安全**: 自行部署到 Google Apps Script。您的凭据信息由您自己保管。
  * **免费**: 完全在 Google Apps Script 的免费套餐上运行。
  * **便捷**: 在云端自动运行，并向 Discord 或 Telegram 发送通知。

-----

## 如何选择版本？(Which Version to Choose?)

| 特性 | Light 版本 | Original 版本 | Robust 版本 |
| :--- | :---: | :---: | :---: |
| **最适合…** | 大多数用户，追求速度 | 初学者，追求简单 | 高级用户，追求可靠性 |
| **性能** | 🚀 高 (并行) | ✅ 良好 (顺序) | ✨ 高 (顺序) |
| **主要功能** | 高效、现代 | 代码易于阅读 | 缓存、重试、监控 |
| **配置** | 单个 `CONFIG` 对象 | 独立变量 | 高级 `AppConfig` 对象 |
| **平均执行时间 (秒)** | 0.5s - 3s | 3s - 5s | 4s - 6s |
| **代码行数** | 250~ | 150~ | 900~ |

-----

## 设置步骤 (Setup)

1.  前往 [Google Apps Script](https://script.google.com/home/start) 并使用您的自定义名称创建一个新项目。

2.  选择编辑器并粘贴 [English ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/English/) / [Chinese ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Chinese/) / [Russia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Russian/) / [Japan ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Japanese/) / [Indonesia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Indonesian/) 的代码。请参考下面的说明来配置设置文件并保存。

3.  选择“main”并在顶部点击“运行”按钮。

4.  授予必要的权限并确认配置正确（执行日志显示“已开始执行 > 已完成”）。

5.  点击左侧的“触发器”按钮/标签页，然后在右下角点击“添加触发器”按钮。
    选择要运行的函数: `main`
    选择事件源: 时间驱动
    选择时间驱动的触发器类型: 天
    选择具体时间: 建议选择 09:00 至 15:00 之间的任意非高峰时间。

-----

## 配置 (Configuration)

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

> HoYoLAB 已于 2023 年 7 月更改了 token 规则，将之前的 “ltoken” 和 “ltuid” 切换为 “ltoken_v2” 和 “ltuid_v2”。

<details>
<summary><b>HoYoLAB Cookie 设置</b></summary>

**按照此说明获取 token** 1. 前往 HoYoLAB ([https://www.hoyolab.com/](https://www.hoyolab.com/)) 并登录。
2. 前往您的个人资料页面。
3. 打开开发者工具（F12 或 Ctrl+Shift+I）。
4. 前往“Network (网络)”选项卡。
5. 点击“Preserve Log (保留日志)” / “Persist Logs”按钮。

```
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E05.png)   
```

6.  刷新页面。

7.  点击 method 为“GET”的 `getGameRecordCard` 请求（应命名为 `getGameRecordCard` 并附带您的 HoYoLab UID）。

8.  前往“Cookies”选项卡。

9.  复制 "account_mid_v2"、"account_id_v2"、"ltoken_v2"、"ltmid_v2" 和 "ltuid_v2"。

</details>

<details>
<summary><b>Discord 通知设置</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1.  **discord_notify**

    是否启用 Discord 通知。
    如果您想启用自动签到通知，请将其设置为 `true`。如果不想，请设置为 `false`。

2.  **myDiscordID** - 请输入您的 Discord 用户 ID。

    当签到失败时是否需要被 @ (ping)。
    复制您的 Discord 用户 ID（类似于 `23456789012345678`）并填入“引号”中。
    您可以参考[这篇文章](https://www.google.com/search?q=https://support.discord.com/hc/zh-cn/articles/206346498)来查找您的 Discord 用户 ID。
    如果您不想被 @，请将“引号”留空。

3.  **discordWebhook** - 请输入用于发送通知的服务器频道的 Discord webhook。

    您可以参考[这篇文章](https://www.google.com/search?q=https://support.discord.com/hc/zh-cn/articles/228383668)来创建 Discord webhook。
    创建完成后，您将收到您的 Discord webhook URL，类似于 `https://discord.com/api/webhooks/1234567890987654321/PekopekoPekopekoPekopeko06f810494a4dbf07b726924a5f60659f09edcaa1`。
    复制该 webhook URL 并粘贴到“引号”中。

</details>

<details>
<summary><b>Telegram 通知设置</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1.  **telegram_notify**

    是否启用 Telegram 通知。
    如果您想启用自动签到通知，请将其设置为 `true`。如果不想，请设置为 `false`。

2.  **myTelegramID** - 请输入您的 Telegram ID。

    通过向 [@IDBot](https://t.me/myidbot) 发送消息，使用 `/getid` 命令查找您的 Telegram 用户 ID。
    复制您的 Telegram ID（类似于 `123456780`）并填入“引号”中。

3.  **telegramBotToken** - 请输入您的 Telegram Bot Token。

    通过向 [@BotFather](https://t.me/botfather) 发送消息，使用 `/newbot` 命令在 Telegram 上创建一个新机器人。
    完成机器人创建后，您将收到您的 Telegram Bot Token，类似于 `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`。
    复制您的 Telegram Bot Token 并填入“引号”中。
    有关更详细的说明，您可以参考[这篇文章](https://core.telegram.org/bots/features#botfather)。

</details>

-----

## 演示 (Demo) (有bug)

如果自动签到过程成功，将发送“OK”。
如果您今天已经签到，将发送“旅行者/开拓者/舰长，今天已经签到过了”。

<details>
<summary><b>单个 HoYoLAB 账户自动签到，并启用 Discord 通知和 @ 功能。</b></summary>
启用《原神》和《崩坏：星穹铁道》的自动签到，启用 Discord 通知和 @ 功能。

```javascript
/** 示例 **/
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
<summary><b>两个 HoYoLAB 账户自动签到，并启用 Telegram 通知。</b></summary>
在账户 A 上启用《原神》自动签到，在账户 B 上启用《崩坏3》自动签到，并启用 Telegram 通知。

```javascript
/** 示例 **/
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

## 更新日志 (Changelog)

  * **2025-08-01**: 重大重构，分为 **Light**、**Original** 和 **Robust** 版本。改进了代码结构、性能，并增加了缓存和重试等高级功能（Robust 版）。
  * **2024-12-03**: 增加了对《未定事件簿》和《绝区零》的支持。增加了特定语言的代码文件。
  * **2024-02-02**: 提高了代码的可读性和可维护性。
  * **2023-05-13**: 增加了对多个 HoYoLAB 账户的支持。
  * **2023-05-12**: 增加了 Telegram 通知支持。
  * **2023-04-27**: 增加了对《崩坏3》和《崩坏：星穹铁道》的支持。
  * **2022-12-30**: 项目启动。

-----
