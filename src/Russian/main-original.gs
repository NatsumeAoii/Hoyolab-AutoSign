/**
 * @file Скрипт автоматической отметки в Hoyolab для Google Apps Script
 * @version 6.0.0 devs
 * @author NatsumeAoii, Canaria (Оригинал)
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} Оригинальный репозиторий
 */

const log = message => Logger.log(message);

const profiles = [{
    token: "account_mid_v2=XXXXX; account_id_v2=XXXXX; ltoken_v2=XXXXX; ltmid_v2=XXXXX; ltuid_v2=XXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    tears_of_themis: false,
    zenless_zone_zero: false,
    accountName: "Ваше имя"
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
    log(`Запуск HTTP-запросов`);
    try {
        const responses = await Promise.all(urls.map(url => UrlFetchApp.fetch(url, { method: 'POST', headers: { Cookie: token }, muteHttpExceptions: true })));
        log(`HTTP-запросы завершены`);
        return responses.map(response => {
            const content = response.getContentText();
            try {
                return JSON.parse(content).message;
            } catch (error) {
                log(`Ошибка при разборе ответа: ${error}`);
                return "Ошибка разбора ответа";
            }
        });
    } catch (error) {
        log(`Ошибка при выполнении HTTP-запросов: ${error}`);
        return Array(urls.length).fill("Ошибка выполнения HTTP-запроса");
    }
};

const notify = async (message) => {
    if (notificationConfig.discord.notify && notificationConfig.discord.webhook) {
        const discordPayload = JSON.stringify({ 'username': 'Hoyolab-АвтоЧекИн', 'avatar_url': 'https://i.imgur.com/LI1D4hP.png', 'content': message });
        const discordOptions = { method: 'POST', contentType: 'application/json', payload: discordPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(notificationConfig.discord.webhook, discordOptions);
            log(`Discord-уведомление отправлено`);
        } catch (error) {
            log(`Ошибка при отправке сообщения в Discord: ${error}`);
        }
    } else {
        log(`Discord-уведомление не отправлено: настройки отсутствуют или отключены`);
    }
    
    if (notificationConfig.telegram.notify && notificationConfig.telegram.botToken && notificationConfig.telegram.chatID) {
        const telegramPayload = JSON.stringify({ chat_id: notificationConfig.telegram.chatID, text: message, parse_mode: 'HTML' });
        const telegramOptions = { method: 'POST', contentType: 'application/json', payload: telegramPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(`https://api.telegram.org/bot${notificationConfig.telegram.botToken}/sendMessage`, telegramOptions);
            log(`Telegram-уведомление отправлено`);
        } catch (error) {
            log(`Ошибка при отправке сообщения в Telegram: ${error}`);
        }
    } else {
        log(`Telegram-уведомление не отправлено: настройки отсутствуют или отключены`);
    }
};

const main = async () => {
    const startTime = new Date().getTime();
    log(`Запуск основной функции`);

    const responseMessages = {
        "character info not found": "Аккаунт не найден.",
        "活动已结束": "Событие завершено.",
        "-500012": "Аккаунт не найден!",
        "already checked in today": "Уже выполнен вход!",
        "already signed in": "Уже выполнен вход!",
        "not logged in": "Проблема с cookie!",
        "please log in to take part in the event": "Проблема с cookie!"
    };

    const results = [];
    for (const profile of profiles) {
        log(`Обработка профиля: ${profile.accountName}`);
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

            // Сравнение с известными сообщениями
            for (const [key, message] of Object.entries(responseMessages)) {
                if (response.includes(key)) {
                    return `${name}: ${message}`;
                }
            }

            // Обработка неизвестных ответов
            return `${name}: Неизвестный ответ: ${responses[index]}`;
        }).join("\n");

        results.push(`Чек-ин завершен для: ${profile.accountName}\n${profileResult}`);
    }

    const message = results.join('\n\n');
    await notify(message);

    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000; // Перевод миллисекунд в секунды
    log(`Завершение основной функции. Время выполнения: ${executionTime} секунд`);
};