/**
 * @file Google Apps Script用 Hoyolab 自動チェックインスクリプト
 * @version 6.0.0 devs
 * @author NatsumeAoii, Canaria (オリジナル)
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} オリジナルリポジトリ
 */

const log = message => Logger.log(message);

const profiles = [{
    token: "account_mid_v2=XXXXX; account_id_v2=XXXXX; ltoken_v2=XXXXX; ltmid_v2=XXXXX; ltuid_v2=XXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    tears_of_themis: false,
    zenless_zone_zero: false,
    accountName: "あなたの名前"
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
    log(`HTTPリクエストを開始`);
    try {
        const responses = await Promise.all(urls.map(url => UrlFetchApp.fetch(url, { method: 'POST', headers: { Cookie: token }, muteHttpExceptions: true })));
        log(`HTTPリクエスト完了`);
        return responses.map(response => {
            const content = response.getContentText();
            try {
                return JSON.parse(content).message;
            } catch (error) {
                log(`レスポンスの解析中にエラーが発生しました: ${error}`);
                return "レスポンス解析エラー";
            }
        });
    } catch (error) {
        log(`HTTPリクエスト中にエラーが発生しました: ${error}`);
        return Array(urls.length).fill("HTTPリクエストエラー");
    }
};

const notify = async (message) => {
    if (notificationConfig.discord.notify && notificationConfig.discord.webhook) {
        const discordPayload = JSON.stringify({ 'username': 'Hoyolab-自動チェックイン', 'avatar_url': 'https://i.imgur.com/LI1D4hP.png', 'content': message });
        const discordOptions = { method: 'POST', contentType: 'application/json', payload: discordPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(notificationConfig.discord.webhook, discordOptions);
            log(`Discord通知を送信しました`);
        } catch (error) {
            log(`Discordへのメッセージ送信中にエラーが発生しました: ${error}`);
        }
    } else {
        log(`Discord通知が送信されませんでした: 設定が不足しているか無効です`);
    }
    
    if (notificationConfig.telegram.notify && notificationConfig.telegram.botToken && notificationConfig.telegram.chatID) {
        const telegramPayload = JSON.stringify({ chat_id: notificationConfig.telegram.chatID, text: message, parse_mode: 'HTML' });
        const telegramOptions = { method: 'POST', contentType: 'application/json', payload: telegramPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(`https://api.telegram.org/bot${notificationConfig.telegram.botToken}/sendMessage`, telegramOptions);
            log(`Telegram通知を送信しました`);
        } catch (error) {
            log(`Telegramへのメッセージ送信中にエラーが発生しました: ${error}`);
        }
    } else {
        log(`Telegram通知が送信されませんでした: 設定が不足しているか無効です`);
    }
};

const main = async () => {
    const startTime = new Date().getTime();
    log(`メイン関数を開始`);

    const responseMessages = {
        "character info not found": "アカウントが見つかりません。",
        "活動已結束": "イベントは終了しました。",
        "-500012": "アカウントが見つかりません！",
        "already checked in today": "既にチェックイン済み！",
        "already signed in": "既にチェックイン済み！",
        "not logged in": "Cookieに問題があります！",
        "please log in to take part in the event": "Cookieに問題があります！"
    };

    const results = [];
    for (const profile of profiles) {
        log(`アカウントを処理中: ${profile.accountName}`);
        const urlsToCheck = [];
        const gameNames = [];

        if (profile.genshin) { urlsToCheck.push(urls.genshin); gameNames.push("原神"); }
        if (profile.honkai_star_rail) { urlsToCheck.push(urls.starRail); gameNames.push("崩壊：スターレール"); }
        if (profile.honkai_3) { urlsToCheck.push(urls.honkai3); gameNames.push("崩壊3"); }
        if (profile.tears_of_themis) { urlsToCheck.push(urls.tearsOfThemis); gameNames.push("未定事件簿"); }
        if (profile.zenless_zone_zero) { urlsToCheck.push(urls.zenlessZoneZero); gameNames.push("ゼンレスゾーンゼロ"); }

        const responses = await fetchUrls(urlsToCheck, profile.token);

        const profileResult = gameNames.map((name, index) => {
            const response = responses[index].toLowerCase();

            // 既知のメッセージと照らし合わせる
            for (const [key, message] of Object.entries(responseMessages)) {
                if (response.includes(key)) {
                    return `${name}: ${message}`;
                }
            }

            // 未知の応答の場合
            return `${name}: 未知の応答: ${responses[index]}`;
        }).join("\n");

        results.push(`チェックイン完了: ${profile.accountName}\n${profileResult}`);
    }

    const message = results.join('\n\n');
    await notify(message);

    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000; // ミリ秒を秒に変換
    log(`メイン関数が終了しました。実行時間: ${executionTime} 秒`);
};