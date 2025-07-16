# AI対応葬儀社チャットボット セットアップガイド

## 🎯 概要

このチャットボットは、Google Gemini AIを使用して、葬儀社の詳細な情報を基に高品質な回答を提供するシステムです。

## 📋 必要な環境

- Node.js 14.0以上
- npm または yarn
- Google Gemini API Key

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
# プロジェクトディレクトリに移動
cd funeral-chatbot

# 依存関係をインストール
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして編集：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# Google Gemini API Key（必須）
GEMINI_API_KEY=your_actual_api_key_here

# サーバー設定
PORT=3000
NODE_ENV=development
```

### 3. Google Gemini API Keyの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. 生成されたAPIキーを`.env`ファイルに設定

### 4. サーバーの起動

```bash
# 開発モードで起動
npm run dev

# または本番モードで起動
npm start
```

### 5. 動作確認

ブラウザで以下にアクセス：
- **テストページ**: `http://localhost:3000/test-ai.html`
- **ヘルスチェック**: `http://localhost:3000/api/health`

## 📁 ファイル構成

```
funeral-chatbot/
├── server.js                    # バックエンドサーバー
├── chatbot-widget-ai.js         # AI対応フロントエンド
├── funeral-knowledge-base.json  # 詳細な知識データベース
├── test-ai.html                 # AIテストページ
├── package.json                 # 依存関係
├── .env.example                 # 環境変数テンプレート
└── setup-guide.md              # このファイル
```

## 🔧 カスタマイズ

### 知識データベースの更新

`funeral-knowledge-base.json`を編集して、会社の情報を更新：

```json
{
  "companyName": "お葬式のとねや",
  "contact": {
    "phone": "0120-000-000",
    "website": "https://your-website.com"
  },
  "plans": [
    {
      "name": "直葬・火葬式プラン",
      "priceRange": "150,000円〜300,000円",
      "description": "詳細な説明..."
    }
  ]
}
```

### フロントエンドの設定

`chatbot-widget-ai.js`の設定を変更：

```javascript
FuneralChatbotAI.init({
  apiUrl: 'http://localhost:3000/api/chat',
  position: 'bottom-right',
  primaryColor: '#2b4c7d',
  companyName: 'お葬式のとねや',
  phoneNumber: '0120-000-000',
  isDebugMode: false
});
```

## 🌐 本番環境への配置

### 1. サーバーの設定

```bash
# 本番用の環境変数を設定
NODE_ENV=production
PORT=80
GEMINI_API_KEY=your_production_api_key

# サーバーを起動
npm start
```

### 2. ウェブサイトへの組み込み

既存のウェブサイトに以下のコードを追加：

```html
<!-- </body>タグの直前に追加 -->
<script src="https://your-domain.com/chatbot-widget-ai.js"></script>
<script>
  FuneralChatbotAI.init({
    apiUrl: 'https://your-api-domain.com/api/chat',
    position: 'bottom-right',
    primaryColor: '#2b4c7d',
    companyName: 'お葬式のとねや',
    phoneNumber: '0120-000-000'
  });
</script>
```

## 📊 API エンドポイント

### POST /api/chat

チャットメッセージを送信：

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "料金について教えてください"}'
```

### GET /api/health

システムの健全性を確認：

```bash
curl http://localhost:3000/api/health
```

### GET /api/knowledge

知識データベースの概要を取得：

```bash
curl http://localhost:3000/api/knowledge
```

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. API Keyエラー

```
Error: GEMINI_API_KEY is not set
```

**解決方法**: `.env`ファイルでGEMINI_API_KEYを正しく設定してください。

#### 2. CORS エラー

```
Access to fetch at 'http://localhost:3000' from origin 'https://your-site.com' has been blocked by CORS policy
```

**解決方法**: `server.js`でCORS設定を調整してください。

#### 3. チャットボタンが表示されない

- JavaScriptファイルのパスが正しいか確認
- ブラウザのコンソールでエラーを確認
- CSSの競合がないか確認

## 🚀 パフォーマンス最適化

### 1. レスポンス時間の改善

- 知識データベースのサイズを最適化
- 不要な情報を削除
- APIリクエストのキャッシュ実装

### 2. 可用性の向上

- 複数のAPIキーでのフェールオーバー
- キーワードベースのフォールバック機能
- ヘルスチェック機能の活用

## 📈 監視とログ

### ログの確認

```bash
# サーバーログの確認
npm start

# デバッグモードの有効化
FuneralChatbotAI.init({
  isDebugMode: true
});
```

### メトリクスの監視

- API応答時間
- エラー率
- チャットボットの利用状況
- ユーザーの質問パターン

## 🛡️ セキュリティ

### 推奨事項

1. **APIキーの保護**: 環境変数で管理、リポジトリには含めない
2. **HTTPS使用**: 本番環境では必ずHTTPS通信
3. **レート制限**: 過度なリクエストを防ぐ
4. **入力検証**: ユーザー入力のサニタイズ

## 📞 サポート

問題が発生した場合：

1. このガイドの内容を確認
2. `http://localhost:3000/api/health`でシステム状態を確認
3. ブラウザの開発者ツールでエラーログを確認
4. 知識データベースの内容を確認

## 🔄 アップデート

### 知識データベースの更新

1. `funeral-knowledge-base.json`を編集
2. サーバーを再起動
3. 動作確認を実行

### システムの更新

1. 新しいバージョンをダウンロード
2. 依存関係を更新: `npm install`
3. 設定ファイルを確認・更新
4. テストを実行
5. 本番環境にデプロイ

---

## 🎉 完了！

セットアップが完了しました。高品質なAI対応チャットボットをお楽しみください！