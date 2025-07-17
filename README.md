# とね屋チャットボット - XSERVER×Vercel連携システム

Google Analytics式のJSタグ埋め込みで簡単導入できる、葬儀サービス専用チャットボットです。

## 🌟 システム概要

- **フロントエンド**: XSERVER (JavaScript埋め込み)
- **バックエンド**: Vercel Functions (サーバーレス)
- **AI エンジン**: Google Gemini API
- **導入方法**: Google Analytics のようなJSタグ貼り付け

## 🚀 XSERVER導入手順

### 1. バックエンドのデプロイ

#### Vercel Functionsでのデプロイ
1. [Vercel](https://vercel.com/)にログイン
2. 「New Project」をクリック
3. このGitHubリポジトリをインポート
4. 環境変数を設定:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   CORS_ORIGIN=https://your-domain.com
   NODE_ENV=production
   ```
5. 「Deploy」をクリック

📋 **詳細なデプロイ手順**: [VERCEL-FUNCTIONS-DEPLOY-GUIDE.md](./VERCEL-FUNCTIONS-DEPLOY-GUIDE.md) を参照

### 2. XSERVERへの導入

#### 簡単導入 (推奨)
XSERVERのHTMLファイルの `</body>` 直前に以下を貼り付け:

```html
<!-- とね屋チャットボット -->
<script>
  (function() {
    // Vercelバックエンドから動的に読み込み
    const script = document.createElement('script');
    script.src = 'https://your-project.vercel.app/toneya-chatbot.js';
    script.onload = function() {
      ToneyaChatbot.init({
        apiUrl: 'https://your-project.vercel.app'
      });
    };
    document.head.appendChild(script);
  })();
</script>
```

> **重要**: `your-project.vercel.app` を実際のVercelのURLに置き換えてください

#### カスタマイズ版
```html
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://your-project.vercel.app/toneya-chatbot.js';
    script.onload = function() {
      ToneyaChatbot.init({
        apiUrl: 'https://your-project.vercel.app',
        position: 'bottom-right',
        primaryColor: '#2b4c7d',
        companyName: 'とね屋のお葬式',
        phoneNumber: '0120-000-000'
      });
    };
    document.head.appendChild(script);
  })();
</script>
```

## 📋 機能一覧

### 🤖 AI チャットボット
- **Gemini AI**: 自然言語処理による高度な応答
- **知識データベース**: 正確な価格・プラン情報
- **キーワード検索**: AIが利用できない場合の代替機能
- **24時間対応**: 緊急時も含めた全日対応

### 💰 料金システム
- **直葬/火葬式**: 39,000円～184,800円
- **家族葬**: 300,000円～400,000円
- **一日葬**: 300,000円～330,000円
- **一般葬**: 350,000円～410,000円
- **自宅葬**: 600,000円～700,000円
- **生活保護葬**: 0円（自治体扶助）
- **会員制度**: 全プランで大幅割引

### 🎯 主な質問対応
- 葬儀プランの詳細説明
- 料金体系と会員制度
- 緊急時の対応方法
- 各種手続きの案内
- 式場・エリア情報

## 🔧 技術仕様

### フロントエンド
- **言語**: Vanilla JavaScript (フレームワーク不要)
- **UI**: モダンなチャットインターフェース
- **レスポンシブ**: PC・スマホ・タブレット対応
- **軽量**: 最小限のリソース使用

### バックエンド
- **Node.js**: v18以上
- **Express**: Web フレームワーク
- **Google Gemini API**: AI 応答生成
- **CORS**: XSERVER ドメイン自動対応
- **セキュリティ**: Helmet + CSP 設定

### 導入要件
- **XSERVER**: 通常のレンタルサーバープラン
- **Vercel**: 無料プランで運用可能
- **Google AI**: Gemini API キー必要

## 🛡️ セキュリティ

### CORS設定
```javascript
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN,
    /\.xserver\.jp$/,  // XSERVER標準ドメイン
    /\.xsrv\.jp$/,     // XSERVER標準ドメイン
    /localhost/        // 開発用
  ]
};
```

### 環境変数管理
```
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
```

## 📱 動作確認

### ヘルスチェック
```
https://your-project.vercel.app/api/health
```

### 機能テスト
1. **チャットボタン**: 右下に表示確認
2. **AI応答**: 各種質問での回答確認
3. **レスポンシブ**: 各デバイスでの動作確認
4. **CORS**: 本番ドメインからの通信確認

## 📂 ファイル構成

```
├── server.js              # Express サーバー
├── toneya-chatbot.js       # チャットボット Widget
├── accurate-knowledge-base.json  # 知識データベース
├── package.json            # 依存関係
├── vercel.json            # Vercel 設定
├── .env.example           # 環境変数例
└── xserver-integration.html # 導入デモ
```

## 🔄 開発・保守

### ローカル開発
```bash
npm install
npm start
```

### 本番デプロイ
```bash
# Vercelにプッシュするだけで自動デプロイ
git push origin main
```

### 知識データベース更新
`accurate-knowledge-base.json` を編集後、リポジトリにプッシュ

## 📞 サポート

### 技術的な問題
- GitHub Issues で報告
- 開発者によるサポート対応

### 葬儀サービス関連
- **とね屋**: 0120-000-000
- **24時間365日対応**
- **通話無料**

---

**とね屋チャットボット** は、現代的な技術と伝統的な葬儀サービスを融合した革新的なシステムです。