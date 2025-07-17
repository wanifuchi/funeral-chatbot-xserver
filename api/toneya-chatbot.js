const fs = require('fs');
const path = require('path');
const { setCorsHeaders, handlePreflight } = require('./_utils/cors');
const { 
  sendInternalServerError, 
  sendMethodNotAllowedError, 
  withErrorHandler 
} = require('./_utils/errorHandler');

/**
 * チャットボットクライアントスクリプト配信エンドポイント
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 */
async function chatbotScriptHandler(req, res) {
  // プリフライトリクエストのハンドリング
  if (handlePreflight(req, res)) {
    return;
  }
  
  // CORSヘッダーの設定
  setCorsHeaders(req, res);
  
  // GETメソッドのみ許可
  if (req.method !== 'GET') {
    return sendMethodNotAllowedError(res, 'GET');
  }
  
  try {
    // クライアントスクリプトファイルの読み込み
    const filePath = path.join(process.cwd(), 'toneya-chatbot.js');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // JavaScript配信用のヘッダー設定
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(content);
    
  } catch (error) {
    console.error('Chatbot script loading error:', error);
    sendInternalServerError(res, error, 'チャットボットスクリプトの読み込みに失敗しました。');
  }
}

module.exports = withErrorHandler(chatbotScriptHandler);