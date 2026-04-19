// 主要应用入口文件
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loadingIndicator = document.getElementById('loading-indicator');
    const titleText = document.getElementById('title-text');
    const contentText = document.getElementById('content-text');
    const navigation = document.getElementById('navigation');
    const soundToggle = document.getElementById('sound-toggle');
    const pdfExportCurrent = document.getElementById('pdf-export-current');
    const pdfExportFull = document.getElementById('pdf-export-full');
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
        
        // 初始化触摸导航
        const resumeSections = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];
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
        
        // 音效开关事件
        soundToggle.addEventListener('click', function() {
            // 播放点击音效
            soundManager.playClickSound();
            toggleSound();
        });
        
        // PDF导出当前内容事件
        pdfExportCurrent.addEventListener('click', function() {
            // 播放点击音效
            soundManager.playClickSound();
            exportCurrentContent();
        });
        
        // PDF导出完整简历事件
        pdfExportFull.addEventListener('click', function() {
            // 播放点击音效
            soundManager.playClickSound();
            exportFullResume();
        });
        
        // 强制刷新数据事件
        forceRefresh.addEventListener('click', function() {
            // 播放点击音效
            soundManager.playClickSound();
            forceRefreshData();
        });
    }
    
    // 加载简历数据
    async function loadResumeData(forceRefresh = false) {
        try {
            // 显示加载指示器
            loadingIndicator.style.display = 'block';
            
            // 如果强制刷新，清除缓存
            if (forceRefresh) {
                dataFetcher.clearCache();
            }
            
            // 使用DataFetcher加载简历数据
            resumeData = await dataFetcher.loadData();
            
            // 隐藏加载指示器
            loadingIndicator.style.display = 'none';
            
            // 显示主标题
            typeText(titleText, "Hi, I'm Becky!", 120);
            
            // 更新最后更新时间
            if (resumeData.meta && resumeData.meta.lastUpdated) {
                lastUpdated.textContent = resumeData.meta.lastUpdated;
            }
            
            // 显示默认内容
            setTimeout(() => {
                navigation.style.opacity = '1';
                showContent(currentSection);
            }, 2000);
        } catch (error) {
            console.error('Error loading resume data:', error);
            
            // 显示错误信息
            loadingIndicator.textContent = '加载简历数据失败，请检查网络连接并刷新页面重试。';
            
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
        
        // 添加过渡效果
        contentText.style.opacity = '0.5';
        
        // 清除当前内容并显示新内容
        eraseContent(contentText, () => {
            contentText.style.opacity = '1';
            showContent(section);
        });
    }
    
    // 显示内容
    function showContent(section) {
        if (!resumeData) return;
        
        // 使用ContentRenderer格式化内容
        const content = contentRenderer.render(section, resumeData);
        
        // 使用打字机效果显示内容
        typeText(contentText, content, 50);
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
    
    // 导出当前内容为PDF
    function exportCurrentContent() {
        // 显示导出中状态
        pdfExportCurrent.textContent = '导出中...';
        pdfExportCurrent.disabled = true;
        
        // 导出当前显示的内容
        pdfExporter.exportCurrentContent(
            contentText,
            // 成功回调
            () => {
                // 恢复按钮状态
                pdfExportCurrent.textContent = '导出当前';
                pdfExportCurrent.disabled = false;
                
                // 显示导出成功提示
                showAlert('当前内容导出成功！', 'success');
            },
            // 错误回调
            (error) => {
                // 恢复按钮状态
                pdfExportCurrent.textContent = '导出当前';
                pdfExportCurrent.disabled = false;
                
                // 显示错误提示
                showAlert('导出失败，请稍后重试。', 'error');
                console.error('PDF导出失败:', error);
            }
        );
    }
    
    // 导出完整简历为PDF
    function exportFullResume() {
        // 显示导出中状态
        pdfExportFull.textContent = '导出中...';
        pdfExportFull.disabled = true;
        
        // 导出完整简历内容
        pdfExporter.exportFullResume(
            resumeData,
            contentRenderer,
            // 成功回调
            () => {
                // 恢复按钮状态
                pdfExportFull.textContent = '导出完整';
                pdfExportFull.disabled = false;
                
                // 显示导出成功提示
                showAlert('完整简历导出成功！', 'success');
            },
            // 错误回调
            (error) => {
                // 恢复按钮状态
                pdfExportFull.textContent = '导出完整';
                pdfExportFull.disabled = false;
                
                // 显示错误提示
                showAlert('导出失败，请稍后重试。', 'error');
                console.error('完整PDF导出失败:', error);
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
            // 显示加载指示器
            loadingIndicator.style.display = 'block';
            loadingIndicator.textContent = '正在刷新数据...';
            
            // 强制刷新数据
            await loadResumeData(true);
            
            // 重新显示当前部分内容
            eraseContent(contentText, () => {
                showContent(currentSection);
                
                // 显示刷新成功提示
                showAlert('数据刷新成功！', 'success');
                
                // 隐藏加载指示器
                loadingIndicator.style.display = 'none';
            });
        } catch (error) {
            console.error('Error refreshing data:', error);
            showAlert('数据刷新失败，请稍后重试。', 'error');
            loadingIndicator.style.display = 'none';
        }
    }
    
    // 初始化应用
    init();
    
    // 暴露强制刷新数据函数到全局作用域，以便在控制台中调用
    window.forceRefreshResumeData = forceRefreshData;
});
