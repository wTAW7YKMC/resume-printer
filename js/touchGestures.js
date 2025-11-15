/**
 * 触摸手势模块
 * 为移动设备添加触摸手势支持
 */
class TouchGestures {
    /**
     * 构造函数
     * @param {HTMLElement} element - 要添加手势的元素
     * @param {Object} options - 配置选项
     * @param {Function} options.onSwipeLeft - 向左滑动回调
     * @param {Function} options.onSwipeRight - 向右滑动回调
     * @param {Function} options.onSwipeUp - 向上滑动回调
     * @param {Function} options.onSwipeDown - 向下滑动回调
     * @param {number} options.threshold - 滑动阈值（像素）
     * @param {number} options.timeout - 触摸超时时间（毫秒）
     */
    constructor(element, options = {}) {
        this.element = element;
        this.onSwipeLeft = options.onSwipeLeft || (() => {});
        this.onSwipeRight = options.onSwipeRight || (() => {});
        this.onSwipeUp = options.onSwipeUp || (() => {});
        this.onSwipeDown = options.onSwipeDown || (() => {});
        this.threshold = options.threshold || 50;
        this.timeout = options.timeout || 500;
        
        // 触摸状态
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化触摸事件监听
     */
    init() {
        if (!this.element) {
            console.error('TouchGestures: No element provided');
            return;
        }
        
        // 添加触摸事件监听器
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        
        // 添加鼠标事件监听器（用于桌面测试）
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }
    
    /**
     * 处理触摸开始事件
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchStart(event) {
        this.touchStartTime = Date.now();
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }
    
    /**
     * 处理触摸结束事件
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchEnd(event) {
        this.touchEndX = event.changedTouches[0].clientX;
        this.touchEndY = event.changedTouches[0].clientY;
        this.handleSwipe();
    }
    
    /**
     * 处理触摸移动事件
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchMove(event) {
        // 可以在这里添加拖动效果
    }
    
    /**
     * 处理鼠标按下事件（用于桌面测试）
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseDown(event) {
        this.touchStartTime = Date.now();
        this.touchStartX = event.clientX;
        this.touchStartY = event.clientY;
        this.isMouseDown = true;
    }
    
    /**
     * 处理鼠标释放事件（用于桌面测试）
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseUp(event) {
        if (this.isMouseDown) {
            this.touchEndX = event.clientX;
            this.touchEndY = event.clientY;
            this.handleSwipe();
            this.isMouseDown = false;
        }
    }
    
    /**
     * 处理鼠标移动事件（用于桌面测试）
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseMove(event) {
        if (this.isMouseDown) {
            // 可以在这里添加拖动效果
        }
    }
    
    /**
     * 处理滑动动作
     */
    handleSwipe() {
        // 检查触摸时间是否在有效范围内
        const touchDuration = Date.now() - this.touchStartTime;
        if (touchDuration > this.timeout) {
            return;
        }
        
        // 计算水平和垂直滑动距离
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // 确定主要滑动方向
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // 检查滑动距离是否超过阈值
        if (absDeltaX < this.threshold && absDeltaY < this.threshold) {
            return;
        }
        
        if (absDeltaX > absDeltaY) {
            // 水平滑动
            if (deltaX > 0) {
                // 向右滑动
                this.onSwipeRight();
            } else {
                // 向左滑动
                this.onSwipeLeft();
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                // 向下滑动
                this.onSwipeDown();
            } else {
                // 向上滑动
                this.onSwipeUp();
            }
        }
    }
    
    /**
     * 移除事件监听器
     */
    destroy() {
        if (!this.element) return;
        
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('mousedown', this.handleMouseDown);
        this.element.removeEventListener('mouseup', this.handleMouseUp);
        this.element.removeEventListener('mousemove', this.handleMouseMove);
    }
}

/**
 * 触摸导航模块
 * 为简历网站添加触摸导航支持
 */
class TouchNavigation {
    /**
     * 构造函数
     * @param {HTMLElement} container - 容器元素
     * @param {Array} sections - 简历部分列表
     * @param {Function} onNavigate - 导航回调函数
     * @param {Object} options - 配置选项
     */
    constructor(container, sections, onNavigate, options = {}) {
        this.container = container;
        this.sections = sections || [];
        this.onNavigate = onNavigate || (() => {});
        this.currentSectionIndex = 0;
        this.options = {
            enableKeyboardNav: options.enableKeyboardNav !== undefined ? options.enableKeyboardNav : true,
            enableSwipeNav: options.enableSwipeNav !== undefined ? options.enableSwipeNav : true,
            ...options
        };
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化触摸导航
     */
    init() {
        if (!this.container) {
            console.error('TouchNavigation: No container provided');
            return;
        }
        
        // 添加滑动导航
        if (this.options.enableSwipeNav) {
            this.gestures = new TouchGestures(this.container, {
                onSwipeLeft: this.handleSwipeLeft.bind(this),
                onSwipeRight: this.handleSwipeRight.bind(this),
                threshold: 80,
                timeout: 500
            });
        }
        
        // 添加键盘导航
        if (this.options.enableKeyboardNav) {
            this.setupKeyboardNavigation();
        }
    }
    
    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.navigatePrevious();
                    break;
                case 'ArrowRight':
                    this.navigateNext();
                    break;
                case 'ArrowUp':
                    this.navigatePrevious();
                    break;
                case 'ArrowDown':
                    this.navigateNext();
                    break;
            }
        });
    }
    
    /**
     * 处理向左滑动
     */
    handleSwipeLeft() {
        this.navigateNext();
    }
    
    /**
     * 处理向右滑动
     */
    handleSwipeRight() {
        this.navigatePrevious();
    }
    
    /**
     * 导航到下一部分
     */
    navigateNext() {
        if (this.currentSectionIndex < this.sections.length - 1) {
            this.currentSectionIndex++;
            this.onNavigate(this.sections[this.currentSectionIndex]);
        }
    }
    
    /**
     * 导航到上一部分
     */
    navigatePrevious() {
        if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            this.onNavigate(this.sections[this.currentSectionIndex]);
        }
    }
    
    /**
     * 设置当前部分
     * @param {string} section - 当前部分的名称
     */
    setCurrentSection(section) {
        const index = this.sections.indexOf(section);
        if (index !== -1) {
            this.currentSectionIndex = index;
        }
    }
    
    /**
     * 更新简历部分列表
     * @param {Array} sections - 新的简历部分列表
     */
    updateSections(sections) {
        this.sections = sections;
    }
    
    /**
     * 销毁触摸导航
     */
    destroy() {
        if (this.gestures) {
            this.gestures.destroy();
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TouchGestures, TouchNavigation };
} else {
    window.TouchGestures = TouchGestures;
    window.TouchNavigation = TouchNavigation;
}