App({
  onLaunch: function () {
    console.log('小程序启动')
    // 初始化简历数据
    this.initResumeData()
  },
  
  globalData: {
    resumeData: null
  },
  
  // 初始化简历数据
  initResumeData: function() {
    try {
      // 尝试加载外部数据
      const resumeData = require('./data/resume.js');
      this.globalData.resumeData = resumeData;
      console.log('简历数据加载成功');
    } catch (error) {
      console.error('加载简历数据失败:', error);
      // 使用默认数据
      this.globalData.resumeData = {
        personalInfo: {
          name: "张三",
          title: "前端开发工程师",
          summary: "5年前端开发经验，精通HTML、CSS、JavaScript，熟悉React、Vue等主流框架。"
        },
        workExperience: [
          {
            id: 1,
            company: "ABC科技有限公司",
            position: "高级前端工程师",
            duration: "2020-至今",
            description: "负责公司核心产品的前端开发工作。"
          }
        ],
        education: [
          {
            id: 1,
            school: "某某大学",
            degree: "计算机科学与技术 本科",
            duration: "2012-2016"
          }
        ],
        skills: [
          {
            name: "HTML/CSS",
            level: 95
          },
          {
            name: "JavaScript",
            level: 90
          }
        ]
      };
    }
  },
  
  // 获取简历数据
  getResumeData: function() {
    return this.globalData.resumeData || {}
  }
})