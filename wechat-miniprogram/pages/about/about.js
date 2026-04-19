// pages/about/about.js
const app = getApp()

Page({
  data: {
    resumeData: null,
    personalInfo: null,
    displayText: '',
    showCursor: true,
    currentCharIndex: 0,
    isTyping: false,
    aboutText: "我是一名热爱设计与开发的前端工程师，专注于创造美观且实用的用户界面。我拥有多年的前端开发经验，熟练掌握现代前端技术栈，并致力于提供最佳的用户体验。我相信好的设计不仅要美观，更要实用、易用。在工作中，我注重细节，追求代码质量和性能优化，同时保持对新技术的学习热情。"
  },

  onLoad() {
    // 获取简历数据
    const resumeData = app.getResumeData()
    const personalInfo = resumeData ? resumeData.personalInfo : null
    
    this.setData({
      resumeData,
      personalInfo
    })
    
    // 开始打字机效果
    this.startTypewriter()
  },

  // 开始打字机效果
  startTypewriter() {
    if (this.data.isTyping) return
    
    this.setData({
      isTyping: true,
      currentCharIndex: 0,
      displayText: ''
    })
    
    this.typeNextChar()
  },

  // 打印下一个字符
  typeNextChar() {
    const { currentCharIndex, aboutText } = this.data
    
    if (currentCharIndex < aboutText.length) {
      // 继续打印当前字符
      const newChar = aboutText[currentCharIndex]
      this.setData({
        displayText: this.data.displayText + newChar,
        currentCharIndex: currentCharIndex + 1
      })
      
      // 设置延迟后继续打印
      setTimeout(() => {
        this.typeNextChar()
      }, 30 + Math.random() * 30) // 随机延迟，模拟真实打字
    } else {
      // 文本打印完成
      this.setData({
        isTyping: false,
        showCursor: false
      })
    }
  },

  // 打开社交媒体链接
  openSocialLink(e) {
    const url = e.currentTarget.dataset.url
    
    // 复制链接到剪贴板
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  onShareAppMessage() {
    const { personalInfo } = this.data
    const name = personalInfo ? personalInfo.name : 'Becky'
    
    return {
      title: `${name}的个人简历 - 关于我`,
      path: '/pages/about/about'
    }
  }
})