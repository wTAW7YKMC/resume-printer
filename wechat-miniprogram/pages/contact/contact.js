// pages/contact/contact.js
const app = getApp()
const { copyToClipboard, showSuccess, showError, showLoading, hideLoading } = require('../../utils/util.js')
const { isEmpty } = require('../../utils/util.js')

Page({
  data: {
    resumeData: null,
    formData: {
      name: '',
      email: '',
      message: ''
    },
    submitting: false
  },

  onLoad() {
    // 获取简历数据
    const resumeData = app.getResumeData()
    
    this.setData({
      resumeData
    })
  },

  // 表单输入处理
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 复制联系方式
  copyContact(e) {
    const value = e.currentTarget.dataset.value
    const type = e.currentTarget.dataset.type
    
    copyToClipboard(value)
      .then(() => {
        showSuccess(`${type}已复制`)
      })
      .catch(() => {
        showError('复制失败，请重试')
      })
  },

  // 打开社交媒体链接
  openSocialLink(e) {
    const url = e.currentTarget.dataset.url
    
    // 复制链接到剪贴板
    copyToClipboard(url)
      .then(() => {
        showSuccess('链接已复制')
      })
      .catch(() => {
        showError('复制失败，请重试')
      })
    
    // 如果是小程序内页面，可以使用wx.navigateTo
    // 如果是外部链接，可以使用web-view组件或复制链接
    // wx.navigateTo({
    //   url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
    // })
  },

  // 提交消息
  submitMessage() {
    const { name, email, message } = this.data.formData
    
    // 表单验证
    if (!name.trim()) {
      showError('请输入您的姓名')
      return
    }
    
    if (!email.trim()) {
      showError('请输入您的邮箱')
      return
    }
    
    if (!message.trim()) {
      showError('请输入留言内容')
      return
    }
    
    // 邮箱格式简单验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showError('请输入正确的邮箱格式')
      return
    }
    
    this.setData({ submitting: true })
    showLoading('发送中...')
    
    // 这里应该调用后端API发送消息
    // 由于是演示，我们模拟发送过程
    setTimeout(() => {
      this.setData({ submitting: false })
      hideLoading()
      
      // 清空表单
      this.setData({
        formData: {
          name: '',
          email: '',
          message: ''
        }
      })
      
      showSuccess('消息发送成功')
    }, 1500)
  },

  // 拨打电话
  makePhoneCall(e) {
    const phoneNumber = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber,
      fail: () => {
        showError('拨打电话失败')
      }
    })
  },

  // 发送邮件
  sendEmail(e) {
    const email = e.currentTarget.dataset.email
    copyToClipboard(email)
      .then(() => {
        showSuccess('邮箱地址已复制，请在邮件应用中使用')
      })
      .catch(() => {
        showError('复制失败，请重试')
      })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.resumeData?.personalInfo?.name || '个人'}简历 - 联系方式`,
      path: '/pages/contact/contact'
    }
  }
})