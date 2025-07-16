# ⚡ 5分で完了！とね屋チャットボット - クイックデプロイ

## 🚀 Vercel デプロイ（推奨）

### 1. 準備（1分）
```bash
# Vercel CLI をインストール
npm install -g vercel
```

### 2. デプロイ（2分）
```bash
# ログイン
vercel login

# デプロイ
vercel

# 質問に答える
? Set up and deploy "funeral-chatbot"? [Y/n] y
? Which scope? → あなたのアカウントを選択
? Link to existing project? [y/N] n
? What's your project's name? → toneya-chatbot
? In which directory is your code located? → ./
```

### 3. 環境変数設定（1分）
```bash
# Gemini API Key を設定
vercel env add GEMINI_API_KEY
# 値を入力: your_gemini_api_key_here
# 環境を選択: Production, Preview, Development

# 本番デプロイ
vercel --prod
```

### 4. 使用開始（1分）
```html
<!-- 取得したURLを使用 -->
<script src="https://your-project.vercel.app/toneya-chatbot.js"></script>
<script>
  ToneyaChatbot.init({
    apiUrl: 'https://your-project.vercel.app'
  });
</script>
```

---

## 🚂 Railway デプロイ

### 1. 準備（1分）
```bash
# Railway CLI をインストール
npm install -g @railway/cli
```

### 2. デプロイ（2分）
```bash
# ログイン
railway login

# 初期化
railway init

# 環境変数を設定
railway variables set GEMINI_API_KEY=your_api_key_here
railway variables set NODE_ENV=production

# デプロイ
railway deploy
```

### 3. 使用開始（1分）
```html
<!-- 取得したURLを使用 -->
<script src="https://your-project.railway.app/toneya-chatbot.js"></script>
<script>
  ToneyaChatbot.init({
    apiUrl: 'https://your-project.railway.app'
  });
</script>
```

---

## 🎯 GitHub連携デプロイ（最も簡単）

### 1. GitHubにプッシュ（1分）
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercelで連携（2分）
1. [vercel.com](https://vercel.com) にアクセス
2. "New Project" をクリック
3. GitHubリポジトリを選択
4. "Deploy" をクリック

### 3. 環境変数設定（1分）
1. Settings → Environment Variables
2. `GEMINI_API_KEY` を追加
3. 値を入力して保存

### 4. 自動デプロイ完了（1分）
- 以後、GitHubにプッシュするだけで自動デプロイ
- プルリクエストで自動プレビュー

---

## ✅ 動作確認

### 1. API確認
```bash
curl https://your-project.vercel.app/api/health
```

### 2. チャット機能確認
```bash
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"料金を教えてください"}'
```

### 3. フロントエンド確認
```
https://your-project.vercel.app/easy-embed-test.html
```

---

## 🔧 必要なもの

### 必須
- [x] **Gemini API Key** - [Google AI Studio](https://makersuite.google.com/app/apikey)
- [x] **GitHubアカウント** - [github.com](https://github.com)
- [x] **Vercel/Railwayアカウント** - 無料登録

### あると便利
- [x] **独自ドメイン** - お名前.com、ムームードメインなど
- [x] **監視サービス** - UptimeRobot（無料）

---

## 🎨 カスタマイズ

### 色を変更
```javascript
ToneyaChatbot.init({
  apiUrl: 'https://your-project.vercel.app',
  primaryColor: '#dc3545' // 赤色に変更
});
```

### 位置を変更
```javascript
ToneyaChatbot.init({
  apiUrl: 'https://your-project.vercel.app',
  position: 'bottom-left' // 左下に変更
});
```

### 会社情報を変更
```javascript
ToneyaChatbot.init({
  apiUrl: 'https://your-project.vercel.app',
  companyName: 'あなたの会社名',
  phoneNumber: '0120-123-456'
});
```

---

## 💰 費用

### 完全無料構成
- **Vercel**: 100GB帯域/月まで無料
- **Gemini API**: 60リクエスト/分まで無料
- **合計**: **月額 0円**

### 有料になる場合
- 帯域超過: $20/月〜
- API超過: $0.00025/1000文字
- 独自ドメイン: $10-50/年

---

## 🐛 よくある問題

### デプロイできない
```bash
# Node.jsのバージョンを確認
node -v  # v18以上が必要

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### APIエラー
```bash
# 環境変数を確認
vercel env ls

# 正しいAPIキーか確認
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models
```

### CORSエラー
```javascript
// server.js で CORS 設定を確認
app.use(cors({
  origin: ['https://your-website.com', 'https://your-project.vercel.app'],
  credentials: true
}));
```

---

## 🎉 完了！

**5分でデプロイ完了！**

あとは、HTMLに1つのタグを貼り付けるだけで、
Google Analytics風にチャットボットが導入できます。

```html
<script src="https://your-project.vercel.app/toneya-chatbot.js?apiUrl=https://your-project.vercel.app"></script>
```

**🎊 これで、とね屋チャットボットが世界中からアクセス可能になりました！**