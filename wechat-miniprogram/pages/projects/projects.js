// pages/projects/projects.js
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

  // 打开项目链接
  openLink(e) {
    const url = e.currentTarget.dataset.url
    
    // 复制链接到剪贴板
    wx.setClipboardData({
      data: url,
      success: function() {
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 2000
        })
      }
    })
    
    // 如果是小程序内页面，可以使用wx.navigateTo
    // 如果是外部链接，可以使用web-view组件或复制链接
    // wx.navigateTo({
    //   url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
    // })
  },

  // 点击项目项展开/收起详情
  toggleProjectDetail(e) {
    const index = e.currentTarget.dataset.index
    const projectList = this.data.resumeData.projects
    projectList[index].expanded = !projectList[index].expanded
    
    this.setData({
      'resumeData.projects': projectList
    })
  },

  onShareAppMessage() {
    return {
      title: 'Becky的个人简历 - 项目经验',
      path: '/pages/projects/projects'
    }
  }
})