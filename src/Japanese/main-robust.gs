/**
 * @file Google Apps Script用Hoyolab自動チェックインスクリプト
 * @version 6.0.0 開発版
 * @author NatsumeAoii, Canaria (オリジナル)
 * @license MIT
 * @original オリジナルリンク canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} オリジナルリポジトリ
 */

// ============================================================================
// セクション 1: スクリプト設定
// ============================================================================

/**
 * 認証トークン構造
 * @typedef {Object} AuthToken
 * @property {string} account_mid_v2 - アカウント mid v2 トークン
 * @property {string} account_id_v2 - アカウント id v2 トークン
 * @property {string} ltoken_v2 - Ltoken v2
 * @property {string} ltmid_v2 - Ltmid v2
 * @property {string} ltuid_v2 - Ltuid v2
 */

/**
 * ユーザープロファイル設定
 * @typedef {Object} Profile
 * @property {(string|AuthToken)} token - HoYoLAB 認証トークン
 * @property {string} accountName - 分かりやすいアカウント識別子
 * @property {boolean} genshin - 原神チェックインが有効
 * @property {boolean} honkai_star_rail - 崩壊：スターレイル チェックインが有効
 * @property {boolean} honkai_3 - 崩壊3rd チェックインが有効
 * @property {boolean} tears_of_themis - 未定事件簿 チェックインが有効
 * @property {boolean} zenless_zone_zero - ゼンレスゾーンゼロ チェックインが有効
 */

/**
 * Discord通知設定
 * @typedef {Object} DiscordConfig
 * @property {boolean} notify - 通知の有効状態
 * @property {string} webhook - Discord Webhook URL
 */

/**
 * Telegram通知設定
 * @typedef {Object} TelegramConfig
 * @property {boolean} notify - 通知の有効状態
 * @property {string} botToken - Telegramボットトークン
 * @property {string} chatID - ターゲットチャットID
 */

/**
 * ゲームサービス設定
 * @typedef {Object} GameServiceConfig
 * @property {string} name - ゲームのフルネーム
 * @property {string} shortName - ゲームの略称
 * @property {string} url - チェックインAPIエンドポイント
 * @property {boolean} enabled - グローバルサービスの有効状態
 * @property {keyof Profile} configKey - プロファイル設定キー
 */

const AppConfig = {
    /**
     * ユーザーアカウントプロファイル
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
     * 通知プラットフォーム設定
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
     * アプリケーション実行時設定
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
     * アプリケーション定数
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
     * サポートされているゲームサービス
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
            name: '崩壊：スターレイル',
            shortName: 'Star Rail',
            url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
            enabled: true,
            configKey: 'honkai_star_rail'
        },
        honkai_3: {
            name: '崩壊3rd',
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
            name: 'ゼンレスゾーンゼロ',
            shortName: 'ZZZ',
            url: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091',
            enabled: true,
            configKey: 'zenless_zone_zero'
        }
    },

    /**
     * API応答マッピング
     * @type {Object.<string, string>}
     */
    RESPONSE_MESSAGES: {
        "character detected": "アカウントがありません。🔍",
        "character info not found": "アカウントがありません。🔍",
        "活动已结束": "アカウントがありません。🔍",
        "-500012": "アカウントがありません。🔍",
        "already checked in today": "本日チェックイン済み！✅",
        "already checked in": "本日チェックイン済み！✅",
        "already signed in": "本日チェックイン済み！✅",
        "ok": "チェックイン成功！✅",
        "not logged in": "無効なCookieです！❌",
        "please log in to take part in the event": "無効なCookieです！❌"
    },

    /**
     * HTTPリクエストヘッダー
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

// 変更を防ぐために設定オブジェクトを凍結
Object.freeze(AppConfig);
Object.freeze(AppConfig.USER_PROFILES);
Object.freeze(AppConfig.NOTIFICATION_CONFIG);
Object.freeze(AppConfig.APP_SETTINGS);
Object.freeze(AppConfig.CONSTANTS);
Object.freeze(AppConfig.GAME_SERVICES);
Object.freeze(AppConfig.RESPONSE_MESSAGES);
Object.freeze(AppConfig.GAME_HEADERS);

// ============================================================================
// セクション 2: コアサービス
// ============================================================================

/**
 * 集中ログサービス
 */
const AppLogger = {
    /**
     * タイムスタンプと重要度レベル付きでメッセージをログに記録
     * @param {string} message - ログメッセージの内容
     * @param {string} [level=AppConfig.CONSTANTS.LOG_LEVELS.INFO] - ログの重要度レベル
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
 * 永続キャッシュサービス
 */
class CacheService {
    constructor() {
        this.propertyStore = PropertiesService.getScriptProperties();
        this.memoryCache = {};
    }

    /**
     * キーによってキャッシュされた値を取得
     * @param {string} key - キャッシュキー識別子
     * @returns {any|null} キャッシュされた値またはnull
     */
    get(key) {
        try {
            // まずメモリ内キャッシュを確認
            const cachedItem = this.memoryCache[key];
            if (cachedItem && cachedItem.expiry >= Date.now()) {
                return cachedItem.value;
            }

            // 永続ストレージを確認
            const storedItem = this.propertyStore.getProperty(key);
            if (!storedItem) return null;

            const parsedData = JSON.parse(storedItem);
            if (parsedData.expiry < Date.now()) {
                this.remove(key);
                return null;
            }

            // メモリキャッシュを更新
            this.memoryCache[key] = parsedData;
            return parsedData.value;
        } catch (error) {
            AppLogger.log(`キャッシュ取得エラー: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return null;
        }
    }

    /**
     * キャッシュに値を保存
     * @param {string} key - キャッシュキー識別子
     * @param {any} value - 保存する値
     * @param {number} [ttlSeconds=AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS] - 有効期間（秒）
     */
    set(key, value, ttlSeconds = AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS) {
        if (!AppConfig.APP_SETTINGS.CACHE_ENABLED) return;

        try {
            const expiry = Date.now() + (ttlSeconds * 1000);
            const cacheItem = { value, expiry };
            
            this.propertyStore.setProperty(key, JSON.stringify(cacheItem));
            this.memoryCache[key] = cacheItem;
        } catch (error) {
            AppLogger.log(`キャッシュ保存エラー: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * キャッシュから項目を削除
     * @param {string} key - キャッシュキー識別子
     */
    remove(key) {
        delete this.memoryCache[key];
        this.propertyStore.deleteProperty(key);
    }

    /**
     * キャッシュ全体をクリア
     */
    clear() {
        this.memoryCache = {};
        this.propertyStore.deleteAllProperties();
        AppLogger.log("キャッシュが正常にクリアされました", AppConfig.CONSTANTS.LOG_LEVELS.INFO);
    }
}

/**
 * パフォーマンスの監視と報告
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.scriptStartTime = Date.now();
    }

    /**
     * メトリックの計測を開始
     * @param {string} label - メトリック識別子
     */
    start(label) {
        this.metrics[label] = {
            startTime: Date.now(),
            endTime: null,
            duration: null
        };
    }

    /**
     * メトリックの計測を停止
     * @param {string} label - メトリック識別子
     */
    end(label) {
        const metric = this.metrics[label];
        if (metric && !metric.endTime) {
            metric.endTime = Date.now();
            metric.duration = metric.endTime - metric.startTime;
        }
    }

    /**
     * 総実行時間を取得
     * @returns {number} 総時間（ミリ秒）
     */
    getTotalTime() {
        return Date.now() - this.scriptStartTime;
    }

    /**
     * パフォーマンスレポートを生成
     * @returns {string} フォーマットされたパフォーマンスメトリック
     */
    getReport() {
        const totalTime = this.getTotalTime();
        let report = "パフォーマンスメトリック:\n═══════════════════════\n";

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
            report += "記録されたメトリックはありません\n";
        }

        const totalSec = (totalTime / 1000).toFixed(2);
        report += `═══════════════════════\n合計: ${totalTime}ms (${totalSec}s)`;
        return report;
    }
}

/**
 * リトライとキャッシュ機能付きHTTPクライアント
 */
class HttpClient {
    /**
     * @param {CacheService} cacheService - キャッシュサービスインスタンス
     */
    constructor(cacheService) {
        this.cache = cacheService;
    }

    /**
     * トークンをCookie文字列形式に正規化
     * @param {string|AuthToken} token - 認証トークン
     * @returns {string} 正規化されたトークン文字列
     * @throws {Error} 無効なトークン構造の場合
     */
    _normalizeToken(token) {
        // 既に文字列の場合は即時リターン
        if (typeof token === 'string') return token;
        
        // 構造化トークンを検証
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
            throw new Error(`無効なトークン構造です。キーが欠落または無効です: ${missingKeys.join(', ')}`);
        }
        
        // Cookie文字列形式に変換
        return Object.entries(token)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    /**
     * APIリクエスト用のヘッダーを作成
     * @param {string|AuthToken} token - 認証トークン
     * @param {string} gameKey - ゲーム識別子
     * @returns {Object} HTTPヘッダー
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
     * URLからゲームキーを取得
     * @param {string} url - APIエンドポイントURL
     * @returns {string} ゲーム識別子
     */
    _getGameKeyFromUrl(url) {
        for (const [key, config] of Object.entries(AppConfig.GAME_SERVICES)) {
            if (config.url === url) return key;
        }
        return 'default';
    }

    /**
     * リトライロジックを使用してAPIからデータを取得
     * @param {string} url - APIエンドポイントURL
     * @param {string|AuthToken} token - 認証トークン
     * @param {PerformanceMonitor} monitor - パフォーマンスモニター
     * @returns {Object|null} API応答またはnull
     */
    fetchWithRetry(url, token, monitor) {
        const maxAttempts = AppConfig.APP_SETTINGS.RETRY_COUNT;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = this._executeFetch(url, token, monitor);
                if (response) return response;
            } catch (error) {
                AppLogger.log(`試行 ${attempt}/${maxAttempts} 失敗: ${error.message}`, 
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN);
                
                if (attempt < maxAttempts) {
                    const delay = Math.pow(2, attempt - 1) * AppConfig.APP_SETTINGS.RATE_LIMIT_DELAY_MS;
                    Utilities.sleep(delay);
                }
            }
        }
        
        AppLogger.log(`${url} のすべての取得試行が失敗しました`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        return null;
    }

    /**
     * 単一のフェッチ操作を実行
     * @param {string} url - APIエンドポイントURL
     * @param {string|AuthToken} token - 認証トークン
     * @param {PerformanceMonitor} monitor - パフォーマンスモニター
     * @returns {Object|null} API応答またはnull
     * @throws {Error} フェッチ失敗時
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
            throw new Error(`フェッチ失敗: ${error.message}`);
        } finally {
            monitor.end(metricLabel);
        }
    }
}

/**
 * ゲームチェックインサービス
 */
class GameService {
    /**
     * @param {HttpClient} httpClient - HTTPクライアントインスタンス
     */
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * API応答を分かりやすいメッセージにマッピング
     * @param {string} apiMessage - 生のAPIメッセージ
     * @returns {string} 分かりやすいステータス
     */
    _mapResponseToStatus(apiMessage) {
        const lowerMessage = apiMessage.toLowerCase();
        for (const [key, status] of Object.entries(AppConfig.RESPONSE_MESSAGES)) {
            if (lowerMessage.includes(key)) return status;
        }
        return `認識できない応答: ${apiMessage}`;
    }

    /**
     * ゲームのチェックインを実行
     * @param {GameServiceConfig} gameConfig - ゲーム設定
     * @param {string|AuthToken} token - 認証トークン
     * @param {PerformanceMonitor} monitor - パフォーマンスモニター
     * @returns {string} チェックイン結果ステータス
     */
    performCheckIn(gameConfig, token, monitor) {
        const metricLabel = `CHECKIN:${gameConfig.shortName}`;
        monitor.start(metricLabel);
        AppLogger.log(`${gameConfig.name} のチェックインを開始`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        
        try {
            const response = this.httpClient.fetchWithRetry(gameConfig.url, token, monitor);
            
            if (!response || !response.message) {
                throw new Error("無効なAPI応答構造");
            }
            
            const status = this._mapResponseToStatus(response.message);
            AppLogger.log(`${gameConfig.name} 結果: ${status}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            return status;
        } catch (error) {
            AppLogger.log(`${gameConfig.name} のチェックインに失敗しました: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return "チェックインエラー！❌";
        } finally {
            monitor.end(metricLabel);
        }
    }

    /**
     * プロファイルで有効なゲームを取得
     * @param {Profile} profile - ユーザープロファイル
     * @returns {GameServiceConfig[]} 有効なゲーム設定
     */
    getEnabledGames(profile) {
        return Object.values(AppConfig.GAME_SERVICES).filter(game => 
            game.enabled && profile[game.configKey] === true
        );
    }
}

/**
 * 通知配信サービス
 */
class NotificationService {
    /**
     * 内容に基づいて通知の色を決定
     * @param {string} content - 通知メッセージ
     * @returns {number} カラーコード
     */
    _determineColor(content) {
        if (content.includes("❌")) return AppConfig.CONSTANTS.STATUS_COLORS.ERROR;
        if (content.includes("✅")) return AppConfig.CONSTANTS.STATUS_COLORS.SUCCESS;
        return AppConfig.CONSTANTS.STATUS_COLORS.DEFAULT;
    }

    /**
     * レポートからゲームステータスをフォーマット
     * @param {string} report - レポートの全内容
     * @returns {string} フォーマットされたゲームステータス
     */
    _formatGameStatuses(report) {
        return Object.values(AppConfig.GAME_SERVICES)
            .map(game => {
                const pattern = new RegExp(`\\*\\*${game.shortName}\\*\\*: ([^\\n]+)`);
                const match = report.match(pattern);
                return match ? `• **${game.name}**: ${match[1]}` : null;
            })
            .filter(Boolean)
            .join('\n') || "処理されたゲームチェックインはありません";
    }

    /**
     * Discord通知を送信
     * @param {string} report - チェックインレポート
     */
    _sendDiscordNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.discord; 
        if (!config.notify || !config.webhook) return;
        
        try {
            const now = new Date();
            const payload = {
                username: 'HoYoLAB自動チェックイン',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '🎮 毎日のチェックインレポート',
                    description: `アカウントのチェックインが完了しました: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**`,
                    color: this._determineColor(report),
                    fields: [{
                        name: "結果",
                        value: this._formatGameStatuses(report),
                        inline: false
                    }, {
                        name: "\u200B",
                        value: `[更新を確認](${AppConfig.APP_SETTINGS.UPDATE_LINK})`
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
            AppLogger.log(`Discord通知に失敗しました: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Telegram通知を送信
     * @param {string} report - チェックインレポート
     */
    _sendTelegramNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.telegram;
        if (!config.notify || !config.botToken || !config.chatID) return;
        
        try {
            const plainText = report.replace(/\*\*/g, '');
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: config.chatID,
                text: `${plainText}\n\n<a href='${AppConfig.APP_SETTINGS.UPDATE_LINK}'>更新を確認</a>`,
                parse_mode: 'HTML'
            };
            
            UrlFetchApp.fetch(url, {
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify(payload)
            });
        } catch (error) {
            AppLogger.log(`Telegram通知に失敗しました: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * パフォーマンスレポートを送信
     * @param {PerformanceMonitor} monitor - パフォーマンスモニター
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
                username: 'パフォーマンスモニター',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '⏱️ スクリプトのパフォーマンス',
                    description: `アカウント: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**\n\`\`\`\n${monitor.getReport()}\n\`\`\`\``,
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
            AppLogger.log(`パフォーマンスレポートの送信に失敗しました: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * すべての通知を送信
     * @param {string} report - チェックインレポート
     * @param {PerformanceMonitor} monitor - パフォーマンスモニター
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
 * プロファイル処理サービス
 */
class ProfileProcessor {
    /**
     * @param {GameService} gameService - ゲームチェックインサービスインスタンス
     */
    constructor(gameService) {
        this.gameService = gameService;
    }

    /**
     * ユーザープロファイル設定を検証
     * @param {Profile} profile - 検証するユーザープロファイル
     * @throws {Error} プロファイルの検証に失敗した場合
     */
    _validateProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            throw new Error('プロファイルはオブジェクトである必要があります');
        }

        // 必須フィールドの検証
        const requiredFields = ['token', 'accountName'];
        for (const field of requiredFields) {
            if (!(field in profile)) {
                throw new Error(`プロファイルに必須フィールドがありません: ${field}`);
            }
        }

        // トークンの検証
        const token = profile.token;
        if (typeof token !== 'string' && typeof token !== 'object') {
            throw new Error('トークンは文字列または構造化オブジェクトである必要があります');
        }
        
        // アカウント名の検証
        if (typeof profile.accountName !== 'string' || profile.accountName.trim() === '') {
            throw new Error('アカウント名は空でない文字列である必要があります');
        }

        // ゲームフラグの検証
        const gameFlags = Object.keys(AppConfig.GAME_SERVICES).map(
            key => AppConfig.GAME_SERVICES[key].configKey
        );
        
        for (const flag of gameFlags) {
            if (flag in profile) {
                if (typeof profile[flag] !== 'boolean') {
                    throw new Error(`ゲームフラグ ${flag} はブール値である必要があります`);
                }
            } else {
                AppLogger.log(
                    `プロファイル '${profile.accountName}' にゲームフラグ ${flag} がありません。falseにデフォルト設定します`,
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN
                );
                profile[flag] = false;
            }
        }
    }

    /**
     * 単一のプロファイルを処理
     * @param {Profile} profile - ユーザープロファイル
     * @param {PerformanceMonitor} monitor - パフォーマンスモニター
     * @returns {string} チェックイン結果
     */
    processProfile(profile, monitor) {
        try {
            // 処理前にプロファイルを検証
            this._validateProfile(profile);
            
            AppLogger.log(`${profile.accountName} 処理中`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            const enabledGames = this.gameService.getEnabledGames(profile);
            
            if (enabledGames.length === 0) {
                return `${profile.accountName} に有効なゲームはありません`;
            }
            
            const results = enabledGames.map(game => 
                `**${game.shortName}**: ${this.gameService.performCheckIn(game, profile.token, monitor)}`
            );
            
            return `**${profile.accountName}**\n${results.join('\n')}`;
        } catch (error) {
            const errorMessage = `プロファイル '${profile.accountName || 'unknown'}' の検証に失敗しました: ${error.message}`;
            AppLogger.log(errorMessage, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return `❌ ${errorMessage}`;
        }
    }

    /**
     * すべてのプロファイルを処理
     * @param {Profile[]} profiles - ユーザープロファイル
     * @param {PerformanceMonitor} monitor - パフォーマンスモニター
     * @returns {string[]} プロファイルの結果
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
// セクション 3: メインアプリケーション
// ============================================================================

/**
 * メインアプリケーションコントローラー
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
     * 完全なチェックインワークフローを実行
     */
    execute() {
        const monitor = new PerformanceMonitor();
        monitor.start('TOTAL_RUNTIME');
        
        try {
            AppLogger.log('自動チェックインを開始', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            
            const profileResults = this.profileProcessor.processAllProfiles(
                AppConfig.USER_PROFILES, 
                monitor
            );
            const fullReport = profileResults.join('\n\n');
            
            this.notificationService.dispatchNotifications(fullReport, monitor);
            
            AppLogger.log('チェックインが正常に完了しました', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            AppLogger.log(`\n${monitor.getReport()}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        } catch (error) {
            AppLogger.log(`重大なエラー: ${error.message}\n${error.stack}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            throw error;
        } finally {
            monitor.end('TOTAL_RUNTIME');
        }
    }

    /**
     * アプリケーションキャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
    }
}

// グローバルインスタンスとエントリポイント
const Application = new HoyolabAutoCheckIn();

/**
 * スケジュール実行用のメインエントリポイント
 */
function main() {
    Application.execute();
}

/**
 * 手動キャッシュクリア機能
 */
function clearCache() {
    Application.clearCache();
}