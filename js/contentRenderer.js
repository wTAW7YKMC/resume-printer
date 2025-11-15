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
        
        // 按照用户指定的格式渲染About部分
        let content = `姓名： 喻贝贝（Becky）\n\n`;
        content += `院校：武汉理工大学\n\n`;
        content += `学院：经济学院\n\n`;
        content += `专业：智能经济\n\n`;
        content += `个人标签：对宏观经济、数据分析充满热情的经济学学习者，擅长将理论知识应用于实践，曾参与校园经济调研与金融模拟竞赛，期待在经济领域探索更多可能性。\n\n`;
        content += `个人宣言：风萧萧兮易水寒\n\n`;
        
        return content;
    }
    
    /**
     * 渲染工作经历部分
     * @param {Array} workExperience - 工作经历数组
     * @returns {string} 格式化后的内容
     */
    renderExperience(workExperience) {
        // 按照用户指定的格式渲染Experience部分
        let content = `1. 武汉理工大学经济学人协会\n`;
        content += `职位：办公室副部长 | 荣誉：年度之星\n`;
        content += `核心工作：\n`;
        content += `策划并落地学术研讨、案例分享等活动，衔接专业知识与实践应用；\n`;
        content += `负责活动流程协调、物料准备，责任心强、执行高效获评 "年度之星"。\n\n`;
        content += `2. 武汉理工大学经济学院科学技术协会\n`;
        content += `职位：干事\n`;
        content += `核心工作：\n`;
        content += `参与统筹 "创新杯""品牌策划赛""能源经济大赛" 等科创赛事，负责宣传推广、师生对接、评审流程把控；\n\n`;
        
        return content;
    }
    
    /**
     * 渲染教育经历部分
     * @param {Array} education - 教育经历数组
     * @returns {string} 格式化后的内容
     */
    renderEducation(education) {
        // 按照用户指定的格式渲染Education部分
        let content = `武汉理工大学 ｜ 经济学院 ｜ 经济学专业 ｜ 2024.09 - 至今\n`;
        content += `- 核心课程：微观经济学、宏观经济学、统计学、货币金融学；\n`;
        content += `- 成绩：专业前30%\n\n`;
        
        return content;
    }
    
    /**
     * 渲染技能部分
     * @param {Object} skills - 技能对象
     * @returns {string} 格式化后的内容
     */
    renderSkills(skills) {
        // 按照用户指定的格式渲染Skills部分
        let content = `个人优势\n`;
        content += `1.责任担当：曾任班级纪律委员、学习委员，牵头学风建设与日常管理，获评 "经济学院优秀团员"，具备良好的 服务意识与执行力；\n`;
        content += `2.工具技能：精通 PowerPoint、Excel、Word；熟练运用 Trae、v0、DeepSeek、文心一言等辅助学习，掌握 Axure 产品策划基础操作；\n`;
        content += `3.组织统筹：曾任学院志愿者协会负责人，策划执行志愿服务活动，涵盖人员调度、资源对接、全流程把控。\n\n`;
        
        return content;
    }
    
    /**
     * 渲染项目部分
     * @param {Array} projects - 项目数组
     * @returns {string} 格式化后的内容
     */
    renderProjects(projects) {
        // 按照用户指定的格式渲染Projects部分
        let content = `实践经历\n`;
        content += `1.经济学院 "创新杯"\n`;
        content += `2024-12\n`;
        content += `角色：核心成员 | 作品：《氢动氨能》（创业类）| 成果：校级优秀奖\n`;
        content += `核心贡献：\n`;
        content += `主导项目 PPT 设计与创业策划书撰写，结合智能经济思维优化项目逻辑框架；\n`;
        content += `参与可行性分析与创意打磨，输出完整创业方案，助力团队斩获校级奖项。\n\n`;
        content += `2.法学与人文社会学院 "创新杯"\n`;
        content += `2025-3\n`;
        content += `角色：核心成员 | 作品：《乐享余年 — 基于武汉市情的老年公寓市场分析与城市嵌入式养老研究》\n`;
        content += `成果：校级铜奖\n`;
        content += `核心贡献：\n`;
        content += `负责实地调研（武汉养老机构访谈、数据采集）、PPT 逻辑优化与策划案美工设计；\n`;
        content += `运用市场分析方法整理调研数据，输出可视化报告，为项目获奖提供关键支撑。\n\n`;
        content += `3.车路云未来学习项目\n`;
        content += `2025-6\n`;
        content += `方向：数字园区数字孪生\n`;
        content += `核心贡献：\n`;
        content += `运用 Axure 梳理产品需求，撰写基础策划方案，辅助定义数字园区功能模块；\n`;
        content += `结合智能经济、数字经济专业知识优化产品逻辑，积累实践经验。\n\n`;
        
        return content;
    }
    
    /**
     * 渲染联系方式部分
     * @param {Object} personalInfo - 个人信息
     * @returns {string} 格式化后的内容
     */
    renderContact(personalInfo) {
        // 按照用户指定的格式渲染Contact部分
        let content = `email：may_seventeen17@126.com\n`;
        content += `telephone：19571319571\n`;
        content += `wechat:19571319571\n`;
        content += `address:武汉市洪山区珞狮路雄楚大道武汉理工大学\n`;
        content += `github: https://github.com/wTAW7YKMC\n\n`;
        
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