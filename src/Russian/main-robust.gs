/**
 * @file Скрипт автоматической отметки в Hoyolab для Google Apps Script
 * @version 6.0.0 для разработчиков
 * @author NatsumeAoii, Canaria (Оригинал)
 * @license MIT
 * @original оригинальная ссылка canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} Оригинальный репозиторий
 */

// ============================================================================
// РАЗДЕЛ 1: КОНФИГУРАЦИЯ СКРИПТА
// ============================================================================

/**
 * Структура токена аутентификации
 * @typedef {Object} AuthToken
 * @property {string} account_mid_v2 - Токен account mid v2
 * @property {string} account_id_v2 - Токен account id v2
 * @property {string} ltoken_v2 - Ltoken v2
 * @property {string} ltmid_v2 - Ltmid v2
 * @property {string} ltuid_v2 - Ltuid v2
 */

/**
 * Конфигурация профиля пользователя
 * @typedef {Object} Profile
 * @property {(string|AuthToken)} token - Токен аутентификации HoYoLAB
 * @property {string} accountName - Удобный идентификатор учетной записи
 * @property {boolean} genshin - Отметка в Genshin Impact включена
 * @property {boolean} honkai_star_rail - Отметка в Honkai: Star Rail включена
 * @property {boolean} honkai_3 - Отметка в Honkai Impact 3rd включена
 * @property {boolean} tears_of_themis - Отметка в Tears of Themis включена
 * @property {boolean} zenless_zone_zero - Отметка в Zenless Zone Zero включена
 */

/**
 * Конфигурация уведомлений Discord
 * @typedef {Object} DiscordConfig
 * @property {boolean} notify - Статус включения уведомлений
 * @property {string} webhook - URL веб-хука Discord
 */

/**
 * Конфигурация уведомлений Telegram
 * @typedef {Object} TelegramConfig
 * @property {boolean} notify - Статус включения уведомлений
 * @property {string} botToken - Токен бота Telegram
 * @property {string} chatID - Целевой ID чата
 */

/**
 * Конфигурация игровых сервисов
 * @typedef {Object} GameServiceConfig
 * @property {string} name - Полное название игры
 * @property {string} shortName - Аббревиатура игры
 * @property {string} url - API-эндпоинт для отметки
 * @property {boolean} enabled - Статус включения глобального сервиса
 * @property {keyof Profile} configKey - Ключ конфигурации профиля
 */

const AppConfig = {
    /**
     * Профили учетных записей пользователей
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
     * Конфигурация платформы уведомлений
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
     * Настройки времени выполнения приложения
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
     * Константы приложения
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
     * Поддерживаемые игровые сервисы
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
     * Сопоставления ответов API
     * @type {Object.<string, string>}
     */
    RESPONSE_MESSAGES: {
        "character detected": "Нет аккаунта. 🔍",
        "character info not found": "Нет аккаунта. 🔍",
        "活动已结束": "Нет аккаунта. 🔍",
        "-500012": "Нет аккаунта. 🔍",
        "already checked in today": "Уже отмечено сегодня! ✅",
        "already checked in": "Уже отмечено сегодня! ✅",
        "already signed in": "Уже отмечено сегодня! ✅",
        "ok": "Отметка успешна! ✅",
        "not logged in": "Неверный Cookie! ❌",
        "please log in to take part in the event": "Неверный Cookie! ❌"
    },

    /**
     * Заголовки HTTP-запроса
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

// Заморозить объекты конфигурации для предотвращения изменений
Object.freeze(AppConfig);
Object.freeze(AppConfig.USER_PROFILES);
Object.freeze(AppConfig.NOTIFICATION_CONFIG);
Object.freeze(AppConfig.APP_SETTINGS);
Object.freeze(AppConfig.CONSTANTS);
Object.freeze(AppConfig.GAME_SERVICES);
Object.freeze(AppConfig.RESPONSE_MESSAGES);
Object.freeze(AppConfig.GAME_HEADERS);

// ============================================================================
// РАЗДЕЛ 2: ОСНОВНЫЕ СЕРВИСЫ
// ============================================================================

/**
 * Централизованный сервис логирования
 */
const AppLogger = {
    /**
     * Записывает сообщения с временной меткой и уровнем серьезности
     * @param {string} message - Содержимое сообщения лога
     * @param {string} [level=AppConfig.CONSTANTS.LOG_LEVELS.INFO] - Уровень серьезности лога
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
 * Сервис постоянного кеширования
 */
class CacheService {
    constructor() {
        this.propertyStore = PropertiesService.getScriptProperties();
        this.memoryCache = {};
    }

    /**
     * Извлекает кешированное значение по ключу
     * @param {string} key - Идентификатор ключа кеша
     * @returns {any|null} Кешированное значение или null
     */
    get(key) {
        try {
            // Сначала проверить кеш в памяти
            const cachedItem = this.memoryCache[key];
            if (cachedItem && cachedItem.expiry >= Date.now()) {
                return cachedItem.value;
            }

            // Проверить постоянное хранилище
            const storedItem = this.propertyStore.getProperty(key);
            if (!storedItem) return null;

            const parsedData = JSON.parse(storedItem);
            if (parsedData.expiry < Date.now()) {
                this.remove(key);
                return null;
            }

            // Обновить кеш в памяти
            this.memoryCache[key] = parsedData;
            return parsedData.value;
        } catch (error) {
            AppLogger.log(`Ошибка извлечения из кеша: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return null;
        }
    }

    /**
     * Сохраняет значение в кеше
     * @param {string} key - Идентификатор ключа кеша
     * @param {any} value - Значение для сохранения
     * @param {number} [ttlSeconds=AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS] - Время жизни (в секундах)
     */
    set(key, value, ttlSeconds = AppConfig.APP_SETTINGS.CACHE_TTL_SECONDS) {
        if (!AppConfig.APP_SETTINGS.CACHE_ENABLED) return;

        try {
            const expiry = Date.now() + (ttlSeconds * 1000);
            const cacheItem = { value, expiry };
            
            this.propertyStore.setProperty(key, JSON.stringify(cacheItem));
            this.memoryCache[key] = cacheItem;
        } catch (error) {
            AppLogger.log(`Ошибка сохранения в кеш: ${error.message}`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Удаляет элемент из кеша
     * @param {string} key - Идентификатор ключа кеша
     */
    remove(key) {
        delete this.memoryCache[key];
        this.propertyStore.deleteProperty(key);
    }

    /**
     * Очищает весь кеш
     */
    clear() {
        this.memoryCache = {};
        this.propertyStore.deleteAllProperties();
        AppLogger.log("Кеш успешно очищен", AppConfig.CONSTANTS.LOG_LEVELS.INFO);
    }
}

/**
 * Мониторинг и отчетность о производительности
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.scriptStartTime = Date.now();
    }

    /**
     * Начинает замер времени для метрики
     * @param {string} label - Идентификатор метрики
     */
    start(label) {
        this.metrics[label] = {
            startTime: Date.now(),
            endTime: null,
            duration: null
        };
    }

    /**
     * Останавливает замер времени для метрики
     * @param {string} label - Идентификатор метрики
     */
    end(label) {
        const metric = this.metrics[label];
        if (metric && !metric.endTime) {
            metric.endTime = Date.now();
            metric.duration = metric.endTime - metric.startTime;
        }
    }

    /**
     * Получает общее время выполнения
     * @returns {number} Общее время в миллисекундах
     */
    getTotalTime() {
        return Date.now() - this.scriptStartTime;
    }

    /**
     * Генерирует отчет о производительности
     * @returns {string} Отформатированные метрики производительности
     */
    getReport() {
        const totalTime = this.getTotalTime();
        let report = "Метрики производительности:\n═══════════════════════\n";

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
            report += "Нет записанных метрик\n";
        }

        const totalSec = (totalTime / 1000).toFixed(2);
        report += `═══════════════════════\nИтого: ${totalTime}ms (${totalSec}s)`;
        return report;
    }
}

/**
 * HTTP-клиент с повторными попытками и кешированием
 */
class HttpClient {
    /**
     * @param {CacheService} cacheService - Экземпляр сервиса кеширования
     */
    constructor(cacheService) {
        this.cache = cacheService;
    }

    /**
     * Нормализует токен в строковый формат cookie
     * @param {string|AuthToken} token - Токен аутентификации
     * @returns {string} Нормализованная строка токена
     * @throws {Error} Для неверных структур токена
     */
    _normalizeToken(token) {
        // Немедленно вернуть, если уже строка
        if (typeof token === 'string') return token;
        
        // Проверить структурированный токен
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
            throw new Error(`Неверная структура токена. Отсутствуют или неверные ключи: ${missingKeys.join(', ')}`);
        }
        
        // Преобразовать в строковый формат cookie
        return Object.entries(token)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    /**
     * Создает заголовки для API-запроса
     * @param {string|AuthToken} token - Токен аутентификации
     * @param {string} gameKey - Идентификатор игры
     * @returns {Object} Заголовки HTTP
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
     * Получает ключ игры из URL
     * @param {string} url - URL-адрес эндпоинта API
     * @returns {string} Идентификатор игры
     */
    _getGameKeyFromUrl(url) {
        for (const [key, config] of Object.entries(AppConfig.GAME_SERVICES)) {
            if (config.url === url) return key;
        }
        return 'default';
    }

    /**
     * Получает данные из API с логикой повторных попыток
     * @param {string} url - URL-адрес эндпоинта API
     * @param {string|AuthToken} token - Токен аутентификации
     * @param {PerformanceMonitor} monitor - Монитор производительности
     * @returns {Object|null} Ответ API или null
     */
    fetchWithRetry(url, token, monitor) {
        const maxAttempts = AppConfig.APP_SETTINGS.RETRY_COUNT;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = this._executeFetch(url, token, monitor);
                if (response) return response;
            } catch (error) {
                AppLogger.log(`Попытка ${attempt}/${maxAttempts} не удалась: ${error.message}`, 
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN);
                
                if (attempt < maxAttempts) {
                    const delay = Math.pow(2, attempt - 1) * AppConfig.APP_SETTINGS.RATE_LIMIT_DELAY_MS;
                    Utilities.sleep(delay);
                }
            }
        }
        
        AppLogger.log(`Все попытки получения для ${url} провалились`, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        return null;
    }

    /**
     * Выполняет одну операцию получения данных
     * @param {string} url - URL-адрес эндпоинта API
     * @param {string|AuthToken} token - Токен аутентификации
     * @param {PerformanceMonitor} monitor - Монитор производительности
     * @returns {Object|null} Ответ API или null
     * @throws {Error} При сбое получения данных
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
            throw new Error(`Сбой получения данных: ${error.message}`);
        } finally {
            monitor.end(metricLabel);
        }
    }
}

/**
 * Сервис отметки в играх
 */
class GameService {
    /**
     * @param {HttpClient} httpClient - Экземпляр HTTP-клиента
     */
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * Сопоставляет ответ API с понятным сообщением
     * @param {string} apiMessage - Исходное сообщение API
     * @returns {string} Понятный статус
     */
    _mapResponseToStatus(apiMessage) {
        const lowerMessage = apiMessage.toLowerCase();
        for (const [key, status] of Object.entries(AppConfig.RESPONSE_MESSAGES)) {
            if (lowerMessage.includes(key)) return status;
        }
        return `Нераспознанный ответ: ${apiMessage}`;
    }

    /**
     * Выполняет отметку в игре
     * @param {GameServiceConfig} gameConfig - Конфигурация игры
     * @param {string|AuthToken} token - Токен аутентификации
     * @param {PerformanceMonitor} monitor - Монитор производительности
     * @returns {string} Статус результата отметки
     */
    performCheckIn(gameConfig, token, monitor) {
        const metricLabel = `CHECKIN:${gameConfig.shortName}`;
        monitor.start(metricLabel);
        AppLogger.log(`Начинается отметка в ${gameConfig.name}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        
        try {
            const response = this.httpClient.fetchWithRetry(gameConfig.url, token, monitor);
            
            if (!response || !response.message) {
                throw new Error("Неверная структура ответа API");
            }
            
            const status = this._mapResponseToStatus(response.message);
            AppLogger.log(`${gameConfig.name} результат: ${status}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            return status;
        } catch (error) {
            AppLogger.log(`${gameConfig.name} отметка в не удалась: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return "Ошибка отметки! ❌";
        } finally {
            monitor.end(metricLabel);
        }
    }

    /**
     * Получает включенные игры для профиля
     * @param {Profile} profile - Профиль пользователя
     * @returns {GameServiceConfig[]} Конфигурации включенных игр
     */
    getEnabledGames(profile) {
        return Object.values(AppConfig.GAME_SERVICES).filter(game => 
            game.enabled && profile[game.configKey] === true
        );
    }
}

/**
 * Сервис доставки уведомлений
 */
class NotificationService {
    /**
     * Определяет цвет уведомления по содержимому
     * @param {string} content - Сообщение уведомления
     * @returns {number} Код цвета
     */
    _determineColor(content) {
        if (content.includes("❌")) return AppConfig.CONSTANTS.STATUS_COLORS.ERROR;
        if (content.includes("✅")) return AppConfig.CONSTANTS.STATUS_COLORS.SUCCESS;
        return AppConfig.CONSTANTS.STATUS_COLORS.DEFAULT;
    }

    /**
     * Форматирует статусы игр из отчета
     * @param {string} report - Полное содержимое отчета
     * @returns {string} Отформатированные статусы игр
     */
    _formatGameStatuses(report) {
        return Object.values(AppConfig.GAME_SERVICES)
            .map(game => {
                const pattern = new RegExp(`\\*\\*${game.shortName}\\*\\*: ([^\\n]+)`);
                const match = report.match(pattern);
                return match ? `• **${game.name}**: ${match[1]}` : null;
            })
            .filter(Boolean)
            .join('\n') || "Нет обработанных отметок в играх";
    }

    /**
     * Отправляет уведомление в Discord
     * @param {string} report - Отчет об отметках
     */
    _sendDiscordNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.discord; 
        if (!config.notify || !config.webhook) return;
        
        try {
            const now = new Date();
            const payload = {
                username: 'Авто-отметка HoYoLAB',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '🎮 Ежедневный отчет об отметках',
                    description: `Отметка завершена для аккаунтов: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**`,
                    color: this._determineColor(report),
                    fields: [{
                        name: "Результаты",
                        value: this._formatGameStatuses(report),
                        inline: false
                    }, {
                        name: "\u200B",
                        value: `[Проверить обновления](${AppConfig.APP_SETTINGS.UPDATE_LINK})`
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
            AppLogger.log(`Не удалось отправить уведомление в Discord: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Отправляет уведомление в Telegram
     * @param {string} report - Отчет об отметках
     */
    _sendTelegramNotification(report) {
        const config = AppConfig.NOTIFICATION_CONFIG.telegram;
        if (!config.notify || !config.botToken || !config.chatID) return;
        
        try {
            const plainText = report.replace(/\*\*/g, '');
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            const payload = {
                chat_id: config.chatID,
                text: `${plainText}\n\n<a href='${AppConfig.APP_SETTINGS.UPDATE_LINK}'>Проверить обновления</a>`,
                parse_mode: 'HTML'
            };
            
            UrlFetchApp.fetch(url, {
                method: 'POST',
                contentType: 'application/json',
                payload: JSON.stringify(payload)
            });
        } catch (error) {
            AppLogger.log(`Не удалось отправить уведомление в Telegram: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Отправляет отчет о производительности
     * @param {PerformanceMonitor} monitor - Монитор производительности
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
                username: 'Монитор производительности',
                avatar_url: AppConfig.CONSTANTS.AVATAR_URL,
                embeds: [{
                    title: '⏱️ Производительность скрипта',
                    description: `Аккаунт: **${AppConfig.USER_PROFILES.map(p => p.accountName).join(', ')}**\n\`\`\`\n${monitor.getReport()}\n\`\`\`\``,
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
            AppLogger.log(`Не удалось отправить отчет о производительности: ${error.message}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
        }
    }

    /**
     * Отправляет все уведомления
     * @param {string} report - Отчет об отметках
     * @param {PerformanceMonitor} monitor - Монитор производительности
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
 * Сервис обработки профилей
 */
class ProfileProcessor {
    /**
     * @param {GameService} gameService - Экземпляр сервиса отметки в играх
     */
    constructor(gameService) {
        this.gameService = gameService;
    }

    /**
     * Проверяет конфигурацию профиля пользователя
     * @param {Profile} profile - Профиль пользователя для проверки
     * @throws {Error} Если профиль не проходит проверку
     */
    _validateProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            throw new Error('Профиль должен быть объектом');
        }

        // Проверка обязательных полей
        const requiredFields = ['token', 'accountName'];
        for (const field of requiredFields) {
            if (!(field in profile)) {
                throw new Error(`В профиле отсутствует обязательное поле: ${field}`);
            }
        }

        // Проверка токена
        const token = profile.token;
        if (typeof token !== 'string' && typeof token !== 'object') {
            throw new Error('Токен должен быть строкой или структурированным объектом');
        }
        
        // Проверка имени аккаунта
        if (typeof profile.accountName !== 'string' || profile.accountName.trim() === '') {
            throw new Error('Имя аккаунта должно быть непустой строкой');
        }

        // Проверка флагов игр
        const gameFlags = Object.keys(AppConfig.GAME_SERVICES).map(
            key => AppConfig.GAME_SERVICES[key].configKey
        );
        
        for (const flag of gameFlags) {
            if (flag in profile) {
                if (typeof profile[flag] !== 'boolean') {
                    throw new Error(`Флаг игры ${flag} должен быть булевым значением`);
                }
            } else {
                AppLogger.log(
                    `В профиле '${profile.accountName}' отсутствует флаг игры ${flag}, по умолчанию false`,
                    AppConfig.CONSTANTS.LOG_LEVELS.WARN
                );
                profile[flag] = false;
            }
        }
    }

    /**
     * Обрабатывает один профиль
     * @param {Profile} profile - Профиль пользователя
     * @param {PerformanceMonitor} monitor - Монитор производительности
     * @returns {string} Результаты отметки
     */
    processProfile(profile, monitor) {
        try {
            // Проверить профиль перед обработкой
            this._validateProfile(profile);
            
            AppLogger.log(`Обработка ${profile.accountName}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            const enabledGames = this.gameService.getEnabledGames(profile);
            
            if (enabledGames.length === 0) {
                return `Нет включенных игр для ${profile.accountName}`;
            }
            
            const results = enabledGames.map(game => 
                `**${game.shortName}**: ${this.gameService.performCheckIn(game, profile.token, monitor)}`
            );
            
            return `**${profile.accountName}**\n${results.join('\n')}`;
        } catch (error) {
            const errorMessage = `Проверка профиля '${profile.accountName || 'unknown'}' не удалась: ${error.message}`;
            AppLogger.log(errorMessage, AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            return `❌ ${errorMessage}`;
        }
    }

    /**
     * Обрабатывает все профили
     * @param {Profile[]} profiles - Профили пользователей
     * @param {PerformanceMonitor} monitor - Монитор производительности
     * @returns {string[]} Результаты профилей
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
// РАЗДЕЛ 3: ОСНОВНОЕ ПРИЛОЖЕНИЕ
// ============================================================================

/**
 * Главный контроллер приложения
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
     * Выполняет полный рабочий процесс отметки
     */
    execute() {
        const monitor = new PerformanceMonitor();
        monitor.start('TOTAL_RUNTIME');
        
        try {
            AppLogger.log('Начало автоматической отметки', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            
            const profileResults = this.profileProcessor.processAllProfiles(
                AppConfig.USER_PROFILES, 
                monitor
            );
            const fullReport = profileResults.join('\n\n');
            
            this.notificationService.dispatchNotifications(fullReport, monitor);
            
            AppLogger.log('Отметка успешно завершена', AppConfig.CONSTANTS.LOG_LEVELS.INFO);
            AppLogger.log(`\n${monitor.getReport()}`, AppConfig.CONSTANTS.LOG_LEVELS.INFO);
        } catch (error) {
            AppLogger.log(`Критическая ошибка: ${error.message}\n${error.stack}`, 
                AppConfig.CONSTANTS.LOG_LEVELS.ERROR);
            throw error;
        } finally {
            monitor.end('TOTAL_RUNTIME');
        }
    }

    /**
     * Очищает кеш приложения
     */
    clearCache() {
        this.cache.clear();
    }
}

// Глобальный экземпляр и точки входа
const Application = new HoyolabAutoCheckIn();

/**
 * Основная точка входа для запланированного выполнения
 */
function main() {
    Application.execute();
}

/**
 * Функция ручной очистки кеша
 */
function clearCache() {
    Application.clearCache();
}