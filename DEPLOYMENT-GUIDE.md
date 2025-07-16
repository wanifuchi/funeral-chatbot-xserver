# 🚀 とね屋チャットボット - デプロイガイド

## 🌟 対応プラットフォーム

### ✅ 推奨プラットフォーム
- **Vercel** - 無料枠豊富、高速、簡単
- **Railway** - 無料枠あり、データベース対応
- **Heroku** - 老舗、安定
- **Render** - 無料枠、自動スケーリング

### ✅ その他対応プラットフォーム
- **Netlify** (Functions使用)
- **AWS Lambda** + API Gateway
- **Google Cloud Functions**
- **Azure Functions**

---

## 🚀 Vercel への配置

### 1. プロジェクトの準備

```bash
# package.json に start スクリプトを追加
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 2. vercel.json の作成

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. 環境変数の設定

```bash
# Vercel CLI をインストール
npm install -g vercel

# ログイン
vercel login

# 環境変数を設定
vercel env add GEMINI_API_KEY
vercel env add PORT
vercel env add CORS_ORIGIN
```

### 4. デプロイ

```bash
# 初回デプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

### 5. カスタムドメインの設定

```bash
# ドメインを追加
vercel domains add your-domain.com

# DNS設定
# A レコード: 76.76.19.61
# CNAME: cname.vercel-dns.com
```

---

## 🚂 Railway への配置

### 1. プロジェクトの準備

```bash
# package.json の確認
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install"
  }
}
```

### 2. railway.json の作成（オプション）

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 3. Railway CLI でデプロイ

```bash
# Railway CLI をインストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクトを作成
railway init

# 環境変数を設定
railway variables set GEMINI_API_KEY=your_api_key_here
railway variables set PORT=3000
railway variables set NODE_ENV=production

# デプロイ
railway deploy
```

### 4. GitHub連携での自動デプロイ

1. [railway.app](https://railway.app) にアクセス
2. "New Project" → "Deploy from GitHub repo"
3. リポジトリを選択
4. 環境変数を設定
5. 自動デプロイ開始

---

## 🟣 Heroku への配置

### 1. Procfile の作成

```
web: node server.js
```

### 2. package.json の設定

```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

### 3. Heroku CLI でデプロイ

```bash
# Heroku CLI をインストール
# https://devcenter.heroku.com/articles/heroku-cli

# ログイン
heroku login

# アプリを作成
heroku create toneya-chatbot

# 環境変数を設定
heroku config:set GEMINI_API_KEY=your_api_key_here
heroku config:set NODE_ENV=production

# デプロイ
git push heroku main
```

---

## 🎨 Render への配置

### 1. render.yaml の作成

```yaml
services:
  - type: web
    name: toneya-chatbot
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: GEMINI_API_KEY
        fromSecret: GEMINI_API_KEY
```

### 2. Web管理画面でのデプロイ

1. [render.com](https://render.com) にアクセス
2. "New Web Service" を選択
3. GitHubリポジトリを接続
4. 環境変数を設定
5. デプロイ開始

---

## 🔧 環境変数の設定

### 必須の環境変数

```env
# 必須
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production

# 推奨
PORT=3000
CORS_ORIGIN=https://your-website.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### プラットフォーム別設定方法

#### Vercel
```bash
vercel env add GEMINI_API_KEY
# 値を入力: your_api_key_here
# 環境を選択: Production
```

#### Railway
```bash
railway variables set GEMINI_API_KEY=your_api_key_here
railway variables set CORS_ORIGIN=https://your-website.com
```

#### Heroku
```bash
heroku config:set GEMINI_API_KEY=your_api_key_here
heroku config:set CORS_ORIGIN=https://your-website.com
```

---

## 🌐 本番環境での使用

### 1. フロントエンド導入コード

```html
<!-- Vercel の場合 -->
<script src="https://your-project.vercel.app/toneya-chatbot.js"></script>
<script>
  ToneyaChatbot.init({
    apiUrl: 'https://your-api.vercel.app'
  });
</script>

<!-- Railway の場合 -->
<script src="https://your-project.railway.app/toneya-chatbot.js"></script>
<script>
  ToneyaChatbot.init({
    apiUrl: 'https://your-api.railway.app'
  });
</script>
```

### 2. 自動初期化版

```html
<!-- URLパラメーター版 -->
<script src="https://your-project.vercel.app/toneya-chatbot.js?apiUrl=https://your-api.vercel.app"></script>
```

---

## 📊 プラットフォーム比較

| 項目 | Vercel | Railway | Heroku | Render |
|------|--------|---------|--------|--------|
| 無料枠 | 100GB帯域 | $5/月まで | 550時間/月 | 750時間/月 |
| 起動速度 | 超高速 | 高速 | 中速 | 高速 |
| 設定簡単さ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 独自ドメイン | 無料 | 有料 | 有料 | 無料 |
| スリープなし | 有料 | 有料 | 有料 | 有料 |

### 📝 推奨度

1. **Vercel** - 最も簡単、高速、無料枠豊富
2. **Railway** - データベース使用時におすすめ
3. **Render** - バランスが良い、独自ドメイン無料
4. **Heroku** - 老舗、実績豊富だが有料化進行中

---

## 🔒 セキュリティ設定

### 1. CORS設定

```javascript
// 本番環境用 CORS 設定
app.use(cors({
  origin: [
    'https://your-website.com',
    'https://www.your-website.com'
  ],
  credentials: true
}));
```

### 2. 環境変数での制御

```javascript
// 環境に応じた設定
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://your-website.com']
  : ['http://localhost:3000'];
```

### 3. APIキーの保護

```bash
# 本番環境では必ず環境変数で設定
# .env ファイルは .gitignore に追加
echo ".env" >> .gitignore
```

---

## 📈 監視・メンテナンス

### 1. ヘルスチェック

```bash
# 定期的なヘルスチェック
curl https://your-api.vercel.app/api/health
```

### 2. ログ監視

```bash
# Vercel
vercel logs

# Railway
railway logs

# Heroku
heroku logs --tail
```

### 3. アップタイム監視

- **UptimeRobot** - 無料監視サービス
- **StatusPage** - ステータスページ作成
- **PingPong** - 日本製監視サービス

---

## 🐛 トラブルシューティング

### 1. デプロイエラー

```bash
# ビルドログを確認
vercel logs --follow

# 環境変数を確認
vercel env ls
```

### 2. API接続エラー

```bash
# CORS エラーの場合
curl -H "Origin: https://your-website.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-api.vercel.app/api/chat
```

### 3. 環境変数エラー

```bash
# 環境変数が設定されているか確認
curl https://your-api.vercel.app/api/health
```

---

## 💰 費用概算

### 月額費用（目安）

| プラットフォーム | 無料枠 | 有料プラン |
|-----------------|--------|-----------|
| Vercel | 100GB帯域 | $20/月〜 |
| Railway | $5/月まで | $5/月〜 |
| Heroku | 550時間/月 | $7/月〜 |
| Render | 750時間/月 | $7/月〜 |

### 関連費用

- **独自ドメイン**: $10-50/年
- **SSL証明書**: 無料（Let's Encrypt）
- **監視サービス**: $0-20/月

---

## 🎉 おすすめの構成

### 小規模サイト
```
Vercel (無料) + 独自ドメイン + UptimeRobot
月額: $0-5
```

### 中規模サイト
```
Railway ($5/月) + 独自ドメイン + 監視サービス
月額: $10-20
```

### 大規模サイト
```
Heroku ($25/月) + 独自ドメイン + 本格監視
月額: $50-100
```

---

## 📞 サポート

どのプラットフォームでも、基本的な設定は同じです。
問題が発生した場合は、各プラットフォームのドキュメントと
このガイドを参照してください。

**🎉 これで、とね屋チャットボットを様々なプラットフォームに
簡単にデプロイできます！**