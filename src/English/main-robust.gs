/**
 * @file Hoyolab Auto Check-In Script for Google Apps Script
 * @version 6.0.0 devs
 * @author NatsumeAoii, Canaria (Original)
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} Original repository
 */

// ============================================================================
// SECTION 1: SCRIPT CONFIGURATION
// ============================================================================

/**
 * Authentication token structure
 * @typedef {Object} AuthToken
 * @property {string} account_mid_v2 - Account mid v2 token
 * @property {string} account_id_v2 - Account id v2 token
 * @property {string} ltoken_v2 - Ltoken v2
 * @property {string} ltmid_v2 - Ltmid v2
 * @property {string} ltuid_v2 - Ltuid v2
 */

/**
 * User profile configuration
 * @typedef {Object} Profile
 * @property {(string|AuthToken)} token - HoYoLAB authentication token
 * @property {string} accountName - User-friendly account identifier
 * @property {boolean} genshin - Genshin Impact check-in enabled
 * @property {boolean} honkai_star_rail - Honkai: Star Rail check-in enabled
 * @property {boolean} honkai_3 - Honkai Impact 3rd check-in enabled
 * @property {boolean} tears_of_themis - Tears of Themis check-in enabled
 * @property {boolean} zenless_zone_zero - Zenless Zone Zero check-in enabled
 */

/**
 * Discord notification configuration
 * @typedef {Object} DiscordConfig
 * @property {boolean} notify - Notification enabled status
 * @property {string} webhook - Discord webhook URL
 */

/**
 * Telegram notification configuration
 * @typedef {Object} TelegramConfig
 * @property {boolean} notify - Notification enabled status
 * @property {string} botToken - Telegram bot token
 * @property {string} chatID - Target chat ID
 */

/**
 * Game service configuration
 * @typedef {Object} GameServiceConfig
 * @property {string} name - Full game name
 * @property {string} shortName - Game abbreviation
 * @property {string} url - Check-in API endpoint
 * @property {boolean} enabled - Global service enabled status
 * @property {keyof Profile} configKey - Profile configuration key
 */

const AppConfig = {
    /**
     * User account profiles
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
     * Notification platform configuration
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
     * Application runtime settings
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
     * Application constants
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
     * Supported game services
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
     * API response mappings
     * @type {Object.<string, string>}
     */
    RESPONSE_MESSAGES: {
        "character detected": "No Account. 🔍",
        "character info not found": "No Account. 🔍",
        "活动已结束": "No Account. 🔍",
        "-500012": "No Account. 🔍",
        "already checked in today": "Already Checked In! ✅",
        "already checked in": "Already Checked In! ✅",
        "already signed in": "Already Checked In! ✅",
        "ok": "Check-in Success! ✅",
        "not logged in": "Invalid Cookie! ❌",
        "please log in to take part in the event": "Invalid Cookie! ❌"
    },

    /**
     * HTTP request headers
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

// Freeze configuration objects to prevent modification
Object.freeze(AppConfig);
Object.freeze(AppConfig.USER_PROFILES);
Object.freeze(AppConfig.NOTIFICATION_CONFIG);
Object.freeze(AppConfig.APP_SETTINGS);
Object.freeze(AppConfig.CONSTANTS);
Object.freeze(AppConfig.GAME_SERVICES);
Object.freeze(AppConfig.RESPONSE_MESSAGES);
Object.freeze(AppConfig.GAME_HEADERS);

// ============================================================================
// SECTION 2: CORE SERVICES
// ============================================================================

/**
 * Centralized logging service
 */
const AppLogger = {
    /**
     * Logs messages with timestamp and severity level
     * @param {string} message - Log message content
     * @param {string} [level=AppConfig.CONSTANTS.LOG_LEVELS.INFO] - Log severity level
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
 * Persistent caching service
 */
class CacheService {
    constructor() {
        this.propertyStore = PropertiesService.getScriptProperties();
        this.memoryCache = {};
    }

    /**
     * Retrieves cached value by key
     * @param {string} key - Cache key identifier
     * @returns {any|null} Cached value or null
     */
    get(key) {
        try {
            // Check in-memory cache first
            const cachedItem = this.memoryCache[key];
            if (cachedItem && cachedItem.expiry >= Date.now()) {
                return cachedItem.value;
            }

            // Check persistent storage
            const storedItem = this.propertyStore.getProperty(key);
            if (!storedItem) return null;

            const parsedData = JSON.parse(storedItem);
            if (parsedData.expiry < Date.now()) {
                this.remove(key);
                return null;
            }

            // Update memory cache
            this.memoryCache[key] = parsedData;
            return parsedData.value;
        } catch (error) {
            AppLogger.log(`Cache retrieval error: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return null;
        }
    }

    /**
     * Stores value in cache
     * @param {string} key - Cache key identifier
     * @param {any} value - Value to store
     * @param {number} [ttlSeconds=AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS] - Time-to-live in seconds
     */
    set(key, value, ttlSeconds = AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS) {
        if (!AppConfig.APP_SETTINGS.CACHE_ENABLED) return;

        try {
            const expiry = Date.now() + (ttlSeconds * 1000);
            const cacheItem = { value, expiry };
            
            this.propertyStore.setProperty(key, JSON.stringify(cacheItem));
            this.memoryCache[key] = cacheItem;
        } catch (error) {
            AppLogger.log(`Cache storage error: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Removes item from cache
     * @param {string} key - Cache key identifier
     */
    remove(key) {
        delete this.memoryCache[key];
        this.propertyStore.deleteProperty(key);
    }

    /**
     * Clears entire cache
     */
    clear() {
        this.memoryCache = {};
        this.propertyStore.deleteAllProperties();
        AppLogger.log("Cache cleared successfully", AppConfig.CONSTANTS.LOG_LEVELS.INFO);
    }
}

/**
 * Performance monitoring and reporting
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.scriptStartTime = Date.now();
    }

    /**
     * Starts timing for a metric
     * @param {string} label - Metric identifier
     */
    start(label) {
        this.metrics[label] = {
            startTime: Date.now(),
            endTime: null,
            duration: null
        };
    }

    /**
     * Stops timing for a metric
     * @param {string} label - Metric identifier
     */
    end(label) {
        const metric = this.metrics[label];
        if (metric && !metric.endTime) {
            metric.endTime = Date.now();
            metric.duration = metric.endTime - metric.startTime;
        }
    }

    /**
     * Gets total execution time
     * @returns {number} Total time in milliseconds
     */
    getTotalTime() {
        return Date.now() - this.scriptStartTime;
    }

    /**
     * Generates performance report
     * @returns {string} Formatted performance metrics
     */
    getReport() {
        const totalTime = this.getTotalTime();
        let report = "Performance Metrics:\n═══════════════════════\n";

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
            report += "No metrics recorded\n";
        }

        const totalSec = (totalTime / 1000).toFixed(2);
        report += `═══════════════════════\nTotal: ${totalTime}ms (${totalSec}s)`;
        return report;
    }
}

/**
 * HTTP client with retry and caching
 */
class HttpClient {
    /**
     * @param {CacheService} cacheService - Cache service instance
     */
    constructor(cacheService) {
        this.cache = cacheService;
    }

    /**
     * Normalizes token to cookie string format
     * @param {string|AuthToken} token - Authentication token
     * @returns {string} Normalized token string
     * @throws {Error} For invalid token structures
     */
    _normalizeToken(token) {
        // Return immediately if already string
        if (typeof token === 'string') return token;
        
        // Validate structured token
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
            throw new Error(`Invalid token structure. Missing or invalid keys: ${missingKeys.join(', ')}`);
        }
        
        // Convert to cookie string format
        return Object.entries(token)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    /**
     * Creates headers for API request
     * @param {string|AuthToken} token - Authentication token
     * @param {string} gameKey - Game identifier
     * @returns {Object} HTTP headers
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
     * Gets game key from URL
     * @param {string} url - API endpoint URL
     * @returns {string} Game identifier
     */
    _getGameKeyFromUrl(url) {
        for (const [key, config] of Object.entries(AppConfig.GAME_SERVICES)) {
            if (config.url === url) return key;
        }
        return 'default';
    }

    /**
     * Fetches data from API with retry logic
     * @param {string} url - API endpoint URL
     * @param {string|AuthToken} token - Authentication token
     * @param {PerformanceMonitor} monitor - Performance monitor
     * @returns {Object|null} API response or null
     */
    fetchWithRetry(url, token, monitor) {
        const maxAttempts = AppConfig.APP_SETTINGS.RETRY_COUNT;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = this._executeFetch(url, token, monitor);
                if (response) return response;
            } catch (error) {
                AppLogger.log(`Attempt ${attempt}/${maxAttempts} failed: ${error.message}`, 
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN);
                
                if (attempt < maxAttempts) {
                    const delay = Math.pow(2, attempt - 1) * AppConfig.APP_SETTINGS.RATE_LIMIT_DELAY_MS;
                    Utilities.sleep(delay);
                }
            }
        }
        
        AppLogger.log(`All fetch attempts failed for ${url}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        return null;
    }

    /**
     * Executes single fetch operation
     * @param {string} url - API endpoint URL
     * @param {string|AuthToken} token - Authentication token
     * @param {PerformanceMonitor} monitor - Performance monitor
     * @returns {Object|null} API response or null
     * @throws {Error} On fetch failure
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
            throw new Error(`Fetch failed: ${error.message}`);
        } finally {
            monitor.end(metricLabel);
        }
    }
}

/**
 * Game check-in service
 */
class GameService {
    /**
     * @param {HttpClient} httpClient - HTTP client instance
     */
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * Maps API response to user-friendly message
     * @param {string} apiMessage - Raw API message
     * @returns {string} User-friendly status
     */
    _mapResponseToStatus(apiMessage) {
        const lowerMessage = apiMessage.toLowerCase();
        for (const [key, status] of Object.entries(AppConfig.RESPONSE_MESSAGES)) {
            if (lowerMessage.includes(key)) return status;
        }
        return `Unrecognized response: ${apiMessage}`;
    }

    /**
     * Performs game check-in
     * @param {GameServiceConfig} gameConfig - Game configuration
     * @param {string|AuthToken} token - Authentication token
     * @param {PerformanceMonitor} monitor - Performance monitor
     * @returns {string} Check-in result status
     */
    performCheckIn(gameConfig, token, monitor) {
        const metricLabel = `CHECKIN:${gameConfig.shortName}`;
        monitor.start(metricLabel);
        AppLogger.log(`Starting ${gameConfig.name} check-in`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        
        try {
            const response = this.httpClient.fetchWithRetry(gameConfig.url, token, monitor);
            
            if (!response || !response.message) {
                throw new Error("Invalid API response structure");
            }
            
            const status = this._mapResponseToStatus(response.message);
            AppLogger.log(`${gameConfig.name} result: ${status}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            return status;
        } catch (error) {
            AppLogger.log(`${gameConfig.name} check-in failed: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return "Check-in Error! ❌";
        } finally {
            monitor.end(metricLabel);
        }
    }

    /**
     * Gets enabled games for profile
     * @param {Profile} profile - User profile
     * @returns {GameServiceConfig[]} Enabled game configurations
     */
    getEnabledGames(profile) {
        return Object.values(AppConfig.GAME_SERVICES).filter(game => 
            game.enabled && profile[game.configKey] === true
        );
    }
}

/**
 * Notification delivery service
 */
class NotificationService {
    /**
     * Determines notification color based on content
     * @param {string} content - Notification message
     * @returns {number} Color code
     */
    _determineColor(content) {
        if (content.includes("❌")) return AppConfig.CONSTANTS.STATUS_COLORS.ERROR;
        if (content.includes("✅")) return AppConfig.CONSTANTS.STATUS_COLORS.SUCCESS;
        return AppConfig.CONSTANTS.STATUS_COLORS.DEFAULT;
    }

    /**
     * Formats game statuses from report
     * @param {string} report - Full report content
     * @returns {string} Formatted game statuses
     */
    _formatGameStatuses(report) {
        return Object.values(AppConfig.GAME_SERVICES)
            .map(game => {
                const pattern = new RegExp(`\\*\\*${game.shortName}\\*\\*: ([^\\n]+)`);
                const match = report.match(pattern);
                return match ? `• **${game.name}**: ${match[1]}` : null;
            })
            .filter(Boolean)
            .join('\n') || "No game check-ins processed";
    }

    /**
     * Sends Discord notification
     * @param {string} report - Check-in report
     */
    _sendDiscordNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.discord; 
        if (!config.notify || !config.webhook) return;
        
        try {
            const now = new Date();
            const payload = {
                username: 'HoYoLAB Auto Check-In',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '🎮 Daily Check-in Report',
                    description: `Check-in completed for accounts: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**`,
                    color: this._determineColor(report),
                    fields: [{
                        name: "Results",
                        value: this._formatGameStatuses(report),
                        inline: false
                    }, {
                        name: "\u200B",
                        value: `[Check for Updates](${AppConfig.APP_SETTINGS.UPDATE_LINK})`
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
            AppLogger.log(`Discord notification failed: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Sends Telegram notification
     * @param {string} report - Check-in report
     */
    _sendTelegramNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.telegram;
        if (!config.notify || !config.botToken || !config.chatID) return;
        
        try {
            const plainText = report.replace(/\*\*/g, '');
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: config.chatID,
                text: `${plainText}\n\n<a href='${AppConfig.APP_SETTINGS.UPDATE_LINK}'>Check for updates</a>`,
                parse_mode: 'HTML'
            };
            
            UrlFetchApp.fetch(url, {
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify(payload)
            });
        } catch (error) {
            AppLogger.log(`Telegram notification failed: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Sends performance report
     * @param {PerformanceMonitor} monitor - Performance monitor
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
                username: 'Performance Monitor',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '⏱️ Script Performance',
                    description: `Account: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**\n\`\`\`\n${monitor.getReport()}\n\`\`\`\``,
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
            AppLogger.log(`Performance report failed: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Sends all notifications
     * @param {string} report - Check-in report
     * @param {PerformanceMonitor} monitor - Performance monitor
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
 * Profile processing service
 */
class ProfileProcessor {
    /**
     * @param {GameService} gameService - Game service instance
     */
    constructor(gameService) {
        this.gameService = gameService;
    }

    /**
     * Validates user profile configuration
     * @param {Profile} profile - User profile to validate
     * @throws {Error} If profile fails validation
     */
    _validateProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            throw new Error('Profile must be an object');
        }

        // Required fields validation
        const requiredFields = ['token', 'accountName'];
        for (const field of requiredFields) {
            if (!(field in profile)) {
                throw new Error(`Profile missing required field: ${field}`);
            }
        }

        // Token validation
        const token = profile.token;
        if (typeof token !== 'string' && typeof token !== 'object') {
            throw new Error('Token must be string or structured object');
        }
        
        // Account name validation
        if (typeof profile.accountName !== 'string' || profile.accountName.trim() === '') {
            throw new Error('Account name must be a non-empty string');
        }

        // Game flags validation
        const gameFlags = Object.keys(AppConfig.GAME_SERVICES).map(
            key => AppConfig.GAME_SERVICES[key].configKey
        );
        
        for (const flag of gameFlags) {
            if (flag in profile) {
                if (typeof profile[flag] !== 'boolean') {
                    throw new Error(`Game flag ${flag} must be a boolean value`);
                }
            } else {
                AppLogger.log(
                    `Profile '${profile.accountName}' missing game flag ${flag}, defaulting to false`,
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN
                );
                profile[flag] = false;
            }
        }
    }

    /**
     * Processes single profile
     * @param {Profile} profile - User profile
     * @param {PerformanceMonitor} monitor - Performance monitor
     * @returns {string} Check-in results
     */
    processProfile(profile, monitor) {
        try {
            // Validate profile before processing
            this._validateProfile(profile);
            
            AppLogger.log(`Processing ${profile.accountName}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            const enabledGames = this.gameService.getEnabledGames(profile);
            
            if (enabledGames.length === 0) {
                return `No enabled games for ${profile.accountName}`;
            }
            
            const results = enabledGames.map(game => 
                `**${game.shortName}**: ${this.gameService.performCheckIn(game, profile.token, monitor)}`
            );
            
            return `**${profile.accountName}**\n${results.join('\n')}`;
        } catch (error) {
            const errorMessage = `Profile '${profile.accountName || 'unknown'}' validation failed: ${error.message}`;
            AppLogger.log(errorMessage, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return `❌ ${errorMessage}`;
        }
    }

    /**
     * Processes all profiles
     * @param {Profile[]} profiles - User profiles
     * @param {PerformanceMonitor} monitor - Performance monitor
     * @returns {string[]} Profile results
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
// SECTION 3: MAIN APPLICATION
// ============================================================================

/**
 * Main application controller
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
     * Executes full check-in workflow
     */
    execute() {
        const monitor = new PerformanceMonitor();
        monitor.start('TOTAL_RUNTIME');
        
        try {
            AppLogger.log('Starting auto check-in', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            
            const profileResults = this.profileProcessor.processAllProfiles(
                AppConfig.USER_PROFILES, 
                monitor
            );
            const fullReport = profileResults.join('\n\n');
            
            this.notificationService.dispatchNotifications(fullReport, monitor);
            
            AppLogger.log('Check-in completed successfully', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            AppLogger.log(`\n${monitor.getReport()}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        } catch (error) {
            AppLogger.log(`Critical error: ${error.message}\n${error.stack}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            throw error;
        } finally {
            monitor.end('TOTAL_RUNTIME');
        }
    }

    /**
     * Clears application cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Global instance and entry points
const Application = new HoyolabAutoCheckIn();

/**
 * Main entry point for scheduled execution
 */
function main() {
    Application.execute();
}

/**
 * Manual cache clearance function
 */
function clearCache() {
    Application.clearCache();
}