/**
 * 音效管理模块
 * 负责播放、控制和管理各种音效
 */
class SoundManager {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {boolean} options.enabled - 是否启用音效
     * @param {number} options.volume - 音量 (0-1)
     * @param {string} options.soundPath - 音效文件路径前缀
     * @param {Object} options.soundFiles - 音效文件映射
     */
    constructor(options = {}) {
        this.enabled = options.enabled !== undefined ? options.enabled : true;
        this.volume = options.volume || 0.7; // 默认音量70%
        this.soundPath = options.soundPath || 'assets/sounds/';
        this.soundFiles = {
            type: 'typewriter.mp3',
            erase: 'typewriter-backspace.mp3',
            click: 'click.mp3',
            ...options.soundFiles
        };
        
        // 预加载的音频对象
        this.audioCache = {};
        
        // 设置为默认使用Web Audio API
        this.useWebAudioAsDefault = options.useWebAudioAsDefault !== undefined ? options.useWebAudioAsDefault : true;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化音效管理器
     */
    init() {
        // 从本地存储恢复音效设置
        const savedEnabled = localStorage.getItem('typewriter-muted');
        if (savedEnabled !== null) {
            this.enabled = savedEnabled !== 'true';
        }
        
        // 预加载音效文件
        this.preloadSounds();
    }
    
    /**
     * 预加载音效文件
     */
    preloadSounds() {
        // 如果设置为默认使用Web Audio API，则跳过音频文件预加载
        if (this.useWebAudioAsDefault) {
            console.debug('SoundManager: Skipping audio file preloading, using Web Audio API by default');
            // 初始化Web Audio API作为备用音效
            this.initWebAudioFallback();
            return;
        }
        
        Object.keys(this.soundFiles).forEach(key => {
            try {
                const audio = new Audio();
                audio.src = this.soundPath + this.soundFiles[key];
                audio.preload = 'auto';
                audio.volume = this.volume;
                
                // 添加到缓存
                this.audioCache[key] = audio;
                
                // 开始加载但不播放
                audio.load().catch(error => {
                    console.warn(`SoundManager: Failed to preload sound "${key}":`, error);
                });
            } catch (error) {
                console.warn(`SoundManager: Error creating audio for "${key}":`, error);
            }
        });
        
        // 初始化Web Audio API作为备用音效
        this.initWebAudioFallback();
    }
    
    /**
     * 初始化Web Audio API作为备用音效
     */
    initWebAudioFallback() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建合成打字机声音的函数
            this.createTypewriterSound = (frequency = 800, duration = 50) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                // 设置振荡器类型和频率
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                // 设置音量包络
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
                
                // 连接节点
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // 播放声音
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration / 1000);
            };
        } catch (error) {
            console.warn('SoundManager: Web Audio API not available:', error);
            this.audioContext = null;
            this.createTypewriterSound = null;
        }
    }
    
    /**
     * 播放音效
     * @param {string} soundName - 音效名称
     * @param {Object} options - 播放选项
     * @param {number} options.volume - 音量 (可选)
     * @param {number} options.playbackRate - 播放速率 (可选)
     * @returns {Promise} 播放Promise
     */
    async play(soundName, options = {}) {
        if (!this.enabled) {
            return Promise.resolve();
        }
        
        // 检查音效是否存在
        if (!this.soundFiles[soundName]) {
            console.warn(`SoundManager: Sound "${soundName}" not found`);
            return Promise.resolve();
        }
        
        // 如果设置为默认使用Web Audio API，直接使用备用音效
        if (this.useWebAudioAsDefault) {
            this.playWebAudioFallback(soundName, options);
            return Promise.resolve();
        }
        
        // 尝试使用音频文件
        try {
            // 如果没有缓存，创建新的音频对象
            let audio = this.audioCache[soundName];
            
            if (!audio) {
                audio = new Audio(this.soundPath + this.soundFiles[soundName]);
                audio.volume = options.volume !== undefined ? options.volume : this.volume;
            } else {
                // 重置音频状态以便重新播放
                audio.currentTime = 0;
                
                // 更新音量
                if (options.volume !== undefined) {
                    audio.volume = options.volume;
                } else {
                    audio.volume = this.volume;
                }
            }
            
            // 设置播放速率
            if (options.playbackRate !== undefined) {
                audio.playbackRate = options.playbackRate;
            }
            
            // 播放音频
            return audio.play().catch(error => {
                // 如果音频文件失败，尝试使用Web Audio API
                this.playWebAudioFallback(soundName, options);
                console.debug(`SoundManager: Using Web Audio API fallback for "${soundName}"`);
            });
        } catch (error) {
            console.error(`SoundManager: Error playing sound "${soundName}":`, error);
            // 尝试使用Web Audio API
            this.playWebAudioFallback(soundName, options);
        }
    }
    
    /**
     * 使用Web Audio API播放备用音效
     * @param {string} soundName - 音效名称
     * @param {Object} options - 播放选项
     */
    playWebAudioFallback(soundName, options = {}) {
        if (!this.audioContext || !this.createTypewriterSound) {
            return;
        }
        
        const volume = options.volume !== undefined ? options.volume : this.volume * 0.7; // 进一步增加整体音量
        
        // 根据音效名称创建不同频率的声音
        switch (soundName) {
            case 'type':
                // 清脆的键盘打字声，持续时间与打字速度匹配
                this.createKeyboardTypingSound(volume, 50); // 默认50ms，匹配内容打字速度
                break;
            case 'erase':
                // 完全禁用删除音效
                break;
            case 'click':
                // 自然的鼠标点击声
                this.createMouseClickSound(volume);
                break;
            default:
                // 默认使用打字声
                this.createKeyboardTypingSound(volume);
                break;
        }
    }
    
    /**
     * 创建柔和的键盘打字声
     * @param {number} volume - 音量
     * @param {number} duration - 声音持续时间，与打字速度匹配
     */
    createKeyboardTypingSound(volume, duration = 50) {
        // 创建一个非常柔和的键盘点击声，持续时间与打字速度匹配
        // 如果提供了打字速度，调整音效持续时间使其更自然
        let soundDuration = duration;
        if (duration > 100) {
            soundDuration = duration * 0.4; // 较慢打字速度时使用40%的持续时间，让音效更短
        } else if (duration < 80) {
            soundDuration = duration * 0.3; // 较快打字速度时使用30%的持续时间，让音效更短
        } else {
            soundDuration = duration * 0.35; // 中等速度使用35%的持续时间
        }
        
        const now = this.audioContext.currentTime;
        
        // 使用噪声而不是纯音调，更像真实键盘声
        const bufferSeconds = soundDuration / 1000; // 将毫秒转换为秒
        const bufferSize = Math.floor(this.audioContext.sampleRate * bufferSeconds);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 填充噪声数据
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() - 0.5) * 2;
        }
        
        // 创建噪声源
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        
        // 创建带通滤波器，使声音更像键盘点击
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 500; // 1000-1500Hz
        filter.Q.value = 5; // 适中的共振
        
        // 创建音量控制
        const gainNode = this.audioContext.createGain();
        
        // 设置更柔和的音量包络，让音效更自然
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25 * volume, now + 0.005); // 增加到5ms的attack时间
        gainNode.gain.exponentialRampToValueAtTime(0.001 * volume, now + Math.min(soundDuration / 1000, 0.05)); // 限制最大衰减时间
        
        // 连接节点
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 播放声音
        noiseSource.start(now);
        noiseSource.stop(now + bufferSeconds);
    }
    
    /**
     * 创建自然的鼠标点击声
     * @param {number} volume - 音量
     */
    createMouseClickSound(volume) {
        const now = this.audioContext.currentTime;
        
        // 创建一个短促的噪声来模拟鼠标点击
        const bufferSize = this.audioContext.sampleRate * 0.015; // 15ms 缓冲区
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 填充噪声数据，使用较低的幅度以获得更柔和的声音
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() - 0.5) * 0.5;
        }
        
        // 创建噪声源
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        
        // 创建低通滤波器，使声音更像鼠标点击
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800; // 较低的截止频率，使声音更柔和
        filter.Q.value = 1; // 较低的共振
        
        // 创建音量控制
        const gainNode = this.audioContext.createGain();
        
        // 设置快速的音量包络
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.35 * volume, now + 0.001); // 增加音量到0.35
        gainNode.gain.exponentialRampToValueAtTime(0.001 * volume, now + 0.01); // 快速衰减
        
        // 连接节点
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 播放声音
        noiseSource.start(now);
        noiseSource.stop(now + 0.015);
    }
    
    /**
     * 启用音效
     */
    enable() {
        this.enabled = true;
        this.saveSettings();
    }
    
    /**
     * 禁用音效
     */
    disable() {
        this.enabled = false;
        this.saveSettings();
    }
    
    /**
     * 切换音效状态
     */
    toggle() {
        this.enabled = !this.enabled;
        this.saveSettings();
        return this.enabled;
    }
    
    /**
     * 设置音量
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // 更新所有缓存的音频对象的音量
        Object.values(this.audioCache).forEach(audio => {
            audio.volume = this.volume;
        });
        
        this.saveSettings();
    }
    
    /**
     * 添加音效
     * @param {string} name - 音效名称
     * @param {string} filename - 文件名
     */
    addSound(name, filename) {
        this.soundFiles[name] = filename;
        
        // 立即预加载新音效
        try {
            const audio = new Audio();
            audio.src = this.soundPath + filename;
            audio.preload = 'auto';
            audio.volume = this.volume;
            audio.load().catch(error => {
                console.warn(`SoundManager: Failed to preload new sound "${name}":`, error);
            });
            
            this.audioCache[name] = audio;
        } catch (error) {
            console.warn(`SoundManager: Error creating audio for new sound "${name}":`, error);
        }
    }
    
    /**
     * 设置音效文件路径前缀
     * @param {string} path - 新的路径前缀
     */
    setSoundPath(path) {
        this.soundPath = path;
        
        // 重新预加载所有音效
        this.audioCache = {};
        this.preloadSounds();
    }
    
    /**
     * 播放打字音效
     * @param {Object} options - 播放选项
     */
    playTypingSound(options = {}) {
        // 根据打字速度调整音效持续时间
        if (options.duration) {
            this.createKeyboardTypingSound(this.volume, options.duration);
        } else {
            this.play('type', options);
        }
    }
    
    /**
     * 播放擦除音效
     * @param {Object} options - 播放选项
     */
    playEraseSound(options = {}) {
        this.play('erase', options);
    }
    
    /**
     * 播放点击音效
     * @param {Object} options - 播放选项
     */
    playClickSound(options = {}) {
        this.play('click', options);
    }
    
    /**
     * 保存设置到本地存储
     */
    saveSettings() {
        try {
            localStorage.setItem('typewriter-muted', (!this.enabled).toString());
            localStorage.setItem('typewriter-volume', this.volume.toString());
        } catch (error) {
            console.warn('SoundManager: Failed to save settings:', error);
        }
    }
    
    /**
     * 从本地存储加载设置
     */
    loadSettings() {
        try {
            const savedMuted = localStorage.getItem('typewriter-muted');
            const savedVolume = localStorage.getItem('typewriter-volume');
            
            if (savedMuted !== null) {
                this.enabled = savedMuted !== 'true';
            }
            
            if (savedVolume !== null) {
                this.volume = parseFloat(savedVolume);
                this.setVolume(this.volume);
            }
        } catch (error) {
            console.warn('SoundManager: Failed to load settings:', error);
        }
    }
    
    /**
     * 获取当前状态
     * @returns {Object} 状态对象
     */
    getStatus() {
        return {
            enabled: this.enabled,
            volume: this.volume,
            soundFiles: { ...this.soundFiles },
            cacheSize: Object.keys(this.audioCache).length
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
} else {
    window.SoundManager = SoundManager;
}