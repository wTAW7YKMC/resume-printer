/**
 * 留言功能模块
 * 处理留言表单提交和留言列表显示
 */
class MessageManager {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.apiBaseUrl - API基础URL
     * @param {Function} options.onSuccess - 成功回调函数
     * @param {Function} options.onError - 错误回调函数
     */
    constructor(options = {}) {
        this.apiBaseUrl = options.apiBaseUrl || 'http://localhost:8080';
        this.onSuccess = options.onSuccess || this.defaultSuccessHandler;
        this.onError = options.onError || this.defaultErrorHandler;
        
        // DOM元素
        this.contactFormContainer = document.getElementById('contact-form-container');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageForm = document.getElementById('message-form');
        this.formMessage = document.getElementById('form-message');
        this.messagesList = document.getElementById('messages-list');
        this.submitBtn = document.getElementById('submit-btn');
        this.viewMessagesBtn = document.getElementById('view-messages-btn');
        this.backToFormBtn = document.getElementById('back-to-form-btn');
        
        // 初始化事件监听器
        this.initEventListeners();
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 表单提交事件
        if (this.messageForm) {
            this.messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitMessage();
            });
        }
        
        // 查看留言按钮事件
        if (this.viewMessagesBtn) {
            this.viewMessagesBtn.addEventListener('click', () => {
                this.showMessagesList();
            });
        }
        
        // 返回表单按钮事件
        if (this.backToFormBtn) {
            this.backToFormBtn.addEventListener('click', () => {
                this.showContactForm();
            });
        }
    }
    
    /**
     * 显示留言表单
     */
    showContactForm() {
        if (this.contactFormContainer) {
            this.contactFormContainer.style.display = 'block';
        }
        if (this.messagesContainer) {
            this.messagesContainer.style.display = 'none';
        }
    }
    
    /**
     * 显示留言列表
     */
    showMessagesList() {
        if (this.contactFormContainer) {
            this.contactFormContainer.style.display = 'none';
        }
        if (this.messagesContainer) {
            this.messagesContainer.style.display = 'block';
        }
        
        // 加载留言列表
        this.loadMessages();
    }
    
    /**
     * 提交留言
     */
    async submitMessage() {
        if (!this.messageForm) return;
        
        // 获取表单数据
        const formData = new FormData(this.messageForm);
        const messageData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            content: formData.get('message')
        };
        
        // 验证表单数据
        if (!this.validateMessage(messageData)) {
            return;
        }
        
        // 禁用提交按钮，防止重复提交
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = '发送中...';
        }
        
        try {
            // 发送请求到后端API
            console.log('发送请求到:', `${this.apiBaseUrl}/api/resume/message`);
            console.log('请求数据:', messageData);
            
            const response = await fetch(`${this.apiBaseUrl}/api/resume/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });
            
            console.log('响应状态:', response.status);
            const result = await response.json();
            console.log('响应数据:', result);
            
            if (response.ok && result.code === 200) {
                // 显示成功消息
                this.showFormMessage('留言发送成功！感谢您的反馈。', 'success');
                
                // 重置表单
                this.messageForm.reset();
                
                // 调用成功回调
                this.onSuccess(result);
            } else {
                // 显示错误消息
                const errorMsg = result ? (result.msg || '服务器返回错误') : '无效的响应格式';
                console.error('服务器错误:', response.status, result);
                this.showFormMessage(`发送失败: ${errorMsg}`, 'error');
                
                // 调用错误回调
                this.onError(result);
            }
        } catch (error) {
            console.error('Error submitting message:', error);
            console.error('错误详情:', error.message);
            console.error('错误堆栈:', error.stack);
            
            // 显示错误消息
            let errorMessage = '网络错误，请检查网络连接后重试。';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = '无法连接到服务器，请检查后端服务是否正常运行。';
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = '网络请求失败，可能是CORS问题或网络连接问题。';
            }
            
            this.showFormMessage(errorMessage, 'error');
            
            // 调用错误回调
            this.onError(error);
        } finally {
            // 恢复提交按钮状态
            if (this.submitBtn) {
                this.submitBtn.disabled = false;
                this.submitBtn.textContent = '发送留言';
            }
        }
    }
    
    /**
     * 加载留言列表
     */
    async loadMessages() {
        if (!this.messagesList) return;
        
        // 显示加载状态
        this.messagesList.innerHTML = '<div class="loading">正在加载留言...</div>';
        
        try {
            // 从后端API获取留言列表
            const response = await fetch(`${this.apiBaseUrl}/api/resume/message/list`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                // 显示留言列表
                this.displayMessages(result.data);
            } else {
                // 显示错误消息
                this.messagesList.innerHTML = `<div class="no-messages">加载失败: ${result.msg || '未知错误'}</div>`;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            
            // 显示错误消息
            this.messagesList.innerHTML = '<div class="no-messages">加载留言失败，请稍后重试。</div>';
        }
    }
    
    /**
     * 显示留言列表
     * @param {Array} messages - 留言数组
     */
    displayMessages(messages) {
        if (!this.messagesList) return;
        
        if (!messages || messages.length === 0) {
            this.messagesList.innerHTML = '<div class="no-messages">暂无留言</div>';
            return;
        }
        
        // 按时间倒序排序（最新的在前）
        const sortedMessages = messages.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // 生成留言HTML
        const messagesHtml = sortedMessages.map(message => {
            const createdDate = new Date(message.createdAt).toLocaleString('zh-CN');
            
            return `
                <div class="message-item">
                    <div class="message-header">
                        <div class="message-author">${this.escapeHtml(message.name)}</div>
                        <div class="message-date">${createdDate}</div>
                    </div>
                    <div class="message-subject">${this.escapeHtml(message.subject)}</div>
                    <div class="message-content">${this.escapeHtml(message.content)}</div>
                    <div class="message-email">邮箱: ${this.escapeHtml(message.email)}</div>
                </div>
            `;
        }).join('');
        
        // 更新留言列表
        this.messagesList.innerHTML = messagesHtml;
    }
    
    /**
     * 验证留言数据
     * @param {Object} messageData - 留言数据
     * @returns {boolean} 验证结果
     */
    validateMessage(messageData) {
        if (!messageData.name || messageData.name.trim() === '') {
            this.showFormMessage('请输入您的姓名', 'error');
            return false;
        }
        
        if (!messageData.email || messageData.email.trim() === '') {
            this.showFormMessage('请输入您的邮箱', 'error');
            return false;
        }
        
        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageData.email)) {
            this.showFormMessage('请输入有效的邮箱地址', 'error');
            return false;
        }
        
        if (!messageData.subject || messageData.subject.trim() === '') {
            this.showFormMessage('请输入留言主题', 'error');
            return false;
        }
        
        if (!messageData.content || messageData.content.trim() === '') {
            this.showFormMessage('请输入留言内容', 'error');
            return false;
        }
        
        return true;
    }
    
    /**
     * 显示表单消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success/error)
     */
    showFormMessage(message, type) {
        if (!this.formMessage) return;
        
        this.formMessage.textContent = message;
        this.formMessage.className = `form-message ${type}`;
        this.formMessage.style.display = 'block';
        
        // 5秒后自动隐藏消息
        setTimeout(() => {
            this.formMessage.style.display = 'none';
        }, 5000);
    }
    
    /**
     * HTML转义，防止XSS攻击
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 默认成功处理函数
     * @param {Object} result - API响应结果
     */
    defaultSuccessHandler(result) {
        console.log('Message submitted successfully:', result);
    }
    
    /**
     * 默认错误处理函数
     * @param {Object} error - 错误对象
     */
    defaultErrorHandler(error) {
        console.error('Error in message manager:', error);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageManager;
} else {
    window.MessageManager = MessageManager;
}