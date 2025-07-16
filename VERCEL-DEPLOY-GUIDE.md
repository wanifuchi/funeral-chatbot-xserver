# Vercel デプロイガイド

## 🚀 Vercelでのデプロイ手順

### 1. Vercelアカウントの準備
1. [Vercel](https://vercel.com/) にアクセス
2. 「Sign up」または「Log in」でアカウント作成/ログイン
3. GitHubアカウントと連携

### 2. 新しいプロジェクトの作成
1. **「New Project」** をクリック
2. **「Import Git Repository」** を選択
3. **GitHub** タブで認証
4. **`wanifuchi/toneya-chatbot`** リポジトリを選択
5. **「Import」** をクリック

### 3. プロジェクト設定
#### 基本設定
- **Project Name**: `toneya-chatbot` (自動設定)
- **Framework Preset**: `Other` (Node.js)
- **Build Command**: `npm run build` (空でOK)
- **Output Directory**: `public` (空でOK)
- **Install Command**: `npm install` (自動設定)

#### 環境変数の設定
「Environment Variables」セクションで以下を設定:

| Key | Value | 説明 |
|-----|-------|------|
| `GEMINI_API_KEY` | `your_gemini_api_key` | Google Gemini API キー |
| `CORS_ORIGIN` | `https://your-domain.com` | 許可するドメイン |
| `NODE_ENV` | `production` | 本番環境設定 |

### 4. デプロイ実行
1. **「Deploy」** ボタンをクリック
2. ビルドプロセスの完了を待つ（約2-3分）
3. デプロイ完了後、URLが表示される

### 5. 動作確認
デプロイ完了後、以下のURLで動作確認:

```
https://your-project.vercel.app/api/health
```

正常であれば以下のレスポンスが返される:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "aiAvailable": true,
  "knowledgeBaseLoaded": true
}
```

## 🔧 XSERVERでの導入

### 1. Vercel URLの確認
デプロイ完了後、以下の形式でURLが発行される:
```
https://toneya-chatbot-xxx.vercel.app
```

### 2. XSERVERのHTMLに埋め込み
サイトの `</body>` 直前に以下を追加:

```html
<!-- とね屋チャットボット -->
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://toneya-chatbot-xxx.vercel.app/toneya-chatbot.js';
    script.onload = function() {
      ToneyaChatbot.init({
        apiUrl: 'https://toneya-chatbot-xxx.vercel.app'
      });
    };
    document.head.appendChild(script);
  })();
</script>
```

> **重要**: `toneya-chatbot-xxx.vercel.app` を実際のURLに置き換えてください

### 3. カスタムドメインの設定（オプション）
1. Vercelダッシュボードで「Domains」タブ
2. 独自ドメインを追加
3. DNS設定でCNAMEレコードを追加

## 🛠️ 高度な設定

### 環境変数の管理
```bash
# ローカル開発用
GEMINI_API_KEY=your_local_key
CORS_ORIGIN=http://localhost:3000

# 本番環境用（Vercelで設定）
GEMINI_API_KEY=your_production_key
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
```

### 自動デプロイ設定
- **main** ブランチへのプッシュで自動デプロイ
- **プレビュー機能**: Pull Request でプレビュー環境作成
- **ロールバック**: 以前のデプロイへの即座復元

### パフォーマンス最適化
- **Edge Network**: 世界中のCDNで高速配信
- **自動スケーリング**: トラフィックに応じた自動調整
- **ゼロダウンタイム**: シームレスなデプロイ

## 🔒 セキュリティ設定

### CORS設定
```javascript
// server.js で自動設定済み
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN,
    /\.xserver\.jp$/,
    /\.xsrv\.jp$/
  ]
};
```

### API制限
- **レート制限**: 1分間に100リクエスト
- **リクエストサイズ**: 最大10MB
- **タイムアウト**: 30秒

## 📊 監視とログ

### Vercelダッシュボード
- **デプロイ履歴**: 全デプロイの状況確認
- **ログ**: リアルタイムログ監視
- **アナリティクス**: アクセス統計

### エラー監視
```javascript
// 自動エラーハンドリング設定済み
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: 'サーバーエラーが発生しました。' 
  });
});
```

## 🆘 トラブルシューティング

### よくある問題

#### 1. ビルドエラー
```bash
# 依存関係の問題
npm install --legacy-peer-deps
```

#### 2. 環境変数が反映されない
- Vercelダッシュボードで再確認
- デプロイ後に環境変数を変更した場合は再デプロイ

#### 3. CORS エラー
```javascript
// 許可ドメインの確認
CORS_ORIGIN=https://your-exact-domain.com
```

#### 4. API制限エラー
- Google Gemini API の使用量確認
- Vercel Function の実行時間制限確認

### サポート
- **Vercel**: https://vercel.com/support
- **GitHub Issues**: https://github.com/wanifuchi/toneya-chatbot/issues
- **技術サポート**: 開発者に連絡

---

**成功するデプロイのために、各ステップを順番に実行してください。**