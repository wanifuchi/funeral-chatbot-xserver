/**
 * レート制限ユーティリティ
 */
const { warn } = require('./logger');

// メモリベースのレート制限ストレージ（本番環境ではRedisを推奨）
const requestCounts = new Map();
const requestTimes = new Map();

/**
 * レート制限設定
 */
const RATE_LIMIT_CONFIG = {
  // IP単位の制限
  perIP: {
    maxRequests: 100,      // 1時間あたりの最大リクエスト数
    windowMs: 60 * 60 * 1000, // 1時間
    blockDurationMs: 60 * 60 * 1000 // ブロック期間（1時間）
  },
  // チャットAPI専用の制限
  chatAPI: {
    maxRequests: 30,       // 1時間あたりの最大リクエスト数
    windowMs: 60 * 60 * 1000, // 1時間
    blockDurationMs: 60 * 60 * 1000 // ブロック期間（1時間）
  },
  // その他のAPI
  otherAPI: {
    maxRequests: 200,      // 1時間あたりの最大リクエスト数
    windowMs: 60 * 60 * 1000, // 1時間
    blockDurationMs: 30 * 60 * 1000 // ブロック期間（30分）
  }
};

/**
 * クライアントIPアドレスを取得
 * @param {Object} req リクエストオブジェクト
 * @returns {string} IPアドレス
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * レート制限キーを生成
 * @param {string} ip IPアドレス
 * @param {string} endpoint エンドポイント名
 * @returns {string} レート制限キー
 */
function generateRateLimitKey(ip, endpoint) {
  return `${ip}:${endpoint}`;
}

/**
 * 期限切れのエントリをクリーンアップ
 * @param {string} key レート制限キー
 * @param {number} windowMs 時間窓（ミリ秒）
 */
function cleanupExpiredEntries(key, windowMs) {
  const now = Date.now();
  const times = requestTimes.get(key) || [];
  
  // 時間窓外のエントリを削除
  const validTimes = times.filter(time => now - time < windowMs);
  
  if (validTimes.length === 0) {
    requestTimes.delete(key);
    requestCounts.delete(key);
  } else {
    requestTimes.set(key, validTimes);
    requestCounts.set(key, validTimes.length);
  }
}

/**
 * レート制限チェック
 * @param {Object} req リクエストオブジェクト
 * @param {string} endpoint エンドポイント名（'chat', 'health', 'knowledge'等）
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: number }
 */
function checkRateLimit(req, endpoint) {
  const ip = getClientIP(req);
  const key = generateRateLimitKey(ip, endpoint);
  
  // 設定を取得
  const config = endpoint === 'chat' ? RATE_LIMIT_CONFIG.chatAPI : RATE_LIMIT_CONFIG.otherAPI;
  
  // 期限切れエントリのクリーンアップ
  cleanupExpiredEntries(key, config.windowMs);
  
  const now = Date.now();
  const currentCount = requestCounts.get(key) || 0;
  const times = requestTimes.get(key) || [];
  
  // 制限チェック
  if (currentCount >= config.maxRequests) {
    const oldestTime = times[0];
    const resetTime = oldestTime + config.windowMs;
    
    warn(`Rate limit exceeded for IP: ${ip}, endpoint: ${endpoint}`);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000)
    };
  }
  
  // リクエスト記録
  times.push(now);
  requestTimes.set(key, times);
  requestCounts.set(key, times.length);
  
  return {
    allowed: true,
    remaining: config.maxRequests - times.length,
    resetTime: now + config.windowMs,
    retryAfter: 0
  };
}

/**
 * レート制限ミドルウェア
 * @param {string} endpoint エンドポイント名
 * @returns {Function} ミドルウェア関数
 */
function rateLimitMiddleware(endpoint) {
  return (req, res, next) => {
    // 開発環境ではレート制限を無効化（オプション）
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }
    
    const result = checkRateLimit(req, endpoint);
    
    // レート制限ヘッダーを設定
    res.setHeader('X-RateLimit-Limit', endpoint === 'chat' ? RATE_LIMIT_CONFIG.chatAPI.maxRequests : RATE_LIMIT_CONFIG.otherAPI.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetTime);
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。',
        retryAfter: result.retryAfter
      });
    }
    
    next();
  };
}

/**
 * レート制限統計を取得（開発・デバッグ用）
 * @returns {Object} レート制限統計
 */
function getRateLimitStats() {
  if (process.env.NODE_ENV === 'production') {
    return { message: 'Statistics not available in production' };
  }
  
  return {
    totalKeys: requestCounts.size,
    entries: Array.from(requestCounts.entries()).map(([key, count]) => ({
      key,
      count,
      lastRequest: Math.max(...(requestTimes.get(key) || []))
    }))
  };
}

module.exports = {
  checkRateLimit,
  rateLimitMiddleware,
  getRateLimitStats,
  getClientIP
};