/**
 * @file Google Apps Script用Hoyolab自動チェックインスクリプト
 * @version 6.0.0 開発版
 * @author NatsumeAoii、原作者 Canaria
 * @license MIT
 * @original link canaria https://github.com/canaria3406/hoyolab-auto-sign
 * @see {@link https://github.com/NatsumeAoii/Hoyolab-AutoSign} オリジナルリポジトリ
 */

// ============================================================================
// セクション1：スクリプト設定
// ============================================================================

const CONFIG = {
  /**
   * ユーザーアカウントのプロファイル。
   * 文字列のクッキーまたは構造化されたトークンオブジェクトを指定できます。
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

  /** 通知プラットフォームの設定 */
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

  /** アプリケーションの実行時設定 */
  APP: {
    VERSION: '7.2-parallel',
    AVATAR_URL: 'https://i.imgur.com/GsT8Xj3.jpeg',
    LOG_LEVELS: {
      INFO: '情報',
      WARN: '警告',
      ERROR: 'エラー'
    },
    STATUS_COLORS: {
      DEFAULT: 0x3498db,
      ERROR: 0xff0000,
      SUCCESS: 0x00ff00
    },
  },

  /** 対応ゲームサービス */
  GAME_SERVICES: {
    genshin: {
      name: '原神',
      shortName: 'GI',
      url: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
      configKey: 'genshin'
    },
    honkai_star_rail: {
      name: '崩壊：スターレイル',
      shortName: 'HSR',
      url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
      configKey: 'honkai_star_rail'
    },
    honkai_3: {
      name: '崩壊3rd',
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
      name: 'ゼンレスゾーンゼロ',
      shortName: 'ZZZ',
      url: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091',
      configKey: 'zenless_zone_zero'
    },
  },

  /** API応答マッピング */
  RESPONSE_MESSAGES: {
    "ok": "成功しました！✅",
    "success": "成功しました！✅",
    "already checked in": "チェックイン済み ✅",
    "already signed in": "チェックイン済み ✅",
    "not logged in": "無効なクッキーです ❌",
    "invalid cookie": "無効なクッキーです ❌",
    "authkey invalid": "無効なクッキーです ❌",
    "please log in": "無効なクッキーです ❌",
    "no game account": "ゲームアカウントが見つかりません 🔍",
    "character not found": "ゲームアカウントが見つかりません 🔍",
    "-100": "無効なクッキーです ❌",
    "-5003": "アカウントが見つかりません 🔍"
  },

  /** HTTPリクエストヘッダー */
  GAME_HEADERS: {
    'Accept': 'application/json, text/plain, */*',
    'x-rpc-app_version': '2.34.1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
  },
};

// ============================================================================
// セクション2：コアロジック
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
  throw new Error('無効なトークン形式です。');
}

function _mapResponseToStatus(response) {
  try {
    const responseText = response.getContentText();
    if (!responseText) throw new Error("サーバーからの応答が空です。");

    const data = JSON.parse(responseText);
    if (!data || (typeof data.retcode === 'undefined' && typeof data.code === 'undefined')) {
      throw new Error(`無効な応答構造です: ${responseText}`);
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

    return `認識できませんでした: ${message}`;
  } catch (e) {
    _log(`応答の解析に失敗しました: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    return "リクエストに失敗しました ❌";
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
  const title = '🎮 デイリーチェックインレポート';
  const color = report.includes("❌") ? CONFIG.APP.STATUS_COLORS.ERROR : CONFIG.APP.STATUS_COLORS.SUCCESS;

  const discordConf = CONFIG.NOTIFICATIONS.discord;
  if (discordConf.enabled && discordConf.webhook) {
    try {
      UrlFetchApp.fetch(discordConf.webhook, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          username: 'HoYoLAB チェックイン',
          avatar_url: CONFIG.APP.AVATAR_URL,
          embeds: [{
            title,
            description: report,
            color,
            footer: {
              text: `v${CONFIG.APP.VERSION} • 実行時間: ${durationSec}秒`
            },
            timestamp: new Date().toISOString()
          }, ],
        })
      });
    } catch (e) {
      _log(`Discord通知に失敗しました: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
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
          text: `*${title}*\n\n${report.replace(/\*\*/g, '*')}\n\n実行時間: ${durationSec}秒`,
          parse_mode: 'Markdown',
        })
      });
    } catch (e) {
      _log(`Telegram通知に失敗しました: ${e.message}`, CONFIG.APP.LOG_LEVELS.ERROR);
    }
  }
}

// ============================================================================
// セクション3：メイン実行
// ============================================================================

function main() {
  const startTime = Date.now();
  _log('自動チェックインスクリプトを開始します。');

  if (!CONFIG.USER_PROFILES || CONFIG.USER_PROFILES.length === 0) {
    _log('ユーザープロファイルが設定されていません。終了します。', CONFIG.APP.LOG_LEVELS.WARN);
    return;
  }

  const reports = CONFIG.USER_PROFILES.map(profile => {
    if (!profile.token || !profile.accountName) {
      _log(`無効なプロファイルをスキップします: ${JSON.stringify(profile)}`, CONFIG.APP.LOG_LEVELS.ERROR);
      return `**無効なプロファイル**\nトークンまたはアカウント名がありません ❌`;
    }

    _log(`アカウントを処理中: ${profile.accountName}`);

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
      return `**${profile.accountName}**\nこのプロファイルで有効なゲームはありません。`;
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
  _log(`スクリプトは ${duration}ms で終了しました。`);
}

function clearCache() {
  _log('キャッシュクリア関数が呼び出されました。このバージョンでは永続的なキャッシュは使用されません。');
}