// pages/experience/experience.js
const app = getApp()

Page({
  data: {
    resumeData: null,
    workExperience: []
  },

  onLoad() {
    // 获取简历数据
    const resumeData = app.getResumeData()
    this.setData({
      resumeData: resumeData,
      workExperience: resumeData.workExperience || []
    })
  },

  // 切换工作经历详情展开/收起
  toggleExperienceDetail(e) {
    const index = e.currentTarget.dataset.index
    const workExperience = this.data.workExperience
    workExperience[index].expanded = !workExperience[index].expanded
    
    this.setData({
      workExperience: workExperience
    })
  },

  // 格式化日期范围
  formatDateRange(startDate, endDate) {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    
    const startYear = start.getFullYear()
    const startMonth = start.getMonth() + 1
    const endYear = end.getFullYear()
    const endMonth = end.getMonth() + 1
    
    return `${startYear}年${startMonth}月 - ${endYear}年${endMonth}月`
  },

  onShareAppMessage() {
    return {
      title: 'Becky的个人简历 - 工作经历',
      path: '/pages/experience/experience'
    }
  }
})