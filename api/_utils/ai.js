const { GoogleGenerativeAI } = require('@google/generative-ai');
const { info, warn, error, debug, apiKeyLog } = require('./logger');

// Gemini AIクライアントをキャッシュ（Cold Start対策）
let genAI = null;
let model = null;

/**
 * Gemini AIの初期化
 * @returns {Object} {genAI, model} または null
 */
function initializeAI() {
  if (model) {
    return { genAI, model };
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      apiKeyLog('Gemini APIが初期化されました');
      return { genAI, model };
    } catch (err) {
      error('Gemini API初期化エラー', err);
      return null;
    }
  } else {
    warn('GEMINI_API_KEYが設定されていません。フォールバック機能のみ使用可能です。');
    return null;
  }
}

/**
 * AI回答を生成
 * @param {string} prompt プロンプト
 * @returns {Promise<string>} AI回答または null
 */
async function generateAIResponse(prompt) {
  // 開発環境でのモックAPI使用
  if (process.env.MOCK_API_MODE === 'true') {
    return generateMockResponse(prompt);
  }
  
  const ai = initializeAI();
  
  if (!ai || !ai.model) {
    return null;
  }

  try {
    const result = await ai.model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    
    // 回答が空または不適切な場合はnullを返す
    if (!answer || answer.trim() === '' || answer.includes('申し訳ございません')) {
      return null;
    }
    
    return answer;
  } catch (err) {
    error('AI回答生成エラー', err);
    return null;
  }
}

/**
 * モックAPI応答を生成（開発環境用）
 * @param {string} prompt プロンプト
 * @returns {Promise<string>} モック応答
 */
async function generateMockResponse(prompt) {
  // 簡単な遅延を追加してリアルなレスポンスを模擬
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const question = prompt.toLowerCase();
  
  if (question.includes('料金') || question.includes('費用')) {
    return 'こちらはモック応答です。料金についてのお問い合わせありがとうございます。詳しくはお電話（0120-000-000）でお問い合わせください。';
  }
  
  if (question.includes('家族葬')) {
    return 'こちらはモック応答です。家族葬について説明いたします。詳しくはお電話（0120-000-000）でお問い合わせください。';
  }
  
  return 'こちらはモック応答です。お問い合わせありがとうございます。詳しくはお電話（0120-000-000）でお問い合わせください。';
}

/**
 * AI機能が利用可能かチェック
 * @returns {boolean} AI機能の利用可否
 */
function isAIAvailable() {
  // モックAPIモードの場合は常に利用可能
  if (process.env.MOCK_API_MODE === 'true') {
    return true;
  }
  
  return !!(process.env.GEMINI_API_KEY && initializeAI());
}

module.exports = {
  initializeAI,
  generateAIResponse,
  isAIAvailable
};