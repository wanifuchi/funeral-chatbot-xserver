# 🚀 とね屋チャットボット - 簡単導入ガイド

> Google Analytics風の簡単導入！1つのタグを貼り付けるだけで完了。

## ✨ 特徴

- **📱 レスポンシブ対応** - PC、スマホ、タブレットで最適表示
- **⚡ 高速動作** - 軽量設計でページ速度に影響なし
- **🎨 カスタマイズ可能** - 色、位置、メッセージを自由に変更
- **🔒 セキュア** - HTTPS、CSP、レート制限対応
- **🤖 AI搭載** - 具体的な料金情報を即答

## 🎯 導入方法

### 1. 最も簡単な導入

HTMLの`</body>`直前に以下を貼り付けるだけ：

```html
<script src="https://your-cdn.com/toneya-chatbot.js"></script>
<script>
  ToneyaChatbot.init({
    apiUrl: 'https://your-api-domain.com'
  });
</script>
```

### 2. Google Analytics風の導入

```html
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

## ⚙️ 設定オプション

| オプション | デフォルト | 説明 |
|-----------|------------|------|
| `apiUrl` | `http://localhost:3000` | バックエンドAPIのURL |
| `position` | `bottom-right` | 表示位置（`bottom-right`, `bottom-left`） |
| `primaryColor` | `#2b4c7d` | テーマカラー |
| `companyName` | `とね屋のお葬式` | 会社名 |
| `phoneNumber` | `0120-000-000` | 電話番号 |

## 🖥️ バックエンド設定

### 1. サーバー起動

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# GEMINI_API_KEY を設定してください

# サーバー起動
npm start
```

### 2. 本番環境での配置

詳細は [BACKEND-SETUP.md](BACKEND-SETUP.md) を参照してください。

## 🔧 動作確認

### 1. ローカルテスト

```bash
# サーバーを起動
node server.js

# ブラウザで確認
open http://localhost:3000/easy-embed-test.html
```

### 2. API動作確認

```bash
# ヘルスチェック
curl http://localhost:3000/api/health

# チャット機能テスト
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"料金を教えてください"}'
```

## 💬 機能一覧

### チャットボット機能
- ✅ 具体的な料金情報を即答
- ✅ 各プランの詳細説明
- ✅ 会員制度の説明
- ✅ クイック返信ボタン
- ✅ タイピングインジケーター
- ✅ 接続状態表示

### 対応する質問例
- 「料金を教えてください」
- 「家族葬の料金は？」
- 「直葬について教えて」
- 「会員制度について」
- 「生活保護葬について」

## 🎨 カスタマイズ例

### 色を変更
```javascript
ToneyaChatbot.init({
  apiUrl: 'https://your-api.com',
  primaryColor: '#dc3545' // 赤色
});
```

### 位置を変更
```javascript
ToneyaChatbot.init({
  apiUrl: 'https://your-api.com',
  position: 'bottom-left' // 左下
});
```

### 会社情報を変更
```javascript
ToneyaChatbot.init({
  apiUrl: 'https://your-api.com',
  companyName: 'カスタム葬儀社',
  phoneNumber: '0120-123-456'
});
```

## 📱 レスポンシブ対応

- **PC**: 右下（または左下）にフローティングボタン
- **スマホ**: 全画面表示でフルスクリーン体験
- **タブレット**: 適切なサイズで表示

## 🔒 セキュリティ

- **HTTPS必須**: 本番環境では必ずHTTPS使用
- **CORS設定**: 許可されたドメインのみアクセス可能
- **レート制限**: 過度なリクエストを防止
- **CSP対応**: セキュリティポリシーに準拠

## 📊 パフォーマンス

- **軽量**: 約25KB（gzip圧縮）
- **高速**: 初期化時間 < 100ms
- **非同期**: ページ読み込みをブロックしない

## 🐛 トラブルシューティング

### チャットボタンが表示されない
```javascript
// デバッグモードで確認
ToneyaChatbot.init({
  apiUrl: 'https://your-api.com',
  isDebugMode: true
});
```

### API接続エラー
```bash
# サーバーの状態確認
curl http://localhost:3000/api/health

# CORS設定の確認
curl -H "Origin: https://your-website.com" \
     -X OPTIONS \
     http://localhost:3000/api/chat
```

## 📞 サポート

- **技術サポート**: support@example.com
- **導入サポート**: 初期設定代行サービス
- **カスタマイズ**: 追加開発対応

## 🎉 完了！

これで、とね屋チャットボットがGoogle Analytics風に簡単導入できます。
何か問題があれば、上記のトラブルシューティングを参考にしてください。