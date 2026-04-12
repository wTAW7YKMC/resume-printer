// DeepSeek AI助手 - 集成到个人简历网站
(function() {
    // DeepSeek API配置
    const DEEPSEEK_API_KEY = 'sk-pyqoijjcftrgokxzrotgdlkgctqeqpsrfwtonkfbtpvjbqaq';
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    // DOM元素
    let chatContainer = null;
    let userInput = null;
    let sendBtn = null;
    let toggleBtn = null;
    let aiPanel = null;
    let closeBtn = null;
    
    // 初始化函数
    function init() {
        chatContainer = document.getElementById('ai-chat-container');
        userInput = document.getElementById('ai-user-input');
        sendBtn = document.getElementById('ai-send-btn');
        toggleBtn = document.getElementById('ai-toggle-btn');
        aiPanel = document.getElementById('ai-assistant-panel');
        closeBtn = document.getElementById('ai-close-btn');
        
        if (!chatContainer || !userInput || !sendBtn) {
            console.error('DeepSeek AI助手：找不到必要的DOM元素');
            return;
        }
        
        // 绑定事件
        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', handleKeyPress);
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleAIPanel);
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeAIPanel);
        }
        
        // 添加欢迎消息
        addMessage('你好！我是DeepSeek AI助手，可以帮你优化简历、准备面试、分析职业规划等。', 'ai');
        addMessage('试试问我："如何优化我的简历？"', 'ai');
    }
    
    // 切换AI面板显示/隐藏
    function toggleAIPanel() {
        if (aiPanel) {
            aiPanel.classList.toggle('show');
            const isShowing = aiPanel.classList.contains('show');
            toggleBtn.textContent = isShowing ? '✕ 关闭AI' : '🤖 AI助手';
            
            if (isShowing && userInput) {
                userInput.focus();
            }
        }
    }
    
    // 关闭AI面板
    function closeAIPanel() {
        if (aiPanel) {
            aiPanel.classList.remove('show');
            if (toggleBtn) {
                toggleBtn.textContent = '🤖 AI助手';
            }
        }
    }
    
    // 处理键盘事件
    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    // 发送消息
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        userInput.value = '';
        
        const typingId = addMessage('正在思考...', 'ai', true);
        
        callDeepSeekAPI(message, typingId);
    }
    
    // 添加消息到聊天容器
    function addMessage(text, sender, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}-message`;
        
        if (isTyping) {
            messageDiv.id = 'typingIndicator';
            messageDiv.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
        } else {
            messageDiv.textContent = text;
        }
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        return isTyping ? 'typingIndicator' : null;
    }
    
    // 调用DeepSeek API
    async function callDeepSeekAPI(userMessage, typingId) {
        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的简历和职业发展顾问，帮助用户优化简历、准备面试、规划职业发展。回答要简洁实用，中文回复。'
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            const data = await response.json();
            
            removeTypingIndicator(typingId);
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                addMessage(data.choices[0].message.content, 'ai');
            } else if (data.error) {
                addMessage(`错误: ${data.error.message}`, 'ai');
            } else {
                addMessage('抱歉，我暂时无法回答这个问题。', 'ai');
            }
            
        } catch (error) {
            console.error('DeepSeek API调用失败:', error);
            removeTypingIndicator(typingId);
            addMessage('网络错误，请检查API Key配置或稍后重试。', 'ai');
        }
    }
    
    // 移除正在输入提示
    function removeTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();