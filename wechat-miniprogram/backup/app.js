// app.js
const resumeData = require('./data/resume.js')
const appConfig = require('./config/app.js')

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    
    // 初始化简历数据
    this.initResumeData()
    
    // 检查更新
    this.checkUpdate()
  },
  
  onShow() {
    // 应用从后台进入前台时触发
  },
  
  onHide() {
    // 应用从前台进入后台时触发
  },
  
  globalData: {
    userInfo: null,
    resumeData: null,
    lastUpdated: null,
    config: appConfig
  },
  
  // 初始化简历数据
  initResumeData: function() {
    try {
      // 先尝试从本地缓存加载
      const cachedData = wx.getStorageSync(appConfig.storageKeys.resumeData)
      const cachedTime = wx.getStorageSync('resumeDataTime')
      
      if (cachedData && cachedTime && (Date.now() - cachedTime < 24 * 60 * 60 * 1000)) {
        // 如果缓存数据存在且未过期（24小时），使用缓存数据
        this.globalData.resumeData = cachedData
        this.globalData.lastUpdated = cachedTime
        console.log('从缓存加载简历数据成功')
      } else {
        // 否则使用本地数据文件
        this.globalData.resumeData = resumeData
        this.globalData.lastUpdated = Date.now()
        console.log('从本地文件加载简历数据成功')
        // 存储到本地缓存
        wx.setStorageSync(appConfig.storageKeys.resumeData, resumeData)
        wx.setStorageSync('resumeDataTime', Date.now())
      }
    } catch (error) {
      console.error('初始化简历数据失败:', error)
      // 设置默认数据，防止应用崩溃
      this.globalData.resumeData = {
        personalInfo: {
          name: 'Becky',
          title: '学生',
          summary: '欢迎浏览我的个人简历'
        }
      }
      this.globalData.lastUpdated = Date.now()
    }
  },
  
  // 获取简历数据
  getResumeData: function() {
    try {
      if (!this.globalData.resumeData) {
        console.warn('简历数据未初始化，尝试从本地加载')
        this.initResumeData()
      }
      return this.globalData.resumeData || {}
    } catch (error) {
      console.error('获取简历数据出错:', error)
      return {}
    }
  },
  
  // 获取最后更新时间
  getLastUpdated: function() {
    return this.globalData.lastUpdated
  },
  
  // 获取应用配置
  getConfig: function() {
    return this.globalData.config
  },
  
  // 检查小程序更新
  checkUpdate: function() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        console.log('是否有新版本：', res.hasUpdate)
      })
      
      updateManager.onUpdateReady(function() {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success(res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })
      
      updateManager.onUpdateFailed(function() {
        // 新版本下载失败
        wx.showToast({
          title: '更新失败',
          icon: 'none',
          duration: 2000
        })
      })
    }
  },
  
  // 格式化日期
  formatDate: function(date, format = 'YYYY-MM-DD') {
    if (!date) return ''
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    
    return format
      .replace('YYYY', year)
      .replace('MM', month < 10 ? '0' + month : month)
      .replace('DD', day < 10 ? '0' + day : day)
  },
  
  // 显示加载提示
  showLoading: function(title = '加载中') {
    wx.showLoading({
      title,
      mask: true
    })
  },
  
  // 隐藏加载提示
  hideLoading: function() {
    wx.hideLoading()
  },
  
  // 显示成功提示
  showSuccess: function(title) {
    wx.showToast({
      title,
      icon: 'success',
      duration: 2000
    })
  },
  
  // 显示错误提示
  showError: function(title) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 2000
    })
  },
  
  // 显示确认对话框
  showConfirm: function(content, title = '提示') {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        success(res) {
          resolve(res.confirm)
        }
      })
    })
  },
  
  // 复制到剪贴板
  copyToClipboard: function(data) {
    wx.setClipboardData({
      data,
      success: () => {
        this.showSuccess('已复制到剪贴板')
      },
      fail: () => {
        this.showError('复制失败')
      }
    })
  }
})