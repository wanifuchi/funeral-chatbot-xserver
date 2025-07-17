const { loadKnowledgeBase } = require('./_utils/knowledge');
const { isAIAvailable } = require('./_utils/ai');
const { setCorsHeaders, handlePreflight } = require('./_utils/cors');
const { 
  sendMethodNotAllowedError, 
  withErrorHandler 
} = require('./_utils/errorHandler');
const { error: logError } = require('./_utils/logger');

/**
 * ヘルスチェックエンドポイント
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 */
async function healthHandler(req, res) {
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
    // 知識ベースの読み込み確認
    let knowledgeBaseLoaded = false;
    try {
      loadKnowledgeBase();
      knowledgeBaseLoaded = true;
    } catch (error) {
      logError('Knowledge base check failed', error);
    }
    
    // ヘルスチェック情報の返却（セキュリティ上、詳細情報は制限）
    const healthInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        ai: isAIAvailable(),
        knowledge: knowledgeBaseLoaded
      }
    };
    
    // 開発環境でのみ詳細情報を返す
    if (process.env.NODE_ENV !== 'production') {
      healthInfo.environment = process.env.NODE_ENV || 'development';
    }
    
    res.json(healthInfo);
    
  } catch (error) {
    logError('Health check error', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'ヘルスチェックに失敗しました。'
    });
  }
}

module.exports = withErrorHandler(healthHandler);