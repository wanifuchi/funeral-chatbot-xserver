const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"],
      scriptSrcAttr: ["'unsafe-inline'"]
    }
  }
}));
// CORS設定 - XSERVER対応
const corsOptions = {
  origin: function (origin, callback) {
    // 開発環境では全て許可
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // 本番環境では指定されたドメインのみ許可
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      /\.xserver\.jp$/,  // XSERVERの標準ドメイン
      /\.xsrv\.jp$/,     // XSERVERの標準ドメイン
      /localhost/,       // ローカル開発用
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// 正確な知識データベースを読み込み
let knowledgeBase;
try {
  const knowledgeBasePath = path.join(__dirname, 'accurate-knowledge-base.json');
  knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
  console.log('正確な知識データベースを読み込みました');
} catch (error) {
  console.error('正確な知識データベースの読み込みに失敗しました:', error);
  process.exit(1);
}

// Gemini AIの初期化
let genAI;
let model;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('Gemini APIが初期化されました');
} else {
  console.warn('GEMINI_API_KEYが設定されていません。フォールバック機能のみ使用可能です。');
}

// プロンプトテンプレート（推測情報を排除）
const createPrompt = (userQuestion, knowledge) => {
  return `あなたは「${knowledge.companyName}」の正確で誠実なカスタマーサービス担当者です。
以下の実際のサイト情報のみに基づいて、お客様の質問にお答えください。

【重要な回答ガイドライン】
1. 提供された情報に記載されている内容のみを回答する
2. 推測や一般的な知識による回答は絶対に行わない
3. 料金については「要問い合わせ」であることを明確にする
4. 詳細情報がない場合は「詳細はお電話（${knowledge.contact.phone}）でお問い合わせください」と案内する
5. 「情報なし」と記載されている項目については、正直に情報がないことを伝える
6. 常に温かく、理解しやすい言葉遣いで応答する
7. 実際のサイト情報に基づいた正確な回答を最優先とする

【実際のサイト情報】
${JSON.stringify(knowledge, null, 2)}

【重要な注意事項】
- この知識データベースは実際のサイト情報のみに基づいて作成されています
- サイトに記載されていない情報については推測せず、お問い合わせを案内してください
- 料金に関する質問には具体的な価格帯を示し、会員制度についても説明してください

【お客様の質問】
${userQuestion}

【回答】`;
};

// キーワードベースのフォールバック回答（実際のサイト情報のみ）
const getKeywordResponse = (question) => {
  const lowerQuestion = question.toLowerCase();
  
  // 料金関連
  if (lowerQuestion.includes('料金') || lowerQuestion.includes('費用') || lowerQuestion.includes('価格')) {
    return `とね屋では幅広い価格帯で葬儀プランをご用意しております：

💰 **料金一覧**
🔸 **直葬/火葬式**: 39,000円～184,800円
   └ プラン3: 70,000円（会員39,000円）
   └ メインプラン: 140,800円（会員128,000円）

🔸 **家族葬**: 300,000円～400,000円
   └ 一般400,000円 → 会員300,000円

🔸 **一日葬**: 300,000円～330,000円
   └ 通夜省略の1日完結型

🔸 **一般葬**: 350,000円～410,000円
   └ 従来の2日間形式

🔸 **自宅葬**: 600,000円～700,000円
   └ ご自宅でゆっくりとお見送り

🔸 **生活保護葬**: 0円（自治体扶助）

🎫 **会員制度で大幅割引**
・全プランで会員価格適用
・最大100,000円以上の割引

詳しいお見積もりは無料で承ります。
お電話（0120-000-000）にて24時間365日対応いたします。`;
  }
  
  // 具体的なプラン関連
  if (lowerQuestion.includes('家族葬')) {
    return `**とね屋の家族葬**

💰 **料金**
・一般価格: 400,000円～
・会員価格: 300,000円～
・割引額: 100,000円

👥 **特徴**
・家族・親族中心の小規模葬儀
・2日間（通夜・告別式）
・温かく心のこもったお見送り

📋 **プロセス**
1日目: 通夜
2日目: 告別式・火葬

会員制度で100,000円の割引が適用されます。
詳しくは0120-000-000までお電話ください。`;
  }
  
  if (lowerQuestion.includes('直葬') || lowerQuestion.includes('火葬式')) {
    return `**直葬/火葬式プラン**

💰 **料金体系**
・プラン3: 70,000円（会員39,000円）- 最もシンプル
・プラン2: 100,000円（会員89,000円）- 半日完了
・メインプラン: 140,800円（会員128,000円）- No.1人気
・ベーシック: 184,800円（会員168,000円）- 納棺込み

✨ **特徴**
・通夜・告別式なしの最もシンプルな形式
・短時間での完了
・費用を抑えたい方におすすめ

📋 **基本の流れ**
ご逝去 → お迎え → 火葬

詳しいプラン内容は0120-000-000までお電話ください。`;
  }
  
  if (lowerQuestion.includes('一日葬')) {
    return `**とね屋の一日葬**

💰 **料金**
・一般価格: 330,000円～
・会員価格: 300,000円～

✨ **特徴**
・通夜を省略した1日完結型
・おすすめプラン
・時間的負担を軽減

📋 **プロセス**
告別式のみを1日で執り行います

会員制度で30,000円の割引が適用されます。
詳しくは0120-000-000までお電話ください。`;
  }
  
  if (lowerQuestion.includes('一般葬')) {
    return `**とね屋の一般葬**

💰 **料金**
・一般価格: 410,000円～
・会員価格: 350,000円～

✨ **特徴**
・従来の通夜・告別式を行う形式
・一般的な葬儀を低価格で提供
・多くの方にご参列いただける

📋 **プロセス**
1日目: 通夜
2日目: 告別式・火葬

会員制度で60,000円の割引が適用されます。
詳しくは0120-000-000までお電話ください。`;
  }
  
  if (lowerQuestion.includes('自宅葬')) {
    return `**自宅葬**

💰 **料金**
・一般価格: 700,000円～
・会員価格: 600,000円～

✨ **特徴**
・故人の住み慣れた自宅で執り行う
・ゆっくりとお見送りができる
・家族でゆっくりと過ごせる

📋 **プロセス**
自宅でゆっくりお見送り（2日間）

会員制度で100,000円の割引が適用されます。
詳しくは0120-000-000までお電話ください。`;
  }
  
  if (lowerQuestion.includes('生活保護') || lowerQuestion.includes('福祉葬')) {
    return `**生活保護葬（福祉プラン）**

💰 **料金**
・自己負担: 0円
・自治体扶助が適用されます

✅ **対象者**
・生活保護受給者のみ

📋 **プロセス**
お迎え → ご安置 → 納棺 → 火葬 → 収骨

🔸 必要最小限の内容で尊厳を保った葬儀
🔸 自治体との手続きも代行いたします

詳しくは0120-000-000までお電話ください。`;
  }
  
  // 会員制度関連
  if (lowerQuestion.includes('会員') || lowerQuestion.includes('割引') || lowerQuestion.includes('会員制度')) {
    return `**とね屋の会員制度**

🎫 **会員特典**
・全プランで会員価格が適用されます
・大幅な割引でお得にご利用いただけます

💰 **割引例**
・直葬メインプラン: 140,800円 → 128,000円（12,800円割引）
・家族葬: 400,000円 → 300,000円（100,000円割引）
・一般葬: 410,000円 → 350,000円（60,000円割引）
・自宅葬: 700,000円 → 600,000円（100,000円割引）

✅ **その他の特典**
・無料相談サービス優先対応
・24時間365日サポート
・事前相談で安心

📞 **入会・詳細について**
会員制度の詳細やご入会については、
お電話（0120-000-000）にてご案内いたします。`;
  }
  
  // プラン関連
  if (lowerQuestion.includes('プラン') || lowerQuestion.includes('種類')) {
    return `とね屋では豊富な葬儀プランをご用意しております：

📋 **プラン一覧**

**🔸 直葬/火葬式（39,000円～）**
・プラン3: 70,000円（会員39,000円）- 最もシンプル
・メインプラン: 140,800円（会員128,000円）- No.1人気

**🔸 家族葬（300,000円～）**
・家族・親族中心の2日間の葬儀
・一般400,000円 → 会員300,000円

**🔸 一日葬（300,000円～）**
・通夜を省略した1日完結型
・おすすめプラン

**🔸 一般葬（350,000円～）**
・従来の通夜・告別式を行う形式
・一般410,000円 → 会員350,000円

**🔸 自宅葬（600,000円～）**
・故人の住み慣れた自宅で
・一般700,000円 → 会員600,000円

**🔸 生活保護葬（0円）**
・生活保護受給者専用
・自治体扶助で自己負担なし

**🔸 社葬（1,000万円～）**
・企業・団体主催の大規模葬儀

💡 **すべてのプランで会員制度による割引あり**

詳細なプラン内容は、お電話（0120-000-000）にて
専門スタッフがご説明いたします。`;
  }
  
  // 式場関連
  if (lowerQuestion.includes('式場') || lowerQuestion.includes('ホール') || lowerQuestion.includes('場所')) {
    return `申し訳ございませんが、自社式場の詳細な情報については、サイトに記載がございません。

📍 対応エリア
- 東京都（23区全体およびその他の地域）
- 神奈川県（横浜市、川崎市、相模原市など）

式場の詳細情報については、お電話（0120-000-000）にて
専門スタッフが丁寧にご案内いたします。`;
  }
  
  // 緊急時対応
  if (lowerQuestion.includes('緊急') || lowerQuestion.includes('今すぐ') || lowerQuestion.includes('急')) {
    return `緊急時は24時間365日対応いたします。

🚨 今すぐお電話ください
☎️ 0120-000-000

✅ 通話無料
✅ 年中無休
✅ フリーダイヤル

緊急時の詳細な対応については、お電話にて
専門スタッフが迅速にご対応いたします。`;
  }
  
  // デフォルトレスポンス
  return `お問い合わせありがとうございます。

当社では以下のサービスを提供しております：
🔸 各種葬儀プラン
🔸 宗教・宗派に応じた葬儀（仏式、神式、キリスト教、創価学会、無宗教）
🔸 事前相談サービス
🔸 アフターサポート

詳しい情報については、専門スタッフが丁寧にお答えいたします。

📞 24時間365日対応
☎️ 0120-000-000

お気軽にお電話ください。`;
};

// チャットエンドポイント
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ 
        error: 'Question is required',
        message: '質問を入力してください。' 
      });
    }
    
    let answer;
    
    if (model && process.env.GEMINI_API_KEY) {
      try {
        // AI APIを使用して回答を生成
        const prompt = createPrompt(question, knowledgeBase);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        answer = response.text();
        
        // 回答が空または不適切な場合のフォールバック
        if (!answer || answer.trim() === '' || answer.includes('申し訳ございません')) {
          answer = getKeywordResponse(question);
        }
        
      } catch (aiError) {
        console.error('AI API Error:', aiError);
        // AI APIが失敗した場合はキーワードベースの回答を使用
        answer = getKeywordResponse(question);
      }
    } else {
      // API KEYが設定されていない場合はキーワードベースの回答を使用
      answer = getKeywordResponse(question);
    }
    
    res.json({ 
      answer: answer,
      timestamp: new Date().toISOString(),
      source: model ? 'ai' : 'keyword'
    });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: '申し訳ございません。システムエラーが発生しました。しばらく時間をおいてから再度お試しください。'
    });
  }
});

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    aiAvailable: !!model,
    knowledgeBaseLoaded: !!knowledgeBase
  });
});

// 知識データベース取得エンドポイント（開発用）
app.get('/api/knowledge', (req, res) => {
  res.json({
    companyName: knowledgeBase.companyName,
    contact: knowledgeBase.contact,
    serviceAreas: knowledgeBase.serviceAreas,
    planCount: knowledgeBase.plans.length,
    hallCount: knowledgeBase.funeralHalls.length,
    faqCount: knowledgeBase.frequentlyAskedQuestions.reduce((count, category) => 
      count + category.questions.length, 0
    )
  });
});

// 静的ファイルの提供
app.use(express.static('.'));

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: 'サーバーエラーが発生しました。' 
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'リクエストされたリソースが見つかりません。' 
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`📚 Knowledge base: http://localhost:${PORT}/api/knowledge`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY is not set. Using keyword-based responses only.');
    console.log('   To enable AI responses, set GEMINI_API_KEY in your .env file.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;