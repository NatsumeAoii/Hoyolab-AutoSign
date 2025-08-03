/**
 * @file Hoyolab Auto Check-In Script for Google Apps Script
 * @version 6.0.0 devs
 * @author NatsumeAoii, Original author Canaria
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} Original repository
 */

// ============================================================================
// SECTION 1: SCRIPT CONFIGURATION
// ============================================================================

const CONFIG = {
  /**
   * User account profiles.
   * Can be a string cookie or a structured token object.
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

  /** Notification platform settings */
  NOTIFICATIONS: {
    discord: {
      enabled: true,
      webhook: "xxxxxx",
    },
    telegram: {
      enabled: true,
      botToken: "xxxxxx",
      chatID: "xxxxxx",
    },
  },

  /** Application runtime settings */
  APP: {
    VERSION: '7.2-parallel',
    AVATAR_URL: 'https://i.imgur.com/GsT8Xj3.jpeg',
    LOG_LEVELS: {
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR'
    },
    STATUS_COLORS: {
      DEFAULT: 0x3498db,
      ERROR: 0xff0000,
      SUCCESS: 0x00ff00
    },
  },

  /** Supported game services */
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

  /** API response mappings */
  RESPONSE_MESSAGES: {
    "ok": "Success! ✅",
    "success": "Success! ✅",
    "already checked in": "Already Checked In ✅",
    "already signed in": "Already Checked In ✅",
    "not logged in": "Invalid Cookie ❌",
    "invalid cookie": "Invalid Cookie ❌",
    "authkey invalid": "Invalid Cookie ❌",
    "please log in": "Invalid Cookie ❌",
    "no game account": "No Account Found 🔍",
    "character not found": "No Account Found 🔍",
    "-100": "Invalid Cookie ❌",
    "-5003": "Account Not Found 🔍"
  },

  /** HTTP request headers */
  GAME_HEADERS: {
    'Accept': 'application/json, text/plain, */*',
    'x-rpc-app_version': '2.34.1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
  },
};

// ============================================================================
// SECTION 2: CORE LOGIC
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
  throw new Error('Invalid token format.');
}

function _mapResponseToStatus(response) {
  try {
    const responseText = response.getContentText();
    if (!responseText) throw new Error("Empty response from server.");

    const data = JSON.parse(responseText);
    if (!data || (typeof data.retcode === 'undefined' && typeof data.code === 'undefined')) {
      throw new Error(`Invalid response structure: ${responseText}`);
    }

    const retcode = data.retcode ?? data.code;
    const message = data.message || `retcode ${retcode}`;
    const lowerMessage = message.toLowerCase();

    // HoYoLAB uses retcode 0 or message 'Success' for successful actions.
    if (retcode === 0 || lowerMessage === 'success') {
      return CONFIG.RESPONSE_MESSAGES.ok;
    }

    for (const [key, status] of Object.entries(CONFIG.RESPONSE_MESSAGES)) {
      if (lowerMessage.includes(key)) return status;
    }

    return `Unrecognized: ${message}`;
  } catch (e) {
    _log(`Response parsing failed: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    return "Request Failed ❌";
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
  const title = '🎮 Daily Check-in Report';
  const color = report.includes("❌") ? CONFIG.APP.STATUS_COLORS.ERROR : CONFIG.APP.STATUS_COLORS.SUCCESS;

  const discordConf = CONFIG.NOTIFICATIONS.discord;
  if (discordConf.enabled && discordConf.webhook) {
    try {
      UrlFetchApp.fetch(discordConf.webhook, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          username: 'HoYoLAB Check-In',
          avatar_url: CONFIG.APP.AVATAR_URL,
          embeds: [{
            title,
            description: report,
            color,
            footer: {
              text: `v${CONFIG.APP.VERSION} • Execution Time: ${durationSec}s`
            },
            timestamp: new Date().toISOString()
          }, ],
        })
      });
    } catch (e) {
      _log(`Discord notification failed: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
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
          text: `*${title}*\n\n${report.replace(/\*\*/g, '*')}\n\nExecution Time: ${durationSec}s`,
          parse_mode: 'Markdown',
        })
      });
    } catch (e) {
      _log(`Telegram notification failed: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    }
  }
}

// ============================================================================
// SECTION 3: MAIN EXECUTION
// ============================================================================

function main() {
  const startTime = Date.now();
  _log('Starting auto check-in script.');

  if (!CONFIG.USER_PROFILES || CONFIG.USER_PROFILES.length === 0) {
    _log('No user profiles configured. Exiting.', CONFIG.APP.LOG_LEVELS.WARN);
    return;
  }

  const reports = CONFIG.USER_PROFILES.map(profile => {
    if (!profile.token || !profile.accountName) {
      _log(`Skipping invalid profile: ${JSON.stringify(profile)}`, CONFIG.APP.LOG_LEVELS.ERROR);
      return `**Invalid Profile**\nMissing token or accountName ❌`;
    }

    _log(`Processing account: ${profile.accountName}`);

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
      return `**${profile.accountName}**\nNo games enabled for this profile.`;
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
  _log(`Script finished in ${duration}ms.`);
}

function clearCache() {
  _log('Cache clearing function called. No persistent cache is used in this version.');
}