/**
 * 内容渲染模块
 * 负责将JSON数据格式化为适合显示的文本内容
 */
class ContentRenderer {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {Object} options.templates - 自定义模板对象
     * @param {Function} options.dateFormatter - 日期格式化函数
     */
    constructor(options = {}) {
        this.templates = {
            ...this.getDefaultTemplates(),
            ...options.templates
        };
        this.dateFormatter = options.dateFormatter || this.defaultDateFormatter;
    }
    
    /**
     * 渲染内容
     * @param {string} section - 要渲染的部分名称
     * @param {Object} data - 简历数据
     * @returns {string} 格式化后的内容
     */
    render(section, data) {
        if (!data) {
            return '数据加载中...';
        }
        
        switch (section) {
            case 'about':
                return this.renderAbout(data.personalInfo);
            case 'experience':
                return this.renderExperience(data.workExperience);
            case 'education':
                return this.renderEducation(data.education);
            case 'skills':
                return this.renderSkills(data.skills);
            case 'projects':
                return this.renderProjects(data.projects);
            case 'contact':
                return this.renderContact(data.personalInfo);
            default:
                return '未知部分';
        }
    }
    
    /**
     * 渲染关于我部分
     * @param {Object} personalInfo - 个人信息
     * @returns {string} 格式化后的内容
     */
    renderAbout(personalInfo) {
        if (!personalInfo) {
            return '个人信息不可用';
        }
        
        let content = this.templates.about.header;
        
        content += `${this.templates.about.name}${personalInfo.name}\n`;
        content += `${this.templates.about.title}${personalInfo.title}\n\n`;
        content += `${personalInfo.tagline}\n\n`;
        content += `${this.templates.about.contact}\n`;
        content += `${this.templates.about.email}${personalInfo.email}\n`;
        content += `${this.templates.about.phone}${personalInfo.phone}\n`;
        content += `${this.templates.about.location}${personalInfo.location}\n\n`;
        
        if (personalInfo.socialLinks && personalInfo.socialLinks.length > 0) {
            content += `${this.templates.about.social}\n`;
            personalInfo.socialLinks.forEach(link => {
                content += `${this.templates.about.socialLink}${link.platform}: ${link.url}\n`;
            });
        }
        
        return content;
    }
    
    /**
     * 渲染工作经历部分
     * @param {Array} workExperience - 工作经历数组
     * @returns {string} 格式化后的内容
     */
    renderExperience(workExperience) {
        if (!workExperience || workExperience.length === 0) {
            return '暂无工作经历';
        }
        
        let content = this.templates.experience.header;
        
        workExperience.forEach(job => {
            content += `${this.templates.experience.company}${job.company} | ${job.position} (${job.period})\n`;
            content += `${this.templates.experience.location}${job.location}\n\n`;
            content += `${job.description}\n\n`;
            
            if (job.highlights && job.highlights.length > 0) {
                content += `${this.templates.experience.highlights}\n`;
                job.highlights.forEach(highlight => {
                    content += `${this.templates.experience.highlight}${highlight}\n`;
                });
                content += '\n';
            }
        });
        
        return content;
    }
    
    /**
     * 渲染教育经历部分
     * @param {Array} education - 教育经历数组
     * @returns {string} 格式化后的内容
     */
    renderEducation(education) {
        if (!education || education.length === 0) {
            return '暂无教育经历';
        }
        
        let content = this.templates.education.header;
        
        education.forEach(edu => {
            content += `${this.templates.education.institution}${edu.institution}\n`;
            content += `${this.templates.education.degree}${edu.degree} - ${edu.major} (${edu.period})\n`;
            content += `${this.templates.education.location}${edu.location}\n\n`;
            
            if (edu.achievements && edu.achievements.length > 0) {
                content += `${this.templates.education.achievements}\n`;
                edu.achievements.forEach(achievement => {
                    content += `${this.templates.education.achievement}${achievement}\n`;
                });
                content += '\n';
            }
        });
        
        return content;
    }
    
    /**
     * 渲染技能部分
     * @param {Object} skills - 技能对象
     * @returns {string} 格式化后的内容
     */
    renderSkills(skills) {
        if (!skills) {
            return '暂无技能信息';
        }
        
        let content = this.templates.skills.header;
        
        ['design', 'development', 'other'].forEach(category => {
            if (skills[category] && skills[category].length > 0) {
                content += `${this.getCategoryName(category)}:\n`;
                skills[category].forEach(skill => {
                    content += `${this.templates.skills.item}${skill.name} (${this.getProficiencyLevel(skill.proficiency)})\n`;
                });
                content += '\n';
            }
        });
        
        return content;
    }
    
    /**
     * 渲染项目部分
     * @param {Array} projects - 项目数组
     * @returns {string} 格式化后的内容
     */
    renderProjects(projects) {
        if (!projects || projects.length === 0) {
            return '暂无项目经历';
        }
        
        let content = this.templates.projects.header;
        
        projects.forEach(project => {
            content += `${this.templates.projects.name}${project.name} | ${project.role} (${project.period})\n\n`;
            content += `${project.description}\n\n`;
            
            if (project.technologies && project.technologies.length > 0) {
                content += `${this.templates.projects.technologies}${project.technologies.join(', ')}\n\n`;
            }
            
            if (project.outcomes && project.outcomes.length > 0) {
                content += `${this.templates.projects.outcomes}\n`;
                project.outcomes.forEach(outcome => {
                    content += `${this.templates.projects.outcome}${outcome}\n`;
                });
                content += '\n';
            }
        });
        
        return content;
    }
    
    /**
     * 渲染联系方式部分
     * @param {Object} personalInfo - 个人信息
     * @returns {string} 格式化后的内容
     */
    renderContact(personalInfo) {
        if (!personalInfo) {
            return '联系信息不可用';
        }
        
        let content = this.templates.contact.header;
        content += `${this.templates.contact.name}${personalInfo.name}\n`;
        content += `${this.templates.contact.title}${personalInfo.title}\n\n`;
        content += `${this.templates.contact.email}${personalInfo.email}\n`;
        content += `${this.templates.contact.phone}${personalInfo.phone}\n`;
        content += `${this.templates.contact.location}${personalInfo.location}\n\n`;
        
        if (personalInfo.socialLinks && personalInfo.socialLinks.length > 0) {
            content += `${this.templates.contact.social}\n`;
            personalInfo.socialLinks.forEach(link => {
                content += `${this.templates.contact.socialLink}${link.platform}: ${link.url}\n`;
            });
        }
        
        return content;
    }
    
    /**
     * 获取技能类别名称
     * @param {string} category - 技能类别
     * @returns {string} 本地化的类别名称
     */
    getCategoryName(category) {
        const categoryNames = {
            'design': '设计技能',
            'development': '开发技能',
            'other': '其他技能'
        };
        return categoryNames[category] || category;
    }
    
    /**
     * 获取熟练度级别
     * @param {number} proficiency - 熟练度数值
     * @returns {string} 本地化的熟练度级别
     */
    getProficiencyLevel(proficiency) {
        const levels = ['', '基础', '了解', '熟悉', '熟练', '精通'];
        return levels[proficiency] || '未知';
    }
    
    /**
     * 获取默认模板
     * @returns {Object} 默认模板对象
     */
    getDefaultTemplates() {
        return {
            about: {
                header: '个人简介\n\n',
                name: '姓名: ',
                title: '职位: ',
                contact: '联系方式:\n',
                email: '邮箱: ',
                phone: '电话: ',
                location: '位置: ',
                social: '社交媒体:\n',
                socialLink: ''
            },
            experience: {
                header: '工作经历\n\n',
                company: '',
                location: '位置: ',
                highlights: '主要成就:\n',
                highlight: '- '
            },
            education: {
                header: '教育经历\n\n',
                institution: '',
                degree: '',
                location: '位置: ',
                achievements: '成就:\n',
                achievement: '- '
            },
            skills: {
                header: '专业技能\n\n',
                item: '- '
            },
            projects: {
                header: '项目经历\n\n',
                name: '',
                technologies: '使用技术: ',
                outcomes: '成果:\n',
                outcome: '- '
            },
            contact: {
                header: '联系方式\n\n',
                name: '姓名: ',
                title: '职位: ',
                email: '邮箱: ',
                phone: '电话: ',
                location: '位置: ',
                social: '社交媒体:\n',
                socialLink: ''
            }
        };
    }
    
    /**
     * 默认日期格式化函数
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期
     */
    defaultDateFormatter(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }
    
    /**
     * 更新模板
     * @param {Object} newTemplates - 新的模板对象
     */
    updateTemplates(newTemplates) {
        this.templates = {
            ...this.templates,
            ...newTemplates
        };
    }
    
    /**
     * 设置日期格式化函数
     * @param {Function} formatter - 日期格式化函数
     */
    setDateFormatter(formatter) {
        this.dateFormatter = formatter;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentRenderer;
} else {
    window.ContentRenderer = ContentRenderer;
}