const { loadKnowledgeBase } = require('./_utils/knowledge');
const { setCorsHeaders, handlePreflight } = require('./_utils/cors');
const { 
  sendInternalServerError, 
  sendMethodNotAllowedError, 
  withErrorHandler 
} = require('./_utils/errorHandler');
const { error: logError } = require('./_utils/logger');

/**
 * 知識データベース取得エンドポイント（開発用）
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 */
async function knowledgeHandler(req, res) {
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
    // 知識ベースの読み込み
    const knowledgeBase = loadKnowledgeBase();
    
    // 要約情報の返却（セキュリティ上、全データは返さない）
    res.json({
      companyName: knowledgeBase.companyName,
      contact: knowledgeBase.contact,
      serviceAreas: knowledgeBase.serviceAreas,
      planCount: knowledgeBase.plans ? knowledgeBase.plans.length : 0,
      hallCount: knowledgeBase.funeralHalls ? knowledgeBase.funeralHalls.length : 0,
      faqCount: knowledgeBase.frequentlyAskedQuestions ? 
        knowledgeBase.frequentlyAskedQuestions.reduce((count, category) => 
          count + (category.questions ? category.questions.length : 0), 0
        ) : 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logError('Knowledge API Error', error);
    sendInternalServerError(res, error, '知識データベースの取得に失敗しました。');
  }
}

module.exports = withErrorHandler(knowledgeHandler);