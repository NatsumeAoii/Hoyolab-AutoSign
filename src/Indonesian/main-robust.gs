/**
 * @file Skrip Check-In Otomatis Hoyolab untuk Google Apps Script
 * @version 6.0.0 dev
 * @author NatsumeAoii, Canaria (Asli)
 * @license MIT
 * @original tautan asli canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} Repositori asli
 */

// ============================================================================
// BAGIAN 1: KONFIGURASI SKRIP
// ============================================================================

/**
 * Struktur token autentikasi
 * @typedef {Object} AuthToken
 * @property {string} account_mid_v2 - Token account mid v2
 * @property {string} account_id_v2 - Token account id v2
 * @property {string} ltoken_v2 - Ltoken v2
 * @property {string} ltmid_v2 - Ltmid v2
 * @property {string} ltuid_v2 - Ltuid v2
 */

/**
 * Konfigurasi profil pengguna
 * @typedef {Object} Profile
 * @property {(string|AuthToken)} token - Token autentikasi HoYoLAB
 * @property {string} accountName - Pengenal akun yang ramah pengguna
 * @property {boolean} genshin - Check-in Genshin Impact diaktifkan
 * @property {boolean} honkai_star_rail - Check-in Honkai: Star Rail diaktifkan
 * @property {boolean} honkai_3 - Check-in Honkai Impact 3rd diaktifkan
 * @property {boolean} tears_of_themis - Check-in Tears of Themis diaktifkan
 * @property {boolean} zenless_zone_zero - Check-in Zenless Zone Zero diaktifkan
 */

/**
 * Konfigurasi notifikasi Discord
 * @typedef {Object} DiscordConfig
 * @property {boolean} notify - Status notifikasi diaktifkan
 * @property {string} webhook - URL webhook Discord
 */

/**
 * Konfigurasi notifikasi Telegram
 * @typedef {Object} TelegramConfig
 * @property {boolean} notify - Status notifikasi diaktifkan
 * @property {string} botToken - Token bot Telegram
 * @property {string} chatID - ID chat target
 */

/**
 * Konfigurasi layanan game
 * @typedef {Object} GameServiceConfig
 * @property {string} name - Nama lengkap game
 * @property {string} shortName - Singkatan game
 * @property {string} url - Endpoint API check-in
 * @property {boolean} enabled - Status layanan global diaktifkan
 * @property {keyof Profile} configKey - Kunci konfigurasi profil
 */

const AppConfig = {
    /**
     * Profil akun pengguna
     * @type {Profile[]}
     */
    USER_PROFILES: [{
        token: {
            account_mid_v2: 'xxxxxx',
            account_id_v2: 'xxxxxx',
            ltoken_v2: 'xxxxxx',
            ltmid_v2: 'xxxxxx',
            ltuid_v2: 'xxxxxx'
        },
        genshin: true,
        honkai_star_rail: true,
        honkai_3: true,
        tears_of_themis: true,
        zenless_zone_zero: true,
        accountName: "xxxxxx"
    }],

    /**
     * Konfigurasi platform notifikasi
     */
    NOTIFICATION_CONFIG: {
        discord: {
            notify: true,
            webhook: "xxxxxx"
        },
        discordPerformance: {
            notify: true,
            webhook: "xxxxxx"
        },
        telegram: {
            notify: true,
            botToken: "xxxxxx",
            chatID: "xxxxxx"
        }
    },

    /**
     * Pengaturan runtime aplikasi
     */
    APP_SETTINGS: {
        RETRY_COUNT: 3,
        RATE_LIMIT_DELAY_MS: 500,
        CACHE_TTL_SECONDS: 3600,
        VERSION: '6',
        DEBUG_MODE: false,
        UPDATE_LINK: 'https://github.com/NatsumeAoii/Hoyolab-AutoSign',
        CACHE_ENABLED: true
    },

    /**
     * Konstanta aplikasi
     */
    CONSTANTS: {
        AVATAR_URL: 'https://i.imgur.com/GsT8Xj3.jpeg',
        STATUS_COLORS: {
            DEFAULT: 0x3498db,
            ERROR: 0xff0000,
            SUCCESS: 0x00ff00,
            WARNING: 0xf1c40f
        },
        PERFORMANCE_THRESHOLDS_SECONDS: {
            WARNING: 5,
            ERROR: 10
        },
        LOG_LEVELS: {
            INFO: 'INFO',
            WARN: 'WARN',
            ERROR: 'ERROR',
            DEBUG: 'DEBUG'
        }
    },

    /**
     * Layanan game yang didukung
     * @type {Object.<string, GameServiceConfig>}
     */
    GAME_SERVICES: {
        genshin: {
            name: 'Genshin Impact',
            shortName: 'Genshin',
            url: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
            enabled: true,
            configKey: 'genshin'
        },
        honkai_star_rail: {
            name: 'Honkai: Star Rail',
            shortName: 'Star Rail',
            url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
            enabled: true,
            configKey: 'honkai_star_rail'
        },
        honkai_3: {
            name: 'Honkai Impact 3rd',
            shortName: 'HI 3',
            url: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111',
            enabled: true,
            configKey: 'honkai_3'
        },
        tears_of_themis: {
            name: 'Tears of Themis',
            shortName: 'ToT',
            url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581',
            enabled: true,
            configKey: 'tears_of_themis'
        },
        zenless_zone_zero: {
            name: 'Zenless Zone Zero',
            shortName: 'ZZZ',
            url: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091',
            enabled: true,
            configKey: 'zenless_zone_zero'
        }
    },

    /**
     * Pemetaan respons API
     * @type {Object.<string, string>}
     */
    RESPONSE_MESSAGES: {
        "character detected": "Tidak Ada Akun. 🔍",
        "character info not found": "Tidak Ada Akun. 🔍",
        "活动已结束": "Tidak Ada Akun. 🔍",
        "-500012": "Tidak Ada Akun. 🔍",
        "already checked in today": "Sudah Check-In! ✅",
        "already checked in": "Sudah Check-In! ✅",
        "already signed in": "Sudah Check-In! ✅",
        "ok": "Check-in Berhasil! ✅",
        "not logged in": "Cookie Tidak Valid! ❌",
        "please log in to take part in the event": "Cookie Tidak Valid! ❌"
    },

    /**
     * Header permintaan HTTP
     */
    GAME_HEADERS: {
        default: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'x-rpc-app_version': '2.34.1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'x-rpc-client_type': '4',
            'Referer': 'https://act.hoyolab.com/',
            'Origin': 'https://act.hoyolab.com',
        },
        zenless_zone_zero: {
            'x-rpc-signgame': 'zzz',
        }
    }
};

// Bekukan objek konfigurasi untuk mencegah modifikasi
Object.freeze(AppConfig);
Object.freeze(AppConfig.USER_PROFILES);
Object.freeze(AppConfig.NOTIFICATION_CONFIG);
Object.freeze(AppConfig.APP_SETTINGS);
Object.freeze(AppConfig.CONSTANTS);
Object.freeze(AppConfig.GAME_SERVICES);
Object.freeze(AppConfig.RESPONSE_MESSAGES);
Object.freeze(AppConfig.GAME_HEADERS);

// ============================================================================
// BAGIAN 2: LAYANAN INTI
// ============================================================================

/**
 * Layanan logging terpusat
 */
const AppLogger = {
    /**
     * Mencatat pesan dengan stempel waktu dan tingkat keparahan
     * @param {string} message - Konten pesan log
     * @param {string} [level=AppConfig.CONSTANTS.LOG_LEVELS.INFO] - Tingkat keparahan log
     */
    log(message, level = AppConfig.CONSTANTS.LOG_LEVELS.INFO) {
        if (AppConfig.NOTIFICATION_CONFIG.discordPerformance.notify) return;
        if (level === AppConfig.CONSTANTS.LOG_LEVELS.DEBUG && !AppConfig.APP_SETTINGS.DEBUG_MODE) return;

        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;
        
        Logger.log(formattedMessage);
        if (AppConfig.APP_SETTINGS.DEBUG_MODE) console.log(formattedMessage);
    }
};

/**
 * Layanan caching persisten
 */
class CacheService {
    constructor() {
        this.propertyStore = PropertiesService.getScriptProperties();
        this.memoryCache = {};
    }

    /**
     * Mengambil nilai dari cache berdasarkan kunci
     * @param {string} key - Pengenal kunci cache
     * @returns {any|null} Nilai cache atau null
     */
    get(key) {
        try {
            // Periksa cache dalam memori terlebih dahulu
            const cachedItem = this.memoryCache[key];
            if (cachedItem && cachedItem.expiry >= Date.now()) {
                return cachedItem.value;
            }

            // Periksa penyimpanan persisten
            const storedItem = this.propertyStore.getProperty(key);
            if (!storedItem) return null;

            const parsedData = JSON.parse(storedItem);
            if (parsedData.expiry < Date.now()) {
                this.remove(key);
                return null;
            }

            // Perbarui cache memori
            this.memoryCache[key] = parsedData;
            return parsedData.value;
        } catch (error) {
            AppLogger.log(`Kesalahan pengambilan cache: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return null;
        }
    }

    /**
     * Menyimpan nilai di cache
     * @param {string} key - Pengenal kunci cache
     * @param {any} value - Nilai untuk disimpan
     * @param {number} [ttlSeconds=AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS] - Waktu hidup (dalam detik)
     */
    set(key, value, ttlSeconds = AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS) {
        if (!AppConfig.APP_SETTINGS.CACHE_ENABLED) return;

        try {
            const expiry = Date.now() + (ttlSeconds * 1000);
            const cacheItem = { value, expiry };
            
            this.propertyStore.setProperty(key, JSON.stringify(cacheItem));
            this.memoryCache[key] = cacheItem;
        } catch (error) {
            AppLogger.log(`Kesalahan penyimpanan cache: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Menghapus item dari cache
     * @param {string} key - Pengenal kunci cache
     */
    remove(key) {
        delete this.memoryCache[key];
        this.propertyStore.deleteProperty(key);
    }

    /**
     * Membersihkan seluruh cache
     */
    clear() {
        this.memoryCache = {};
        this.propertyStore.deleteAllProperties();
        AppLogger.log("Cache berhasil dibersihkan", AppConfig.CONSTANTS.LOG_LEVELS.INFO);
    }
}

/**
 * Pemantauan dan pelaporan kinerja
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.scriptStartTime = Date.now();
    }

    /**
     * Memulai penghitungan waktu для метрики
     * @param {string} label - Pengenal metrik
     */
    start(label) {
        this.metrics[label] = {
            startTime: Date.now(),
            endTime: null,
            duration: null
        };
    }

    /**
     * Menghentikan penghitungan waktu untuk metrik
     * @param {string} label - Pengenal metrik
     */
    end(label) {
        const metric = this.metrics[label];
        if (metric && !metric.endTime) {
            metric.endTime = Date.now();
            metric.duration = metric.endTime - metric.startTime;
        }
    }

    /**
     * Mendapatkan total waktu eksekusi
     * @returns {number} Total waktu dalam milidetik
     */
    getTotalTime() {
        return Date.now() - this.scriptStartTime;
    }

    /**
     * Menghasilkan laporan kinerja
     * @returns {string} Metrik kinerja yang diformat
     */
    getReport() {
        const totalTime = this.getTotalTime();
        let report = "Metrik Kinerja:\n═══════════════════════\n";

        const validMetrics = Object.entries(this.metrics)
            .filter(([, metric]) => metric.duration !== null)
            .sort((a, b) => b[1].duration - a[1].duration);

        if (validMetrics.length > 0) {
            const maxLabelLength = validMetrics.reduce((max, [label]) => 
                Math.max(max, label.length), 0);
            
            validMetrics.forEach(([label, metric]) => {
                const paddedLabel = label.padEnd(maxLabelLength);
                const durationSec = (metric.duration / 1000).toFixed(2);
                report += `${paddedLabel}: ${metric.duration}ms (${durationSec}s)\n`;
            });
        } else {
            report += "Tidak ada metrik yang tercatat\n";
        }

        const totalSec = (totalTime / 1000).toFixed(2);
        report += `═══════════════════════\nTotal: ${totalTime}ms (${totalSec}s)`;
        return report;
    }
}

/**
 * Klien HTTP dengan coba lagi dan caching
 */
class HttpClient {
    /**
     * @param {CacheService} cacheService - Instans layanan cache
     */
    constructor(cacheService) {
        this.cache = cacheService;
    }

    /**
     * Menormalkan token ke format string cookie
     * @param {string|AuthToken} token - Token autentikasi
     * @returns {string} String token yang dinormalkan
     * @throws {Error} Untuk struktur token yang tidak valid
     */
    _normalizeToken(token) {
        // Kembalikan segera jika sudah berupa string
        if (typeof token === 'string') return token;
        
        // Validasi token terstruktur
        const requiredKeys = [
            'account_mid_v2', 'account_id_v2', 
            'ltoken_v2', 'ltmid_v2', 'ltuid_v2'
        ];
        
        const missingKeys = [];
        for (const key of requiredKeys) {
            if (!(key in token) || typeof token[key] !== 'string' || token[key].trim() === '') {
                missingKeys.push(key);
            }
        }
        
        if (missingKeys.length > 0) {
            throw new Error(`Struktur token tidak valid. Kunci hilang atau tidak valid: ${missingKeys.join(', ')}`);
        }
        
        // Konversi ke format string cookie
        return Object.entries(token)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    /**
     * Membuat header untuk permintaan API
     * @param {string|AuthToken} token - Token autentikasi
     * @param {string} gameKey - Pengenal game
     * @returns {Object} Header HTTP
     */
    _createHeaders(token, gameKey) {
        const normalizedToken = this._normalizeToken(token);
        return {
            'Cookie': normalizedToken,
            ...AppConfig.GAME_HEADERS.default,
            ...(AppConfig.GAME_HEADERS[gameKey] || {})
        };
    }

    /**
     * Mendapatkan kunci game dari URL
     * @param {string} url - URL endpoint API
     * @returns {string} Pengenal game
     */
    _getGameKeyFromUrl(url) {
        for (const [key, config] of Object.entries(AppConfig.GAME_SERVICES)) {
            if (config.url === url) return key;
        }
        return 'default';
    }

    /**
     * Mengambil data dari API dengan logika coba lagi
     * @param {string} url - URL endpoint API
     * @param {string|AuthToken} token - Token autentikasi
     * @param {PerformanceMonitor} monitor - Monitor kinerja
     * @returns {Object|null} Respons API atau null
     */
    fetchWithRetry(url, token, monitor) {
        const maxAttempts = AppConfig.APP_SETTINGS.RETRY_COUNT;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = this._executeFetch(url, token, monitor);
                if (response) return response;
            } catch (error) {
                AppLogger.log(`Percobaan ${attempt}/${maxAttempts} gagal: ${error.message}`, 
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN);
                
                if (attempt < maxAttempts) {
                    const delay = Math.pow(2, attempt - 1) * AppConfig.APP_SETTINGS.RATE_LIMIT_DELAY_MS;
                    Utilities.sleep(delay);
                }
            }
        }
        
        AppLogger.log(`Semua upaya pengambilan untuk ${url} gagal`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        return null;
    }

    /**
     * Mengeksekusi operasi pengambilan tunggal
     * @param {string} url - URL endpoint API
     * @param {string|AuthToken} token - Token autentikasi
     * @param {PerformanceMonitor} monitor - Monitor kinerja
     * @returns {Object|null} Respons API atau null
     * @throws {Error} Saat pengambilan gagal
     */
    _executeFetch(url, token, monitor) {
        const cacheKey = `URL_${url}_${typeof token === 'string' ? token.substring(0, 20) : 'structured'}`;
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) return cachedData;
        
        const metricLabel = `API:${url.split('?')[0]}`;
        monitor.start(metricLabel);
        
        try {
            const gameKey = this._getGameKeyFromUrl(url);
            const headers = this._createHeaders(token, gameKey);
            const options = {
                method: 'POST',
                headers: headers,
                muteHttpExceptions: true
            };
            
            const response = UrlFetchApp.fetch(url, options);
            const statusCode = response.getResponseCode();
            const responseText = response.getContentText();
            
            if (statusCode < 200 || statusCode >= 300) {
                throw new Error(`HTTP ${statusCode}: ${responseText}`);
            }
            
            const jsonData = JSON.parse(responseText);
            
            if (jsonData?.retcode === 0) {
                this.cache.set(cacheKey, jsonData);
            }
            
            return jsonData;
        } catch (error) {
            throw new Error(`Pengambilan gagal: ${error.message}`);
        } finally {
            monitor.end(metricLabel);
        }
    }
}

/**
 * Layanan check-in game
 */
class GameService {
    /**
     * @param {HttpClient} httpClient - Instans klien HTTP
     */
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * Memetakan respons API ke pesan yang ramah pengguna
     * @param {string} apiMessage - Pesan API mentah
     * @returns {string} Status yang ramah pengguna
     */
    _mapResponseToStatus(apiMessage) {
        const lowerMessage = apiMessage.toLowerCase();
        for (const [key, status] of Object.entries(AppConfig.RESPONSE_MESSAGES)) {
            if (lowerMessage.includes(key)) return status;
        }
        return `Respons tidak dikenal: ${apiMessage}`;
    }

    /**
     * Melakukan check-in game
     * @param {GameServiceConfig} gameConfig - Konfigurasi game
     * @param {string|AuthToken} token - Token autentikasi
     * @param {PerformanceMonitor} monitor - Monitor kinerja
     * @returns {string} Status hasil check-in
     */
    performCheckIn(gameConfig, token, monitor) {
        const metricLabel = `CHECKIN:${gameConfig.shortName}`;
        monitor.start(metricLabel);
        AppLogger.log(`Memulai check-in ${gameConfig.name}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        
        try {
            const response = this.httpClient.fetchWithRetry(gameConfig.url, token, monitor);
            
            if (!response || !response.message) {
                throw new Error("Struktur respons API tidak valid");
            }
            
            const status = this._mapResponseToStatus(response.message);
            AppLogger.log(`${gameConfig.name} hasil: ${status}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            return status;
        } catch (error) {
            AppLogger.log(`${gameConfig.name} check-in gagal: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return "Kesalahan Check-in! ❌";
        } finally {
            monitor.end(metricLabel);
        }
    }

    /**
     * Mendapatkan game yang diaktifkan untuk profil
     * @param {Profile} profile - Profil pengguna
     * @returns {GameServiceConfig[]} Konfigurasi game yang diaktifkan
     */
    getEnabledGames(profile) {
        return Object.values(AppConfig.GAME_SERVICES).filter(game => 
            game.enabled && profile[game.configKey] === true
        );
    }
}

/**
 * Layanan pengiriman notifikasi
 */
class NotificationService {
    /**
     * Menentukan warna notifikasi berdasarkan konten
     * @param {string} content - Pesan notifikasi
     * @returns {number} Kode warna
     */
    _determineColor(content) {
        if (content.includes("❌")) return AppConfig.CONSTANTS.STATUS_COLORS.ERROR;
        if (content.includes("✅")) return AppConfig.CONSTANTS.STATUS_COLORS.SUCCESS;
        return AppConfig.CONSTANTS.STATUS_COLORS.DEFAULT;
    }

    /**
     * Memformat status game dari laporan
     * @param {string} report - Konten laporan lengkap
     * @returns {string} Status game yang diformat
     */
    _formatGameStatuses(report) {
        return Object.values(AppConfig.GAME_SERVICES)
            .map(game => {
                const pattern = new RegExp(`\\*\\*${game.shortName}\\*\\*: ([^\\n]+)`);
                const match = report.match(pattern);
                return match ? `• **${game.name}**: ${match[1]}` : null;
            })
            .filter(Boolean)
            .join('\n') || "Tidak ada check-in game yang diproses";
    }

    /**
     * Mengirim notifikasi Discord
     * @param {string} report - Laporan check-in
     */
    _sendDiscordNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.discord; 
        if (!config.notify || !config.webhook) return;
        
        try {
            const now = new Date();
            const payload = {
                username: 'Check-In Otomatis HoYoLAB',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '🎮 Laporan Check-in Harian',
                    description: `Check-in selesai untuk akun: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**`,
                    color: this._determineColor(report),
                    fields: [{
                        name: "Hasil",
                        value: this._formatGameStatuses(report),
                        inline: false
                    }, {
                        name: "\u200B",
                        value: `[Periksa Pembaruan](${AppConfig.APP_SETTINGS.UPDATE_LINK})`
                    }],
                    footer: {
                        text: `v${AppConfig.APP_SETTINGS.VERSION} • ${now.toDateString()} - ${now.toTimeString().split(' ')[0]} UTC`
                    }
                }]
            };
            
            UrlFetchApp.fetch(config.webhook, {
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify(payload)
            });
        } catch (error) {
            AppLogger.log(`Notifikasi Discord gagal: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Mengirim notifikasi Telegram
     * @param {string} report - Laporan check-in
     */
    _sendTelegramNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.telegram;
        if (!config.notify || !config.botToken || !config.chatID) return;
        
        try {
            const plainText = report.replace(/\*\*/g, '');
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: config.chatID,
                text: `${plainText}\n\n<a href='${AppConfig.APP_SETTINGS.UPDATE_LINK}'>Periksa pembaruan</a>`,
                parse_mode: 'HTML'
            };
            
            UrlFetchApp.fetch(url, {
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify(payload)
            });
        } catch (error) {
            AppLogger.log(`Notifikasi Telegram gagal: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Mengirim laporan kinerja
     * @param {PerformanceMonitor} monitor - Monitor kinerja
     */
    _sendPerformanceReport(monitor) {
        const config = AppConfig.NOTIFICATION_CONFIG.discordPerformance;
        if (!config.notify || !config.webhook) return;
        
        try {
            const totalSeconds = monitor.getTotalTime() / 1000;
            let color = AppConfig.CONSTANTS.STATUS_COLORS.SUCCESS;
            
            if (totalSeconds > AppConfig.CONSTANTS.PERFORMANCE_THRESHOLDS_SECONDS.ERROR) {
                color = AppConfig.CONSTANTS.STATUS_COLORS.ERROR;
            } else if (totalSeconds > AppConfig.CONSTANTS.PERFORMANCE_THRESHOLDS_SECONDS.WARNING) {
                color = AppConfig.CONSTANTS.STATUS_COLORS.WARNING;
            }
            
            const payload = {
                username: 'Monitor Kinerja',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '⏱️ Kinerja Skrip',
                    description: `Akun: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**\n\`\`\`\n${monitor.getReport()}\n\`\`\`\``,
                    color: color,
                    footer: { text: `v${AppConfig.APP_SETTINGS.VERSION}` } ,
                    timestamp: new Date().toISOString()
                }]
            };
            
            UrlFetchApp.fetch(config.webhook, {
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify(payload)
            });
        } catch (error) {
            AppLogger.log(`Laporan kinerja gagal: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Mengirim semua notifikasi
     * @param {string} report - Laporan check-in
     * @param {PerformanceMonitor} monitor - Monitor kinerja
     */
    dispatchNotifications(report, monitor) {
        monitor.start('NOTIFICATIONS');
        this._sendDiscordNotification(report);
        this._sendTelegramNotification(report);
        this._sendPerformanceReport(monitor);
        monitor.end('NOTIFICATIONS');
    }
}

/**
 * Layanan pemrosesan profil
 */
class ProfileProcessor {
    /**
     * @param {GameService} gameService - Instans layanan check-in game
     */
    constructor(gameService) {
        this.gameService = gameService;
    }

    /**
     * Memvalidasi konfigurasi profil pengguna
     * @param {Profile} profile - Profil pengguna untuk divalidasi
     * @throws {Error} Jika validasi profil gagal
     */
    _validateProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            throw new Error('Profil harus berupa objek');
        }

        // Validasi bidang yang wajib diisi
        const requiredFields = ['token', 'accountName'];
        for (const field of requiredFields) {
            if (!(field in profile)) {
                throw new Error(`Profil tidak memiliki bidang wajib: ${field}`);
            }
        }

        // Validasi token
        const token = profile.token;
        if (typeof token !== 'string' && typeof token !== 'object') {
            throw new Error('Token harus berupa string atau objek terstruktur');
        }
        
        // Validasi nama akun
        if (typeof profile.accountName !== 'string' || profile.accountName.trim() === '') {
            throw new Error('Nama akun harus berupa string yang tidak kosong');
        }

        // Validasi flag game
        const gameFlags = Object.keys(AppConfig.GAME_SERVICES).map(
            key => AppConfig.GAME_SERVICES[key].configKey
        );
        
        for (const flag of gameFlags) {
            if (flag in profile) {
                if (typeof profile[flag] !== 'boolean') {
                    throw new Error(`Flag game ${flag} harus bernilai boolean`);
                }
            } else {
                AppLogger.log(
                    `Profil '${profile.accountName}' tidak memiliki flag game ${flag}, default ke false`,
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN
                );
                profile[flag] = false;
            }
        }
    }

    /**
     * Memproses profil tunggal
     * @param {Profile} profile - Profil pengguna
     * @param {PerformanceMonitor} monitor - Monitor kinerja
     * @returns {string} Hasil check-in
     */
    processProfile(profile, monitor) {
        try {
            // Validasi profil sebelum diproses
            this._validateProfile(profile);
            
            AppLogger.log(`Memproses ${profile.accountName}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            const enabledGames = this.gameService.getEnabledGames(profile);
            
            if (enabledGames.length === 0) {
                return `Tidak ada game yang diaktifkan untuk ${profile.accountName}`;
            }
            
            const results = enabledGames.map(game => 
                `**${game.shortName}**: ${this.gameService.performCheckIn(game, profile.token, monitor)}`
            );
            
            return `**${profile.accountName}**\n${results.join('\n')}`;
        } catch (error) {
            const errorMessage = `Validasi profil '${profile.accountName || 'unknown'}' gagal: ${error.message}`;
            AppLogger.log(errorMessage, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return `❌ ${errorMessage}`;
        }
    }

    /**
     * Memproses semua profil
     * @param {Profile[]} profiles - Profil pengguna
     * @param {PerformanceMonitor} monitor - Monitor kinerja
     * @returns {string[]} Hasil profil
     */
    processAllProfiles(profiles, monitor) {
        monitor.start('PROFILE_PROCESSING');
        const results = profiles.map(profile => 
            this.processProfile(profile, monitor)
        );
        monitor.end('PROFILE_PROCESSING');
        return results;
    }
}

// ============================================================================
// BAGIAN 3: APLIKASI UTAMA
// ============================================================================

/**
 * Pengontrol aplikasi utama
 */
class HoyolabAutoCheckIn {
    constructor() {
        this.cache = new CacheService();
        this.httpClient = new HttpClient(this.cache);
        this.gameService = new GameService(this.httpClient);
        this.notificationService = new NotificationService();
        this.profileProcessor = new ProfileProcessor(this.gameService);
    }

    /**
     * Mengeksekusi alur kerja check-in penuh
     */
    execute() {
        const monitor = new PerformanceMonitor();
        monitor.start('TOTAL_RUNTIME');
        
        try {
            AppLogger.log('Memulai check-in otomatis', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            
            const profileResults = this.profileProcessor.processAllProfiles(
                AppConfig.USER_PROFILES, 
                monitor
            );
            const fullReport = profileResults.join('\n\n');
            
            this.notificationService.dispatchNotifications(fullReport, monitor);
            
            AppLogger.log('Check-in berhasil diselesaikan', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            AppLogger.log(`\n${monitor.getReport()}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        } catch (error) {
            AppLogger.log(`Kesalahan kritis: ${error.message}\n${error.stack}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            throw error;
        } finally {
            monitor.end('TOTAL_RUNTIME');
        }
    }

    /**
     * Membersihkan cache aplikasi
     */
    clearCache() {
        this.cache.clear();
    }
}

// Instans global dan titik masuk
const Application = new HoyolabAutoCheckIn();

/**
 * Titik masuk utama untuk eksekusi terjadwal
 */
function main() {
    Application.execute();
}

/**
 * Fungsi pembersihan cache manual
 */
function clearCache() {
    Application.clearCache();
}