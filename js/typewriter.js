/**
 * 打字机效果核心模块
 * 提供打字机动画效果，包括字符打印、清除和光标效果
 */
class Typewriter {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {number} options.typeSpeed - 打字速度（毫秒/字符）
     * @param {number} options.eraseSpeed - 擦除速度（毫秒/字符）
     * @param {boolean} options.playSound - 是否播放音效
     * @param {Function} options.soundCallback - 音效回调函数
     */
    constructor(options = {}) {
        this.typeSpeed = options.typeSpeed || 120;
        this.eraseSpeed = options.eraseSpeed || 60;
        this.playSound = options.playSound !== undefined ? options.playSound : true;
        this.soundCallback = options.soundCallback || this.defaultSoundCallback;
        
        // 打字状态
        this.isTyping = false;
        this.isErasing = false;
        this.currentText = '';
        this.targetElement = null;
        this.onCompleteCallback = null;
        
        // 光标元素（如果存在）
        this.cursorElement = null;
        this.cursorChar = '|';
        
        // 中断标志
        this.isInterrupted = false;
    }
    
    /**
     * 设置目标元素
     * @param {HTMLElement} element - 目标DOM元素
     */
    setElement(element) {
        this.targetElement = element;
        // 检查是否有光标元素
        this.cursorElement = element.querySelector('.cursor');
    }
    
    /**
     * 打字效果
     * @param {string} text - 要显示的文本
     * @param {Function} onComplete - 完成回调
     * @returns {Promise} 返回Promise对象
     */
    async type(text, onComplete = null) {
        // 如果已经在打字，先中断当前操作
        if (this.isTyping) {
            this.interrupt();
            // 短暂延迟，确保中断状态生效
            await this.delay(10);
        }
        
        this.isTyping = true;
        this.isErasing = false;
        this.isInterrupted = false;
        this.currentText = text;
        this.onCompleteCallback = onComplete;
        
        if (!this.targetElement) {
            console.error('Typewriter: No target element set');
            this.isTyping = false;
            return;
        }
        
        // 清空元素内容
        this.clearContent();
        
        // 逐字显示文本
        let displayText = '';
        const chars = this.splitIntoChars(text);
        
        for (let i = 0; i < chars.length; i++) {
            // 检查是否被中断
            if (this.isInterrupted) {
                break;
            }
            
            // 添加当前字符
            displayText += chars[i];
            
            // 更新显示
            this.updateDisplay(displayText);
            
            // 播放打字音效
            if (this.playSound) {
                this.soundCallback('type', this.typeSpeed);
            }
            
            // 等待指定时间
            await this.delay(this.typeSpeed);
        }
        
        this.isTyping = false;
        
        // 执行完成回调
        if (onComplete && !this.isInterrupted) {
            onComplete();
        }
    }
    
    /**
     * 擦除效果
     * @param {Function} onComplete - 完成回调
     * @returns {Promise} 返回Promise对象
     */
    async erase(onComplete = null) {
        // 如果已经在擦除，先中断当前操作
        if (this.isErasing) {
            this.interrupt();
        }
        
        this.isErasing = true;
        this.isTyping = false;
        this.isInterrupted = false;
        this.onCompleteCallback = onComplete;
        
        if (!this.targetElement) {
            console.error('Typewriter: No target element set');
            this.isErasing = false;
            return;
        }
        
        // 获取当前显示的文本（不包括光标）
        let displayText = this.getCurrentDisplayText();
        
        // 逐个删除字符
        while (displayText.length > 0 && this.isErasing && !this.isInterrupted) {
            displayText = displayText.slice(0, -1);
            
            // 更新显示
            this.updateDisplay(displayText);
            
            // 播放擦除音效
            if (this.playSound) {
                this.soundCallback('erase', this.eraseSpeed);
            }
            
            // 等待指定时间
            await this.delay(this.eraseSpeed);
        }
        
        this.isErasing = false;
        
        // 执行完成回调
        if (onComplete && !this.isInterrupted) {
            onComplete();
        }
    }
    
    /**
     * 中断当前的打字或擦除效果
     */
    interrupt() {
        this.isInterrupted = true;
        this.isTyping = false;
        this.isErasing = false;
        
        // 不立即清空内容，保留当前显示状态
        // 这样可以避免闪屏
    }
    
    /**
     * 清空元素内容
     */
    clearContent() {
        if (!this.targetElement) return;
        
        if (this.cursorElement) {
            // 如果有光标元素，只保留光标
            this.targetElement.innerHTML = '';
            this.targetElement.appendChild(this.cursorElement);
        } else {
            // 如果没有光标元素，直接清空
            this.targetElement.innerHTML = '';
        }
    }
    
    /**
     * 更新显示内容
     * @param {string} text - 要显示的文本
     */
    updateDisplay(text) {
        if (!this.targetElement) return;
        
        if (this.cursorElement) {
            // 如果有光标元素，使用innerHTML一次性更新，减少DOM操作
            // 转义HTML特殊字符，防止XSS攻击
            const escapedText = text.replace(/&/g, '&amp;')
                                   .replace(/</g, '&lt;')
                                   .replace(/>/g, '&gt;');
            this.targetElement.innerHTML = escapedText;
            this.targetElement.appendChild(this.cursorElement);
        } else {
            // 如果没有光标元素，直接设置文本
            this.targetElement.textContent = text;
        }
    }
    
    /**
     * 获取当前显示的文本（不包括光标）
     * @returns {string} 当前显示的文本
     */
    getCurrentDisplayText() {
        if (!this.targetElement) return '';
        
        if (this.cursorElement) {
            // 如果有光标元素，获取光标前的文本
            const textNodes = Array.from(this.targetElement.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE);
            return textNodes.map(node => node.textContent).join('');
        } else {
            // 如果没有光标元素，直接获取文本内容
            return this.targetElement.textContent;
        }
    }
    
    /**
     * 将文本分割成字符数组，正确处理中文字符
     * @param {string} text - 要分割的文本
     * @returns {Array} 字符数组
     */
    splitIntoChars(text) {
        // 使用Array.from正确处理Unicode字符，包括中文字符
        return Array.from(text);
    }
    
    /**
     * 设置音效开关
     * @param {boolean} play - 是否播放音效
     */
    setSoundEnabled(play) {
        this.playSound = play;
    }
    
    /**
     * 获取当前状态
     * @returns {Object} 状态对象
     */
    getStatus() {
        return {
            isTyping: this.isTyping,
            isErasing: this.isErasing,
            isInterrupted: this.isInterrupted,
            currentText: this.currentText
        };
    }
    
    /**
     * 延迟函数
     * @param {number} ms - 延迟时间（毫秒）
     * @returns {Promise} Promise对象
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 默认音效回调
     * @param {string} action - 动作类型（'type'或'erase'）
     * @param {number} speed - 速度（毫秒）
     */
    defaultSoundCallback(action, speed) {
        // 默认不播放任何音效
        // 可以被覆盖以实现自定义音效
    }
}