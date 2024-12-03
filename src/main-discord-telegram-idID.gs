const log = message => Logger.log(message);

const profiles = [{
    token: "account_mid_v2=XXXXX; account_id_v2=XXXXX; ltoken_v2=XXXXX; ltmid_v2=XXXXX; ltuid_v2=XXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    tears_of_themis: false,
    zenless_zone_zero: false,
    accountName: "Nama Anda"
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
    log(`Memulai permintaan HTTP`);
    try {
        const responses = await Promise.all(urls.map(url => UrlFetchApp.fetch(url, { method: 'POST', headers: { Cookie: token }, muteHttpExceptions: true })));
        log(`Permintaan HTTP selesai`);
        return responses.map(response => {
            const content = response.getContentText();
            try {
                return JSON.parse(content).message;
            } catch (error) {
                log(`Error saat mengurai respons: ${error}`);
                return "Error saat mengurai respons";
            }
        });
    } catch (error) {
        log(`Terjadi error saat melakukan permintaan HTTP: ${error}`);
        return Array(urls.length).fill("Terjadi error saat melakukan permintaan HTTP");
    }
};

const notify = async (message) => {
    if (notificationConfig.discord.notify && notificationConfig.discord.webhook) {
        const discordPayload = JSON.stringify({ 'username': 'Hoyolab-AutoCheck-In', 'avatar_url': 'https://i.imgur.com/LI1D4hP.png', 'content': message });
        const discordOptions = { method: 'POST', contentType: 'application/json', payload: discordPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(notificationConfig.discord.webhook, discordOptions);
            log(`Pemberitahuan Discord terkirim`);
        } catch (error) {
            log(`Terjadi error saat mengirim pesan ke Discord: ${error}`);
        }
    } else {
        log(`Pemberitahuan Discord tidak terkirim: Pengaturan tidak ada atau dinonaktifkan`);
    }
    
    if (notificationConfig.telegram.notify && notificationConfig.telegram.botToken && notificationConfig.telegram.chatID) {
        const telegramPayload = JSON.stringify({ chat_id: notificationConfig.telegram.chatID, text: message, parse_mode: 'HTML' });
        const telegramOptions = { method: 'POST', contentType: 'application/json', payload: telegramPayload, muteHttpExceptions: true };

        try {
            await UrlFetchApp.fetch(`https://api.telegram.org/bot${notificationConfig.telegram.botToken}/sendMessage`, telegramOptions);
            log(`Pemberitahuan Telegram terkirim`);
        } catch (error) {
            log(`Terjadi error saat mengirim pesan ke Telegram: ${error}`);
        }
    } else {
        log(`Pemberitahuan Telegram tidak terkirim: Pengaturan tidak ada atau dinonaktifkan`);
    }
};

const main = async () => {
    const startTime = new Date().getTime();
    log(`Memulai fungsi utama`);

    const responseMessages = {
        "character info not found": "Akun tidak ditemukan.",
        "活动已结束": "Acara sudah selesai.",
        "-500012": "Akun tidak ditemukan!",
        "already checked in today": "Sudah masuk hari ini!",
        "already signed in": "Sudah masuk!",
        "not logged in": "Masalah dengan cookie!",
        "please log in to take part in the event": "Masalah dengan cookie!"
    };

    const results = [];
    for (const profile of profiles) {
        log(`Memproses profil: ${profile.accountName}`);
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

            // Memeriksa respons terhadap pesan yang sudah dikenal
            for (const [key, message] of Object.entries(responseMessages)) {
                if (response.includes(key)) {
                    return `${name}: ${message}`;
                }
            }

            // Kasus default untuk respons yang tidak dikenal
            return `${name}: Respons tidak dikenal: ${responses[index]}`;
        }).join("\n");

        results.push(`Check-in selesai untuk : ${profile.accountName}\n${profileResult}`);
    }

    const message = results.join('\n\n');
    await notify(message);

    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000; // Mengubah milidetik menjadi detik
    log(`Fungsi utama selesai. Waktu eksekusi: ${executionTime} detik`);
};