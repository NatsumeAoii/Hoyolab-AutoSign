/**
 * @file 适用于 Google Apps 脚本的 Hoyolab 自动签到脚本
* @version 6.0.0 开发版
 * @author NatsumeAoii，原作者 Canaria
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} 原始仓库
 */

// ============================================================================
// 第 1 部分：脚本配置
// ============================================================================

const CONFIG = {
  /**
   * 用户帐户个人资料。
   * 可以是字符串 cookie 或结构化令牌对象。
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

  /** 通知平台设置 */
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

  /** 应用程序运行时设置 */
  APP: {
    VERSION: '7.2-parallel',
    AVATAR_URL: 'https://i.imgur.com/GsT8Xj3.jpeg',
    LOG_LEVELS: {
      INFO: '信息',
      WARN: '警告',
      ERROR: '错误'
    },
    STATUS_COLORS: {
      DEFAULT: 0x3498db,
      ERROR: 0xff0000,
      SUCCESS: 0x00ff00
    },
  },

  /** 支持的游戏服务 */
  GAME_SERVICES: {
    genshin: {
      name: '原神',
      shortName: 'GI',
      url: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
      configKey: 'genshin'
    },
    honkai_star_rail: {
      name: '崩坏：星穹铁道',
      shortName: 'HSR',
      url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
      configKey: 'honkai_star_rail'
    },
    honkai_3: {
      name: '崩坏3rd',
      shortName: 'HI3',
      url: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111',
      configKey: 'honkai_3'
    },
    tears_of_themis: {
      name: '未定事件簿',
      shortName: 'ToT',
      url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581',
      configKey: 'tears_of_themis'
    },
    zenless_zone_zero: {
      name: '绝区零',
      shortName: 'ZZZ',
      url: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091',
      configKey: 'zenless_zone_zero'
    },
  },

  /** API 响应映射 */
  RESPONSE_MESSAGES: {
    "ok": "成功！✅",
    "success": "成功！✅",
    "already checked in": "已签到 ✅",
    "already signed in": "已签到 ✅",
    "not logged in": "Cookie 无效 ❌",
    "invalid cookie": "Cookie 无效 ❌",
    "authkey invalid": "Cookie 无效 ❌",
    "please log in": "Cookie 无效 ❌",
    "no game account": "未找到游戏账号 🔍",
    "character not found": "未找到游戏账号 🔍",
    "-100": "Cookie 无效 ❌",
    "-5003": "未找到账号 🔍"
  },

  /** HTTP 请求头 */
  GAME_HEADERS: {
    'Accept': 'application/json, text/plain, */*',
    'x-rpc-app_version': '2.34.1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
  },
};

// ============================================================================
// 第 2 部分：核心逻辑
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
  throw new Error('无效的令牌格式。');
}

function _mapResponseToStatus(response) {
  try {
    const responseText = response.getContentText();
    if (!responseText) throw new Error("服务器响应为空。");

    const data = JSON.parse(responseText);
    if (!data || (typeof data.retcode === 'undefined' && typeof data.code === 'undefined')) {
      throw new Error(`无效的响应结构: ${responseText}`);
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

    return `无法识别: ${message}`;
  } catch (e) {
    _log(`响应解析失败: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    return "请求失败 ❌";
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
  const title = '🎮 每日签到报告';
  const color = report.includes("❌") ? CONFIG.APP.STATUS_COLORS.ERROR : CONFIG.APP.STATUS_COLORS.SUCCESS;

  const discordConf = CONFIG.NOTIFICATIONS.discord;
  if (discordConf.enabled && discordConf.webhook) {
    try {
      UrlFetchApp.fetch(discordConf.webhook, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          username: 'HoYoLAB 签到',
          avatar_url: CONFIG.APP.AVATAR_URL,
          embeds: [{
            title,
            description: report,
            color,
            footer: {
              text: `v${CONFIG.APP.VERSION} • 执行用时: ${durationSec}s`
            },
            timestamp: new Date().toISOString()
          }, ],
        })
      });
    } catch (e) {
      _log(`Discord 通知失败: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
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
          text: `*${title}*\n\n${report.replace(/\*\*/g, '*')}\n\n执行用时: ${durationSec}s`,
          parse_mode: 'Markdown',
        })
      });
    } catch (e) {
      _log(`Telegram 通知失败: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    }
  }
}

// ============================================================================
// 第 3 部分：主执行
// ============================================================================

function main() {
  const startTime = Date.now();
  _log('开始执行自动签到脚本。');

  if (!CONFIG.USER_PROFILES || CONFIG.USER_PROFILES.length === 0) {
    _log('未配置用户个人资料。正在退出。', CONFIG.APP.LOG_LEVELS.WARN);
    return;
  }

  const reports = CONFIG.USER_PROFILES.map(profile => {
    if (!profile.token || !profile.accountName) {
      _log(`跳过无效的个人资料: ${JSON.stringify(profile)}`, CONFIG.APP.LOG_LEVELS.ERROR);
      return `**无效的个人资料**\n缺少 token 或 accountName ❌`;
    }

    _log(`正在处理帐户: ${profile.accountName}`);

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
      return `**${profile.accountName}**\n此个人资料未启用任何游戏。`;
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
  _log(`脚本执行完毕，耗时 ${duration}ms。`);
}

function clearCache() {
  _log('缓存清除函数已调用。此版本未使用持久缓存。');
}