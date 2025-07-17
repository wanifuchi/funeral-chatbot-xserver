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
    apiUrl: 'https://your-project.vercel.app',
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

    // 初期化
    init: function(customConfig) {
      if (this.initialized) return;
      
      // カスタム設定を適用
      if (customConfig) {
        Object.assign(this.config, customConfig);
      }

      // CSSを挿入
      this.injectStyles();
      
      // HTMLを挿入
      this.injectHTML();
      
      // イベントリスナーを設定
      this.setupEventListeners();
      
      // API接続テスト
      this.testApiConnection();
      
      // ウェルカムメッセージを表示
      setTimeout(() => {
        this.addMessage(this.config.welcomeMessage, 'bot');
      }, 1000);

      this.initialized = true;

      // デバッグモードの場合、コンソールに情報を表示
      if (this.config.isDebugMode) {
        console.log('ToneyaChatbot initialized with config:', this.config);
      }
    },

    // スタイルを挿入
    injectStyles: function() {
      const style = document.createElement('style');
      style.textContent = `
        /* とね屋チャットボット CSS */
        #toneya-chatbot-button {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : 'left: 20px; bottom: 20px;'}
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, ${this.config.primaryColor}, #4a6d9a);
          border-radius: 50%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9998;
          transition: all 0.3s ease;
          border: none;
        }

        #toneya-chatbot-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        #toneya-chatbot-button.pulse {
          animation: toneya-pulse 2s infinite;
        }

        @keyframes toneya-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        #toneya-chatbot-button svg {
          width: 30px;
          height: 30px;
          fill: white;
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
        }

        #toneya-chatbot-window {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
          bottom: 100px;
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
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 20px;
          max-height: 100px;
          font-family: inherit;
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

        .toneya-typing-indicator {
          display: none;
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
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.19.22 2.34.6 3.41l-1.6 4.82 4.82-1.6c1.07.38 2.22.6 3.41.6 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.36-3.88-1l-3.12 1.04 1.04-3.12c-.64-1.15-1-2.47-1-3.88 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
        <div id="toneya-chatbot-badge">1</div>
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
          <div class="toneya-typing-indicator" id="toneya-typing-indicator">
            <div class="toneya-typing-dots">
              <div class="toneya-typing-dot"></div>
              <div class="toneya-typing-dot"></div>
              <div class="toneya-typing-dot"></div>
            </div>
            <span>入力中...</span>
          </div>
        </div>
        <div id="toneya-chatbot-input-container">
          <form id="toneya-chatbot-input-form">
            <textarea id="toneya-chatbot-input" 
                      placeholder="ご質問をどうぞ..." 
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

      // クイック返信ボタンを追加
      setTimeout(() => {
        this.addQuickReplies([
          '料金を教えて',
          '家族葬について',
          '直葬について',
          '会員制度について'
        ]);
      }, 2000);
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

      // Enterキーでの送信
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
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

    // メッセージを追加
    addMessage: function(text, sender) {
      const messagesContainer = document.getElementById('toneya-chatbot-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `toneya-message ${sender}`;
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      
      messageDiv.innerHTML = `
        <div class="toneya-message-content">
          ${text.replace(/\n/g, '<br>')}
          <div class="toneya-message-time">${timeStr}</div>
        </div>
      `;
      
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
          document.getElementById('toneya-chatbot-input').value = reply;
          this.sendMessage();
          quickRepliesDiv.remove();
        });
        quickRepliesDiv.appendChild(button);
      });
      
      messagesContainer.appendChild(quickRepliesDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // タイピングインジケーターを表示
    showTypingIndicator: function() {
      const indicator = document.getElementById('toneya-typing-indicator');
      indicator.style.display = 'flex';
      
      const messagesContainer = document.getElementById('toneya-chatbot-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // タイピングインジケーターを非表示
    hideTypingIndicator: function() {
      const indicator = document.getElementById('toneya-typing-indicator');
      indicator.style.display = 'none';
    },

    // テキストエリアの高さを調整
    adjustTextareaHeight: function() {
      const textarea = document.getElementById('toneya-chatbot-input');
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
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