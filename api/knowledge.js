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
    
    // 要約情報とレコメンド質問データの返却
    res.json({
      companyName: knowledgeBase.companyInfo?.officialName || knowledgeBase.companyName,
      contact: knowledgeBase.contact,
      serviceAreas: knowledgeBase.serviceAreas,
      planCount: knowledgeBase.funeralPlans ? 
        (knowledgeBase.funeralPlans.basicPlans?.length || 0) + 
        (knowledgeBase.funeralPlans.specialPlans?.length || 0) + 
        (knowledgeBase.funeralPlans.religiousPlans?.length || 0) : 0,
      hallCount: knowledgeBase.facilities?.ownFacilities?.length || 0,
      faqCount: knowledgeBase.customerSupport?.faq ? 1 : 0,
      recommendedQuestions: knowledgeBase.recommendedQuestions,
      questionMapping: knowledgeBase.questionMapping,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logError('Knowledge API Error', error);
    sendInternalServerError(res, error, '知識データベースの取得に失敗しました。');
  }
}

module.exports = withErrorHandler(knowledgeHandler);