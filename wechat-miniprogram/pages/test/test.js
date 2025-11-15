// pages/test/test.js
const app = getApp()

Page({
  data: {
    resumeData: null,
    loading: true,
    error: null
  },

  onLoad() {
    console.log('测试页面加载')
    
    try {
      // 获取简历数据
      const rawData = app.getResumeData()
      console.log('原始数据:', rawData)
      
      this.setData({
        resumeData: rawData,
        loading: false
      })
    } catch (error) {
      console.error('加载数据出错:', error)
      this.setData({
        error: error.message,
        loading: false
      })
    }
  }
})