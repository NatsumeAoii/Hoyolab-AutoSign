/**
 * @file 适用于 Google Apps 脚本的 Hoyolab 自动签到脚本
 * @version 6.0.0 开发版
 * @author NatsumeAoii, Canaria (原作者)
 * @license MIT
 * @original 原始链接 canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} 原始仓库
 */

// ============================================================================
// 第 1 节：脚本配置
// ============================================================================

/**
 * 身份验证令牌结构
 * @typedef {Object} AuthToken
 * @property {string} account_mid_v2 - 账户 mid v2 令牌
 * @property {string} account_id_v2 - 账户 id v2 令牌
 * @property {string} ltoken_v2 - Ltoken v2
 * @property {string} ltmid_v2 - Ltmid v2
 * @property {string} ltuid_v2 - Ltuid v2
 */

/**
 * 用户个人资料配置
 * @typedef {Object} Profile
 * @property {(string|AuthToken)} token - HoYoLAB 身份验证令牌
 * @property {string} accountName - 用户友好的账户标识符
 * @property {boolean} genshin - 原神签到已启用
 * @property {boolean} honkai_star_rail - 崩坏：星穹铁道签到已启用
 * @property {boolean} honkai_3 - 崩坏3签到已启用
 * @property {boolean} tears_of_themis - 未定事件簿签到已启用
 * @property {boolean} zenless_zone_zero - 绝区零签到已启用
 */

/**
 * Discord 通知配置
 * @typedef {Object} DiscordConfig
 * @property {boolean} notify - 通知启用状态
 * @property {string} webhook - Discord webhook 网址
 */

/**
 * Telegram 通知配置
 * @typedef {Object} TelegramConfig
 * @property {boolean} notify - 通知启用状态
 * @property {string} botToken - Telegram 机器人令牌
 * @property {string} chatID - 目标聊天 ID
 */

/**
 * 游戏服务配置
 * @typedef {Object} GameServiceConfig
 * @property {string} name - 游戏全名
 * @property {string} shortName - 游戏简称
 * @property {string} url - 签到 API 端点
 * @property {boolean} enabled - 全局服务启用状态
 * @property {keyof Profile} configKey - 个人资料配置键
 */

const AppConfig = {
    /**
     * 用户账户个人资料
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
     * 通知平台配置
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
     * 应用程序运行时设置
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
     * 应用程序常量
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
     * 支持的游戏服务
     * @type {Object.<string, GameServiceConfig>}
     */
    GAME_SERVICES: {
        genshin: {
            name: '原神',
            shortName: 'Genshin',
            url: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
            enabled: true,
            configKey: 'genshin'
        },
        honkai_star_rail: {
            name: '崩坏：星穹铁道',
            shortName: 'Star Rail',
            url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
            enabled: true,
            configKey: 'honkai_star_rail'
        },
        honkai_3: {
            name: '崩坏3',
            shortName: 'HI 3',
            url: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111',
            enabled: true,
            configKey: 'honkai_3'
        },
        tears_of_themis: {
            name: '未定事件簿',
            shortName: 'ToT',
            url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581',
            enabled: true,
            configKey: 'tears_of_themis'
        },
        zenless_zone_zero: {
            name: '绝区零',
            shortName: 'ZZZ',
            url: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091',
            enabled: true,
            configKey: 'zenless_zone_zero'
        }
    },

    /**
     * API 响应消息映射
     * @type {Object.<string, string>}
     */
    RESPONSE_MESSAGES: {
        "character detected": "无账号。🔍",
        "character info not found": "无账号。🔍",
        "活动已结束": "无账号。🔍",
        "-500012": "无账号。🔍",
        "already checked in today": "今日已签到！✅",
        "already checked in": "今日已签到！✅",
        "already signed in": "今日已签到！✅",
        "ok": "签到成功！✅",
        "not logged in": "Cookie 无效！❌",
        "please log in to take part in the event": "Cookie 无效！❌"
    },

    /**
     * HTTP 请求头
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

// 冻结配置对象以防止修改
Object.freeze(AppConfig);
Object.freeze(AppConfig.USER_PROFILES);
Object.freeze(AppConfig.NOTIFICATION_CONFIG);
Object.freeze(AppConfig.APP_SETTINGS);
Object.freeze(AppConfig.CONSTANTS);
Object.freeze(AppConfig.GAME_SERVICES);
Object.freeze(AppConfig.RESPONSE_MESSAGES);
Object.freeze(AppConfig.GAME_HEADERS);

// ============================================================================
// 第 2 节：核心服务
// ============================================================================

/**
 * 集中式日志记录服务
 */
const AppLogger = {
    /**
     * 记录带有时间戳和严重级别的消息
     * @param {string} message - 日志消息内容
     * @param {string} [level=AppConfig.CONSTANTS.LOG_LEVELS.INFO] - 日志严重级别
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
 * 持久化缓存服务
 */
class CacheService {
    constructor() {
        this.propertyStore = PropertiesService.getScriptProperties();
        this.memoryCache = {};
    }

    /**
     * 通过键检索缓存值
     * @param {string} key - 缓存键标识符
     * @returns {any|null} 缓存的值或 null
     */
    get(key) {
        try {
            // 首先检查内存缓存
            const cachedItem = this.memoryCache[key];
            if (cachedItem && cachedItem.expiry >= Date.now()) {
                return cachedItem.value;
            }

            // 检查持久化存储
            const storedItem = this.propertyStore.getProperty(key);
            if (!storedItem) return null;

            const parsedData = JSON.parse(storedItem);
            if (parsedData.expiry < Date.now()) {
                this.remove(key);
                return null;
            }

            // 更新内存缓存
            this.memoryCache[key] = parsedData;
            return parsedData.value;
        } catch (error) {
            AppLogger.log(`缓存检索错误: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return null;
        }
    }

    /**
     * 在缓存中存储值
     * @param {string} key - 缓存键标识符
     * @param {any} value - 要存储的值
     * @param {number} [ttlSeconds=AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS] - 存活时间（秒）
     */
    set(key, value, ttlSeconds = AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS) {
        if (!AppConfig.APP_SETTINGS.CACHE_ENABLED) return;

        try {
            const expiry = Date.now() + (ttlSeconds * 1000);
            const cacheItem = { value, expiry };
            
            this.propertyStore.setProperty(key, JSON.stringify(cacheItem));
            this.memoryCache[key] = cacheItem;
        } catch (error) {
            AppLogger.log(`缓存存储错误: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * 从缓存中移除项目
     * @param {string} key - 缓存键标识符
     */
    remove(key) {
        delete this.memoryCache[key];
        this.propertyStore.deleteProperty(key);
    }

    /**
     * 清除整个缓存
     */
    clear() {
        this.memoryCache = {};
        this.propertyStore.deleteAllProperties();
        AppLogger.log("缓存已成功清除", AppConfig.CONSTANTS.LOG_LEVELS.INFO);
    }
}

/**
 * 性能监控和报告
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.scriptStartTime = Date.now();
    }

    /**
     * 开始为指标计时
     * @param {string} label - 指标标识符
     */
    start(label) {
        this.metrics[label] = {
            startTime: Date.now(),
            endTime: null,
            duration: null
        };
    }

    /**
     * 停止为指标计时
     * @param {string} label - 指标标识符
     */
    end(label) {
        const metric = this.metrics[label];
        if (metric && !metric.endTime) {
            metric.endTime = Date.now();
            metric.duration = metric.endTime - metric.startTime;
        }
    }

    /**
     * 获取总执行时间
     * @returns {number} 总时间（毫秒）
     */
    getTotalTime() {
        return Date.now() - this.scriptStartTime;
    }

    /**
     * 生成性能报告
     * @returns {string} 格式化的性能指标
     */
    getReport() {
        const totalTime = this.getTotalTime();
        let report = "性能指标：\n═══════════════════════\n";

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
            report += "未记录任何指标\n";
        }

        const totalSec = (totalTime / 1000).toFixed(2);
        report += `═══════════════════════\n总计： ${totalTime}ms (${totalSec}s)`;
        return report;
    }
}

/**
 * 具有重试和缓存功能的 HTTP 客户端
 */
class HttpClient {
    /**
     * @param {CacheService} cacheService - 缓存服务实例
     */
    constructor(cacheService) {
        this.cache = cacheService;
    }

    /**
     * 将令牌规范化为 cookie 字符串格式
     * @param {string|AuthToken} token - 身份验证令牌
     * @returns {string} 规范化的令牌字符串
     * @throws {Error} 适用于无效的令牌结构
     */
    _normalizeToken(token) {
        // 如果已是字符串则立即返回
        if (typeof token === 'string') return token;
        
        // 验证结构化令牌
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
            throw new Error(`无效的令牌结构。缺少或无效的键： ${missingKeys.join(', ')}`);
        }
        
        // 转换为 cookie 字符串格式
        return Object.entries(token)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    /**
     * 创建 API 请求头
     * @param {string|AuthToken} token - 身份验证令牌
     * @param {string} gameKey - 游戏标识符
     * @returns {Object} HTTP 请求头
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
     * 从 URL 获取游戏键
     * @param {string} url - API 端点 URL
     * @returns {string} 游戏标识符
     */
    _getGameKeyFromUrl(url) {
        for (const [key, config] of Object.entries(AppConfig.GAME_SERVICES)) {
            if (config.url === url) return key;
        }
        return 'default';
    }

    /**
     * 使用重试逻辑从 API 获取数据
     * @param {string} url - API 端点 URL
     * @param {string|AuthToken} token - 身份验证令牌
     * @param {PerformanceMonitor} monitor - 性能监视器
     * @returns {Object|null} API 响应或 null
     */
    fetchWithRetry(url, token, monitor) {
        const maxAttempts = AppConfig.APP_SETTINGS.RETRY_COUNT;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = this._executeFetch(url, token, monitor);
                if (response) return response;
            } catch (error) {
                AppLogger.log(`尝试 ${attempt}/${maxAttempts} 失败： ${error.message}`, 
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN);
                
                if (attempt < maxAttempts) {
                    const delay = Math.pow(2, attempt - 1) * AppConfig.APP_SETTINGS.RATE_LIMIT_DELAY_MS;
                    Utilities.sleep(delay);
                }
            }
        }
        
        AppLogger.log(`所有对 ${url} 的获取尝试均失败`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        return null;
    }

    /**
     * 执行单个获取操作
     * @param {string} url - API 端点 URL
     * @param {string|AuthToken} token - 身份验证令牌
     * @param {PerformanceMonitor} monitor - 性能监视器
     * @returns {Object|null} API 响应或 null
     * @throws {Error} 在获取失败时
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
            throw new Error(`获取失败： ${error.message}`);
        } finally {
            monitor.end(metricLabel);
        }
    }
}

/**
 * 游戏签到服务
 */
class GameService {
    /**
     * @param {HttpClient} httpClient - HTTP 客户端实例
     */
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * 将 API 响应映射到用户友好的消息
     * @param {string} apiMessage - 原始 API 消息
     * @returns {string} 用户友好的状态
     */
    _mapResponseToStatus(apiMessage) {
        const lowerMessage = apiMessage.toLowerCase();
        for (const [key, status] of Object.entries(AppConfig.RESPONSE_MESSAGES)) {
            if (lowerMessage.includes(key)) return status;
        }
        return `无法识别的响应： ${apiMessage}`;
    }

    /**
     * 执行游戏签到
     * @param {GameServiceConfig} gameConfig - 游戏配置
     * @param {string|AuthToken} token - 身份验证令牌
     * @param {PerformanceMonitor} monitor - 性能监视器
     * @returns {string} 签到结果状态
     */
    performCheckIn(gameConfig, token, monitor) {
        const metricLabel = `CHECKIN:${gameConfig.shortName}`;
        monitor.start(metricLabel);
        AppLogger.log(`开始 ${gameConfig.name} 签到`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        
        try {
            const response = this.httpClient.fetchWithRetry(gameConfig.url, token, monitor);
            
            if (!response || !response.message) {
                throw new Error("无效的 API 响应结构");
            }
            
            const status = this._mapResponseToStatus(response.message);
            AppLogger.log(`${gameConfig.name} 结果： ${status}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            return status;
        } catch (error) {
            AppLogger.log(`${gameConfig.name} 签到失败： ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return "签到出错！❌";
        } finally {
            monitor.end(metricLabel);
        }
    }

    /**
     * 获取个人资料中已启用的游戏
     * @param {Profile} profile - 用户个人资料
     * @returns {GameServiceConfig[]} 已启用的游戏配置
     */
    getEnabledGames(profile) {
        return Object.values(AppConfig.GAME_SERVICES).filter(game => 
            game.enabled && profile[game.configKey] === true
        );
    }
}

/**
 * 通知分发服务
 */
class NotificationService {
    /**
     * 根据内容确定通知颜色
     * @param {string} content - 通知消息
     * @returns {number} 颜色代码
     */
    _determineColor(content) {
        if (content.includes("❌")) return AppConfig.CONSTANTS.STATUS_COLORS.ERROR;
        if (content.includes("✅")) return AppConfig.CONSTANTS.STATUS_COLORS.SUCCESS;
        return AppConfig.CONSTANTS.STATUS_COLORS.DEFAULT;
    }

    /**
     * 从报告中格式化游戏状态
     * @param {string} report - 完整报告内容
     * @returns {string} 格式化的游戏状态
     */
    _formatGameStatuses(report) {
        return Object.values(AppConfig.GAME_SERVICES)
            .map(game => {
                const pattern = new RegExp(`\\*\\*${game.shortName}\\*\\*: ([^\\n]+)`);
                const match = report.match(pattern);
                return match ? `• **${game.name}**: ${match[1]}` : null;
            })
            .filter(Boolean)
            .join('\n') || "未处理任何游戏签到";
    }

    /**
     * 发送 Discord 通知
     * @param {string} report - 签到报告
     */
    _sendDiscordNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.discord; 
        if (!config.notify || !config.webhook) return;
        
        try {
            const now = new Date();
            const payload = {
                username: 'HoYoLAB 自动签到',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '🎮 每日签到报告',
                    description: `已完成签到的账户： **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**`,
                    color: this._determineColor(report),
                    fields: [{
                        name: "结果",
                        value: this._formatGameStatuses(report),
                        inline: false
                    }, {
                        name: "\u200B",
                        value: `[检查更新](${AppConfig.APP_SETTINGS.UPDATE_LINK})`
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
            AppLogger.log(`Discord 通知发送失败： ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * 发送 Telegram 通知
     * @param {string} report - 签到报告
     */
    _sendTelegramNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.telegram;
        if (!config.notify || !config.botToken || !config.chatID) return;
        
        try {
            const plainText = report.replace(/\*\*/g, '');
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: config.chatID,
                text: `${plainText}\n\n<a href='${AppConfig.APP_SETTINGS.UPDATE_LINK}'>检查更新</a>`,
                parse_mode: 'HTML'
            };
            
            UrlFetchApp.fetch(url, {
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify(payload)
            });
        } catch (error) {
            AppLogger.log(`Telegram 通知发送失败： ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * 发送性能报告
     * @param {PerformanceMonitor} monitor - 性能监视器
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
                username: '性能监视器',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '⏱️ 脚本性能',
                    description: `账户： **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**\n\`\`\`\n${monitor.getReport()}\n\`\`\`\``,
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
            AppLogger.log(`性能报告发送失败： ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * 发送所有通知
     * @param {string} report - 签到报告
     * @param {PerformanceMonitor} monitor - 性能监视器
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
 * 个人资料处理服务
 */
class ProfileProcessor {
    /**
     * @param {GameService} gameService - 游戏签到服务实例
     */
    constructor(gameService) {
        this.gameService = gameService;
    }

    /**
     * 验证用户个人资料配置
     * @param {Profile} profile - 要验证的用户个人资料
     * @throws {Error} 如果个人资料验证失败
     */
    _validateProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            throw new Error('个人资料必须是一个对象');
        }

        // 必填字段验证
        const requiredFields = ['token', 'accountName'];
        for (const field of requiredFields) {
            if (!(field in profile)) {
                throw new Error(`个人资料缺少必填字段： ${field}`);
            }
        }

        // 令牌验证
        const token = profile.token;
        if (typeof token !== 'string' && typeof token !== 'object') {
            throw new Error('令牌必须是字符串或结构化对象');
        }
        
        // 账户名验证
        if (typeof profile.accountName !== 'string' || profile.accountName.trim() === '') {
            throw new Error('账户名必须是非空字符串');
        }

        // 游戏标志验证
        const gameFlags = Object.keys(AppConfig.GAME_SERVICES).map(
            key => AppConfig.GAME_SERVICES[key].configKey
        );
        
        for (const flag of gameFlags) {
            if (flag in profile) {
                if (typeof profile[flag] !== 'boolean') {
                    throw new Error(`游戏标志 ${flag} 必须是布尔值`);
                }
            } else {
                AppLogger.log(
                    `个人资料 '${profile.accountName}' 缺少游戏标志 ${flag}，默认为 false`,
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN
                );
                profile[flag] = false;
            }
        }
    }

    /**
     * 处理单个个人资料
     * @param {Profile} profile - 用户个人资料
     * @param {PerformanceMonitor} monitor - 性能监视器
     * @returns {string} 签到结果
     */
    processProfile(profile, monitor) {
        try {
            // 处理前验证个人资料
            this._validateProfile(profile);
            
            AppLogger.log(`正在处理 ${profile.accountName}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            const enabledGames = this.gameService.getEnabledGames(profile);
            
            if (enabledGames.length === 0) {
                return `没有为 ${profile.accountName} 启用的游戏`;
            }
            
            const results = enabledGames.map(game => 
                `**${game.shortName}**: ${this.gameService.performCheckIn(game, profile.token, monitor)}`
            );
            
            return `**${profile.accountName}**\n${results.join('\n')}`;
        } catch (error) {
            const errorMessage = `个人资料 '${profile.accountName || 'unknown'}' 验证失败： ${error.message}`;
            AppLogger.log(errorMessage, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return `❌ ${errorMessage}`;
        }
    }

    /**
     * 处理所有个人资料
     * @param {Profile[]} profiles - 用户个人资料
     * @param {PerformanceMonitor} monitor - 性能监视器
     * @returns {string[]} 个人资料结果
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
// 第 3 节：主应用程序
// ============================================================================

/**
 * 主应用程序控制器
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
     * 执行完整的签到工作流程
     */
    execute() {
        const monitor = new PerformanceMonitor();
        monitor.start('TOTAL_RUNTIME');
        
        try {
            AppLogger.log('开始自动签到', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            
            const profileResults = this.profileProcessor.processAllProfiles(
                AppConfig.USER_PROFILES, 
                monitor
            );
            const fullReport = profileResults.join('\n\n');
            
            this.notificationService.dispatchNotifications(fullReport, monitor);
            
            AppLogger.log('签到已成功完成', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            AppLogger.log(`\n${monitor.getReport()}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        } catch (error) {
            AppLogger.log(`严重错误： ${error.message}\n${error.stack}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            throw error;
        } finally {
            monitor.end('TOTAL_RUNTIME');
        }
    }

    /**
     * 清除应用程序缓存
     */
    clearCache() {
        this.cache.clear();
    }
}

// 全局实例和入口点
const Application = new HoyolabAutoCheckIn();

/**
 * 计划执行的主入口点
 */
function main() {
    Application.execute();
}

/**
 * 手动清除缓存功能
 */
function clearCache() {
    Application.clearCache();
}