/**
 * とね屋チャットボット - 簡単導入版
 * 
 * 使用方法:
 * 1. バックエンドサーバーを起動
 * 2. 以下のタグをHTMLの</body>直前に貼り付け:
 * 
 * <script src="https://your-domain.com/toneya-chatbot.js"></script>
 * <script>
 *   ToneyaChatbot.init({
 *     apiUrl: 'https://your-api-domain.com'
 *   });
 * </script>
 * 
 * または、自動初期化版:
 * <script src="https://your-domain.com/toneya-chatbot.js?apiUrl=https://your-api-domain.com"></script>
 */

(function() {
  'use strict';

  // 設定のデフォルト値
  const DEFAULT_CONFIG = {
    apiUrl: 'https://funeral-chatbot-xserver.vercel.app',
    position: 'bottom-right',
    primaryColor: '#2b4c7d',
    companyName: 'とね屋のお葬式',
    phoneNumber: '0120-000-000',
    welcomeMessage: 'こんにちは。とね屋のお葬式です。\n\n料金やプランについて、具体的にお答えいたします。\nお気軽にご質問ください。',
    maxRetries: 2,
    retryDelay: 1000,
    isDebugMode: false,
    autoInit: true
  };

  // URLパラメータから設定を取得
  function getConfigFromScript() {
    const script = document.currentScript || document.querySelector('script[src*="toneya-chatbot.js"]');
    if (!script) return {};
    
    const src = script.src;
    const url = new URL(src);
    const params = {};
    
    // URLパラメータを設定に変換
    if (url.searchParams.get('apiUrl')) {
      params.apiUrl = url.searchParams.get('apiUrl');
    }
    if (url.searchParams.get('position')) {
      params.position = url.searchParams.get('position');
    }
    if (url.searchParams.get('color')) {
      params.primaryColor = url.searchParams.get('color');
    }
    
    return params;
  }

  // チャットボットのメインオブジェクト
  window.ToneyaChatbot = {
    // 設定
    config: DEFAULT_CONFIG,
    
    // 初期化フラグ
    initialized: false,

    // IME入力状態フラグ
    isComposing: false,

    // 知識ベース（レコメンド質問用）
    knowledgeBase: null,

    // 直前のユーザー質問を保存（レコメンド質問用）
    lastUserQuestion: null,

    // 初期化
    init: function(customConfig) {
      if (this.initialized) return;
      
      // カスタム設定を適用
      if (customConfig) {
        Object.assign(this.config, customConfig);
      }

      // モバイル用viewport設定を強化
      this.enhanceViewportForMobile();

      // CSSを挿入
      this.injectStyles();
      
      // HTMLを挿入
      this.injectHTML();
      
      // イベントリスナーを設定
      this.setupEventListeners();
      
      // API接続テスト
      this.testApiConnection();
      
      // 知識ベースを読み込んでからウェルカムメッセージを表示
      this.loadKnowledgeBase().then(() => {
        setTimeout(() => {
          this.addMessage(this.config.welcomeMessage, 'bot');
        }, 1000);
      });

      this.initialized = true;

      // デバッグモードの場合、コンソールに情報を表示
      if (this.config.isDebugMode) {
        console.log('ToneyaChatbot initialized with config:', this.config);
      }
    },

    // モバイル用viewport設定を強化
    enhanceViewportForMobile: function() {
      // 既存のviewportメタタグを取得または作成
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      
      // モバイル拡大防止の設定
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
      
      // iOS Safari対応の追加設定
      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        const appleWebAppCapable = document.createElement('meta');
        appleWebAppCapable.name = 'apple-mobile-web-app-capable';
        appleWebAppCapable.content = 'yes';
        document.head.appendChild(appleWebAppCapable);
        
        const appleWebAppStatusBar = document.createElement('meta');
        appleWebAppStatusBar.name = 'apple-mobile-web-app-status-bar-style';
        appleWebAppStatusBar.content = 'default';
        document.head.appendChild(appleWebAppStatusBar);
      }
    },

    // スタイルを挿入
    injectStyles: function() {
      const style = document.createElement('style');
      style.textContent = `
        /* とね屋チャットボット CSS */
        #toneya-chatbot-button {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'right: 20px; bottom: 80px;' : 'left: 20px; bottom: 80px;'}
          width: auto;
          height: auto;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: flex-end;
          z-index: 9998;
          transition: all 0.3s ease;
          flex-direction: column;
          align-items: flex-end;
        }

        #toneya-chatbot-button:hover {
          transform: scale(1.05);
        }

        #toneya-chatbot-button.pulse {
          animation: toneya-chat-pulse 2s infinite;
        }

        @keyframes toneya-chat-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        .toneya-chat-bubble {
          position: relative;
          background: linear-gradient(135deg, #a0342d, #c4453c);
          color: white;
          padding: 12px 18px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          box-shadow: 0 4px 15px rgba(160, 52, 45, 0.3);
          white-space: nowrap;
          animation: toneya-bubble-appear 0.5s ease-out;
          line-height: 1.4;
        }

        .toneya-chat-bubble::after {
          content: '';
          position: absolute;
          bottom: -8px;
          right: 20px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #a0342d;
        }

        .toneya-chat-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          border: 3px solid white;
          position: relative;
          overflow: hidden;
        }

        .toneya-chat-avatar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #2b4c7d, #4a6d9a);
          opacity: 0.1;
          border-radius: 50%;
        }

        .toneya-chat-avatar-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #2b4c7d, #4a6d9a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .toneya-chat-avatar-icon::before {
          content: '💬';
          font-size: 20px;
          color: white;
        }

        @keyframes toneya-bubble-appear {
          0% { 
            opacity: 0; 
            transform: translateY(10px) scale(0.9);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }

        .toneya-chat-bubble:hover {
          background: linear-gradient(135deg, #b83b34, #d44a41);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(160, 52, 45, 0.4);
        }

        .toneya-chat-avatar:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        /* より可愛い追加アニメーション */
        @keyframes toneya-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .toneya-chat-bubble {
          animation: toneya-float 3s ease-in-out infinite;
        }

        .toneya-chat-avatar {
          animation: toneya-float 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        /* クリック時のエフェクト */
        #toneya-chatbot-button:active .toneya-chat-bubble {
          transform: scale(0.95);
        }

        #toneya-chatbot-button:active .toneya-chat-avatar {
          transform: scale(0.95);
        }

        #toneya-chatbot-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          display: none;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid white;
          z-index: 10001;
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          #toneya-chatbot-button {
            ${this.config.position === 'bottom-right' ? 'right: 15px; bottom: 70px;' : 'left: 15px; bottom: 70px;'}
          }
          
          .toneya-chat-bubble {
            font-size: 12px;
            padding: 10px 15px;
          }
          
          .toneya-chat-avatar {
            width: 60px;
            height: 60px;
          }
          
          .toneya-chat-avatar-icon {
            width: 35px;
            height: 35px;
          }
          
          .toneya-chat-avatar-icon::before {
            font-size: 18px;
          }
        }

        @media (max-width: 480px) {
          .toneya-chat-bubble {
            font-size: 11px;
            padding: 8px 12px;
          }
          
          .toneya-chat-avatar {
            width: 55px;
            height: 55px;
          }
          
          .toneya-chat-avatar-icon {
            width: 30px;
            height: 30px;
          }
          
          .toneya-chat-avatar-icon::before {
            font-size: 16px;
          }
        }

        #toneya-chatbot-window {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
          bottom: 160px;
          width: 380px;
          height: 550px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          display: none;
          flex-direction: column;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          overflow: hidden;
        }

        @media (max-width: 480px) {
          #toneya-chatbot-window {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
        }

        #toneya-chatbot-header {
          background: linear-gradient(135deg, ${this.config.primaryColor}, #4a6d9a);
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #toneya-chatbot-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        #toneya-chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.3s;
        }

        #toneya-chatbot-close:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        #toneya-chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background-color: #f8f9fa;
        }

        .toneya-message {
          display: flex;
          margin-bottom: 16px;
          animation: toneya-message-fade-in 0.3s ease-out;
        }

        @keyframes toneya-message-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .toneya-message.user {
          justify-content: flex-end;
        }

        .toneya-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .toneya-message.bot .toneya-message-content {
          background-color: white;
          color: #333;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 6px;
        }

        .toneya-message.user .toneya-message-content {
          background-color: ${this.config.primaryColor};
          color: white;
          border-bottom-right-radius: 6px;
        }

        .toneya-message-time {
          font-size: 11px;
          color: #666;
          margin-top: 4px;
          text-align: right;
        }

        .toneya-message.bot .toneya-message-time {
          text-align: left;
        }

        #toneya-chatbot-input-container {
          border-top: 1px solid #e0e0e0;
          padding: 16px;
          background-color: white;
        }

        #toneya-chatbot-input-form {
          display: flex;
          gap: 8px;
        }

        #toneya-chatbot-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 16px;
          outline: none;
          resize: none;
          min-height: 20px;
          max-height: 100px;
          font-family: inherit;
          -webkit-text-size-adjust: 100%;
          -webkit-appearance: none;
          transform: translateZ(0);
        }

        #toneya-chatbot-input:focus {
          border-color: ${this.config.primaryColor};
          box-shadow: 0 0 0 2px rgba(43, 76, 125, 0.1);
        }

        #toneya-chatbot-send {
          background-color: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        #toneya-chatbot-send:hover {
          background-color: #1e3a5f;
          transform: scale(1.05);
        }

        #toneya-chatbot-send:disabled {
          background-color: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        #toneya-chatbot-send.composing {
          background-color: #9e9e9e;
          cursor: default;
          opacity: 0.7;
        }

        .toneya-typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background-color: white;
          border-radius: 18px;
          border: 1px solid #e0e0e0;
          margin-bottom: 16px;
          border-bottom-left-radius: 6px;
          max-width: 80%;
        }

        .toneya-typing-dots {
          display: flex;
          gap: 4px;
        }

        .toneya-typing-dot {
          width: 8px;
          height: 8px;
          background-color: #999;
          border-radius: 50%;
          animation: toneya-typing 1.4s infinite;
        }

        .toneya-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .toneya-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes toneya-typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }

        .toneya-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          margin: 8px 0;
          border-left: 4px solid #c62828;
          font-size: 13px;
        }

        .toneya-connection-status {
          padding: 8px 16px;
          text-align: center;
          font-size: 12px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }

        .toneya-connection-status.online {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        .toneya-connection-status.offline {
          background-color: #ffebee;
          color: #c62828;
        }

        .toneya-quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .toneya-quick-reply {
          background-color: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .toneya-quick-reply:hover {
          background-color: #1e3a5f;
          transform: translateY(-1px);
        }

        /* メッセージ内リンクのスタイル */
        .toneya-message-content a {
          color: ${this.config.primaryColor};
          text-decoration: underline;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .toneya-message-content a:hover {
          color: #1e3a5f;
          text-decoration: none;
        }

        .toneya-message-content a:visited {
          color: #5a7ab8;
        }

        /* スクロールバーのスタイル */
        #toneya-chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        #toneya-chatbot-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        #toneya-chatbot-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        #toneya-chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `;
      document.head.appendChild(style);
    },

    // HTMLを挿入
    injectHTML: function() {
      // チャットボタン
      const button = document.createElement('button');
      button.id = 'toneya-chatbot-button';
      button.className = 'pulse';
      button.innerHTML = `
        <div class="toneya-chat-bubble">
          チャットで<br>お問い合わせ
        </div>
        <div class="toneya-chat-avatar">
          <div class="toneya-chat-avatar-icon"></div>
          <div id="toneya-chatbot-badge">1</div>
        </div>
      `;
      document.body.appendChild(button);

      // チャットウィンドウ
      const chatWindow = document.createElement('div');
      chatWindow.id = 'toneya-chatbot-window';
      chatWindow.innerHTML = `
        <div id="toneya-chatbot-header">
          <h3>
            <span id="toneya-chatbot-status">●</span>
            ${this.config.companyName}
          </h3>
          <button id="toneya-chatbot-close">×</button>
        </div>
        <div id="toneya-chatbot-connection-status" class="toneya-connection-status">
          接続中...
        </div>
        <div id="toneya-chatbot-messages">
        </div>
        <div id="toneya-chatbot-input-container">
          <form id="toneya-chatbot-input-form">
            <textarea id="toneya-chatbot-input" 
                      placeholder="ご質問をどうぞ（Enterで送信）..." 
                      rows="1"></textarea>
            <button type="submit" id="toneya-chatbot-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(chatWindow);

      // 初回のクイック返信ボタンを追加（ウェルカムメッセージ後に追加される）
      // addMessage('bot')で自動的に追加されるため、ここでは削除
    },

    // イベントリスナーを設定
    setupEventListeners: function() {
      const button = document.getElementById('toneya-chatbot-button');
      const window = document.getElementById('toneya-chatbot-window');
      const closeBtn = document.getElementById('toneya-chatbot-close');
      const form = document.getElementById('toneya-chatbot-input-form');
      const input = document.getElementById('toneya-chatbot-input');

      // チャットボタンクリック
      button.addEventListener('click', () => {
        this.toggleChat();
      });

      // 閉じるボタンクリック
      closeBtn.addEventListener('click', () => {
        this.closeChat();
      });

      // フォーム送信
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });

      // テキストエリアのリサイズ
      input.addEventListener('input', () => {
        this.adjustTextareaHeight();
      });

      // IME入力開始
      input.addEventListener('compositionstart', () => {
        this.isComposing = true;
        this.updateSendButtonState();
      });

      // IME入力終了
      input.addEventListener('compositionend', () => {
        this.isComposing = false;
        this.updateSendButtonState();
      });

      // モバイル拡大防止の追加対策
      input.addEventListener('focus', () => {
        this.preventMobileZoom();
      });
      
      input.addEventListener('blur', () => {
        this.restoreMobileZoom();
      });

      // Enterキーでの送信（IME対応）
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !this.isComposing) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // ウィンドウ外クリックで閉じる
      document.addEventListener('click', (e) => {
        if (!window.contains(e.target) && !button.contains(e.target) && window.style.display === 'flex') {
          // this.closeChat(); // コメントアウト：誤作動を防ぐ
        }
      });
    },

    // チャット表示/非表示切り替え
    toggleChat: function() {
      const window = document.getElementById('toneya-chatbot-window');
      if (window.style.display === 'flex') {
        this.closeChat();
      } else {
        this.openChat();
      }
    },

    // チャットを開く
    openChat: function() {
      const window = document.getElementById('toneya-chatbot-window');
      const badge = document.getElementById('toneya-chatbot-badge');
      
      window.style.display = 'flex';
      badge.style.display = 'none';
      
      // 入力フィールドにフォーカス
      setTimeout(() => {
        document.getElementById('toneya-chatbot-input').focus();
      }, 300);
    },

    // チャットを閉じる
    closeChat: function() {
      const window = document.getElementById('toneya-chatbot-window');
      window.style.display = 'none';
    },

    // メッセージを送信
    sendMessage: function() {
      const input = document.getElementById('toneya-chatbot-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      // ユーザーの質問を保存（レコメンド質問用）
      this.lastUserQuestion = message;
      
      // ユーザーメッセージを表示
      this.addMessage(message, 'user');
      
      // 入力をクリア
      input.value = '';
      this.adjustTextareaHeight();
      
      // タイピングインジケーターを表示
      this.showTypingIndicator();
      
      // APIにメッセージを送信
      this.sendToAPI(message);
    },

    // APIにメッセージを送信
    sendToAPI: function(message) {
      const apiUrl = new URL('/api/chat', this.config.apiUrl || window.location.origin).href;
      
      this.fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.hideTypingIndicator();
        
        if (data.answer) {
          this.addMessage(data.answer, 'bot');
        } else {
          this.addMessage('申し訳ございません。システムエラーが発生しました。お電話（' + this.config.phoneNumber + '）でお問い合わせください。', 'bot');
        }
      })
      .catch(error => {
        this.hideTypingIndicator();
        console.error('API Error:', error);
        this.handleApiError(error);
      });
    },

    // リトライ機能付きfetch
    fetchWithRetry: function(url, options, retryCount = 0) {
      return fetch(url, options)
        .then(response => {
          if (!response.ok && retryCount < this.config.maxRetries) {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                this.fetchWithRetry(url, options, retryCount + 1)
                  .then(resolve)
                  .catch(reject);
              }, this.config.retryDelay);
            });
          }
          return response;
        })
        .catch(error => {
          if (retryCount < this.config.maxRetries) {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                this.fetchWithRetry(url, options, retryCount + 1)
                  .then(resolve)
                  .catch(reject);
              }, this.config.retryDelay);
            });
          }
          throw error;
        });
    },

    // エラーハンドリング
    handleApiError: function(error) {
      let errorMessage = '申し訳ございません。';
      
      if (error.message.includes('HTTP error! status: 5')) {
        errorMessage += 'サーバーに問題が発生しています。\n\nしばらく時間をおいてから再度お試しください。';
      } else if (error.message.includes('HTTP error! status: 4')) {
        errorMessage += 'リクエストに問題があります。\n\nページを再読み込みしてお試しください。';
      } else {
        errorMessage += '接続エラーが発生しました。\n\nネットワーク接続を確認してください。';
      }
      
      errorMessage += '\n\nお急ぎの場合は、お電話（' + this.config.phoneNumber + '）でお問い合わせください。';
      this.addMessage(errorMessage, 'bot');
    },

    // API接続テスト
    testApiConnection: function() {
      const statusElement = document.getElementById('toneya-chatbot-connection-status');
      const statusIcon = document.getElementById('toneya-chatbot-status');
      
      const healthUrl = new URL('/api/health', this.config.apiUrl || window.location.origin).href;
      
      fetch(healthUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'OK') {
            statusElement.textContent = 'オンライン';
            statusElement.className = 'toneya-connection-status online';
            statusIcon.style.color = '#4CAF50';
          } else {
            throw new Error('API not healthy');
          }
        })
        .catch(error => {
          statusElement.textContent = 'オフライン';
          statusElement.className = 'toneya-connection-status offline';
          statusIcon.style.color = '#f44336';
          console.error('API connection failed:', error);
        });
    },

    // URLを検出してリンク化する関数
    linkifyUrls: function(text) {
      // 信頼できるドメインのみリンク化
      const trustedDomains = ['kobami.biz', 'toneya-osohshiki.com'];
      // より厳密なURL検出（句読点、括弧、日本語文字を除外）
      const urlRegex = /(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+?)(?=[。、！？\s\n\r）)です。から]|$)/g;
      
      return text.replace(urlRegex, function(match, url) {
        // URLの末尾から不要な文字を除去
        const cleanUrl = url.replace(/[。、！？）)]+$/, '');
        
        // ドメインチェック
        try {
          const urlObj = new URL(cleanUrl);
          const domain = urlObj.hostname.replace('www.', '');
          
          if (trustedDomains.some(trusted => domain.includes(trusted))) {
            return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`;
          }
        } catch (e) {
          // 無効なURL
        }
        return match; // リンク化しない
      });
    },

    // 知識ベースを読み込む関数
    loadKnowledgeBase: async function() {
      if (this.knowledgeBase) return this.knowledgeBase;
      
      try {
        const response = await fetch(new URL('/api/knowledge', this.config.apiUrl || window.location.origin).href);
        if (response.ok) {
          this.knowledgeBase = await response.json();
        }
      } catch (error) {
        console.log('知識ベースの読み込みに失敗しました:', error);
      }
      return this.knowledgeBase;
    },

    // レコメンド質問を取得する関数（直前のユーザー質問に基づく）
    getRecommendedQuestions: function(lastBotMessage) {
      if (!this.knowledgeBase || !this.knowledgeBase.recommendedQuestions) {
        return [
          '料金を教えて',
          '家族葬について',
          '直葬について',
          '会員制度について'
        ];
      }

      const { recommendedQuestions, questionMapping } = this.knowledgeBase;
      const userQuestion = this.lastUserQuestion || '';
      
      // 1. 直前のユーザー質問に基づく関連質問を優先
      const relatedQuestions = this.getRelatedQuestions(userQuestion, recommendedQuestions);
      if (relatedQuestions.length > 0) {
        return relatedQuestions;
      }
      
      // 2. bot回答に基づくカテゴリ判定（フォールバック）
      if (questionMapping && questionMapping.keywords) {
        for (const [keyword, category] of Object.entries(questionMapping.keywords)) {
          if (lastBotMessage.includes(keyword)) {
            return recommendedQuestions[category] || recommendedQuestions.general;
          }
        }
      }
      
      // 3. デフォルトの一般的な質問
      return recommendedQuestions.general || recommendedQuestions[Object.keys(recommendedQuestions)[0]];
    },

    // 特定の質問に関連する質問を取得
    getRelatedQuestions: function(userQuestion, recommendedQuestions) {
      const lowerQuestion = userQuestion.toLowerCase();
      
      // 具体的な関連質問マッピング
      const relatedMapping = {
        // 料金関連
        '料金': ['一番安いプランは？', '会員になるとどのくらい安くなる？', '支払い方法は？', '追加費用はかかりますか？'],
        '価格': ['一番安いプランは？', '会員になるとどのくらい安くなる？', '見積もりをお願いしたい', '分割払いは可能？'],
        '費用': ['一番安いプランは？', '会員になるとどのくらい安くなる？', '追加費用はかかりますか？', '支払い方法は？'],
        '安い': ['一番安いプランは？', '会員になるとどのくらい安くなる？', '直葬について', '会員制度について'],
        
        // プラン関連
        '家族葬': ['家族葬の詳細を教えて', 'プランの違いを教えて', '一日葬との違いは？', '一般葬との違いは？'],
        '直葬': ['直葬の詳細を教えて', 'プランの違いを教えて', '家族葬との違いは？', '一番安いプランは？'],
        '一日葬': ['一日葬の詳細を教えて', 'プランの違いを教えて', '家族葬との違いは？', '一般葬との違いは？'],
        '一般葬': ['一般葬の詳細を教えて', 'プランの違いを教えて', '家族葬との違いは？', '一日葬との違いは？'],
        '自宅葬': ['自宅葬は可能？', 'プランの違いを教えて', '家族葬との違いは？', '設備について'],
        'プラン': ['プランの違いを教えて', 'どのプランがおすすめ？', '一番安いプランは？', '料金を教えて'],
        
        // 宗教関連
        '宗教': ['仏式の葬儀について', '神式の葬儀について', '無宗教の葬儀はできる？', '宗派がわからない場合は？'],
        '仏式': ['仏式の葬儀について', '宗派がわからない場合は？', 'お寺を紹介してもらえる？', '神式との違いは？'],
        '神式': ['神式の葬儀について', '仏式との違いは？', '無宗教の葬儀はできる？', '宗教について'],
        '無宗教': ['無宗教の葬儀はできる？', '宗教について', '仏式について', '神式について'],
        '創価学会': ['創価学会の葬儀は？', '宗教について', '仏式について', '無宗教の葬儀はできる？'],
        
        // 施設関連
        '斎場': ['近くの斎場を教えて', '駐車場はありますか？', '宿泊はできる？', '家族控室はある？'],
        '会場': ['近くの斎場を教えて', '駐車場はありますか？', '宿泊はできる？', 'バリアフリー対応は？'],
        '駐車場': ['駐車場はありますか？', '近くの斎場を教えて', '宿泊はできる？', '家族控室はある？'],
        '宿泊': ['宿泊はできる？', '近くの斎場を教えて', '駐車場はありますか？', '家族控室はある？'],
        
        // 会員制度関連
        '会員': ['会員登録の方法は？', '会員になるメリットは？', '年会費はかかる？', 'とね屋倶楽部とは？'],
        '登録': ['会員登録の方法は？', '無料会員との違いは？', 'すぐに会員になれる？', '年会費はかかる？'],
        '倶楽部': ['とね屋倶楽部とは？', '会員登録の方法は？', '無料会員との違いは？', '年会費はかかる？'],
        
        // 緊急・サービス関連
        '緊急': ['今すぐ相談したい', '緊急時の連絡先は？', '深夜でも対応してくれる？', 'すぐに来てもらえる？'],
        '急ぎ': ['今すぐ相談したい', '緊急時の連絡先は？', '深夜でも対応してくれる？', 'すぐに来てもらえる？'],
        '深夜': ['深夜でも対応してくれる？', '緊急時の連絡先は？', '今すぐ相談したい', '24時間対応ですか？'],
        'サービス': ['事前相談について', 'アフターサポートは？', '供花の注文はできる？', '送迎サービスは？'],
        '相談': ['事前相談について', '今すぐ相談したい', '緊急時の連絡先は？', '24時間対応ですか？'],
        
        // 流れ・手続き関連
        '流れ': ['手続きを教えて', '事前相談について', '病院からの搬送は？', 'アフターサポートは？'],
        '手続き': ['手続きを教えて', '流れについて', '病院からの搬送は？', '事前相談について']
      };
      
      // ユーザーの質問に含まれるキーワードに基づいて関連質問を選択
      for (const [keyword, related] of Object.entries(relatedMapping)) {
        if (lowerQuestion.includes(keyword)) {
          return related;
        }
      }
      
      return [];
    },

    // メッセージを追加
    addMessage: function(text, sender) {
      const messagesContainer = document.getElementById('toneya-chatbot-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `toneya-message ${sender}`;
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      
      // URLをリンク化
      const linkedText = this.linkifyUrls(text);
      
      messageDiv.innerHTML = `
        <div class="toneya-message-content">
          ${linkedText.replace(/\n/g, '<br>')}
          <div class="toneya-message-time">${timeStr}</div>
        </div>
      `;
      
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // botメッセージの場合、レコメンド質問を追加
      if (sender === 'bot') {
        setTimeout(() => {
          this.addRecommendedQuestions(text);
        }, 500);
      }
    },

    // レコメンド質問を追加
    addRecommendedQuestions: function(lastBotMessage) {
      // 既存のレコメンド質問を削除
      const existingQuestions = document.querySelectorAll('.toneya-quick-replies');
      existingQuestions.forEach(q => q.remove());
      
      const questions = this.getRecommendedQuestions(lastBotMessage);
      
      // ランダムに3-4個選択
      const selectedQuestions = this.shuffleArray([...questions]).slice(0, Math.min(4, questions.length));
      
      if (selectedQuestions.length > 0) {
        this.addQuickReplies(selectedQuestions);
      }
    },

    // 配列をシャッフルする関数
    shuffleArray: function(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    // クイック返信を追加
    addQuickReplies: function(replies) {
      const messagesContainer = document.getElementById('toneya-chatbot-messages');
      const quickRepliesDiv = document.createElement('div');
      quickRepliesDiv.className = 'toneya-quick-replies';
      
      replies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'toneya-quick-reply';
        button.textContent = reply;
        button.addEventListener('click', () => {
          // 既存のクイック返信ボタンを削除
          quickRepliesDiv.remove();
          
          // 入力フィールドに質問を設定
          document.getElementById('toneya-chatbot-input').value = reply;
          
          // メッセージを送信
          this.sendMessage();
        });
        quickRepliesDiv.appendChild(button);
      });
      
      messagesContainer.appendChild(quickRepliesDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // タイピングインジケーターを表示
    showTypingIndicator: function() {
      // 既存のインジケーターを削除
      this.hideTypingIndicator();
      
      const messagesContainer = document.getElementById('toneya-chatbot-messages');
      
      // デバッグ用ログ（本番環境では削除可能）
      if (this.config.isDebugMode) {
        console.log('showTypingIndicator called');
      }
      
      // 新しいタイピングインジケーターを動的に生成
      const indicator = document.createElement('div');
      indicator.className = 'toneya-typing-indicator';
      indicator.id = 'toneya-typing-indicator';
      indicator.style.display = 'flex'; // 確実に表示
      indicator.innerHTML = `
        <div class="toneya-typing-dots">
          <div class="toneya-typing-dot"></div>
          <div class="toneya-typing-dot"></div>
          <div class="toneya-typing-dot"></div>
        </div>
        <span>入力中...</span>
      `;
      
      // メッセージコンテナの最後に追加（ユーザーの質問の直後）
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // タイピングインジケーターを非表示
    hideTypingIndicator: function() {
      // 動的に生成されたインジケーターを検索して削除
      const indicators = document.querySelectorAll('.toneya-typing-indicator');
      indicators.forEach(indicator => indicator.remove());
    },

    // テキストエリアの高さを調整
    adjustTextareaHeight: function() {
      const textarea = document.getElementById('toneya-chatbot-input');
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    },

    // 送信ボタンの状態を更新
    updateSendButtonState: function() {
      const sendButton = document.getElementById('toneya-chatbot-send');
      if (this.isComposing) {
        sendButton.classList.add('composing');
        sendButton.title = '日本語入力中...';
      } else {
        sendButton.classList.remove('composing');
        sendButton.title = 'メッセージを送信';
      }
    },

    // モバイル拡大防止
    preventMobileZoom: function() {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
      }
    },

    // モバイル拡大復元
    restoreMobileZoom: function() {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
      }
    }
  };

  // スクリプトパラメータから設定を取得
  const scriptConfig = getConfigFromScript();
  
  // 自動初期化
  if (scriptConfig.apiUrl || DEFAULT_CONFIG.autoInit) {
    // DOMが読み込まれた後に初期化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        ToneyaChatbot.init(scriptConfig);
      });
    } else {
      ToneyaChatbot.init(scriptConfig);
    }
  }

})();