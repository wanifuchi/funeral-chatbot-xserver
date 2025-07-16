/**
 * AI対応葬儀社向けチャットボットウィジェット
 * お葬式のとねや様専用（AI統合版）
 * 
 * 使用方法:
 * 1. バックエンドサーバーを起動
 * 2. このファイルをHTMLで読み込み
 * 3. FuneralChatbotAI.init() を実行
 */

(function() {
  'use strict';

  // チャットボットのメインオブジェクト
  window.FuneralChatbotAI = {
    // 設定
    config: {
      apiUrl: 'http://localhost:3000/api/chat',
      position: 'bottom-right',
      primaryColor: '#2b4c7d',
      companyName: 'お葬式のとねや',
      phoneNumber: '0120-000-000',
      welcomeMessage: 'こんにちは。お葬式のとねやです。\nご葬儀に関するご質問に詳しくお答えいたします。\n\n以下のボタンから、またはお気軽にご質問をお書きください。',
      maxRetries: 3,
      retryDelay: 1000,
      isDebugMode: false
    },

    // 初期化
    init: function(customConfig) {
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

      // デバッグモードの場合、コンソールに情報を表示
      if (this.config.isDebugMode) {
        console.log('FuneralChatbotAI initialized with config:', this.config);
      }
    },

    // スタイルを挿入
    injectStyles: function() {
      const style = document.createElement('style');
      style.textContent = `
        /* チャットボタン */
        #funeral-chatbot-button {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : 'left: 20px; bottom: 20px;'}
          width: 60px;
          height: 60px;
          background-color: ${this.config.primaryColor};
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9998;
          transition: all 0.3s ease;
        }

        #funeral-chatbot-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        #funeral-chatbot-button.pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        #funeral-chatbot-button svg {
          width: 30px;
          height: 30px;
          fill: white;
        }

        /* 通知バッジ */
        #funeral-chatbot-badge {
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

        /* チャットウィンドウ */
        #funeral-chatbot-window {
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

        /* レスポンシブ対応 */
        @media (max-width: 480px) {
          #funeral-chatbot-window {
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

        /* ヘッダー */
        #funeral-chatbot-header {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, 20)});
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        #funeral-chatbot-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        #funeral-chatbot-status {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #4CAF50;
          border-radius: 50%;
          margin-right: 8px;
          animation: heartbeat 2s infinite;
        }

        @keyframes heartbeat {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        #funeral-chatbot-close {
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
          transition: background-color 0.3s ease;
        }

        #funeral-chatbot-close:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        /* メッセージエリア */
        #funeral-chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }

        #funeral-chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        #funeral-chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        #funeral-chatbot-messages::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 3px;
        }

        .chatbot-message {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          animation: slideIn 0.4s ease;
        }

        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .chatbot-message.user {
          justify-content: flex-end;
        }

        .chatbot-message-content {
          max-width: 80%;
          padding: 14px 18px;
          border-radius: 20px;
          word-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.5;
          font-size: 14px;
          position: relative;
        }

        .chatbot-message.bot .chatbot-message-content {
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
          color: #333;
          border: 1px solid #e0e0e0;
          border-radius: 20px 20px 20px 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .chatbot-message.user .chatbot-message-content {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, 20)});
          color: white;
          border-radius: 20px 20px 5px 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .chatbot-message-time {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 4px;
          text-align: right;
        }

        .chatbot-message.bot .chatbot-message-time {
          text-align: left;
        }

        /* 入力エリア */
        #funeral-chatbot-input-area {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          background-color: white;
        }

        #funeral-chatbot-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        #funeral-chatbot-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease;
          resize: none;
          min-height: 44px;
          max-height: 120px;
          font-family: inherit;
        }

        #funeral-chatbot-input:focus {
          border-color: ${this.config.primaryColor};
          box-shadow: 0 0 0 3px rgba(43, 76, 125, 0.1);
        }

        #funeral-chatbot-send {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, 20)});
          color: white;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        #funeral-chatbot-send:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        #funeral-chatbot-send:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* クイックアクション */
        .chatbot-quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .chatbot-quick-action {
          background: linear-gradient(135deg, white, #f8f9fa);
          border: 2px solid ${this.config.primaryColor};
          color: ${this.config.primaryColor};
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .chatbot-quick-action:hover {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, 20)});
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* 電話番号リンク */
        .chatbot-phone-link {
          color: ${this.config.primaryColor};
          font-weight: bold;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 12px;
          background-color: rgba(43, 76, 125, 0.1);
          transition: all 0.3s ease;
        }

        .chatbot-phone-link:hover {
          background-color: ${this.config.primaryColor};
          color: white;
          transform: scale(1.05);
        }

        /* タイピングインジケーター */
        .chatbot-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 14px 18px;
          background-color: #f0f0f0;
          border-radius: 20px 20px 20px 5px;
          max-width: 80px;
        }

        .chatbot-typing-dot {
          width: 8px;
          height: 8px;
          background-color: #999;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .chatbot-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .chatbot-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }

        /* エラーメッセージ */
        .chatbot-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          margin: 8px 0;
          border-left: 4px solid #c62828;
          font-size: 13px;
        }

        /* 接続ステータス */
        .chatbot-connection-status {
          padding: 8px 16px;
          text-align: center;
          font-size: 12px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }

        .chatbot-connection-status.online {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        .chatbot-connection-status.offline {
          background-color: #ffebee;
          color: #c62828;
        }
      `;
      document.head.appendChild(style);
    },

    // HTMLを挿入
    injectHTML: function() {
      // チャットボタン
      const button = document.createElement('div');
      button.id = 'funeral-chatbot-button';
      button.className = 'pulse';
      button.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.19.22 2.34.6 3.41l-1.6 4.82 4.82-1.6c1.07.38 2.22.6 3.41.6 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.36-3.88-1l-3.12 1.04 1.04-3.12c-.64-1.15-1-2.47-1-3.88 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
        <div id="funeral-chatbot-badge">1</div>
      `;
      document.body.appendChild(button);

      // チャットウィンドウ
      const window = document.createElement('div');
      window.id = 'funeral-chatbot-window';
      window.innerHTML = `
        <div id="funeral-chatbot-header">
          <h3>
            <span id="funeral-chatbot-status"></span>
            ${this.config.companyName}
          </h3>
          <button id="funeral-chatbot-close">&times;</button>
        </div>
        <div class="chatbot-connection-status" id="funeral-chatbot-connection-status">
          接続を確認中...
        </div>
        <div id="funeral-chatbot-messages"></div>
        <div id="funeral-chatbot-input-area">
          <div id="funeral-chatbot-input-wrapper">
            <textarea id="funeral-chatbot-input" placeholder="メッセージを入力..." rows="1"></textarea>
            <button id="funeral-chatbot-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div class="chatbot-quick-actions">
            <button class="chatbot-quick-action" data-message="料金について教えてください">料金について</button>
            <button class="chatbot-quick-action" data-message="葬儀プランの種類を教えてください">葬儀プラン</button>
            <button class="chatbot-quick-action" data-message="式場について教えてください">式場案内</button>
            <button class="chatbot-quick-action" data-message="緊急時の対応を教えてください">緊急対応</button>
          </div>
        </div>
      `;
      document.body.appendChild(window);
    },

    // イベントリスナーを設定
    setupEventListeners: function() {
      const button = document.getElementById('funeral-chatbot-button');
      const window = document.getElementById('funeral-chatbot-window');
      const closeBtn = document.getElementById('funeral-chatbot-close');
      const input = document.getElementById('funeral-chatbot-input');
      const sendBtn = document.getElementById('funeral-chatbot-send');
      const quickActions = document.querySelectorAll('.chatbot-quick-action');

      // チャットボタンクリック
      button.addEventListener('click', () => {
        const isVisible = window.style.display === 'flex';
        window.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
          input.focus();
          // 通知バッジを非表示
          document.getElementById('funeral-chatbot-badge').style.display = 'none';
          button.classList.remove('pulse');
        }
      });

      // 閉じるボタン
      closeBtn.addEventListener('click', () => {
        window.style.display = 'none';
      });

      // テキストエリアの自動リサイズ
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      });

      // メッセージ送信
      const sendMessage = () => {
        const message = input.value.trim();
        if (message) {
          this.handleUserMessage(message);
          input.value = '';
          input.style.height = 'auto';
        }
      };

      sendBtn.addEventListener('click', sendMessage);
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      // クイックアクション
      quickActions.forEach(action => {
        action.addEventListener('click', () => {
          const message = action.getAttribute('data-message');
          this.handleUserMessage(message);
        });
      });
    },

    // API接続テスト
    testApiConnection: async function() {
      try {
        const response = await fetch(this.config.apiUrl.replace('/chat', '/health'));
        const data = await response.json();
        
        if (response.ok) {
          this.updateConnectionStatus('online', 'AIアシスタント接続中');
          if (this.config.isDebugMode) {
            console.log('API Health Check:', data);
          }
        } else {
          this.updateConnectionStatus('offline', 'システムメンテナンス中');
        }
      } catch (error) {
        this.updateConnectionStatus('offline', 'オフラインモード');
        if (this.config.isDebugMode) {
          console.error('API Connection failed:', error);
        }
      }
    },

    // 接続ステータスの更新
    updateConnectionStatus: function(status, message) {
      const statusElement = document.getElementById('funeral-chatbot-connection-status');
      statusElement.textContent = message;
      statusElement.className = `chatbot-connection-status ${status}`;
    },

    // ユーザーメッセージを処理
    handleUserMessage: async function(message) {
      // ユーザーメッセージを表示
      this.addMessage(message, 'user');
      
      // 送信ボタンを無効化
      this.toggleSendButton(false);
      
      // タイピングインジケーターを表示
      this.showTypingIndicator();
      
      try {
        // API呼び出し
        const response = await this.callChatAPI(message);
        
        // タイピングインジケーターを非表示
        this.hideTypingIndicator();
        
        // 回答を表示
        this.addMessage(response.answer, 'bot');
        
        if (this.config.isDebugMode) {
          console.log('API Response:', response);
        }
        
      } catch (error) {
        this.hideTypingIndicator();
        
        // エラーメッセージを表示
        const errorMessage = `申し訳ございません。システムエラーが発生しました。

お急ぎの場合は、直接お電話でお問い合わせください。
☎️ ${this.config.phoneNumber}（24時間365日対応）

しばらく時間をおいてから再度お試しください。`;
        
        this.addMessage(errorMessage, 'bot');
        
        if (this.config.isDebugMode) {
          console.error('Chat API Error:', error);
        }
      } finally {
        // 送信ボタンを有効化
        this.toggleSendButton(true);
      }
    },

    // Chat APIを呼び出し
    callChatAPI: async function(message, retryCount = 0) {
      try {
        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: message }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
        
      } catch (error) {
        if (retryCount < this.config.maxRetries) {
          // リトライ
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          return this.callChatAPI(message, retryCount + 1);
        } else {
          throw error;
        }
      }
    },

    // 送信ボタンの状態を切り替え
    toggleSendButton: function(enabled) {
      const sendBtn = document.getElementById('funeral-chatbot-send');
      sendBtn.disabled = !enabled;
    },

    // メッセージを追加
    addMessage: function(text, sender) {
      const messagesContainer = document.getElementById('funeral-chatbot-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatbot-message ${sender}`;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'chatbot-message-content';
      
      // 電話番号をリンクに変換
      const linkedText = text.replace(
        /☎️?\s*([\d-]+)/g,
        '<a href="tel:$1" class="chatbot-phone-link">☎️ $1</a>'
      );
      
      contentDiv.innerHTML = linkedText;
      
      // タイムスタンプを追加
      const timeDiv = document.createElement('div');
      timeDiv.className = 'chatbot-message-time';
      timeDiv.textContent = new Date().toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      messageDiv.appendChild(contentDiv);
      messageDiv.appendChild(timeDiv);
      messagesContainer.appendChild(messageDiv);
      
      // スクロールを最下部に
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // 新しいメッセージの通知（チャットが閉じている場合）
      if (sender === 'bot' && document.getElementById('funeral-chatbot-window').style.display !== 'flex') {
        this.showNotification();
      }
    },

    // 通知を表示
    showNotification: function() {
      const button = document.getElementById('funeral-chatbot-button');
      const badge = document.getElementById('funeral-chatbot-badge');
      
      badge.style.display = 'flex';
      button.classList.add('pulse');
    },

    // タイピングインジケーターを表示
    showTypingIndicator: function() {
      const messagesContainer = document.getElementById('funeral-chatbot-messages');
      const typingDiv = document.createElement('div');
      typingDiv.id = 'chatbot-typing-indicator';
      typingDiv.className = 'chatbot-message bot';
      typingDiv.innerHTML = `
        <div class="chatbot-typing">
          <div class="chatbot-typing-dot"></div>
          <div class="chatbot-typing-dot"></div>
          <div class="chatbot-typing-dot"></div>
        </div>
      `;
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // タイピングインジケーターを非表示
    hideTypingIndicator: function() {
      const indicator = document.getElementById('chatbot-typing-indicator');
      if (indicator) {
        indicator.remove();
      }
    },

    // 色を調整するヘルパー関数
    adjustColor: function(color, amount) {
      const num = parseInt(color.replace('#', ''), 16);
      const r = Math.max(0, Math.min(255, (num >> 16) + amount));
      const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
      const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
      return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
  };
})();