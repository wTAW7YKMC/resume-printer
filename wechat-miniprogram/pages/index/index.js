Page({
  data: {
    resumeData: null,
    typedText: '',
    fullText: "Hi, I'm Becky!",
    isTyping: true,
    currentSection: 'personal', // 当前显示的部分：personal, work, education, skills
    sectionContent: {}, // 存储各板块的打字机内容
    isSectionTyping: false // 标记板块内容是否正在打字
  },
  
  onLoad: function () {
    console.log('页面加载')
    // 获取应用实例
    const app = getApp()
    // 获取简历数据
    const resumeData = app.getResumeData()
    this.setData({
      resumeData
    })
    console.log('简历数据已加载:', resumeData)
    
    // 开始打字机效果
    this.startTyping()
    
    // 页面加载后，延迟触发个人信息板块的打字效果
    setTimeout(() => {
      this.switchSection({ currentTarget: { dataset: { section: 'personal' } } })
    }, 2000) // 2秒后开始个人信息板块的打字效果
  },
  
  // 打字机效果
  startTyping: function() {
    const fullText = this.data.fullText
    let currentIndex = 0
    const that = this
    
    // 清空文本
    this.setData({
      typedText: ''
    })
    
    // 逐字显示
    const typeInterval = setInterval(function() {
      if (currentIndex < fullText.length) {
        that.setData({
          typedText: fullText.substring(0, currentIndex + 1)
        })
        currentIndex++
      } else {
        // 打字完成，停止计时器
        clearInterval(typeInterval)
        that.setData({
          isTyping: false
        })
      }
    }, 150) // 每个字符的间隔时间（毫秒）
  },
  
  // 板块内容打字机效果
  startSectionTyping: function(section, content) {
    const that = this
    let currentIndex = 0
    const sectionContentKey = `${section}Content`
    
    // 清空当前板块内容
    const sectionContent = this.data.sectionContent || {}
    sectionContent[sectionContentKey] = ''
    
    this.setData({
      sectionContent: sectionContent,
      isSectionTyping: true
    })
    
    // 逐字显示
    const typeInterval = setInterval(function() {
      if (currentIndex < content.length) {
        sectionContent[sectionContentKey] = content.substring(0, currentIndex + 1)
        that.setData({
          sectionContent: sectionContent
        })
        currentIndex++
      } else {
        // 打字完成，停止计时器
        clearInterval(typeInterval)
        that.setData({
          isSectionTyping: false
        })
      }
    }, 30) // 板块内容的打字速度更快
  },
  
  // 切换显示的部分
  switchSection: function(e) {
    const section = e.currentTarget.dataset.section
    const resumeData = this.data.resumeData
    
    // 准备要显示的内容
    let content = ''
    
    if (section === 'personal' && resumeData && resumeData.personalInfo) {
      const info = resumeData.personalInfo
      content = `姓名：${info.name}\n职位：${info.title}\n简介：${info.summary}`
      
      // 添加联系方式
      const contactItems = info.contact.filter(item => item.type === 'email' || item.type === 'phone')
      contactItems.forEach(item => {
        const label = item.type === 'email' ? 'Email:' : 'Phone:'
        content += `\n${label} ${item.value}`
      })
    } else if (section === 'work' && resumeData && resumeData.workExperience) {
      resumeData.workExperience.forEach((item, index) => {
        content += `${item.company}\n${item.position} (${item.startDate} - ${item.endDate})\n${item.description}\n\n`
      })
      
      // 添加联系方式
      const contactItems = resumeData.personalInfo.contact.filter(item => item.type === 'email' || item.type === 'phone')
      contactItems.forEach(item => {
        const label = item.type === 'email' ? 'Email:' : 'Phone:'
        content += `${label} ${item.value}\n`
      })
    } else if (section === 'education' && resumeData && resumeData.education) {
      resumeData.education.forEach((item, index) => {
        content += `${item.school} - ${item.major}\n${item.degree} (${item.period})\n${item.description}\n\n`
      })
      
      // 添加联系方式
      const contactItems = resumeData.personalInfo.contact.filter(item => item.type === 'email' || item.type === 'phone')
      contactItems.forEach(item => {
        const label = item.type === 'email' ? 'Email:' : 'Phone:'
        content += `${label} ${item.value}\n`
      })
    } else if (section === 'skills' && resumeData && resumeData.skills) {
      resumeData.skills.forEach(category => {
        content += `${category.category}\n`
        category.items.forEach(skill => {
          content += `${skill.name}\n`
        })
        content += '\n'
      })
      
      // 添加联系方式
      const contactItems = resumeData.personalInfo.contact.filter(item => item.type === 'email' || item.type === 'phone')
      contactItems.forEach(item => {
        const label = item.type === 'email' ? 'Email:' : 'Phone:'
        content += `${label} ${item.value}\n`
      })
    }
    
    // 切换板块并开始打字效果
    this.setData({
      currentSection: section
    })
    
    // 延迟一下再开始打字效果，让板块切换先完成
    setTimeout(() => {
      this.startSectionTyping(section, content)
    }, 100)
  }
})