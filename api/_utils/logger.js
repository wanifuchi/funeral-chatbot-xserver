/**
 * セキュアなログ出力ユーティリティ
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDebugMode = process.env.DEBUG_MODE === 'true';

/**
 * 機密情報をマスクする
 * @param {string} text マスクするテキスト
 * @returns {string} マスクされたテキスト
 */
function maskSensitiveInfo(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .replace(/GEMINI_API_KEY[=:]\s*[^\s\n]+/gi, 'GEMINI_API_KEY=***MASKED***')
    .replace(/api[_-]?key[=:]\s*[^\s\n]+/gi, 'api_key=***MASKED***')
    .replace(/token[=:]\s*[^\s\n]+/gi, 'token=***MASKED***')
    .replace(/password[=:]\s*[^\s\n]+/gi, 'password=***MASKED***')
    .replace(/secret[=:]\s*[^\s\n]+/gi, 'secret=***MASKED***');
}

/**
 * 安全なログ出力
 * @param {string} level ログレベル（info, warn, error）
 * @param {string} message メッセージ
 * @param {any} data 追加データ
 */
function safeLog(level, message, data = null) {
  // 本番環境では重要なログのみ出力
  if (isProduction && level === 'debug') {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    const safeData = typeof data === 'string' ? maskSensitiveInfo(data) : data;
    console[level](logMessage, safeData);
  } else {
    console[level](logMessage);
  }
}

/**
 * 情報ログ
 * @param {string} message メッセージ
 * @param {any} data 追加データ
 */
function info(message, data = null) {
  safeLog('info', message, data);
}

/**
 * 警告ログ
 * @param {string} message メッセージ
 * @param {any} data 追加データ
 */
function warn(message, data = null) {
  safeLog('warn', message, data);
}

/**
 * エラーログ
 * @param {string} message メッセージ
 * @param {any} error エラーオブジェクト
 */
function error(message, error = null) {
  const errorData = error ? {
    message: error.message,
    stack: isProduction ? undefined : error.stack,
    name: error.name
  } : null;
  
  safeLog('error', message, errorData);
}

/**
 * デバッグログ（開発環境のみ）
 * @param {string} message メッセージ
 * @param {any} data 追加データ
 */
function debug(message, data = null) {
  if (isProduction && !isDebugMode) {
    return;
  }
  
  safeLog('debug', message, data);
}

/**
 * APIキー関連のログ（本番環境では出力しない）
 * @param {string} message メッセージ
 */
function apiKeyLog(message) {
  if (isProduction) {
    return;
  }
  
  debug(`[API-KEY] ${message}`);
}

module.exports = {
  info,
  warn,
  error,
  debug,
  apiKeyLog,
  maskSensitiveInfo
};