/**
 * 异常页面互动功能模块
 * 复古打字机风格的趣味交互体验
 * 版本: 1.0.0
 */

(function() {
    'use strict';

    // ========================================
    // 配置项
    // ========================================
    const CONFIG = {
        easterEggClicks: 5,           // 触发彩蛋所需点击次数
        cursorTrailInterval: 50,      // 光标轨迹生成间隔(ms)
        keyRippleDuration: 300,       // 按键波纹持续时间(ms)
        tipRotationInterval: 5000,    // 提示轮播间隔(ms)
        colors: {
            primary: '#8b4513',       // 鞍棕色（主色）
            secondary: '#a67c52',     // 棕褐色
            light: '#e8dcc8'          // 浅米色
        }
    };

    // ========================================
    // 彩蛋内容库
    // ========================================
    const EASTER_EGGS = [
        {
            icon: '🎉',
            title: '发现彩蛋！',
            message: '生活就像打字机，有时候你需要退格重来...',
            detail: '你是个有好奇心的人！这正是我欣赏的品质。',
            action: { text: '查看我的技能', url: 'index.html?showSplash=false#skills' }
        },
        {
            icon: '⌨️',
            title: '打字机小知识',
            message: '第一台商用打字机诞生于1874年，由Remington公司制造',
            detail: '它彻底改变了商业通信的方式。',
            action: null
        },
        {
            icon: '💡',
            title: '编程哲学',
            message: '"代码如诗，调试如解谜"',
            detail: '每一个错误都是一次学习的机会。',
            action: null
        },
        {
            icon: '✨',
            title: '隐藏技能',
            message: '这个网站使用纯原生 HTML/CSS/JS 构建',
            detail: '没有框架，只有对细节的执着追求。',
            action: { text: '查看项目源码', url: 'https://github.com/wTAW7YKMC/resume-printer' }
        },
        {
            icon: '🎯',
            title: '求职小贴士',
            message: '404 Not Found = Opportunity Found',
            detail: '迷路的时候，往往能发现意想不到的风景。',
            action: { text: '返回主页探索', url: 'index.html' }
        }
    ];

    // ========================================
    // 趣味提示库
    // ========================================
    const FUN_TIPS = [
        { icon: '💡', text: '你知道吗？第一台商用打字机诞生于1874年' },
        { icon: '⌨️', text: '试试按一下键盘上的任意键，看看会发生什么...' },
        { icon: '🎯', text: '迷路了吗？点击上方的导航链接吧' },
        { icon: '✨', text: '这个页面正在等待被重新发现' },
        { icon: '🔍', text: '提示：连续点击错误代码5次有惊喜哦~' },
        { icon: '📝', text: '打字机的发明让写作速度提高了5倍' },
        { icon: '🎨', text: '这个网站的配色灵感来自老式牛皮纸' },
        { icon: '⚡', text: '按 / 键可以快速搜索（如果已启用）' },
        { icon: '🌟', text: '你是一个注重细节的人，我欣赏这一点' },
        { icon: '🚀', text: '准备好返回主页继续探索了吗？' }
    ];

    // ========================================
    // 方案1：可点击错误代码 + 彩蛋系统
    // ========================================
    class ErrorCodeInteraction {
        constructor() {
            this.clickCount = 0;
            this.errorCode = document.querySelector('.error-code');
            this.easterEggContainer = null;
            
            if (this.errorCode) {
                this.init();
            }
        }

        init() {
            this.errorCode.style.cursor = 'pointer';
            this.errorCode.title = `点击试试看！(已点击 ${this.clickCount}/${CONFIG.easterEggClicks} 次)`;
            
            this.errorCode.addEventListener('click', (e) => this.handleClick(e));
            
            this.createEasterEggContainer();
        }

        handleClick(e) {
            this.clickCount++;
            
            // 更新标题提示
            this.errorCode.title = `点击试试看！(已点击 ${this.clickCount}/${CONFIG.easterEggClicks} 次)`;
            
            // 触发弹跳动画
            this.triggerBounceAnimation();
            
            // 创建点击波纹效果
            this.createClickRipple(e);
            
            // 检查是否触发彩蛋
            if (this.clickCount >= CONFIG.easterEggClicks) {
                this.triggerEasterEgg();
                this.clickCount = 0; // 重置计数器
            }
        }

        triggerBounceAnimation() {
            this.errorCode.style.animation = 'none';
            this.errorCode.offsetHeight; // 触发重排
            this.errorCode.style.animation = 'errorCodeBounce 0.6s ease';
        }

        createClickRipple(e) {
            const ripple = document.createElement('div');
            ripple.className = 'click-ripple';
            
            const rect = this.errorCode.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.errorCode.style.position = 'relative';
            this.errorCode.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        }

        createEasterEggContainer() {
            this.easterEggContainer = document.createElement('div');
            this.easterEggContainer.className = 'easter-egg-container';
            this.easterEggContainer.innerHTML = `
                <div class="easter-egg-content">
                    <span class="easter-egg-icon"></span>
                    <h3 class="easter-egg-title"></h3>
                    <p class="easter-egg-message"></p>
                    <p class="easter-egg-detail"></p>
                    <div class="easter-egg-action"></div>
                    <button class="easter-egg-close" onclick="this.closest('.easter-egg-container').classList.remove('active')">✕ 关闭</button>
                </div>
            `;
            document.body.appendChild(this.easterEggContainer);
            
            // 点击外部关闭
            this.easterEggContainer.addEventListener('click', (e) => {
                if (e.target === this.easterEggContainer) {
                    this.easterEggContainer.classList.remove('active');
                }
            });
        }

        triggerEasterEgg() {
            const egg = EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)];
            
            const container = this.easterEggContainer;
            container.querySelector('.easter-egg-icon').textContent = egg.icon;
            container.querySelector('.easter-egg-title').textContent = egg.title;
            container.querySelector('.easter-egg-message').textContent = egg.message;
            container.querySelector('.easter-egg-detail').textContent = egg.detail;
            
            const actionDiv = container.querySelector('.easter-egg-action');
            if (egg.action) {
                actionDiv.innerHTML = `<a href="${egg.action.url}" class="easter-egg-btn">${egg.action.text}</a>`;
            } else {
                actionDiv.innerHTML = '';
            }
            
            container.classList.add('active');
        }
    }

    // ========================================
    // 方案2：键盘敲击效果
    // ========================================
    class KeyboardRippleEffect {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        }

        handleKeyPress(e) {
            // 忽略特殊按键和输入框内的按键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'Tab' || e.key === 'Escape') return;

            const ripple = document.createElement('div');
            ripple.className = 'key-ripple';
            ripple.textContent = e.key.length === 1 ? e.key.toUpperCase() : '';
            
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            
            document.body.appendChild(ripple);
            
            requestAnimationFrame(() => {
                ripple.classList.add('active');
            });
            
            setTimeout(() => {
                ripple.classList.remove('active');
                setTimeout(() => ripple.remove(), 300);
            }, 50);
        }
    }

    // ========================================
    // 方案3：鼠标光标轨迹
    // ========================================
    class CursorTrailEffect {
        constructor() {
            this.lastTime = 0;
            this.trails = [];
            this.maxTrails = 20;
            
            this.init();
        }

        init() {
            // 只在桌面端启用（避免移动端性能问题）
            if (window.innerWidth > 768) {
                document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
                
                // 定期清理旧轨迹
                setInterval(() => this.cleanup(), 1000);
            }
        }

        handleMouseMove(e) {
            const now = Date.now();
            if (now - this.lastTime < CONFIG.cursorTrailInterval) return;
            
            this.lastTime = now;
            this.createTrail(e.clientX, e.clientY);
        }

        createTrail(x, y) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.textContent = '|';
            trail.style.left = x + 'px';
            trail.style.top = y + 'px';
            
            document.body.appendChild(trail);
            this.trails.push(trail);
            
            // 限制轨迹数量
            if (this.trails.length > this.maxTrails) {
                const oldTrail = this.trails.shift();
                oldTrail.remove();
            }
            
            // 自动移除
            setTimeout(() => {
                trail.classList.add('fading');
                setTimeout(() => {
                    trail.remove();
                    const index = this.trails.indexOf(trail);
                    if (index > -1) this.trails.splice(index, 1);
                }, 500);
            }, 400);
        }

        cleanup() {
            // 清理可能残留的轨迹元素
            this.trails.forEach(trail => {
                if (!document.body.contains(trail)) {
                    const index = this.trails.indexOf(trail);
                    if (index > -1) this.trails.splice(index, 1);
                }
            });
        }
    }

    // ========================================
    // 方案4：随机提示轮播
    // ========================================
    class TipRotationSystem {
        constructor() {
            this.currentIndex = 0;
            this.tipElement = null;
            this.intervalId = null;
            
            this.init();
        }

        init() {
            // 在错误描述后插入提示容器
            const errorDescription = document.querySelector('.error-description');
            if (!errorDescription) return;

            const tipContainer = document.createElement('div');
            tipContainer.className = 'fun-tip-container';
            tipContainer.innerHTML = `
                <button class="tip-nav prev" aria-label="上一条">◀</button>
                <div class="tip-content">
                    <span class="tip-icon"></span>
                    <span class="tip-text"></span>
                </div>
                <button class="tip-nav next" aria-label="下一条">▶</button>
            `;
            
            errorDescription.parentNode.insertBefore(tipContainer, errorDescription.nextSibling);
            
            this.tipElement = tipContainer;
            
            // 绑定导航事件
            tipContainer.querySelector('.prev').addEventListener('click', () => this.showPreviousTip());
            tipContainer.querySelector('.next').addEventListener('click', () => this.showNextTip());
            
            // 显示第一条提示
            this.updateTipContent(FUN_TIPS[0]);
            
            // 启动自动轮播
            this.startAutoRotation();
            
            // 鼠标悬停时暂停
            tipContainer.addEventListener('mouseenter', () => this.stopAutoRotation());
            tipContainer.addEventListener('mouseleave', () => this.startAutoRotation());
        }

        updateTipContent(tip) {
            this.tipElement.querySelector('.tip-icon').textContent = tip.icon;
            this.tipElement.querySelector('.tip-text').textContent = tip.text;
        }

        showNextTip() {
            this.currentIndex = (this.currentIndex + 1) % FUN_TIPS.length;
            this.animateTipChange(FUN_TIPS[this.currentIndex]);
        }

        showPreviousTip() {
            this.currentIndex = (this.currentIndex - 1 + FUN_TIPS.length) % FUN_TIPS.length;
            this.animateTipChange(FUN_TIPS[this.currentIndex]);
        }

        animateTipChange(tip) {
            const content = this.tipElement.querySelector('.tip-content');
            content.classList.add('changing');
            
            setTimeout(() => {
                this.updateTipContent(tip);
                content.classList.remove('changing');
            }, 300);
        }

        startAutoRotation() {
            this.stopAutoRotation();
            this.intervalId = setInterval(() => this.showNextTip(), CONFIG.tipRotationInterval);
        }

        stopAutoRotation() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    }

    // ========================================
    // 方案5：快捷键助手（可选）
    // ========================================
    class ShortcutHelper {
        constructor() {
            this.searchModal = null;
            this.isOpen = false;
            
            this.init();
        }

        init() {
            document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
            this.createSearchModal();
        }

        handleGlobalKeydown(e) {
            // 按 / 键打开搜索
            if (e.key === '/' && !this.isOpen && !this.isInputFocused()) {
                e.preventDefault();
                this.openSearch();
            }
            
            // 按 Esc 关闭
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSearch();
            }
        }

        isInputFocused() {
            const tag = document.activeElement.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA';
        }

        createSearchModal() {
            this.searchModal = document.createElement('div');
            this.searchModal.className = 'search-modal';
            this.searchModal.innerHTML = `
                <div class="search-modal-content">
                    <h3>🔍 快速导航</h3>
                    <input type="text" class="search-input" placeholder="输入关键词..." />
                    <div class="search-results"></div>
                    <div class="search-shortcut-hint">/ 打开 · Esc 关闭</div>
                </div>
            `;
            
            document.body.appendChild(this.searchModal);
            
            const input = this.searchModal.querySelector('.search-input');
            input.addEventListener('input', (e) => this.handleSearch(e.target.value));
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.selectFirstResult();
                }
            });
            
            // 点击背景关闭
            this.searchModal.addEventListener('click', (e) => {
                if (e.target === this.searchModal) {
                    this.closeSearch();
                }
            });
        }

        openSearch() {
            this.isOpen = true;
            this.searchModal.classList.add('active');
            setTimeout(() => {
                this.searchModal.querySelector('.search-input').focus();
            }, 100);
        }

        closeSearch() {
            this.isOpen = false;
            this.searchModal.classList.remove('active');
            this.searchModal.querySelector('.search-input').value = '';
            this.searchModal.querySelector('.search-results').innerHTML = '';
        }

        handleSearch(query) {
            const results = this.searchModal.querySelector('.search-results');
            
            if (!query.trim()) {
                results.innerHTML = '';
                return;
            }
            
            const pages = [
                { name: '关于我', url: 'index.html?showSplash=false', keywords: ['about', '关于', '个人'] },
                { name: '项目展示', url: 'projects.html', keywords: ['project', '项目', '作品'] },
                { name: '工作经历', url: 'index.html?showSplash=false#experience', keywords: ['experience', '经历', '工作'] },
                { name: '技能专长', url: 'index.html?showSplash=false#skills', keywords: ['skill', '技能', '能力'] },
                { name: '联系方式', url: 'index.html?showSplash=false#contact', keywords: ['contact', '联系', '邮箱'] },
                { name: '返回主页', url: 'index.html', keywords: ['home', '主页', '首页'] }
            ];
            
            const matches = pages.filter(page => 
                page.name.toLowerCase().includes(query.toLowerCase()) ||
                page.keywords.some(k => k.includes(query.toLowerCase()))
            );
            
            results.innerHTML = matches.map(page => `
                <a href="${page.url}" class="search-result-item">${page.name}</a>
            `).join('');
            
            if (matches.length === 0) {
                results.innerHTML = '<div class="no-results">未找到相关页面</div>';
            }
        }

        selectFirstResult() {
            const firstResult = this.searchModal.querySelector('.search-result-item');
            if (firstResult) {
                firstResult.click();
            }
        }
    }

    // ========================================
    // 初始化所有互动功能
    // ========================================
    function initAllInteractions() {
        // 等待DOM完全加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new ErrorCodeInteraction();      // 方案1
                new KeyboardRippleEffect();       // 方案2
                new CursorTrailEffect();          // 方案3
                new TipRotationSystem();          // 方案4
                new ShortcutHelper();             // 方案5
                
                console.log('✅ 所有异常页面互动功能已加载');
            });
        } else {
            new ErrorCodeInteraction();
            new KeyboardRippleEffect();
            new CursorTrailEffect();
            new TipRotationSystem();
            new ShortcutHelper();
            
            console.log('✅ 所有异常页面互动功能已加载');
        }
    }

    // 启动
    initAllInteractions();

})();