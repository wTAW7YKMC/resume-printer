/**
 * 留言管理模块
 * 负责处理留言表单提交、留言列表显示等
 */
class MessageManager {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.apiUrl - API基础URL
     * @param {string} options.messageSectionId - 留言区域元素ID
     * @param {string} options.messageFormId - 留言表单元素ID
     * @param {string} options.messageListId - 留言列表元素ID
     * @param {string} options.messageStatusId - 留言状态提示元素ID
     */
    constructor(options = {}) {
        // 本地服务器地址（作为默认值，实际使用LocalMessageManager）
        this.apiUrl = options.apiUrl || 'http://localhost:8080';
        
        // 元素ID
        this.messageSectionId = options.messageSectionId || 'message-section';
        this.messageFormId = options.messageFormId || 'message-form';
        this.messageListId = options.messageListId || 'message-list';
        this.messageStatusId = options.messageStatusId || 'message-status';
        this.refreshBtnId = options.refreshBtnId || 'refresh-messages';
        
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
    async submitMessage() {
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
        
        try {
            // 发送POST请求到阿里云服务器
            // 创建GMT日期头
            const date = new Date().toUTCString();
            
            const response = await fetch(`${this.apiUrl}/api/resume/message/add`, {
                method: 'POST',
                headers: {
                    'Date': date,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Connection': 'keep-alive'
                },
                body: JSON.stringify({ name, email, content })
            });
            
            const data = await response.json();
            
            if (response.ok && data.code === 200) {
                // 提交成功
                this.showStatus(data.message || '留言提交成功！', 'success');
                // 清空表单
                this.messageForm.reset();
                // 刷新留言列表
                this.loadMessages();
            } else {
                // 提交失败
                this.showStatus(data.message || '提交失败，请稍后再试', 'error');
            }
        } catch (error) {
            console.error('提交留言失败:', error);
            this.showStatus('网络错误，无法连接到服务器', 'error');
        }
    }
    
    /**
     * 加载留言列表
     */
    async loadMessages() {
        // 显示加载状态
        this.showStatus('正在加载留言列表...', 'info');
        
        try {
            // 从阿里云服务器获取留言列表
            // 创建GMT日期头
            const date = new Date().toUTCString();
            
            const response = await fetch(`${this.apiUrl}/api/resume/message/list`, {
                method: 'GET',
                headers: {
                    'Date': date,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Connection': 'keep-alive'
                }
            });
            const data = await response.json();
            
            if (response.ok && data.code === 200) {
                // 加载成功
                this.displayMessages(data.data || []);
                this.showStatus('', 'info'); // 清除状态
            } else {
                // 加载失败
                this.showStatus(data.message || '加载留言失败', 'error');
                this.displayMessages([]); // 清空留言列表
            }
        } catch (error) {
            console.error('加载留言列表失败:', error);
            this.showStatus('无法连接到服务器，请检查网络连接', 'error');
            this.displayMessages([]); // 清空留言列表
        }
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
    module.exports = MessageManager;
} else {
    window.MessageManager = MessageManager;
}