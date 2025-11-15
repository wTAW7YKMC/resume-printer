// config/app.js

/**
 * 应用全局配置
 */

module.exports = {
  // 应用基本信息
  appInfo: {
    name: '简历打印机',
    version: '1.0.0',
    description: '一个精美的微信小程序简历应用'
  },
  
  // API配置
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 10000
  },
  
  // 存储键名
  storageKeys: {
    resumeData: 'resume_data',
    userInfo: 'user_info',
    settings: 'app_settings'
  },
  
  // 页面路径
  pages: {
    index: '/pages/index/index',
    about: '/pages/about/about',
    experience: '/pages/experience/experience',
    education: '/pages/education/education',
    skills: '/pages/skills/skills',
    projects: '/pages/projects/projects'
  },
  
  // 颜色主题
  theme: {
    primaryColor: '#1890ff',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#f5222d',
    textColor: '#333333',
    textSecondaryColor: '#666666',
    borderColor: '#e8e8e8',
    backgroundColor: '#f5f5f5'
  },
  
  // 打字机效果配置
  typewriter: {
    typingSpeed: 50,
    pauseDuration: 1000,
    showCursor: true,
    cursorChar: '|'
  },
  
  // 动画配置
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  
  // 分享配置
  share: {
    title: '我的个人简历',
    path: '/pages/index/index',
    imageUrl: '/images/share.jpg'
  },
  
  // 联系方式配置
  contact: {
    email: 'support@example.com',
    phone: '400-123-4567',
    website: 'https://resume.example.com'
  }
}