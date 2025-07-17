# CORS設定ガイド

## 🔒 CORS設定の概要

Cross-Origin Resource Sharing（CORS）設定により、特定のドメインからのみAPIアクセスを許可します。

## 📋 設定済み許可ドメイン

### 自動許可ドメイン
- `*.xserver.jp` - XSERVERの標準ドメイン
- `*.xsrv.jp` - XSERVERの標準ドメイン
- `localhost` - ローカル開発用

### 手動設定ドメイン
Vercelの環境変数 `CORS_ORIGIN` で設定：

```env
CORS_ORIGIN=https://your-domain.com
```

## 🔧 Vercelでの環境変数設定

### 1. Vercelダッシュボードでの設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. プロジェクトを選択
3. **Settings** > **Environment Variables**
4. 以下の変数を追加：

```env
CORS_ORIGIN=https://your-xserver-domain.com
```

### 2. Vercel CLIでの設定

```bash
# 本番環境に設定
vercel env add CORS_ORIGIN
# 値を入力: https://your-xserver-domain.com

# 設定確認
vercel env ls
```

## 🌐 XSERVERドメインの例

### 独自ドメイン
```env
CORS_ORIGIN=https://your-domain.com
CORS_ORIGIN=https://www.your-domain.com
```

### XSERVERサブドメイン
```env
CORS_ORIGIN=https://your-site.xserver.jp
CORS_ORIGIN=https://your-site.xsrv.jp
```

## 🚨 CORS エラーの対処法

### よくあるエラー

1. **「Access to fetch at '...' from origin '...' has been blocked by CORS policy」**
   - 原因: ドメインが許可されていない
   - 対処: `CORS_ORIGIN` の設定を確認

2. **「No 'Access-Control-Allow-Origin' header is present」**
   - 原因: CORS設定が反映されていない
   - 対処: Vercelプロジェクトの再デプロイ

### デバッグ方法

#### 1. ヘルスチェックでCORS確認
```bash
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-project.vercel.app/api/health
```

#### 2. ブラウザコンソールでの確認
```javascript
// ブラウザのコンソールで実行
fetch('https://your-project.vercel.app/api/health')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('CORS Error:', error));
```

## 🔧 開発環境での設定

### 開発時のCORS無効化
```env
NODE_ENV=development
```

開発環境では全てのオリジンを許可します。

### ローカルテスト
```bash
# ローカルサーバーを起動
npm run dev

# または
vercel dev
```

## 📝 設定チェックリスト

- [ ] Vercelの環境変数 `CORS_ORIGIN` が設定済み
- [ ] XSERVERのドメインが正しく設定されている
- [ ] httpsプロトコルで設定されている
- [ ] Vercelプロジェクトがデプロイ済み
- [ ] ヘルスチェックAPIが正常に動作する
- [ ] チャットボットが正常に読み込まれる

## 🌟 本番環境での推奨設定

### 単一ドメイン
```env
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
```

### 複数ドメイン対応
現在の実装では単一ドメインのみサポート。
複数ドメインが必要な場合は、カンマ区切りで設定を拡張可能です。

## 🔍 トラブルシューティング

### 1. 設定が反映されない
- Vercelプロジェクトの再デプロイを実行
- ブラウザキャッシュをクリア
- 環境変数の設定値を再確認

### 2. 一部のリクエストがブロックされる
- プリフライトリクエストの設定を確認
- カスタムヘッダーの許可設定を確認

### 3. 開発環境でのみエラー
- `NODE_ENV=development` の設定を確認
- ローカルサーバーのポート設定を確認

## 📞 サポート

CORS設定で問題が発生した場合：
1. Vercelのログを確認
2. ブラウザのネットワークタブを確認
3. 環境変数の設定を再確認
4. 必要に応じてプロジェクトを再デプロイ

正しく設定されれば、XSERVERからVercelのAPIに安全にアクセスできます。