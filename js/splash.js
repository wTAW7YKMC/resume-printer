// 开屏页面交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const titleText = document.getElementById('title-text');
    const subtitle = document.getElementById('subtitle');
    const introText = document.getElementById('intro-text');
    const enterBtn = document.getElementById('enter-btn');
    const footerText = document.querySelector('.footer-text');
    const loadingDots = document.querySelector('.loading-dots');
    
    // 检查是否从主页返回
    const fromMain = document.referrer.includes('index.html') || sessionStorage.getItem('fromMain') === 'true';
    
    // 如果是从主页返回，清除之前的标记
    if (fromMain) {
        sessionStorage.removeItem('fromMain');
    }
    
    // 打字机效果配置
    const typeWriterConfig = {
        title: "Becky's Resume",
        subtitle: "循此苦旅，终抵繁星",
        intro: "只此一刻，我们许下一样的愿望"
    };
    
    // 初始化页面
    initSplashPage();
    
    // 初始化开屏页面
    function initSplashPage() {
        // 开始打字机效果
        typeText(titleText, typeWriterConfig.title, 0, () => {
            // 标题打完后，显示副标题
            typeText(subtitle, typeWriterConfig.subtitle, 0, () => {
                // 副标题打完后，显示简介
                typeText(introText, typeWriterConfig.intro, 0, () => {
                    // 简介打完后，更新页脚文本
                    footerText.textContent = '准备就绪，点击查看完整简历';
                    loadingDots.style.display = 'none';
                });
            });
        });
        
        // 添加按钮点击事件
        enterBtn.addEventListener('click', navigateToMain);
        
        // 添加键盘事件
        document.addEventListener('keydown', handleKeyPress);
        
        // 预加载主页面资源
        preloadMainPage();
    }
    
    // 打字机效果
    function typeText(element, text, index, callback) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            
            // 添加打字音效（如果需要）
            playTypeSound();
            
            // 随机打字速度，模拟真实打字
            const speed = Math.random() * 100 + 50;
            setTimeout(() => {
                typeText(element, text, index + 1, callback);
            }, speed);
        } else if (callback) {
            callback();
        }
    }
    
    // 播放打字音效（模拟）
    function playTypeSound() {
        // 创建一个简单的音频上下文来生成打字声音
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800 + Math.random() * 400; // 随机频率
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // 忽略音频错误，静默处理
        }
    }
    
    // 处理键盘按键
    function handleKeyPress(event) {
        // 防止在输入框中触发
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // 任意键跳转到主页
        navigateToMain();
    }
    
    // 导航到主页
    function navigateToMain() {
        // 设置从开屏页面跳转的标记
        sessionStorage.setItem('fromSplash', 'true');
        
        // 添加淡出效果
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0';
        
        // 延迟跳转，等待淡出效果完成
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
    
    // 预加载主页面资源
    function preloadMainPage() {
        // 创建隐藏的链接元素预加载CSS
        const mainCssLink = document.createElement('link');
        mainCssLink.rel = 'preload';
        mainCssLink.as = 'style';
        mainCssLink.href = 'css/style.css';
        document.head.appendChild(mainCssLink);
        
        // 预加载主页HTML
        fetch('index.html')
            .then(response => response.text())
            .then(html => {
                // 存储在会话存储中，以便快速访问
                try {
                    sessionStorage.setItem('mainPageHTML', html);
                } catch (e) {
                    // 忽略存储错误
                }
            })
            .catch(error => {
                console.log('预加载主页失败，但不影响正常访问:', error);
            });
        
        // 预加载简历数据
        fetch('resume-data.json')
            .then(response => response.json())
            .then(data => {
                // 存储在会话存储中，以便快速访问
                try {
                    sessionStorage.setItem('resumeData', JSON.stringify(data));
                } catch (e) {
                    // 忽略存储错误
                }
            })
            .catch(error => {
                console.log('预加载简历数据失败，但不影响正常访问:', error);
            });
    }
    
    // 添加页面可见性变化监听，优化性能
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.querySelectorAll('.key, .loading-dots span, .floating-element').forEach(elem => {
                elem.style.animationPlayState = 'paused';
            });
        } else {
            // 页面可见时恢复动画
            document.querySelectorAll('.key, .loading-dots span, .floating-element').forEach(elem => {
                elem.style.animationPlayState = 'running';
            });
        }
    });
    
    // 添加触摸滑动支持（移动设备）
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartY = event.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(event) {
        touchEndY = event.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        // 向上滑动跳转到主页
        if (touchStartY - touchEndY > 50) {
            navigateToMain();
        }
    }
});