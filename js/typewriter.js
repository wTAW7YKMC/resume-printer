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
        if (this.isTyping || this.isErasing) {
            return;
        }
        
        this.isTyping = true;
        this.currentText = text;
        this.onCompleteCallback = onComplete;
        
        if (!this.targetElement) {
            console.error('Typewriter: No target element set');
            this.isTyping = false;
            return;
        }
        
        // 清空元素内容，但保留光标
        const hasCursor = this.cursorElement !== null;
        this.targetElement.textContent = '';
        if (hasCursor) {
            this.targetElement.appendChild(this.cursorElement);
        }
        
        // 逐字显示文本
        const chars = text.split('');
        for (let i = 0; i < chars.length; i++) {
            // 在光标前插入字符
            if (hasCursor && this.cursorElement.parentNode === this.targetElement) {
                this.targetElement.insertBefore(document.createTextNode(chars[i]), this.cursorElement);
            } else {
                this.targetElement.textContent += chars[i];
            }
            
            // 播放打字音效，传递打字速度作为音效持续时间
            if (this.playSound) {
                this.soundCallback('type', this.typeSpeed);
            }
            
            // 处理特殊字符效果（如换行）
            if (chars[i] === '\n') {
                // 可以在这里添加特殊换行效果
            }
            
            // 等待指定时间
            await this.delay(this.typeSpeed);
        }
        
        this.isTyping = false;
        
        // 执行完成回调
        if (onComplete) {
            onComplete();
        }
    }
    
    /**
     * 擦除效果
     * @param {Function} onComplete - 完成回调
     * @returns {Promise} 返回Promise对象
     */
    async erase(onComplete = null) {
        if (this.isTyping || this.isErasing) {
            return;
        }
        
        this.isErasing = true;
        this.onCompleteCallback = onComplete;
        
        if (!this.targetElement) {
            console.error('Typewriter: No target element set');
            this.isErasing = false;
            return;
        }
        
        // 获取当前文本（不包括光标）
        let text = this.targetElement.textContent;
        if (this.cursorElement && this.cursorElement.parentNode === this.targetElement) {
            const cursorText = this.cursorElement.textContent;
            text = text.replace(cursorText, '');
        }
        
        // 逐个删除字符
        while (text.length > 0) {
            text = text.slice(0, -1);
            
            // 更新元素内容
            if (this.cursorElement && this.cursorElement.parentNode === this.targetElement) {
                this.targetElement.textContent = text;
                this.targetElement.appendChild(this.cursorElement);
            } else {
                this.targetElement.textContent = text;
            }
            
            // 播放擦除音效，传递擦除速度作为音效持续时间
            if (this.playSound) {
                this.soundCallback('erase', this.eraseSpeed);
            }
            
            // 等待指定时间
            await this.delay(this.eraseSpeed);
        }
        
        this.isErasing = false;
        
        // 执行完成回调
        if (onComplete) {
            onComplete();
        }
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
     * @param {string} action - 动作类型 ('type' 或 'erase')
     */
    defaultSoundCallback(action) {
        try {
            // 根据动作类型选择不同的音效
            const soundFile = action === 'erase' ? 
                'assets/sounds/typewriter-backspace.mp3' : 
                'assets/sounds/typewriter.mp3';
            
            const audio = new Audio(soundFile);
            audio.volume = 0.3;
            audio.play().catch(e => {
                // 静默处理错误，避免在控制台显示大量错误信息
                // 在实际应用中，可以在这里添加备用音效或错误处理逻辑
            });
        } catch (error) {
            // 静默处理错误
        }
    }
}

/**
 * 光标效果类
 * 提供闪烁光标效果
 */
class CursorEffect {
    /**
     * 构造函数
     * @param {HTMLElement} element - 光标元素
     * @param {Object} options - 配置选项
     * @param {string} options.blinkSpeed - 闪烁速度
     * @param {string} options.cursorCharacter - 光标字符
     */
    constructor(element, options = {}) {
        this.element = element;
        this.blinkSpeed = options.blinkSpeed || '1s';
        this.cursorCharacter = options.cursorCharacter || '|';
        this.isActive = true;
        
        this.init();
    }
    
    /**
     * 初始化光标效果
     */
    init() {
        if (!this.element) {
            console.error('CursorEffect: No cursor element provided');
            return;
        }
        
        // 设置光标文本
        this.element.textContent = this.cursorCharacter;
        
        // 应用CSS动画
        this.element.style.animation = `cursor-blink ${this.blinkSpeed} step-end infinite`;
        
        // 添加CSS动画样式
        this.addCursorStyles();
    }
    
    /**
     * 添加光标CSS样式
     */
    addCursorStyles() {
        // 检查是否已添加样式
        if (document.getElementById('cursor-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'cursor-styles';
        style.textContent = `
            @keyframes cursor-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 激活光标效果
     */
    activate() {
        this.isActive = true;
        if (this.element) {
            this.element.style.animationPlayState = 'running';
        }
    }
    
    /**
     * 暂停光标效果
     */
    pause() {
        this.isActive = false;
        if (this.element) {
            this.element.style.animationPlayState = 'paused';
        }
    }
    
    /**
     * 更新光标字符
     * @param {string} character - 新的光标字符
     */
    updateCharacter(character) {
        this.cursorCharacter = character;
        if (this.element) {
            this.element.textContent = character;
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Typewriter, CursorEffect };
} else {
    window.Typewriter = Typewriter;
    window.CursorEffect = CursorEffect;
}