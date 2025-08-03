/**
 * @file Скрипт автоматической отметки Hoyolab для Google Apps Script
 * @version 6.0.0 для разработчиков
 * @author NatsumeAoii, Оригинальный автор Canaria
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} Оригинальный репозиторий
 */

// ============================================================================
// РАЗДЕЛ 1: КОНФИГУРАЦИЯ СКРИПТА
// ============================================================================

const CONFIG = {
  /**
   * Профили учетных записей пользователей.
   * Может быть строкой cookie или структурированным объектом токена.
   */
  USER_PROFILES: [{
    token: {
      account_mid_v2: 'xxxxxx',
      account_id_v2: 'xxxxxx',
      ltoken_v2: 'xxxxxx',
      ltmid_v2: 'xxxxxx',
      ltuid_v2: 'xxxxxx'
    },
    accountName: "xxxxxx",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    tears_of_themis: true,
    zenless_zone_zero: true,
  }, ],

  /** Настройки платформы уведомлений */
  NOTIFICATIONS: {
    discord: {
      enabled: true,
      webhook: "xxxxxx
    telegram: {
      enabled: true,
      botToken: "xxxxxx",
      chatID: "xxxxxx",
    },
  },

  /** Настройки времени выполнения приложения */
  APP: {
    VERSION: '7.2-parallel',
    AVATAR_URL: 'https://i.imgur.com/GsT8Xj3.jpeg',
    LOG_LEVELS: {
      INFO: 'ИНФО',
      WARN: 'ПРЕДУПРЕЖДЕНИЕ',
      ERROR: 'ОШИБКА'
    },
    STATUS_COLORS: {
      DEFAULT: 0x3498db,
      ERROR: 0xff0000,
      SUCCESS: 0x00ff00
    },
  },

  /** Поддерживаемые игровые сервисы */
  GAME_SERVICES: {
    genshin: {
      name: 'Genshin Impact',
      shortName: 'GI',
      url: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
      configKey: 'genshin'
    },
    honkai_star_rail: {
      name: 'Honkai: Star Rail',
      shortName: 'HSR',
      url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
      configKey: 'honkai_star_rail'
    },
    honkai_3: {
      name: 'Honkai Impact 3rd',
      shortName: 'HI3',
      url: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111',
      configKey: 'honkai_3'
    },
    tears_of_themis: {
      name: 'Tears of Themis',
      shortName: 'ToT',
      url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581',
      configKey: 'tears_of_themis'
    },
    zenless_zone_zero: {
      name: 'Zenless Zone Zero',
      shortName: 'ZZZ',
      url: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091',
      configKey: 'zenless_zone_zero'
    },
  },

  /** Сопоставления ответов API */
  RESPONSE_MESSAGES: {
    "ok": "Успешно! ✅",
    "success": "Успешно! ✅",
    "already checked in": "Уже отмечено ✅",
    "already signed in": "Уже отмечено ✅",
    "not logged in": "Неверный Cookie ❌",
    "invalid cookie": "Неверный Cookie ❌",
    "authkey invalid": "Неверный Cookie ❌",
    "please log in": "Неверный Cookie ❌",
    "no game account": "Игровой аккаунт не найден 🔍",
    "character not found": "Игровой аккаунт не найден 🔍",
    "-100": "Неверный Cookie ❌",
    "-5003": "Аккаунт не найден 🔍"
  },

  /** HTTP-заголовки запроса */
  GAME_HEADERS: {
    'Accept': 'application/json, text/plain, */*',
    'x-rpc-app_version': '2.34.1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
  },
};

// ============================================================================
// РАЗДЕЛ 2: ОСНОВНАЯ ЛОГИКА
// ============================================================================

function _log(message, level = CONFIG.APP.LOG_LEVELS.INFO) {
  Logger.log(`[${new Date().toISOString()}] [${level}] ${message}`);
}

function _normalizeToken(token) {
  if (typeof token === 'string') return token;
  if (typeof token === 'object' && token !== null) {
    return Object.entries(token)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }
  throw new Error('Неверный формат токена.');
}

function _mapResponseToStatus(response) {
  try {
    const responseText = response.getContentText();
    if (!responseText) throw new Error("Пустой ответ от сервера.");

    const data = JSON.parse(responseText);
    if (!data || (typeof data.retcode === 'undefined' && typeof data.code === 'undefined')) {
      throw new Error(`Неверная структура ответа: ${responseText}`);
    }

    const retcode = data.retcode ?? data.code;
    const message = data.message || `retcode ${retcode}`;
    const lowerMessage = message.toLowerCase();

    if (retcode === 0 || lowerMessage === 'success') {
      return CONFIG.RESPONSE_MESSAGES.ok;
    }

    for (const [key, status] of Object.entries(CONFIG.RESPONSE_MESSAGES)) {
      if (lowerMessage.includes(key)) return status;
    }

    return `Неопознанный: ${message}`;
  } catch (e) {
    _log(`Ошибка разбора ответа: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    return "Запрос не удался ❌";
  }
}

function _createCheckInRequest(game, token) {
  const cookie = _normalizeToken(token);
  const request = {
    url: game.url,
    method: 'post',
    headers: { ...CONFIG.GAME_HEADERS,
      'Cookie': cookie
    },
    muteHttpExceptions: true,
  };
  if (game.configKey === 'zenless_zone_zero') {
    request.headers['x-rpc-signgame'] = 'zzz';
  }
  return request;
}

function _sendNotifications(report, duration) {
  const durationSec = (duration / 1000).toFixed(2);
  const title = '🎮 Ежедневный отчет об отметках';
  const color = report.includes("❌") ? CONFIG.APP.STATUS_COLORS.ERROR : CONFIG.APP.STATUS_COLORS.SUCCESS;

  const discordConf = CONFIG.NOTIFICATIONS.discord;
  if (discordConf.enabled && discordConf.webhook) {
    try {
      UrlFetchApp.fetch(discordConf.webhook, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          username: 'Отметка HoYoLAB',
          avatar_url: CONFIG.APP.AVATAR_URL,
          embeds: [{
            title,
            description: report,
            color,
            footer: {
              text: `v${CONFIG.APP.VERSION} • Время выполнения: ${durationSec}с`
            },
            timestamp: new Date().toISOString()
          }, ],
        })
      });
    } catch (e) {
      _log(`Ошибка уведомления Discord: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    }
  }

  const telegramConf = CONFIG.NOTIFICATIONS.telegram;
  if (telegramConf.enabled && telegramConf.botToken && telegramConf.chatID) {
    try {
      UrlFetchApp.fetch(`https://api.telegram.org/bot${telegramConf.botToken}/sendMessage`, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: String(telegramConf.chatID),
          text: `*${title}*\n\n${report.replace(/\*\*/g, '*')}\n\nВремя выполнения: ${durationSec}с`,
          parse_mode: 'Markdown',
        })
      });
    } catch (e) {
      _log(`Ошибка уведомления Telegram: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    }
  }
}

// ============================================================================
// РАЗДЕЛ 3: ОСНОВНОЕ ВЫПОЛНЕНИЕ
// ============================================================================

function main() {
  const startTime = Date.now();
  _log('Запуск скрипта автоматической отметки.');

  if (!CONFIG.USER_PROFILES || CONFIG.USER_PROFILES.length === 0) {
    _log('Профили пользователей не настроены. Выход.', CONFIG.APP.LOG_LEVELS.WARN);
    return;
  }

  const reports = CONFIG.USER_PROFILES.map(profile => {
    if (!profile.token || !profile.accountName) {
      _log(`Пропуск неверного профиля: ${JSON.stringify(profile)}`, CONFIG.APP.LOG_LEVELS.ERROR);
      return `**Неверный профиль**\nОтсутствует токен или имя учетной записи ❌`;
    }

    _log(`Обработка учетной записи: ${profile.accountName}`);

    const requests = [];
    const gamesForRequests = [];
    for (const gameKey in CONFIG.GAME_SERVICES) {
      if (profile[CONFIG.GAME_SERVICES[gameKey].configKey]) {
        const game = CONFIG.GAME_SERVICES[gameKey];
        requests.push(_createCheckInRequest(game, profile.token));
        gamesForRequests.push(game);
      }
    }

    if (requests.length === 0) {
      return `**${profile.accountName}**\nДля этого профиля не включены игры.`;
    }

    const responses = UrlFetchApp.fetchAll(requests);
    const results = responses.map((response, index) => {
      const game = gamesForRequests[index];
      const status = _mapResponseToStatus(response);
      return `**${game.shortName}**: ${status}`;
    });

    return `**${profile.accountName}**\n${results.join('\n')}`;
  });

  const finalReport = reports.join('\n\n');
  const duration = Date.now() - startTime;

  _sendNotifications(finalReport, duration);
  _log(`Скрипт завершен за ${duration} мс.`);
}

function clearCache() {
  _log('Вызвана функция очистки кэша. В этой версии постоянный кэш не используется.');
}