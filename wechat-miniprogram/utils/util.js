// utils/util.js

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串，如 'YYYY-MM-DD'
 * @return {string} 格式化后的日期字符串
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()
  
  return format.replace(/YYYY/g, year)
              .replace(/MM/g, month < 10 ? `0${month}` : month)
              .replace(/DD/g, day < 10 ? `0${day}` : day)
              .replace(/HH/g, hour < 10 ? `0${hour}` : hour)
              .replace(/mm/g, minute < 10 ? `0${minute}` : minute)
              .replace(/ss/g, second < 10 ? `0${second}` : second)
}

/**
 * 显示加载提示
 * @param {string} title 提示文字
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示成功提示
 * @param {string} title 提示文字
 * @param {number} duration 持续时间，毫秒
 */
const showSuccess = (title, duration = 2000) => {
  wx.showToast({
    title,
    icon: 'success',
    duration
  })
}

/**
 * 显示错误提示
 * @param {string} title 提示文字
 * @param {number} duration 持续时间，毫秒
 */
const showError = (title, duration = 2000) => {
  wx.showToast({
    title,
    icon: 'none',
    duration
  })
}

/**
 * 显示确认对话框
 * @param {string} content 对话框内容
 * @param {string} title 对话框标题
 * @param {function} confirmCallback 确认回调
 * @param {function} cancelCallback 取消回调
 */
const showConfirm = (content, title = '提示', confirmCallback, cancelCallback) => {
  wx.showModal({
    title,
    content,
    success: function(res) {
      if (res.confirm && confirmCallback) {
        confirmCallback()
      } else if (res.cancel && cancelCallback) {
        cancelCallback()
      }
    }
  })
}

/**
 * 复制文本到剪贴板
 * @param {string} text 要复制的文本
 * @param {string} successText 成功提示文字
 */
const copyToClipboard = (text, successText = '已复制到剪贴板') => {
  wx.setClipboardData({
    data: text,
    success: function() {
      wx.showToast({
        title: successText,
        icon: 'success',
        duration: 2000
      })
    }
  })
}

/**
 * 获取系统信息
 * @return {object} 系统信息对象
 */
const getSystemInfo = () => {
  return new Promise((resolve) => {
    wx.getSystemInfo({
      success: (res) => resolve(res),
      fail: () => resolve({})
    })
  })
}

/**
 * 防抖函数
 * @param {function} func 要防抖的函数
 * @param {number} wait 等待时间，毫秒
 * @return {function} 防抖后的函数
 */
const debounce = (func, wait) => {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 节流函数
 * @param {function} func 要节流的函数
 * @param {number} wait 等待时间，毫秒
 * @return {function} 节流后的函数
 */
const throttle = (func, wait) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      func.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 深拷贝对象
 * @param {object} obj 要拷贝的对象
 * @return {object} 拷贝后的对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成随机ID
 * @param {number} length ID长度
 * @return {string} 随机ID
 */
const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * 检查是否为空值
 * @param {any} value 要检查的值
 * @return {boolean} 是否为空
 */
const isEmpty = (value) => {
  return value === null || 
         value === undefined || 
         value === '' || 
         (Array.isArray(value) && value.length === 0) ||
         (typeof value === 'object' && Object.keys(value).length === 0)
}

module.exports = {
  formatDate,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  copyToClipboard,
  getSystemInfo,
  debounce,
  throttle,
  deepClone,
  generateId,
  isEmpty
}