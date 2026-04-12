// 导航到开屏页面
function navigateToSplash() {
    console.log('navigateToSplash函数被调用');
    // 播放打字机音效
    soundManager.playTypingSound();
    
    // 添加淡出效果
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';
    
    // 延迟跳转，等待淡出效果完成
    setTimeout(() => {
        console.log('准备跳转到开屏页面');
        // 直接跳转到开屏页面，不添加任何参数
        window.location.href = 'splash.html';
    }, 500);
}

// 主要应用入口文件
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const titleText = document.getElementById('title-text');
    const contentText = document.getElementById('content-text');
    const navigation = document.getElementById('navigation');
    const soundToggle = document.getElementById('sound-toggle');
    const exportCurrent = document.getElementById('export-current');
    const exportFull = document.getElementById('export-full');
    const exportOptionsCurrent = document.getElementById('export-options-current');
    const exportOptionsFull = document.getElementById('export-options-full');
    const forceRefresh = document.getElementById('force-refresh');
    const lastUpdated = document.getElementById('last-updated');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // 全局状态
    let resumeData = null;
    let isMuted = false;
    let currentSection = 'about';
    let touchNavigation = null;
    
    // 初始化数据获取器和内容渲染器
    const dataFetcher = new DataFetcher({
        dataSource: 'resume-data.json',
        cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
        cacheStrategy: 'cache-first',
        useLocalFallback: true
    });
    
    const contentRenderer = new ContentRenderer();
    
    // 初始化音效管理器
    const soundManager = new SoundManager({
        enabled: true,
        volume: 0.3,
        soundPath: 'assets/sounds/',
        useWebAudioAsDefault: true  // 默认使用Web Audio API生成音效
    });
    
    // 初始化PDF导出器
    const pdfExporter = new PdfExporter({
        filename: 'Becky_Resume.pdf',
        title: 'Becky的个人简历'
    });
    
    // 初始化增强导出器
    const enhancedExporter = new EnhancedExporter({
        filename: 'Becky_Resume',
        title: 'Becky的个人简历'
    });
    
    // 初始化本地留言管理器（目前使用本地存储）
    const messageManager = new LocalMessageManager();
    
    // 阿里云留言管理器（待服务器问题解决后启用）
    // const messageManager = new MessageManager({
    //     apiUrl: 'https://message-server-uutepmlola.cn-hangzhou.fcapp.run'
    // });
    
    // 从本地存储恢复音效设置
    isMuted = !soundManager.enabled;
    
    // 初始化打字机效果
    const titleTypewriter = new Typewriter({
        typeSpeed: 150,
        eraseSpeed: 80,
        playSound: soundManager.enabled,
        soundCallback: (action, speed) => {
            if (action === 'type') {
                soundManager.playTypingSound({ duration: speed });
            }
        }
    });
    
    const contentTypewriter = new Typewriter({
        typeSpeed: 70,
        eraseSpeed: 40,
        playSound: soundManager.enabled,
        soundCallback: (action, speed) => {
            if (action === 'type') {
                soundManager.playTypingSound({ duration: speed });
            }
        }
    });
    
    // 设置打字机目标元素
    titleTypewriter.setElement(titleText);
    contentTypewriter.setElement(contentText);
    
    // 初始化应用
    function init() {
        // 从本地存储恢复音效设置
        isMuted = localStorage.getItem('typewriter-muted') === 'true';
        updateSoundButton();
        
        // 检查是否从开屏页面跳转而来
        const fromSplash = sessionStorage.getItem('fromSplash') === 'true';
        
        // 初始化触摸导航
        const resumeSections = ['about', 'experience', 'skills', 'projects', 'contact'];
        touchNavigation = new TouchNavigation(
            document.querySelector('.paper-container'),
            resumeSections,
            function(section) {
                // 导航回调
                if (section !== currentSection) {
                    switchSection(section);
                }
            },
            {
                enableKeyboardNav: true,
                enableSwipeNav: true
            }
        );
        
        // 加载简历数据
        loadResumeData();
        
        // 设置事件监听器
        setupEventListeners();
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 导航按钮点击事件
        if (navButtons && navButtons.length > 0) {
            navButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // 播放点击音效
                    soundManager.playClickSound();
                    
                    const section = this.getAttribute('data-section');
                    if (section !== currentSection) {
                        switchSection(section);
                    }
                });
            });
        }
        
        // 音效开关事件
        if (soundToggle) {
            soundToggle.addEventListener('click', function() {
                // 播放点击音效
                soundManager.playClickSound();
                toggleSound();
            });
        }
        
        // 导出当前内容事件
        if (exportCurrent) {
            exportCurrent.addEventListener('click', function() {
                // 播放点击音效
                soundManager.playClickSound();
                
                // 显示导出选项
                if (exportOptionsCurrent) {
                    exportOptionsCurrent.style.display = exportOptionsCurrent.style.display === 'block' ? 'none' : 'block';
                    // 隐藏完整导出选项
                    if (exportOptionsFull) {
                        exportOptionsFull.style.display = 'none';
                    }
                }
            });
        }
        
        // 导出完整简历事件
        if (exportFull) {
            exportFull.addEventListener('click', function() {
                // 播放点击音效
                soundManager.playClickSound();
                
                // 显示导出选项
                if (exportOptionsFull) {
                    exportOptionsFull.style.display = exportOptionsFull.style.display === 'block' ? 'none' : 'block';
                    // 隐藏当前导出选项
                    if (exportOptionsCurrent) {
                        exportOptionsCurrent.style.display = 'none';
                    }
                }
            });
        }
        
        // 导出选项点击事件
        const exportOptionButtons = document.querySelectorAll('.export-option');
        exportOptionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const format = this.getAttribute('data-format');
                const isCurrentExport = this.closest('#export-options-current') !== null;
                
                // 隐藏所有导出选项
                if (exportOptionsCurrent) {
                    exportOptionsCurrent.style.display = 'none';
                }
                if (exportOptionsFull) {
                    exportOptionsFull.style.display = 'none';
                }
                
                // 执行导出
                if (isCurrentExport) {
                    exportCurrentContent(format);
                } else {
                    exportFullResume(format);
                }
            });
        });
        
        // 点击其他地方关闭导出选项
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.export-buttons')) {
                if (exportOptionsCurrent) {
                    exportOptionsCurrent.style.display = 'none';
                }
                if (exportOptionsFull) {
                    exportOptionsFull.style.display = 'none';
                }
            }
        });
        
        // 强制刷新数据事件
        if (forceRefresh) {
            forceRefresh.addEventListener('click', function() {
                // 播放点击音效
                soundManager.playClickSound();
                forceRefreshData();
            });
        }
    }
    
    // 加载简历数据
    async function loadResumeData(forceRefresh = false) {
        console.log('loadResumeData: Starting to load resume data');
        try {
            // 检查是否从开屏页面跳转而来
            const fromSplash = sessionStorage.getItem('fromSplash') === 'true';
            
            // 检查URL参数中是否有showSplash=true
            const urlParams = new URLSearchParams(window.location.search);
            const showSplash = urlParams.get('showSplash') === 'true';
            
            // 如果URL参数中有showSplash=true，则跳转到开屏页面
            if (showSplash) {
                setTimeout(() => {
                    window.location.href = 'splash.html';
                }, 1000);
                return;
            }
            
            // 如果强制刷新，清除缓存
            if (forceRefresh) {
                dataFetcher.clearCache();
            }
            
            // 如果从开屏页面跳转而来，尝试使用预加载的数据
            if (fromSplash && !forceRefresh) {
                try {
                    const preloadedData = sessionStorage.getItem('resumeData');
                    if (preloadedData) {
                        resumeData = JSON.parse(preloadedData);
                        console.log('使用预加载的简历数据');
                    }
                } catch (e) {
                    console.log('预加载数据解析失败，重新获取:', e);
                }
            }
            
            // 如果没有预加载数据，则正常加载
            if (!resumeData) {
                console.log('loadResumeData: No preloaded data, loading from network');
                resumeData = await dataFetcher.loadData();
                console.log('loadResumeData: Data loaded successfully');
            } else {
                console.log('loadResumeData: Using preloaded data');
            }
            
            // 显示主标题
            titleText.innerHTML = ""; // 先清空内容
            titleTypewriter.interrupt(); // 中断之前的打字效果
            
            // 如果从开屏页面跳转而来，直接显示内容，不延迟
            if (fromSplash) {
                // 直接显示标题，不使用打字机效果，提高速度
                titleText.innerHTML = "Hi, I'm Becky!";
                // 清除标记，避免刷新页面时重复使用
                sessionStorage.removeItem('fromSplash');
                
                // 立即显示内容，不等待
                setTimeout(() => {
                    // 确保导航按钮已正确设置
                    navButtons.forEach(button => {
                        button.classList.remove('active');
                        if (button.getAttribute('data-section') === 'about') {
                            button.classList.add('active');
                        }
                    });
                    
                    // 直接显示内容，不使用过渡效果
                    contentText.style.transition = 'none';
                    contentText.style.opacity = '1';
                    showContent('about');
                }, 50); // 减少等待时间
            } else {
                // 正常访问，延迟显示标题
                setTimeout(() => {
                    typeText(titleText, "Hi, I'm Becky!", 120);
                }, 500);
            }
            
            // 更新最后更新时间
            if (resumeData.meta && resumeData.meta.lastUpdated) {
                lastUpdated.textContent = resumeData.meta.lastUpdated;
            }
            
            // 显示默认内容
            const delay = fromSplash ? 500 : 2000;
            setTimeout(() => {
                navigation.style.opacity = '1';
                showContent(currentSection);
            }, delay);
        } catch (error) {
            console.error('Error loading resume data:', error);
            
            // 可以在这里添加重试按钮或其他错误处理逻辑
        }
    }
    
    // 切换内容区域
    function switchSection(section) {
        // 防止重复点击同一部分
        if (section === currentSection) {
            return;
        }
        
        // 更新当前选中部分
        currentSection = section;
        
        // 更新触摸导航状态
        if (touchNavigation) {
            touchNavigation.setCurrentSection(section);
        }
        
        // 更新导航按钮状态
        navButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-section') === section) {
                button.classList.add('active');
            }
        });
        
        // 添加平滑过渡效果
        contentText.style.transition = 'opacity 0.2s ease-in-out';
        contentText.style.opacity = '0.5';
        
        // 中断当前正在进行的打字效果
        // 不再中断标题的打字效果，除非是页面加载时的初始状态
        // titleTypewriter.interrupt();
        contentTypewriter.interrupt();
        
        // 短暂延迟后显示新内容
        setTimeout(() => {
            contentText.style.opacity = '1';
            showContent(section);
        }, 100);
    }
    
    // 显示内容
    function showContent(section) {
        // 显示普通内容区域
        contentText.style.display = 'block';
        
        // 如果不是contact部分，隐藏留言区域
        if (section !== 'contact') {
            messageManager.hideMessageSection();
        }
        
        if (!resumeData) return;
        
        // 特殊处理作品集部分
        if (section === 'projects') {
            showProjectsContent();
            return;
        }
        
        // 使用ContentRenderer格式化内容
        const content = contentRenderer.render(section, resumeData);
        
        // 使用打字机效果显示内容
        typeText(contentText, content, 50);
        
        // 如果是contact部分，在显示完联系方式后显示留言区域
        if (section === 'contact') {
            // 获取打字机完成的时间（约内容长度 * 打字速度）
            const typingTime = content.length * 50; // 50ms每个字符
            setTimeout(() => {
                messageManager.showMessageSection();
            }, Math.max(typingTime, 2000)); // 至少等待2秒
        }
    }
    
    // 显示作品集内容
    function showProjectsContent() {
        if (!resumeData.projects) return;
        
        // 创建作品集管理器实例
        const projectsManager = new ProjectsManager({
            soundManager: soundManager,
            typewriter: contentTypewriter
        });
        
        // 渲染作品集内容
        const projectsHTML = projectsManager.renderProjects(resumeData.projects);
        
        // 直接显示HTML内容，不使用打字机效果
        contentText.innerHTML = projectsHTML;
        
        // 初始化作品集交互功能
        setTimeout(() => {
            projectsManager.init();
        }, 100);
    }
    
    // 打字机效果 - 使用新的Typewriter类
    function typeText(element, text, speed = 120) {
        if (element === titleText) {
            titleTypewriter.typeSpeed = speed;
            return titleTypewriter.type(text);
        } else {
            contentTypewriter.typeSpeed = speed;
            return contentTypewriter.type(text);
        }
    }
    
    // 清除文本效果 - 使用新的Typewriter类
    function eraseContent(element, callback) {
        if (element === contentText) {
            contentTypewriter.erase(callback);
        }
    }
    
    // 播放打字音效
    function playTypeSound(action = 'type') {
        // 使用SoundManager播放音效，但不播放删除音效
        if (action === 'type') {
            soundManager.play('type');
        }
    }
    
    // 切换音效状态
    function toggleSound() {
        // 使用SoundManager切换音效状态
        isMuted = !soundManager.toggle();
        
        // 更新Typewriter实例的音效设置
        titleTypewriter.setSoundEnabled(soundManager.enabled);
        contentTypewriter.setSoundEnabled(soundManager.enabled);
        
        updateSoundButton();
    }
    
    // 更新音效按钮显示
    function updateSoundButton() {
        soundToggle.textContent = isMuted ? '🔇' : '🔊';
    }
    
    // 导出当前内容
    function exportCurrentContent(format = 'pdf') {
        // 确保内容已经完全渲染
        if (contentTypewriter.isTyping) {
            // 如果正在打字，等待完成
            showAlert('正在等待内容加载完成，请稍候...', 'info');
            
            // 设置一个临时回调来处理导出
            const originalCallback = contentTypewriter.onCompleteCallback;
            const tempCallback = () => {
                // 调用原始回调（如果有）
                if (originalCallback) {
                    originalCallback();
                }
                
                // 导出当前显示的内容
                enhancedExporter.exportCurrentContent(
                    document.getElementById('content-area'),
                    format,
                    // 成功回调
                    () => {
                        // 显示导出成功提示
                        showAlert(`当前内容已成功导出为${enhancedExporter.getFormatName(format)}！`, 'success');
                    },
                    // 错误回调
                    (error) => {
                        // 显示错误提示
                        showAlert('导出失败，请稍后重试。', 'error');
                        console.error(`${format}导出失败:`, error);
                    }
                );
            };
            
            // 保存当前文本内容
            const currentText = contentTypewriter.currentText;
            
            // 设置新的回调
            contentTypewriter.onCompleteCallback = tempCallback;
            
            // 重新开始打字效果，确保回调会被调用
            contentTypewriter.type(currentText, tempCallback);
        } else {
            // 导出当前显示的内容
            enhancedExporter.exportCurrentContent(
                document.getElementById('content-area'),
                format,
                // 成功回调
                () => {
                    // 显示导出成功提示
                    showAlert(`当前内容已成功导出为${enhancedExporter.getFormatName(format)}！`, 'success');
                },
                // 错误回调
                (error) => {
                    // 显示错误提示
                    showAlert('导出失败，请稍后重试。', 'error');
                    console.error(`${format}导出失败:`, error);
                }
            );
        }
    }
    
    // 导出完整简历
    function exportFullResume(format = 'pdf') {
        // 导出完整简历内容
        enhancedExporter.exportFullResume(
            resumeData,
            contentRenderer,
            format,
            // 成功回调
            () => {
                // 显示导出成功提示
                showAlert(`完整简历已成功导出为${enhancedExporter.getFormatName(format)}！`, 'success');
            },
            // 错误回调
            (error) => {
                // 显示错误提示
                showAlert('导出失败，请稍后重试。', 'error');
                console.error(`完整${format}导出失败:`, error);
            }
        );
    }
    
    // 显示提示信息
    function showAlert(message, type = 'info') {
        // 创建提示元素
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.textContent = message;
        
        // 设置样式
        alert.style.position = 'fixed';
        alert.style.bottom = '20px';
        alert.style.right = '20px';
        alert.style.padding = '10px 20px';
        alert.style.borderRadius = '5px';
        alert.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
        alert.style.zIndex = '1000';
        alert.style.fontFamily = 'Courier New, monospace';
        
        // 根据类型设置背景色
        switch (type) {
            case 'success':
                alert.style.backgroundColor = '#a8d5a8';
                alert.style.color = '#2d5016';
                break;
            case 'error':
                alert.style.backgroundColor = '#f5c6c6';
                alert.style.color = '#5d1616';
                break;
            default:
                alert.style.backgroundColor = '#d4b89a';
                alert.style.color = '#333';
        }
        
        // 添加到页面
        document.body.appendChild(alert);
        
        // 3秒后移除提示
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 3000);
    }
    
    // 强制刷新数据
    async function forceRefreshData() {
        try {
            // 中断当前正在进行的打字效果
            // 不再中断标题的打字效果，除非是页面加载时的初始状态
            // titleTypewriter.interrupt();
            contentTypewriter.interrupt();
            
            // 强制刷新数据
            await loadResumeData(true);
            
            // 立即显示当前部分内容
            showContent(currentSection);
                
            // 显示刷新成功提示
            showAlert('数据刷新成功！', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            showAlert('数据刷新失败，请稍后重试。', 'error');
        }
    }
    
    // 初始化应用
    init();
    
    // 暴露强制刷新数据函数到全局作用域，以便在控制台中调用
    window.forceRefreshResumeData = forceRefreshData;
});