/**
 * @file Hoyolab Auto Check-In Script for Google Apps Script
 * @version 6.0.0 devs
 * @author NatsumeAoii, Canaria (Original)
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} Original repository
 */

const log = (message) => {
    Logger.log(message);
};

const profiles = [{
    token: "account_mid_v2=XXXXX; account_id_v2=XXXXX; ltoken_v2=XXXXX; ltmid_v2=XXXXX; ltuid_v2=XXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    tears_of_themis: false,
    zenless_zone_zero: false,
    accountName: "Your Name"
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

// Below this was the main logic, any changes were on your own risk

const urls = {
    genshin: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
    starRail: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
    honkai3: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111',
    tearsOfThemis: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581',
    zenlessZoneZero: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091'
};

const fetchUrls = async (urls, token) => {
    log(`Starting HTTP requests`);
    try {
        const responses = await Promise.all(urls.map(url => UrlFetchApp.fetch(url, { method: 'POST', headers: { Cookie: token }, muteHttpExceptions: true })));
        log(`HTTP requests completed`);
        return responses.map(response => {
            const content = response.getContentText();
            try {
                return JSON.parse(content).message;
            } catch (error) {
                log(`Error parsing response: ${error}`);
                return "Error parsing response";
            }
        });
    } catch (error) {
        log(`Error occurred during HTTP requests: ${error}`);
        return Array(urls.length).fill("Error occurred during HTTP request");
    }
};

const notify = async (message) => {
    if (notificationConfig.discord.notify && notificationConfig.discord.webhook) {
        const discordPayload = JSON.stringify({ 'username': 'Hoyolab-AutoCheck-In', 'avatar_url': 'https://i.imgur.com/LI1D4hP.png', 'content': message });
        const discordOptions = { method: 'POST', contentType: 'application/json', payload: discordPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(notificationConfig.discord.webhook, discordOptions);
            log(`Discord notification sent`);
        } catch (error) {
            log(`Error sending message to Discord: ${error}`);
        }
    } else {
        log(`Discord notification not sent: Configuration missing or disabled`);
    }
    
    if (notificationConfig.telegram.notify && notificationConfig.telegram.botToken && notificationConfig.telegram.chatID) {
        const telegramPayload = JSON.stringify({ chat_id: notificationConfig.telegram.chatID, text: message, parse_mode: 'HTML' });
        const telegramOptions = { method: 'POST', contentType: 'application/json', payload: telegramPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(`https://api.telegram.org/bot${notificationConfig.telegram.botToken}/sendMessage`, telegramOptions);
            log(`Telegram notification sent`);
        } catch (error) {
            log(`Error sending message to Telegram: ${error}`);
        }
    } else {
        log(`Telegram notification not sent: Configuration missing or disabled`);
    }
};

const main = async () => {
    const startTime = new Date().getTime();
    log(`Starting main function`);

    const responseMessages = {
        "character info not found": "No Account.",
        "活动已结束": "No Account.",
        "-500012": "No Account!.",
        "already checked in today": "Already Check-in!",
        "already signed in": "Already Check-in!",
        "not logged in": "Issue with the cookie!",
        "please log in to take part in the event": "Issue with the cookie!"
    };

    const results = [];
    for (const profile of profiles) {
        log(`Processing profile: ${profile.accountName}`);
        const urlsToCheck = [];
        const gameNames = [];

        if (profile.genshin) { urlsToCheck.push(urls.genshin); gameNames.push("Genshin Impact"); }
        if (profile.honkai_star_rail) { urlsToCheck.push(urls.starRail); gameNames.push("Honkai Star Rail"); }
        if (profile.honkai_3) { urlsToCheck.push(urls.honkai3); gameNames.push("Honkai Impact 3"); }
        if (profile.tears_of_themis) { urlsToCheck.push(urls.tearsOfThemis); gameNames.push("Tears of Themis"); }
        if (profile.zenless_zone_zero) { urlsToCheck.push(urls.zenlessZoneZero); gameNames.push("Zenless Zone Zero"); }

        const responses = await fetchUrls(urlsToCheck, profile.token);

        const profileResult = gameNames.map((name, index) => {
            const response = responses[index].toLowerCase();

            // Check response against known messages
            for (const [key, message] of Object.entries(responseMessages)) {
                if (response.includes(key)) {
                    return `${name}: ${message}`;
                }
            }

            // Default case for unknown responses
            return `${name}: Unknown response: ${responses[index]}`;
        }).join("\n");

        results.push(`Check-in completed for : ${profile.accountName}\n${profileResult}`);
    }

    const message = results.join('\n\n');
    await notify(message);

    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000; // Convert milliseconds to seconds
    log(`Finished main function. Execution time: ${executionTime} seconds`);
};