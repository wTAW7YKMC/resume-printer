/**
 * 本地留言管理模块
 * 作为临时解决方案，在本地存储留言数据
 */
class LocalMessageManager {
    constructor(options = {}) {
        // 元素ID
        this.messageSectionId = options.messageSectionId || 'message-section';
        this.messageFormId = options.messageFormId || 'message-form';
        this.messageListId = options.messageListId || 'message-list';
        this.messageStatusId = options.messageStatusId || 'message-status';
        this.refreshBtnId = options.refreshBtnId || 'refresh-messages';
        
        // 本地存储键名
        this.storageKey = 'resume_messages';
        
        // 缓存DOM元素
        this.messageSection = null;
        this.messageForm = null;
        this.messageList = null;
        this.messageStatus = null;
        this.refreshBtn = null;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化留言管理器
     */
    init() {
        // 缓存DOM元素
        this.messageSection = document.getElementById(this.messageSectionId);
        this.messageForm = document.getElementById(this.messageFormId);
        this.messageList = document.getElementById(this.messageListId);
        this.messageStatus = document.getElementById(this.messageStatusId);
        this.refreshBtn = document.getElementById(this.refreshBtnId);
        
        // 绑定事件
        if (this.messageForm) {
            this.messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitMessage();
            });
        }
        
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.loadMessages();
            });
        }
    }
    
    /**
     * 显示留言区域
     */
    showMessageSection() {
        if (this.messageSection) {
            this.messageSection.style.display = 'block';
            // 加载留言列表
            this.loadMessages();
        }
    }
    
    /**
     * 隐藏留言区域
     */
    hideMessageSection() {
        if (this.messageSection) {
            this.messageSection.style.display = 'none';
        }
    }
    
    /**
     * 提交留言
     */
    submitMessage() {
        // 获取表单数据
        const name = document.getElementById('message-name').value.trim();
        const email = document.getElementById('message-email').value.trim();
        const content = document.getElementById('message-content').value.trim();
        
        // 验证表单
        if (!name || !email || !content) {
            this.showStatus('请填写所有必填字段', 'error');
            return;
        }
        
        // 显示提交状态
        this.showStatus('正在提交留言...', 'info');
        
        // 创建留言对象
        const message = {
            id: Date.now().toString(),
            name: name,
            email: email,
            content: content,
            createTime: new Date().toLocaleString()
        };
        
        // 获取现有留言
        let messages = this.getMessages();
        
        // 添加新留言到数组开头
        messages.unshift(message);
        
        // 限制留言数量
        if (messages.length > 50) {
            messages = messages.slice(0, 50);
        }
        
        // 保存到本地存储
        localStorage.setItem(this.storageKey, JSON.stringify(messages));
        
        // 显示成功状态
        this.showStatus('留言提交成功！', 'success');
        
        // 清空表单
        this.messageForm.reset();
        
        // 刷新留言列表
        this.loadMessages();
    }
    
    /**
     * 从本地存储加载留言列表
     */
    loadMessages() {
        // 显示加载状态
        this.showStatus('正在加载留言列表...', 'info');
        
        // 从本地存储获取留言
        const messages = this.getMessages();
        
        // 延迟一点时间，模拟网络请求
        setTimeout(() => {
            this.displayMessages(messages);
            this.showStatus('', 'info'); // 清除状态
        }, 300);
    }
    
    /**
     * 从本地存储获取留言列表
     */
    getMessages() {
        try {
            const storedMessages = localStorage.getItem(this.storageKey);
            return storedMessages ? JSON.parse(storedMessages) : this.getDefaultMessages();
        } catch (error) {
            console.error('获取留言失败:', error);
            return this.getDefaultMessages();
        }
    }
    
    /**
     * 获取默认留言列表
     */
    getDefaultMessages() {
        return [
            {
                id: '1',
                name: '系统管理员',
                email: 'admin@resume.com',
                content: '欢迎使用留言板！请留下您的宝贵意见。',
                createTime: new Date().toLocaleString()
            }
        ];
    }
    
    /**
     * 显示留言列表
     * @param {Array} messages - 留言数组
     */
    displayMessages(messages) {
        if (!this.messageList) return;
        
        if (!messages || messages.length === 0) {
            this.messageList.innerHTML = '<div class="no-messages">暂无留言</div>';
            return;
        }
        
        // 渲染留言列表
        const messagesHTML = messages.map(message => {
            return `
                <div class="message-item">
                    <div class="message-header">
                        <span class="message-name">${this.escapeHtml(message.name)}</span>
                        <span class="message-time">${message.createTime || ''}</span>
                    </div>
                    <div class="message-content">${this.escapeHtml(message.content)}</div>
                </div>
            `;
        }).join('');
        
        this.messageList.innerHTML = messagesHTML;
    }
    
    /**
     * 显示状态信息
     * @param {string} message - 状态信息
     * @param {string} type - 状态类型 (success, error, info)
     */
    showStatus(message, type = 'info') {
        if (!this.messageStatus) return;
        
        // 清除之前的样式类
        this.messageStatus.className = 'message-status';
        
        if (message) {
            // 添加新的样式类
            this.messageStatus.classList.add(type);
            // 设置状态文本
            this.messageStatus.textContent = message;
            // 显示状态元素
            this.messageStatus.style.display = 'block';
        } else {
            // 隐藏状态元素
            this.messageStatus.style.display = 'none';
        }
    }
    
    /**
     * HTML转义
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalMessageManager;
} else {
    window.LocalMessageManager = LocalMessageManager;
}