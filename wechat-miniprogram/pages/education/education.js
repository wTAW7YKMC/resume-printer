// pages/education/education.js
const app = getApp()

Page({
  data: {
    resumeData: null
  },

  onLoad() {
    // 获取简历数据
    this.setData({
      resumeData: app.getResumeData()
    })
  },

  // 点击教育背景项展开/收起详情
  toggleEducationDetail(e) {
    const index = e.currentTarget.dataset.index
    const education = this.data.resumeData.education
    education[index].expanded = !education[index].expanded
    
    this.setData({
      'resumeData.education': education
    })
  },

  onShareAppMessage() {
    return {
      title: 'Becky的个人简历 - 教育背景',
      path: '/pages/education/education'
    }
  }
})