/**
 * CORS設定 - XSERVER対応
 */
const corsOptions = {
  origin: function (origin, callback) {
    // 開発環境では全て許可
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // 本番環境では指定されたドメインのみ許可
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      /\.xserver\.jp$/,  // XSERVERの標準ドメイン
      /\.xsrv\.jp$/,     // XSERVERの標準ドメイン
      /localhost/,       // ローカル開発用
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * CORS ヘッダーを設定
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 * @returns {boolean} CORS許可の可否
 */
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  // 開発環境では全て許可
  if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return true;
  }
  
  // 本番環境では指定されたドメインのみ許可
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    /\.xserver\.jp$/,
    /\.xsrv\.jp$/,
    /localhost/,
  ].filter(Boolean);
  
  const isAllowed = !origin || allowedOrigins.some(allowed => 
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
  );
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return true;
  }
  
  return false;
}

/**
 * OPTIONSリクエスト（プリフライト）のハンドリング
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 * @returns {boolean} プリフライトリクエストかどうか
 */
function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    if (setCorsHeaders(req, res)) {
      res.status(200).end();
    } else {
      res.status(403).json({ error: 'CORS policy violation' });
    }
    return true;
  }
  return false;
}

module.exports = {
  corsOptions,
  setCorsHeaders,
  handlePreflight
};