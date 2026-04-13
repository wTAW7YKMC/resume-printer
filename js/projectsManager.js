/**
 * 作品集管理模块
 * 负责处理作品集页面的交互和动画效果
 */
class ProjectsManager {
    constructor(options = {}) {
        this.soundManager = options.soundManager;
        this.typewriter = options.typewriter;
        this.isInitialized = false;
        this.currentFlippedCard = null;
    }

    /**
     * 初始化作品集页面
     */
    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.isInitialized = true;
        console.log('ProjectsManager initialized');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 延迟绑定，等待DOM完全加载
        setTimeout(() => {
            this.bindCardEvents();
            this.bindFilterEvents();
        }, 100);
    }

    /**
     * 绑定卡片交互事件
     */
    bindCardEvents() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // 点击翻转卡片
            card.addEventListener('click', (e) => {
                if (e.target.closest('.project-flip-back')) {
                    this.flipCardBack(card);
                } else if (!card.classList.contains('flipped')) {
                    this.flipCard(card);
                }
            });

            // 鼠标悬停效果
            card.addEventListener('mouseenter', () => {
                this.handleCardHover(card, true);
            });

            card.addEventListener('mouseleave', () => {
                this.handleCardHover(card, false);
            });

            // 触摸设备支持
            card.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleCardTouch(card);
            });
        });
    }

    /**
     * 绑定筛选器事件
     */
    bindFilterEvents() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleFilterClick(btn);
            });
        });
    }

    /**
     * 翻转卡片
     * @param {HTMLElement} card - 卡片元素
     */
    flipCard(card) {
        if (this.currentFlippedCard && this.currentFlippedCard !== card) {
            this.flipCardBack(this.currentFlippedCard);
        }

        card.classList.add('flipped');
        this.currentFlippedCard = card;
        
        // 播放音效
        if (this.soundManager && this.soundManager.enabled) {
            this.soundManager.playTypingSound({ duration: 200 });
        }

        // 打字机效果显示背面内容
        const backContent = card.querySelector('.project-details');
        if (backContent && this.typewriter) {
            const originalContent = backContent.innerHTML;
            backContent.innerHTML = '';
            
            this.typewriter.typeText(backContent, originalContent, {
                speed: 50,
                onComplete: () => {
                    console.log('Card content typed');
                }
            });
        }
    }

    /**
     * 翻转卡片返回
     * @param {HTMLElement} card - 卡片元素
     */
    flipCardBack(card) {
        card.classList.remove('flipped');
        this.currentFlippedCard = null;
        
        // 播放音效
        if (this.soundManager && this.soundManager.enabled) {
            this.soundManager.playTypingSound({ duration: 150 });
        }
    }

    /**
     * 处理卡片悬停效果
     * @param {HTMLElement} card - 卡片元素
     * @param {boolean} isEnter - 是否进入
     */
    handleCardHover(card, isEnter) {
        if (isEnter) {
            card.style.transform = 'translateY(-5px) scale(1.02)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        } else {
            card.style.transform = '';
            card.style.boxShadow = '';
        }
    }

    /**
     * 处理卡片触摸事件
     * @param {HTMLElement} card - 卡片元素
     */
    handleCardTouch(card) {
        if (card.classList.contains('flipped')) {
            this.flipCardBack(card);
        } else {
            this.flipCard(card);
        }
    }

    /**
     * 处理筛选器点击
     * @param {HTMLElement} btn - 筛选按钮
     */
    handleFilterClick(btn) {
        const filterType = btn.dataset.filter;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        // 筛选项目
        this.filterProjects(filterType);
    }

    /**
     * 筛选项目
     * @param {string} filterType - 筛选类型
     */
    filterProjects(filterType) {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const technologies = card.dataset.technologies || '';
            
            if (filterType === 'all' || technologies.includes(filterType)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    /**
     * 渲染作品集内容
     * @param {Array} projects - 项目数据
     * @returns {string} HTML内容
     */
    renderProjects(projects) {
        if (!projects || projects.length === 0) {
            return '<div class="no-projects">暂无项目数据</div>';
        }
        
        let html = `
            <div class="projects-grid">
        `;
        
        projects.forEach((project, index) => {
            html += this.renderProjectCard(project, index);
        });
        
        html += `
            </div>
        `;
        
        return html;
    }

    /**
     * 渲染单个项目卡片
     * @param {Object} project - 项目对象
     * @param {number} index - 项目索引
     * @returns {string} 项目卡片HTML
     */
    renderProjectCard(project, index) {
        const technologies = project.technologies ? project.technologies.join(', ') : '';
        const outcomes = project.outcomes ? project.outcomes.join('、') : '';
        
        return `
            <div class="project-card" data-index="${index}" data-technologies="${technologies}">
                <div class="project-card-inner">
                    <!-- 卡片正面 -->
                    <div class="project-card-front">
                        <div class="project-header">
                            <h3 class="project-name">${project.name}</h3>
                            <span class="project-period">${project.period || ''}</span>
                        </div>
                        <div class="project-role">${project.role || ''}</div>
                        <div class="project-description">${project.description || ''}</div>
                        <div class="project-technologies">
                            <span class="tech-label">技术栈：</span>
                            <span class="tech-list">${technologies}</span>
                        </div>
                        <div class="project-flip-hint">点击查看详情 →</div>
                    </div>
                    
                    <!-- 卡片背面 -->
                    <div class="project-card-back">
                        <div class="project-details">
                            <h4>项目成果</h4>
                            <div class="project-outcomes">${outcomes}</div>
                            <div class="project-highlights">
                                <h4>核心亮点</h4>
                                <ul>
                                    <li>创新性的解决方案</li>
                                    <li>用户友好的设计</li>
                                    <li>实际应用价值</li>
                                </ul>
                            </div>
                        </div>
                        <div class="project-flip-back">← 返回</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.isInitialized = false;
        this.currentFlippedCard = null;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsManager;
} else {
    window.ProjectsManager = ProjectsManager;
}