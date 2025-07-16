/**
 * 葬儀社向けチャットボットウィジェット
 * お葬式のとねや様専用
 * 
 * 使用方法:
 * 1. このファイルをサーバーにアップロード
 * 2. chatbot-data.jsonをサーバーにアップロード
 * 3. HTMLに以下のコードを追加:
 *    <script src="/path/to/chatbot-widget.js"></script>
 *    <script>FuneralChatbot.init();</script>
 */

(function() {
  'use strict';

  // チャットボットのメインオブジェクト
  window.FuneralChatbot = {
    // 設定
    config: {
      position: 'bottom-right',
      primaryColor: '#2b4c7d',
      companyName: 'お葬式のとねや',
      phoneNumber: '0120-000-000',
      dataUrl: 'chatbot-data.json',
      welcomeMessage: 'こんにちは。お葬式のとねやです。\nご葬儀に関するご質問にお答えいたします。'
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
      
      // データを読み込み
      this.loadChatbotData();
      
      // ウェルカムメッセージを表示
      setTimeout(() => {
        this.addMessage(this.config.welcomeMessage, 'bot');
      }, 1000);
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
          transition: transform 0.3s ease;
        }

        #funeral-chatbot-button:hover {
          transform: scale(1.1);
        }

        #funeral-chatbot-button svg {
          width: 30px;
          height: 30px;
          fill: white;
        }

        /* チャットウィンドウ */
        #funeral-chatbot-window {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
          bottom: 100px;
          width: 350px;
          height: 500px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          display: none;
          flex-direction: column;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
          background-color: ${this.config.primaryColor};
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #funeral-chatbot-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
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
        }

        /* メッセージエリア */
        #funeral-chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background-color: #f8f9fa;
        }

        .chatbot-message {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chatbot-message.user {
          justify-content: flex-end;
        }

        .chatbot-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .chatbot-message.bot .chatbot-message-content {
          background-color: white;
          color: #333;
          border: 1px solid #e0e0e0;
        }

        .chatbot-message.user .chatbot-message-content {
          background-color: ${this.config.primaryColor};
          color: white;
        }

        /* 入力エリア */
        #funeral-chatbot-input-area {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          background-color: white;
          border-radius: 0 0 12px 12px;
        }

        #funeral-chatbot-input-wrapper {
          display: flex;
          gap: 8px;
        }

        #funeral-chatbot-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        #funeral-chatbot-input:focus {
          border-color: ${this.config.primaryColor};
        }

        #funeral-chatbot-send {
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
          transition: background-color 0.3s ease;
        }

        #funeral-chatbot-send:hover {
          background-color: ${this.adjustColor(this.config.primaryColor, -20)};
        }

        #funeral-chatbot-send:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        /* クイックアクション */
        .chatbot-quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .chatbot-quick-action {
          background-color: white;
          border: 1px solid ${this.config.primaryColor};
          color: ${this.config.primaryColor};
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .chatbot-quick-action:hover {
          background-color: ${this.config.primaryColor};
          color: white;
        }

        /* 電話番号リンク */
        .chatbot-phone-link {
          color: ${this.config.primaryColor};
          font-weight: bold;
          text-decoration: none;
        }

        /* タイピングインジケーター */
        .chatbot-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
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
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `;
      document.head.appendChild(style);
    },

    // HTMLを挿入
    injectHTML: function() {
      // チャットボタン
      const button = document.createElement('div');
      button.id = 'funeral-chatbot-button';
      button.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.19.22 2.34.6 3.41l-1.6 4.82 4.82-1.6c1.07.38 2.22.6 3.41.6 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.36-3.88-1l-3.12 1.04 1.04-3.12c-.64-1.15-1-2.47-1-3.88 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      `;
      document.body.appendChild(button);

      // チャットウィンドウ
      const window = document.createElement('div');
      window.id = 'funeral-chatbot-window';
      window.innerHTML = `
        <div id="funeral-chatbot-header">
          <h3>${this.config.companyName}</h3>
          <button id="funeral-chatbot-close">&times;</button>
        </div>
        <div id="funeral-chatbot-messages"></div>
        <div id="funeral-chatbot-input-area">
          <div id="funeral-chatbot-input-wrapper">
            <input type="text" id="funeral-chatbot-input" placeholder="メッセージを入力...">
            <button id="funeral-chatbot-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div class="chatbot-quick-actions">
            <button class="chatbot-quick-action" data-message="葬儀プランについて">葬儀プラン</button>
            <button class="chatbot-quick-action" data-message="式場について">式場案内</button>
            <button class="chatbot-quick-action" data-message="料金について">料金</button>
            <button class="chatbot-quick-action" data-message="相談したい">相談窓口</button>
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
        window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
        if (window.style.display === 'flex') {
          input.focus();
        }
      });

      // 閉じるボタン
      closeBtn.addEventListener('click', () => {
        window.style.display = 'none';
      });

      // メッセージ送信
      const sendMessage = () => {
        const message = input.value.trim();
        if (message) {
          this.handleUserMessage(message);
          input.value = '';
        }
      };

      sendBtn.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
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

    // チャットボットデータを読み込み
    loadChatbotData: function() {
      // デフォルトデータ（JSONファイルが読み込めない場合のフォールバック）
      const defaultData = {
        patterns: [
          {
            keywords: ['プラン', '葬儀プラン'],
            response: 'プランに関する詳細は、お電話でお問い合わせください。'
          }
        ],
        defaultResponse: 'お問い合わせありがとうございます。詳しくはお電話でご相談ください。'
      };

      // 外部JSONファイルから読み込み
      if (this.config.dataUrl) {
        fetch(this.config.dataUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            this.chatbotData = data;
            console.log('チャットボットデータを読み込みました');
          })
          .catch(error => {
            console.error('チャットボットデータの読み込みに失敗しました:', error);
            this.chatbotData = defaultData;
          });
      } else {
        // dataUrlが指定されていない場合は組み込みデータを使用
        this.chatbotData = defaultData;
      }
    },

    // ユーザーメッセージを処理
    handleUserMessage: function(message) {
      // ユーザーメッセージを表示
      this.addMessage(message, 'user');

      // タイピングインジケーターを表示
      this.showTypingIndicator();

      // 回答を検索して表示（遅延を入れて自然に）
      setTimeout(() => {
        this.hideTypingIndicator();
        const response = this.findResponse(message);
        this.addMessage(response, 'bot');
      }, 1000);
    },

    // 回答を検索
    findResponse: function(message) {
      const lowerMessage = message.toLowerCase();
      
      // パターンマッチング
      for (const pattern of this.chatbotData.patterns) {
        for (const keyword of pattern.keywords) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            return pattern.response;
          }
        }
      }
      
      // デフォルトの回答
      return this.chatbotData.defaultResponse;
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
      messageDiv.appendChild(contentDiv);
      
      messagesContainer.appendChild(messageDiv);
      
      // スクロールを最下部に
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // 会話履歴を保存
      this.saveConversation(text, sender);
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

    // 会話履歴を保存
    saveConversation: function(message, sender) {
      const conversation = JSON.parse(localStorage.getItem('funeral_chatbot_conversation') || '[]');
      conversation.push({
        message: message,
        sender: sender,
        timestamp: new Date().toISOString()
      });
      
      // 最新の50件のみ保存
      if (conversation.length > 50) {
        conversation.splice(0, conversation.length - 50);
      }
      
      localStorage.setItem('funeral_chatbot_conversation', JSON.stringify(conversation));
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