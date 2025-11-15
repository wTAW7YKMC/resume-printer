// utils/typewriter.js

/**
 * 打字机效果类
 */
class Typewriter {
  /**
   * 构造函数
   * @param {object} page 页面对象
   * @param {object} options 配置选项
   */
  constructor(page, options = {}) {
    this.page = page
    this.options = {
      texts: options.texts || [],
      typingSpeed: options.typingSpeed || 50, // 打字速度，毫秒
      pauseDuration: options.pauseDuration || 1000, // 段落间暂停时间，毫秒
      showCursor: options.showCursor !== false, // 是否显示光标
      cursorChar: options.cursorChar || '|', // 光标字符
      onComplete: options.onComplete || null, // 完成回调
      onTextChange: options.onTextChange || null // 文本变化回调
    }
    
    this.state = {
      isTyping: false,
      currentTextIndex: 0,
      currentCharIndex: 0,
      displayText: '',
      showCursor: this.options.showCursor
    }
    
    this.timer = null
  }
  
  /**
   * 开始打字
   * @param {array} texts 要显示的文本数组
   */
  start(texts = null) {
    if (this.state.isTyping) return
    
    if (texts) {
      this.options.texts = texts
    }
    
    if (this.options.texts.length === 0) return
    
    this.state = {
      isTyping: true,
      currentTextIndex: 0,
      currentCharIndex: 0,
      displayText: '',
      showCursor: this.options.showCursor
    }
    
    this._updatePage()
    this._typeNextChar()
  }
  
  /**
   * 停止打字
   */
  stop() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    
    this.state.isTyping = false
    this.state.showCursor = false
    this._updatePage()
  }
  
  /**
   * 重置打字机状态
   */
  reset() {
    this.stop()
    this.state = {
      isTyping: false,
      currentTextIndex: 0,
      currentCharIndex: 0,
      displayText: '',
      showCursor: this.options.showCursor
    }
    this._updatePage()
  }
  
  /**
   * 打印下一个字符
   * @private
   */
  _typeNextChar() {
    const { currentTextIndex, currentCharIndex } = this.state
    const { texts, typingSpeed, pauseDuration } = this.options
    
    if (currentTextIndex >= texts.length) {
      // 所有文本已打印完成
      this.state.isTyping = false
      this.state.showCursor = false
      this._updatePage()
      
      if (this.options.onComplete) {
        this.options.onComplete()
      }
      return
    }
    
    const currentText = texts[currentTextIndex]
    
    if (currentCharIndex < currentText.length) {
      // 继续打印当前字符
      const newChar = currentText[currentCharIndex]
      this.state.displayText += newChar
      this.state.currentCharIndex = currentCharIndex + 1
      
      this._updatePage()
      
      // 设置延迟后继续打印
      this.timer = setTimeout(() => {
        this._typeNextChar()
      }, typingSpeed + Math.random() * typingSpeed / 2) // 随机延迟，模拟真实打字
    } else {
      // 当前文本打印完成，添加换行并继续下一段
      this.state.displayText += '\n'
      this.state.currentTextIndex = currentTextIndex + 1
      this.state.currentCharIndex = 0
      
      this._updatePage()
      
      // 设置延迟后继续下一段
      this.timer = setTimeout(() => {
        this._typeNextChar()
      }, pauseDuration) // 段落间延迟
    }
  }
  
  /**
   * 更新页面数据
   * @private
   */
  _updatePage() {
    if (!this.page || !this.page.setData) {
      return
    }
    
    const { displayText, showCursor } = this.state
    
    this.page.setData({
      typewriterText: displayText,
      showCursor
    })
    
    if (this.options.onTextChange && typeof this.options.onTextChange === 'function') {
      this.options.onTextChange(displayText)
    }
  }
}

module.exports = Typewriter