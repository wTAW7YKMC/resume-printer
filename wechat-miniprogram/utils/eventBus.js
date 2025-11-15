// utils/eventBus.js

/**
 * 简单的事件总线实现，用于页面间通信
 */

class EventBus {
  constructor() {
    this.events = {}
  }
  
  /**
   * 订阅事件
   * @param {string} eventName 事件名称
   * @param {function} callback 回调函数
   * @param {object} context 上下文对象
   */
  on(eventName, callback, context = null) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    
    this.events[eventName].push({
      callback,
      context
    })
  }
  
  /**
   * 取消订阅事件
   * @param {string} eventName 事件名称
   * @param {function} callback 回调函数
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return
    
    this.events[eventName] = this.events[eventName].filter(
      item => item.callback !== callback
    )
  }
  
  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {any} data 传递的数据
   */
  emit(eventName, data = null) {
    if (!this.events[eventName]) return
    
    this.events[eventName].forEach(item => {
      const { callback, context } = item
      if (context) {
        callback.call(context, data)
      } else {
        callback(data)
      }
    })
  }
  
  /**
   * 清除所有事件
   */
  clear() {
    this.events = {}
  }
}

// 创建全局事件总线实例
const eventBus = new EventBus()

module.exports = eventBus