const fs = require('fs');
const path = require('path');
const { info, warn, error, debug } = require('./logger');

// 知識ベースをキャッシュ（Cold Start対策）
let knowledgeBase = null;

/**
 * 正確な知識データベースを読み込み
 * @returns {Object} 知識ベースデータ
 */
function loadKnowledgeBase() {
  if (knowledgeBase) {
    return knowledgeBase;
  }

  try {
    const knowledgeBasePath = path.join(process.cwd(), 'accurate-knowledge-base.json');
    knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
    info('正確な知識データベースを読み込みました');
    return knowledgeBase;
  } catch (err) {
    error('正確な知識データベースの読み込みに失敗しました', err);
    throw new Error('知識データベースの読み込みに失敗しました');
  }
}

/**
 * プロンプトテンプレート（推測情報を排除）
 * @param {string} userQuestion ユーザーの質問
 * @param {Object} knowledge 知識ベース
 * @returns {string} 生成されたプロンプト
 */
function createPrompt(userQuestion, knowledge) {
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
}

/**
 * キーワードベースのフォールバック回答（実際のサイト情報のみ）
 * @param {string} question ユーザーの質問
 * @returns {string} 回答
 */
function getKeywordResponse(question) {
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
  
  // その他のキーワード別回答（省略 - 元のコードと同じ）
  // ... [元のgetKeywordResponseの内容をここに含める]
  
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
}

module.exports = {
  loadKnowledgeBase,
  createPrompt,
  getKeywordResponse
};