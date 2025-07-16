# とね屋チャットボット - バックエンド設定ガイド

## 🚀 概要

このガイドでは、とね屋チャットボットのバックエンドサーバーの設定方法を説明します。
フロントエンドは簡単なタグ貼り付けで導入できますが、バックエンドサーバーが必要です。

## 📋 必要な環境

### システム要件
- **Node.js**: 16.0以上
- **npm**: 8.0以上
- **OS**: Windows、macOS、Linux
- **メモリ**: 最低512MB（推奨1GB以上）

### 必要なAPIキー
- **Google Gemini API Key**: AI機能を使用するために必要
  - [Google AI Studio](https://makersuite.google.com/app/apikey)で取得可能
  - 月間無料枠あり（60リクエスト/分）

## 🔧 セットアップ手順

### 1. プロジェクトのダウンロード

```bash
# プロジェクトフォルダに移動
cd funeral-chatbot

# 依存関係をインストール
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の内容を設定：

```env
# Gemini API設定
GEMINI_API_KEY=your_gemini_api_key_here

# サーバー設定
PORT=3000
NODE_ENV=production

# CORS設定
CORS_ORIGIN=https://your-website.com

# レート制限設定
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ログレベル
LOG_LEVEL=info
```

### 3. サーバーの起動

```bash
# 開発環境での起動
npm run dev

# 本番環境での起動
npm start

# バックグラウンドで起動
node server.js &
```

### 4. 動作確認

```bash
# ヘルスチェック
curl http://localhost:3000/api/health

# チャット機能テスト
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"料金を教えてください"}'
```

## 🌐 本番環境での配置

### 1. サーバー選択肢

#### VPS/クラウドサーバー（推奨）
- **AWS EC2**: 高い可用性、スケーラビリティ
- **Google Cloud Platform**: Gemini APIとの親和性
- **DigitalOcean**: 低価格、簡単設定
- **Heroku**: 簡単デプロイ、無料枠あり

#### 共有ホスティング
- **さくらインターネット**: 国内、低価格
- **ロリポップ**: 国内、初心者向け
- **Xserver**: 国内、高性能

### 2. ドメイン・SSL設定

```bash
# Nginx設定例
server {
    listen 80;
    server_name your-api-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. プロセス管理

```bash
# PM2を使用した本番環境管理
npm install -g pm2

# サーバー起動
pm2 start server.js --name toneya-chatbot

# 起動状態確認
pm2 status

# ログ確認
pm2 logs toneya-chatbot

# 自動起動設定
pm2 startup
pm2 save
```

## 🔒 セキュリティ設定

### 1. 基本的なセキュリティ

```javascript
// server.js での設定例
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://your-website.com"]
    }
  }
}));

// CORS設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-website.com',
  credentials: true
}));
```

### 2. APIキーの保護

```bash
# .env ファイルは必ず.gitignoreに追加
echo ".env" >> .gitignore

# ファイル権限を制限
chmod 600 .env
```

### 3. レート制限

```javascript
// express-rate-limitを使用
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // 最大100リクエスト
});

app.use('/api/', limiter);
```

## 📊 監視・ログ管理

### 1. ログ設定

```javascript
// winston を使用したログ設定
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### 2. ヘルスチェック

```bash
# 定期的なヘルスチェック用cron設定
*/5 * * * * curl -f http://localhost:3000/api/health || echo "Server down" | mail -s "Alert" admin@example.com
```

## 🔧 フロントエンド導入コード

### 1. 基本的な導入

```html
<!-- HTMLの</body>直前に貼り付け -->
<script src="https://your-cdn.com/toneya-chatbot.js"></script>
<script>
  ToneyaChatbot.init({
    apiUrl: 'https://your-api-domain.com'
  });
</script>
```

### 2. Google Analytics風の導入

```html
<!-- URLパラメーター自動初期化 -->
<script src="https://your-cdn.com/toneya-chatbot.js?apiUrl=https://your-api-domain.com"></script>
```

### 3. カスタマイズ例

```html
<script src="https://your-cdn.com/toneya-chatbot.js"></script>
<script>
  ToneyaChatbot.init({
    apiUrl: 'https://your-api-domain.com',
    position: 'bottom-left',
    primaryColor: '#e53e3e',
    companyName: 'カスタム葬儀社',
    phoneNumber: '0120-123-456'
  });
</script>
```

## 🔄 更新・メンテナンス

### 1. 定期的な更新

```bash
# 依存関係の更新
npm update

# セキュリティ脆弱性チェック
npm audit

# 修正の適用
npm audit fix
```

### 2. バックアップ

```bash
# 設定ファイルのバックアップ
cp .env .env.backup
cp accurate-knowledge-base.json accurate-knowledge-base.json.backup

# データベースのバックアップ（必要に応じて）
# mongodbの場合
# mongodump --db chatbot --out /backup/$(date +%Y%m%d)
```

## 🐛 トラブルシューティング

### 1. よくある問題

#### サーバーが起動しない
```bash
# ポート使用状況の確認
lsof -i :3000

# プロセスの強制終了
kill -9 $(lsof -t -i :3000)
```

#### API接続エラー
```bash
# CORS設定の確認
curl -H "Origin: https://your-website.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3000/api/chat
```

#### Gemini APIエラー
```bash
# APIキーの確認
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent
```

### 2. ログの確認

```bash
# サーバーログの確認
tail -f logs/combined.log

# エラーログの確認
tail -f logs/error.log

# PM2ログの確認
pm2 logs toneya-chatbot
```

## 💰 コスト概算

### 1. サーバー費用

| サービス | 月額費用 | 特徴 |
|----------|----------|------|
| AWS EC2 t3.micro | $8-15 | 高性能、スケーラブル |
| DigitalOcean | $5-10 | シンプル、低価格 |
| Heroku | $0-25 | 簡単デプロイ、無料枠あり |
| さくらVPS | ¥500-1,000 | 国内、低価格 |

### 2. API費用

| API | 無料枠 | 有料プラン |
|-----|--------|-----------|
| Gemini API | 60リクエスト/分 | $0.00025/1000文字 |

### 3. 運用費用

- **SSL証明書**: $0-100/年（Let's Encrypt推奨）
- **ドメイン**: $10-50/年
- **監視ツール**: $0-50/月

## 📞 サポート

### 技術的な問題
- **GitHub Issues**: プロジェクトのGitHubリポジトリ
- **Email**: support@example.com
- **電話**: 営業時間内のみ

### 導入支援
- **初期設定代行**: 有料オプション
- **カスタマイズ**: 追加開発対応
- **保守サポート**: 月額サポート契約

---

## 🎉 完了！

これで、とね屋チャットボットのバックエンドサーバーが正常に動作し、
フロントエンドは簡単なタグ貼り付けで導入できるようになりました。

何か問題が発生した場合は、上記のトラブルシューティング を参考にしてください。