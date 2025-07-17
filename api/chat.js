const { loadKnowledgeBase, createPrompt, getKeywordResponse } = require('./_utils/knowledge');
const { generateAIResponse, isAIAvailable } = require('./_utils/ai');
const { setCorsHeaders, handlePreflight } = require('./_utils/cors');
const { 
  sendValidationError, 
  sendInternalServerError, 
  sendMethodNotAllowedError, 
  withErrorHandler 
} = require('./_utils/errorHandler');
const { error: logError } = require('./_utils/logger');
const { checkRateLimit } = require('./_utils/rateLimit');

/**
 * チャットエンドポイント
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 */
async function chatHandler(req, res) {
  // プリフライトリクエストのハンドリング
  if (handlePreflight(req, res)) {
    return;
  }
  
  // CORSヘッダーの設定
  if (!setCorsHeaders(req, res)) {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      message: 'アクセスが許可されていません。' 
    });
  }
  
  // レート制限チェック
  const rateLimitResult = checkRateLimit(req, 'chat');
  res.setHeader('X-RateLimit-Limit', '30');
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime);
  
  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', rateLimitResult.retryAfter);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。',
      retryAfter: rateLimitResult.retryAfter
    });
  }
  
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return sendMethodNotAllowedError(res, 'POST');
  }
  
  const { question } = req.body;
  
  // リクエストサイズ制限チェック
  const maxQuestionLength = 1000; // 最大1000文字
  const maxBodySize = 2000; // 最大2KB
  
  if (JSON.stringify(req.body).length > maxBodySize) {
    return sendValidationError(res, 'リクエストサイズが大きすぎます。');
  }
  
  // バリデーション
  if (!question || question.trim() === '') {
    return sendValidationError(res, '質問を入力してください。');
  }
  
  if (question.length > maxQuestionLength) {
    return sendValidationError(res, `質問は${maxQuestionLength}文字以内で入力してください。`);
  }
  
  try {
    // 知識ベースの読み込み
    const knowledgeBase = loadKnowledgeBase();
    let answer;
    
    // AI機能が利用可能な場合はAIを使用
    if (isAIAvailable()) {
      const prompt = createPrompt(question, knowledgeBase);
      answer = await generateAIResponse(prompt);
      
      // AI回答が取得できない場合はフォールバック
      if (!answer) {
        answer = getKeywordResponse(question);
      }
    } else {
      // AI機能が利用できない場合はキーワードベースの回答
      answer = getKeywordResponse(question);
    }
    
    // レスポンスの送信
    res.json({ 
      answer: answer,
      timestamp: new Date().toISOString(),
      source: isAIAvailable() ? 'ai' : 'keyword'
    });
    
  } catch (error) {
    logError('Chat API Error', error);
    sendInternalServerError(res, error, '申し訳ございません。システムエラーが発生しました。しばらく時間をおいてから再度お試しください。');
  }
}

module.exports = withErrorHandler(chatHandler);