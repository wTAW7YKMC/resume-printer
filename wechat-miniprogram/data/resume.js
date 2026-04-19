// data/resume.js

/**
 * 简历数据 - 喻贝贝（Becky）
 */

module.exports = {
  personalInfo: {
    name: '喻贝贝（Becky）',
    title: '智能经济专业学生',
    avatar: 'https://picsum.photos/seed/avatar123/200/200.jpg',
    summary: '对宏观经济、数据分析充满热情的经济学学习者，擅长将理论知识应用于实践，曾参与校园经济调研与金融模拟竞赛，期待在经济领域探索更多可能性。',
    tagline: '个人宣言：风萧萧兮易水寒',
    location: '武汉理工大学 经济学院',
    details: [
      { label: '专业', value: '智能经济' },
      { label: '学历', value: '本科' },
      { label: '学校', value: '武汉理工大学' },
      { label: '状态', value: '在读' }
    ],
    contact: [
      { type: 'phone', value: '19571319571', icon: '📱' },
      { type: 'email', value: 'may_seventeen17@126.com', icon: '📧' },
      { type: 'location', value: '武汉理工大学 经济学院', icon: '📍' },
      { type: 'github', value: 'https://github.com/becky', icon: '🔗' }
    ],
    social: [
      { name: 'GitHub', url: 'https://github.com/becky', icon: '💻' },
      { name: 'LinkedIn', url: 'https://linkedin.com/in/becky', icon: '💼' },
      { name: 'Dribbble', url: 'https://dribbble.com/becky', icon: '🎨' }
    ]
  },
  skills: [
    {
      category: '专业技能',
      items: [
        { name: '数据分析', level: 85, description: '具备扎实的数据分析基础，能够处理和分析经济数据' },
        { name: '经济学理论', level: 90, description: '系统掌握微观经济学、宏观经济学等基础理论' },
        { name: '智能经济', level: 80, description: '了解智能经济相关技术和应用场景' },
        { name: '市场调研', level: 75, description: '具备市场调研和数据分析能力' }
      ]
    },
    {
      category: '组织能力',
      items: [
        { name: '活动策划', level: 85, description: '成功策划并组织多场学术研讨和案例分享活动' },
        { name: '团队协作', level: 90, description: '在协会工作中展现出色的团队合作能力' },
        { name: '流程管理', level: 80, description: '负责活动流程协调和物料准备，执行高效' },
        { name: '宣传推广', level: 75, description: '负责科创赛事的宣传推广工作' }
      ]
    }
  ],
  workExperience: [
    {
      id: 1,
      company: '武汉理工大学经济学人协会',
      logo: 'https://picsum.photos/seed/company1/100/100.jpg',
      position: '办公室副部长',
      startDate: '2021-09',
      endDate: '2023-06',
      period: '荣誉：年度之星',
      location: '武汉理工大学',
      description: '策划并落地学术研讨、案例分享等活动，衔接专业知识与实践应用；负责活动流程协调、物料准备，责任心强、执行高效获评 "年度之星"。',
      achievements: [
        '成功组织多场学术研讨活动',
        '获评"年度之星"荣誉称号'
      ],
      technologies: ['活动策划', '团队协作', '流程管理']
    },
    {
      id: 2,
      company: '武汉理工大学经济学院科学技术协会',
      logo: 'https://picsum.photos/seed/company2/100/100.jpg',
      position: '干事',
      startDate: '2020-09',
      endDate: '2022-06',
      period: '',
      location: '武汉理工大学',
      description: '参与统筹 "创新杯""品牌策划赛""能源经济大赛" 等科创赛事，负责宣传推广、师生对接、评审流程把控。',
      achievements: [
        '协助组织多项科创赛事',
        '负责赛事宣传推广工作'
      ],
      technologies: ['赛事组织', '宣传推广', '流程把控']
    }
  ],
  education: [
    {
      id: 1,
      school: '武汉理工大学',
      logo: 'https://picsum.photos/seed/school1/100/100.jpg',
      degree: '经济学学士',
      major: '智能经济',
      startDate: '2020-09',
      endDate: '2024-06',
      period: '2020 - 2024',
      location: '武汉, 中国',
      description: '主修智能经济专业，系统学习了经济学基础理论和数据分析技术。',
      achievements: [
        '参与校园经济调研项目',
        '参加金融模拟竞赛'
      ],
      activities: [
        '经济学人协会办公室副部长',
        '经济学院科学技术协会干事'
      ]
    }
  ],
  projects: [
    {
      id: 1,
      name: '学术研讨活动策划',
      thumbnail: 'https://picsum.photos/seed/project1/300/200.jpg',
      role: '活动负责人',
      startDate: '2022-03',
      endDate: '2023-05',
      description: '策划并落地多场学术研讨和案例分享活动，衔接专业知识与实践应用。',
      features: [
        '负责活动整体策划和流程设计',
        '协调各方资源，确保活动顺利进行',
        '邀请行业专家和学者参与分享',
        '收集参与者反馈，持续优化活动质量'
      ],
      achievements: [
        '成功举办8场学术研讨活动',
        '参与人数超过300人次',
        '获评"年度之星"荣誉称号'
      ],
      technologies: ['活动策划', '流程管理', '团队协作'],
      links: []
    },
    {
      id: 2,
      name: '科创赛事组织',
      thumbnail: 'https://picsum.photos/seed/project2/300/200.jpg',
      role: '赛事组织干事',
      startDate: '2021-09',
      endDate: '2022-06',
      description: '参与统筹"创新杯""品牌策划赛""能源经济大赛"等科创赛事，负责宣传推广、师生对接、评审流程把控。',
      features: [
        '负责赛事宣传推广工作',
        '协助师生对接和沟通',
        '参与评审流程把控',
        '整理赛事资料和成果'
      ],
      achievements: [
        '协助组织3项大型科创赛事',
        '参与人数超过500人次',
        '赛事获得校级优秀组织奖'
      ],
      technologies: ['赛事组织', '宣传推广', '流程把控'],
      links: []
    },
    {
      id: 3,
      name: '校园经济调研项目',
      thumbnail: 'https://picsum.photos/seed/project3/300/200.jpg',
      role: '项目成员',
      startDate: '2021-03',
      endDate: '2021-12',
      description: '参与校园经济调研项目，收集和分析校园经济数据，为学校决策提供参考。',
      features: [
        '参与调研问卷设计和数据收集',
        '协助数据分析和报告撰写',
        '参与调研结果展示和交流',
        '整理调研资料和文献'
      ],
      achievements: [
        '完成2项校园经济调研',
        '调研报告被学校采纳',
        '获得调研项目优秀成员称号'
      ],
      technologies: ['经济调研', '数据分析', '报告撰写'],
      links: []
    }
  ]
}