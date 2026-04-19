// pages/skills/skills.js
const app = getApp()

Page({
  data: {
    resumeData: null,
    hasSkills: false,
    skillsData: {
      design: [],
      development: [],
      other: []
    }
  },

  onLoad() {
    // 获取简历数据
    const resumeData = app.getResumeData()
    
    if (resumeData && resumeData.skills) {
      const skillsData = this.formatSkills(resumeData.skills)
      this.setData({
        resumeData: resumeData,
        hasSkills: true,
        skillsData: skillsData
      })
    }
  },

  // 格式化技能数据
  formatSkills(skills) {
    const result = {
      design: [],
      development: [],
      other: []
    }
    
    if (!skills) return result
    
    // 分类处理技能
    skills.forEach(skill => {
      const formattedSkill = {
        name: skill.name,
        level: skill.level || 50,
        levelText: this.getLevelText(skill.level || 50),
        color: this.getSkillColor(skill.level || 50)
      }
      
      // 根据技能类型分类
      if (skill.type === 'design') {
        result.design.push(formattedSkill)
      } else if (skill.type === 'development') {
        result.development.push(formattedSkill)
      } else {
        result.other.push(formattedSkill)
      }
    })
    
    return result
  },

  // 获取技能等级文本
  getLevelText(level) {
    if (level >= 90) return '精通'
    if (level >= 70) return '熟练'
    if (level >= 50) return '掌握'
    return '了解'
  },

  // 获取技能颜色
  getSkillColor(level) {
    if (level >= 90) return '#4CAF50' // 绿色
    if (level >= 70) return '#2196F3' // 蓝色
    if (level >= 50) return '#FF9800' // 橙色
    return '#9E9E9E' // 灰色
  },

  onShareAppMessage() {
    return {
      title: 'Becky的个人简历 - 技能专长',
      path: '/pages/skills/skills'
    }
  }
})