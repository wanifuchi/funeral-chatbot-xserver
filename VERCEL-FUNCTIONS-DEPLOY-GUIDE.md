# Vercel Functions デプロイガイド

## 概要

とね屋チャットボットは、Vercel FunctionsとXSERVERを組み合わせたサーバーレス アーキテクチャを採用しています。

## 🚀 デプロイ手順

### 1. Vercelアカウントの準備

1. [Vercel](https://vercel.com/)にログイン
2. GitHubアカウントと連携

### 2. プロジェクトのデプロイ

```bash
# Vercel CLIのインストール
npm install -g vercel

# プロジェクトディレクトリに移動
cd funeral-chatbot

# デプロイ実行
vercel

# 初回デプロイ時の設定
# - Set up and deploy "~/funeral-chatbot"? [Y/n] y
# - Which scope do you want to deploy to? [選択]
# - Link to existing project? [Y/n] n
# - What's your project's name? funeral-chatbot
# - In which directory is your code located? ./
```

### 3. 環境変数の設定

Vercelダッシュボードから環境変数を設定：

```bash
# コマンドラインから設定する場合
vercel env add GEMINI_API_KEY
vercel env add CORS_ORIGIN
vercel env add NODE_ENV
```

または、Vercelダッシュボード > Settings > Environment Variables で設定：

- `GEMINI_API_KEY`: Google Gemini APIキー
- `CORS_ORIGIN`: XSERVERのドメイン (例: https://your-domain.com)
- `NODE_ENV`: production

### 4. 本番デプロイ

```bash
# 本番環境へのデプロイ
vercel --prod
```

## 🔧 API エンドポイント

デプロイ後、以下のエンドポイントが利用可能：

- **チャット API**: `https://your-project.vercel.app/api/chat`
- **ヘルスチェック**: `https://your-project.vercel.app/api/health`
- **知識ベース**: `https://your-project.vercel.app/api/knowledge`
- **クライアントJS**: `https://your-project.vercel.app/toneya-chatbot.js`

## 🌐 XSERVER導入

### XSERVERサイトへの埋め込み

HTMLファイルの `</body>` 直前に以下を追加：

```html
<!-- とね屋チャットボット -->
<script>
  (function() {
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

**重要**: `your-project.vercel.app` を実際のVercelデプロイURLに置き換えてください。

## 🔒 セキュリティ設定

### CORS設定

- 開発環境: 全てのオリジンを許可
- 本番環境: 以下のドメインのみ許可
  - `CORS_ORIGIN` 環境変数で指定されたドメイン
  - `*.xserver.jp`
  - `*.xsrv.jp`
  - `localhost` (開発用)

### 環境変数の保護

- APIキーはVercelの環境変数で管理
- `.env` ファイルはGitリポジトリに含めない
- `.env.example` を参考に設定

## 🧪 テスト

### ローカルテスト

```bash
# 依存関係のインストール
npm install

# ローカル開発サーバーの起動
npm run dev

# または
vercel dev
```

### 本番テスト

```bash
# ヘルスチェック
curl https://your-project.vercel.app/api/health

# チャット API テスト
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "料金について教えて"}'
```

## 📊 監視とログ

### Vercelダッシュボード

- **Functions**: 各エンドポイントの実行状況
- **Analytics**: リクエスト数、レスポンス時間
- **Logs**: エラーログとデバッグ情報

### 主要メトリクス

- **Cold Start**: 初回リクエスト時間
- **Execution Time**: 関数実行時間
- **Memory Usage**: メモリ使用量
- **Error Rate**: エラー発生率

## 🔧 トラブルシューティング

### よくある問題

1. **CORS エラー**
   - `CORS_ORIGIN` 環境変数を正しく設定
   - XSERVERのドメインを確認

2. **APIキー エラー**
   - `GEMINI_API_KEY` が正しく設定されているか確認
   - Google Cloud Console でAPIキーの制限を確認

3. **Cold Start 遅延**
   - 共通処理のキャッシュ機能を活用
   - 不要なモジュールのインポートを削除

### ログの確認

```bash
# リアルタイムログ
vercel logs --follow

# 特定の関数のログ
vercel logs --limit=50 your-project.vercel.app
```

## 🔄 継続的デプロイ

### GitHub Actions (オプション)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📝 その他の注意事項

- **API制限**: Gemini APIの利用制限に注意
- **コスト**: Vercelの利用料金を監視
- **バックアップ**: 知識ベースの定期的なバックアップ
- **更新**: 依存関係の定期的な更新

## 📞 サポート

問題が発生した場合：
1. Vercelダッシュボードでログを確認
2. GitHub Issues で報告
3. ドキュメントを参照