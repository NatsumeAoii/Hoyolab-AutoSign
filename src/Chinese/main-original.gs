/**
 * @file Hoyolab 自动签到脚本 (适用于 Google Apps Script)
 * @version 6.0.0 devs
 * @author NatsumeAoii, Canaria (原作者)
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} 原仓库地址
 */

const log = message => Logger.log(message);

const profiles = [{
    token: "account_mid_v2=XXXXX; account_id_v2=XXXXX; ltoken_v2=XXXXX; ltmid_v2=XXXXX; ltuid_v2=XXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    tears_of_themis: false,
    zenless_zone_zero: false,
    accountName: "您的名字"
}];

const notificationConfig = {
    discord: {
        notify: true,
        webhook: "XXXXXX"
    },
    telegram: {
        notify: true,
        botToken: "XXXXXX",
        chatID: "XXXXX"
    }
};

const urls = {
    genshin: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
    starRail: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
    honkai3: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111',
    tearsOfThemis: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581',
    zenlessZoneZero: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091'
};

const fetchUrls = async (urls, token) => {
    log(`开始进行HTTP请求`);
    try {
        const responses = await Promise.all(urls.map(url => UrlFetchApp.fetch(url, { method: 'POST', headers: { Cookie: token }, muteHttpExceptions: true })));
        log(`HTTP请求完成`);
        return responses.map(response => {
            const content = response.getContentText();
            try {
                return JSON.parse(content).message;
            } catch (error) {
                log(`解析响应时出错: ${error}`);
                return "解析响应时出错";
            }
        });
    } catch (error) {
        log(`HTTP请求时发生错误: ${error}`);
        return Array(urls.length).fill("HTTP请求时发生错误");
    }
};

const notify = async (message) => {
    if (notificationConfig.discord.notify && notificationConfig.discord.webhook) {
        const discordPayload = JSON.stringify({ 'username': 'Hoyolab自动签到', 'avatar_url': 'https://i.imgur.com/LI1D4hP.png', 'content': message });
        const discordOptions = { method: 'POST', contentType: 'application/json', payload: discordPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(notificationConfig.discord.webhook, discordOptions);
            log(`已发送Discord通知`);
        } catch (error) {
            log(`发送消息到Discord时出错: ${error}`);
        }
    } else {
        log(`未发送Discord通知: 配置缺失或已禁用`);
    }
    
    if (notificationConfig.telegram.notify && notificationConfig.telegram.botToken && notificationConfig.telegram.chatID) {
        const telegramPayload = JSON.stringify({ chat_id: notificationConfig.telegram.chatID, text: message, parse_mode: 'HTML' });
        const telegramOptions = { method: 'POST', contentType: 'application/json', payload: telegramPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(`https://api.telegram.org/bot${notificationConfig.telegram.botToken}/sendMessage`, telegramOptions);
            log(`已发送Telegram通知`);
        } catch (error) {
            log(`发送消息到Telegram时出错: ${error}`);
        }
    } else {
        log(`未发送Telegram通知: 配置缺失或已禁用`);
    }
};

const main = async () => {
    const startTime = new Date().getTime();
    log(`主函数开始`);

    const responseMessages = {
        "character info not found": "没有账户信息。",
        "活动已结束": "活动已结束。",
        "-500012": "没有账户信息！",
        "already checked in today": "已签到！",
        "already signed in": "已签到！",
        "not logged in": "Cookie有问题！",
        "please log in to take part in the event": "Cookie有问题！"
    };

    const results = [];
    for (const profile of profiles) {
        log(`处理账户: ${profile.accountName}`);
        const urlsToCheck = [];
        const gameNames = [];

        if (profile.genshin) { urlsToCheck.push(urls.genshin); gameNames.push("原神"); }
        if (profile.honkai_star_rail) { urlsToCheck.push(urls.starRail); gameNames.push("崩坏：星穹铁道"); }
        if (profile.honkai_3) { urlsToCheck.push(urls.honkai3); gameNames.push("崩坏3"); }
        if (profile.tears_of_themis) { urlsToCheck.push(urls.tearsOfThemis); gameNames.push("未定事件簿"); }
        if (profile.zenless_zone_zero) { urlsToCheck.push(urls.zenlessZoneZero); gameNames.push("绝区零"); }

        const responses = await fetchUrls(urlsToCheck, profile.token);

        const profileResult = gameNames.map((name, index) => {
            const response = responses[index].toLowerCase();

            // 检查响应是否在已知消息中
            for (const [key, message] of Object.entries(responseMessages)) {
                if (response.includes(key)) {
                    return `${name}: ${message}`;
                }
            }

            // 未知响应的默认情况
            return `${name}: 未知响应: ${responses[index]}`;
        }).join("\n");

        results.push(`签到完成: ${profile.accountName}\n${profileResult}`);
    }

    const message = results.join('\n\n');
    await notify(message);

    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000; // 将毫秒转换为秒
    log(`主函数完成。执行时间: ${executionTime} 秒`);
};