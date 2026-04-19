// utils/data.js

/**
 * 数据处理工具函数
 */

/**
 * 格式化技能数据，添加百分比和颜色
 * @param {array} skills 技能数组
 * @return {array} 格式化后的技能数组
 */
const formatSkills = (skills) => {
  if (!skills || !Array.isArray(skills)) return []
  
  return skills.map(skill => {
    let percentage = 0
    let color = '#666'
    
    // 根据技能级别计算百分比和颜色
    if (typeof skill.level === 'number') {
      // 如果已经是数字级别，直接使用
      percentage = skill.level
      
      // 根据百分比设置颜色
      if (percentage >= 90) {
        color = '#07c160' // 绿色
      } else if (percentage >= 80) {
        color = '#1890ff' // 蓝色
      } else if (percentage >= 70) {
        color = '#722ed1' // 紫色
      } else {
        color = '#fa8c16' // 橙色
      }
    } else {
      // 如果是文本级别，转换为数字
      switch (skill.level) {
        case '精通':
          percentage = 90
          color = '#07c160'
          break
        case '熟练':
          percentage = 75
          color = '#1890ff'
          break
        case '掌握':
          percentage = 60
          color = '#722ed1'
          break
        case '了解':
          percentage = 40
          color = '#fa8c16'
          break
        default:
          percentage = 50
          color = '#666'
      }
    }
    
    return {
      ...skill,
      percentage,
      color
    }
  })
}

/**
 * 格式化日期范围
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期，可以为"至今"
 * @return {string} 格式化后的日期范围
 */
const formatDateRange = (startDate, endDate) => {
  if (!startDate) return ''
  
  const start = new Date(startDate)
  const startYear = start.getFullYear()
  const startMonth = start.getMonth() + 1
  
  let endText = ''
  if (endDate && endDate !== '至今') {
    const end = new Date(endDate)
    const endYear = end.getFullYear()
    const endMonth = end.getMonth() + 1
    endText = `${endYear}年${endMonth}月`
  } else if (endDate === '至今') {
    endText = '至今'
  }
  
  return `${startYear}年${startMonth}月 - ${endText}`
}

/**
 * 格式化工作经历数据
 * @param {array} experiences 工作经历数组
 * @return {array} 格式化后的工作经历数组
 */
const formatWorkExperience = (experiences) => {
  if (!experiences || !Array.isArray(experiences)) return []
  
  return experiences.map(exp => ({
    ...exp,
    period: formatDateRange(exp.startDate, exp.endDate),
    expanded: false // 默认不展开
  }))
}

/**
 * 格式化教育经历数据
 * @param {array} education 教育经历数组
 * @return {array} 格式化后的教育经历数组
 */
const formatEducation = (education) => {
  if (!education || !Array.isArray(education)) return []
  
  return education.map(edu => ({
    ...edu,
    period: formatDateRange(edu.startDate, edu.endDate),
    expanded: false // 默认不展开
  }))
}

/**
 * 格式化项目经验数据
 * @param {array} projects 项目经验数组
 * @return {array} 格式化后的项目经验数组
 */
const formatProjects = (projects) => {
  if (!projects || !Array.isArray(projects)) return []
  
  return projects.map(project => ({
    ...project,
    period: formatDateRange(project.startDate, project.endDate),
    expanded: false // 默认不展开
  }))
}

/**
 * 获取技能颜色
 * @param {string} level 技能级别
 * @return {string} 颜色值
 */
const getSkillColor = (level) => {
  switch (level) {
    case '精通':
      return '#07c160'
    case '熟练':
      return '#1890ff'
    case '掌握':
      return '#722ed1'
    case '了解':
      return '#fa8c16'
    default:
      return '#666'
  }
}

/**
 * 格式化简历数据
 * @param {object} resumeData 原始简历数据
 * @return {object} 格式化后的简历数据
 */
const formatResumeData = (resumeData) => {
  if (!resumeData) return null
  
  // 检查技能数据的结构
  let formattedSkills = {
    design: [],
    development: [],
    other: []
  }
  
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    // 新格式：技能是数组，每个元素有category和items
    // 转换为旧格式以便与现有模板兼容
    resumeData.skills.forEach(skillGroup => {
      // 直接处理技能项，不需要调用formatSkills函数
      const formattedItems = (skillGroup.items || []).map(skill => {
        let percentage, color;
        
        if (typeof skill.level === 'number') {
          percentage = skill.level
          
          // 根据百分比设置颜色
          if (percentage >= 90) {
            color = '#07c160' // 绿色
          } else if (percentage >= 80) {
            color = '#1890ff' // 蓝色
          } else if (percentage >= 70) {
            color = '#722ed1' // 紫色
          } else {
            color = '#fa8c16' // 橙色
          }
        } else {
          // 如果是文本级别，转换为数字
          switch (skill.level) {
            case '精通':
              percentage = 90
              color = '#07c160'
              break
            case '熟练':
              percentage = 75
              color = '#1890ff'
              break
            case '掌握':
              percentage = 60
              color = '#722ed1'
              break
            case '了解':
              percentage = 40
              color = '#fa8c16'
              break
            default:
              percentage = 50
              color = '#666'
          }
        }
        
        return {
          ...skill,
          percentage,
          color,
          level: typeof skill.level === 'number' ? `${skill.level}%` : skill.level
        }
      });
      
      // 根据类别名称分配到对应的组
      const categoryName = skillGroup.category
      if (categoryName === '专业技能' || categoryName === '设计技能' || categoryName === '技术技能') {
        formattedSkills.design = formattedItems
      } else if (categoryName === '组织能力' || categoryName === '开发技能' || categoryName === '管理技能') {
        formattedSkills.development = formattedItems
      } else {
        formattedSkills.other = formattedItems
      }
    })
  } else if (resumeData.skills && typeof resumeData.skills === 'object') {
    // 旧格式：技能是对象，有design、development、other等属性
    formattedSkills = {
      design: resumeData.skills.design ? 
        formatSkills(resumeData.skills.design) : [],
      development: resumeData.skills.development ? 
        formatSkills(resumeData.skills.development) : [],
      other: resumeData.skills.other ? 
        formatSkills(resumeData.skills.other) : []
    }
  }
  
  return {
    ...resumeData,
    skills: formattedSkills,
    workExperience: resumeData.workExperience ? 
      formatWorkExperience(resumeData.workExperience) : [],
    education: resumeData.education ? 
      formatEducation(resumeData.education) : [],
    projects: resumeData.projects ? 
      formatProjects(resumeData.projects) : []
  }
}

module.exports = {
  formatSkills,
  formatDateRange,
  formatWorkExperience,
  formatEducation,
  formatProjects,
  getSkillColor,
  formatResumeData
}