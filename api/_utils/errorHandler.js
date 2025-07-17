/**
 * 共通エラーハンドリング
 */
const { error: logError, warn, maskSensitiveInfo } = require('./logger');

/**
 * 標準エラーレスポンス
 * @param {Object} res レスポンスオブジェクト
 * @param {number} statusCode HTTPステータスコード
 * @param {string} error エラーコード
 * @param {string} message ユーザー向けメッセージ
 * @param {Object} details 詳細情報（オプション）
 */
function sendErrorResponse(res, statusCode, error, message, details = null) {
  const errorResponse = {
    error,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.details = details;
  }
  
  res.status(statusCode).json(errorResponse);
}

/**
 * バリデーションエラー
 * @param {Object} res レスポンスオブジェクト
 * @param {string} message エラーメッセージ
 * @param {Object} details 詳細情報
 */
function sendValidationError(res, message, details = null) {
  sendErrorResponse(res, 400, 'Validation Error', message, details);
}

/**
 * 内部サーバーエラー
 * @param {Object} res レスポンスオブジェクト
 * @param {Error} error エラーオブジェクト
 * @param {string} userMessage ユーザー向けメッセージ
 */
function sendInternalServerError(res, error, userMessage = 'システムエラーが発生しました。しばらく時間をおいてから再度お試しください。') {
  // エラーログに機密情報が含まれていないことを確認
  const safeErrorMessage = error?.message ? maskSensitiveInfo(error.message) : 'Unknown error';
  logError('Internal Server Error', { message: safeErrorMessage, stack: error?.stack });
  sendErrorResponse(res, 500, 'Internal Server Error', userMessage);
}

/**
 * CORSエラー
 * @param {Object} res レスポンスオブジェクト
 */
function sendCorsError(res) {
  sendErrorResponse(res, 403, 'CORS Policy Violation', 'アクセスが許可されていません。');
}

/**
 * リクエストメソッドエラー
 * @param {Object} res レスポンスオブジェクト
 * @param {string} allowedMethods 許可されたメソッド
 */
function sendMethodNotAllowedError(res, allowedMethods = 'GET, POST') {
  res.setHeader('Allow', allowedMethods);
  sendErrorResponse(res, 405, 'Method Not Allowed', 'リクエストメソッドが許可されていません。');
}

/**
 * 包括的エラーハンドラー
 * @param {Function} handler メインハンドラー関数
 * @returns {Function} ラップされたハンドラー
 */
function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      // エラーログに機密情報が含まれていないことを確認
      const safeErrorMessage = error?.message ? maskSensitiveInfo(error.message) : 'Unknown error';
      logError('Unhandled error in handler', { message: safeErrorMessage, stack: error?.stack });
      
      // 既にレスポンスが送信されている場合は何もしない
      if (res.headersSent) {
        return;
      }
      
      sendInternalServerError(res, error);
    }
  };
}

module.exports = {
  sendErrorResponse,
  sendValidationError,
  sendInternalServerError,
  sendCorsError,
  sendMethodNotAllowedError,
  withErrorHandler
};