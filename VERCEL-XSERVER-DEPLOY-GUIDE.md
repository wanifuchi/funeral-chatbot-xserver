# Vercel × XSERVER デプロイガイド

## 📋 概要
- **バックエンド**: Vercel Functions（GitHubプッシュで自動デプロイ）
- **フロントエンド**: XSERVER（手動アップロード）

## 🚀 1. Vercelバックエンドのデプロイ

### Step 1: GitHubにプッシュ

```bash
# 現在のディレクトリで実行
git add .
git commit -m "feat: Vercel Functions対応"
git push origin main
```

### Step 2: Vercelプロジェクト作成

1. [Vercel](https://vercel.com/)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト名を設定（例：`funeral-chatbot`）
5. 「Deploy」をクリック

### Step 3: 環境変数設定

Vercelダッシュボード > Settings > Environment Variables で以下を設定：

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
CORS_ORIGIN=https://your-xserver-domain.com
NODE_ENV=production
```

**重要**: `CORS_ORIGIN`にはXSERVERのドメインを設定してください。

### Step 4: デプロイ完了確認

デプロイ完了後、以下のURLが利用可能になります：

- **メインURL**: `https://your-project.vercel.app`
- **チャットAPI**: `https://your-project.vercel.app/api/chat`
- **ヘルスチェック**: `https://your-project.vercel.app/api/health`
- **チャットボットJS**: `https://your-project.vercel.app/toneya-chatbot.js`

## 🖥️ 2. XSERVERフロントエンドのアップロード

### Step 1: HTMLファイルの作成

以下の内容でHTMLファイル（例：`index.html`）を作成：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>とね屋のお葬式</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2b4c7d;
            text-align: center;
            margin-bottom: 30px;
        }
        .content {
            line-height: 1.6;
            color: #333;
        }
        .contact-info {
            background-color: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
        }
        .phone {
            font-size: 24px;
            font-weight: bold;
            color: #2b4c7d;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>とね屋のお葬式</h1>
        
        <div class="content">
            <p>心を込めたお葬式で、大切な方をお見送りいたします。</p>
            <p>料金プランやご質問については、右下のチャットボットからお気軽にお問い合わせください。</p>
            
            <h2>サービス内容</h2>
            <ul>
                <li>直葬・火葬式（39,000円〜）</li>
                <li>家族葬（300,000円〜）</li>
                <li>一日葬（300,000円〜）</li>
                <li>一般葬（350,000円〜）</li>
                <li>自宅葬（600,000円〜）</li>
                <li>生活保護葬（0円）</li>
            </ul>
            
            <h2>会員制度</h2>
            <p>全プランで大幅割引！最大100,000円以上の割引が適用されます。</p>
        </div>
        
        <div class="contact-info">
            <p><strong>24時間365日対応</strong></p>
            <div class="phone">☎️ 0120-000-000</div>
            <p>通話無料・年中無休</p>
        </div>
    </div>

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
</body>
</html>
```

### Step 2: VercelURLの置き換え

**重要**: 上記HTMLファイルの以下の箇所を実際のVercelURLに置き換えてください：

```javascript
// 変更前
script.src = 'https://your-project.vercel.app/toneya-chatbot.js';
apiUrl: 'https://your-project.vercel.app'

// 変更後（例）
script.src = 'https://funeral-chatbot-abc123.vercel.app/toneya-chatbot.js';
apiUrl: 'https://funeral-chatbot-abc123.vercel.app'
```

### Step 3: XSERVERへのアップロード

1. **XSERVERファイルマネージャー**にログイン
2. **public_html**フォルダを開く
3. 作成したHTMLファイルをアップロード
4. 必要に応じて`index.html`にリネーム

### Step 4: 動作確認

1. XSERVERのURL（例：`https://your-domain.com`）にアクセス
2. チャットボットが右下に表示されることを確認
3. チャットボットをクリックして動作確認
4. 「料金について」などの質問を送信して応答を確認

## 🔧 3. 設定の調整

### CORS設定の確認

Vercelの環境変数`CORS_ORIGIN`がXSERVERのドメインと一致していることを確認：

```env
CORS_ORIGIN=https://your-xserver-domain.com
```

### カスタマイズオプション

チャットボットの見た目や設定をカスタマイズする場合：

```javascript
ToneyaChatbot.init({
  apiUrl: 'https://your-project.vercel.app',
  position: 'bottom-right',          // 位置: bottom-right, bottom-left
  primaryColor: '#2b4c7d',          // メインカラー
  companyName: 'とね屋のお葬式',      // 会社名
  phoneNumber: '0120-000-000'       // 電話番号
});
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

1. **チャットボットが表示されない**
   - VercelのURLが正しいか確認
   - ブラウザのコンソールでエラーを確認
   - CORS設定を確認

2. **チャットボットが応答しない**
   - Vercelのヘルスチェック（`/api/health`）を確認
   - 環境変数`GEMINI_API_KEY`の設定を確認
   - ネットワーク設定を確認

3. **CORS エラー**
   - `CORS_ORIGIN`環境変数がXSERVERのドメインと一致しているか確認
   - Vercelでプロジェクトを再デプロイ

### デバッグ方法

```javascript
// デバッグモードで初期化
ToneyaChatbot.init({
  apiUrl: 'https://your-project.vercel.app',
  isDebugMode: true  // コンソールに詳細ログを表示
});
```

## 📞 サポート

問題が発生した場合：
1. Vercelダッシュボードでログを確認
2. ブラウザのコンソールでエラーを確認
3. 設定ファイルを再確認

## 🎯 完了チェックリスト

- [ ] GitHubにプッシュ済み
- [ ] Vercelプロジェクトが作成済み
- [ ] 環境変数が設定済み
- [ ] VercelのURLが取得済み
- [ ] HTMLファイルが作成済み
- [ ] VercelのURLが実際のURLに置き換え済み
- [ ] XSERVERにアップロード済み
- [ ] チャットボットが正常に動作することを確認済み

この手順に従うことで、Vercel（バックエンド）とXSERVER（フロントエンド）の連携が完了します。