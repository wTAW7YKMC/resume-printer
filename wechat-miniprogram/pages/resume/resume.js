// pages/resume/resume.js
const app = getApp()
const { formatResumeData } = require('../../utils/data.js')

Page({
  data: {
    resumeData: null,
    activeTab: 'personal',
    expandedSections: {
      work: false,
      education: false,
      projects: false
    }
  },

  onLoad() {
    // 修复编码问题
    this.fixEncodingIssue();
    
    // 获取简历数据
    const rawData = app.getResumeData()
    const formattedData = formatResumeData(rawData)
    
    this.setData({
      resumeData: formattedData
    })
  },
  
  // 修复编码问题
  fixEncodingIssue: function() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '个人简历'
    });
    
    // 尝试强制重新渲染页面
    setTimeout(() => {
      this.setData({
        forceUpdate: Math.random()
      });
    }, 100);
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  },

  // 展开/收起工作经历
  toggleWorkExperience(e) {
    const index = e.currentTarget.dataset.index
    const workExperience = [...this.data.resumeData.workExperience]
    workExperience[index].expanded = !workExperience[index].expanded
    
    this.setData({
      'resumeData.workExperience': workExperience
    })
  },

  // 展开/收起教育经历
  toggleEducation(e) {
    const index = e.currentTarget.dataset.index
    const education = [...this.data.resumeData.education]
    education[index].expanded = !education[index].expanded
    
    this.setData({
      'resumeData.education': education
    })
  },

  // 展开/收起项目经验
  toggleProject(e) {
    const index = e.currentTarget.dataset.index
    const projects = [...this.data.resumeData.projects]
    projects[index].expanded = !projects[index].expanded
    
    this.setData({
      'resumeData.projects': projects
    })
  },

  // 复制邮箱地址
  copyEmail(e) {
    const email = e.currentTarget.dataset.email
    app.copyToClipboard(email)
  },

  // 复制电话号码
  copyPhone(e) {
    const phone = e.currentTarget.dataset.phone
    app.copyToClipboard(phone)
  },

  // 打开社交媒体链接
  openSocialLink(e) {
    const url = e.currentTarget.dataset.url
    
    // 复制链接到剪贴板
    app.copyToClipboard(url)
  },

  // 展开/收起所有经验（用于experience标签页）
  toggleAllExperience() {
    const { workExperience, education } = this.data.resumeData
    const allExpanded = workExperience.every(item => item.expanded) && 
                       education.every(item => item.expanded)
    
    // 更新工作经历
    const updatedWork = workExperience.map(item => ({
      ...item,
      expanded: !allExpanded
    }))
    
    // 更新教育经历
    const updatedEducation = education.map(item => ({
      ...item,
      expanded: !allExpanded
    }))
    
    this.setData({
      'resumeData.workExperience': updatedWork,
      'resumeData.education': updatedEducation
    })
  },

  // 分享功能
  onShareAppMessage() {
    const { personalInfo } = this.data.resumeData
    const name = personalInfo ? personalInfo.name : 'Becky'
    
    return {
      title: `${name}的个人简历`,
      path: '/pages/resume/resume'
    }
  }
})