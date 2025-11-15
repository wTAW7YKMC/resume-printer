/**
 * 数据获取模块
 * 负责从GitHub或其他源加载简历数据，并提供缓存和错误处理
 */
class DataFetcher {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.dataSource - 数据源URL
     * @param {number} options.cacheExpiry - 缓存过期时间（毫秒）
     * @param {string} options.cacheKey - 本地存储键名
     */
    constructor(options = {}) {
        this.dataSource = options.dataSource || 'resume-data.json';
        this.cacheExpiry = options.cacheExpiry || 24 * 60 * 60 * 1000; // 默认24小时
        this.cacheKey = options.cacheKey || 'resume-data-cache';
        this.useLocalFallback = options.useLocalFallback !== undefined ? options.useLocalFallback : true;
        
        // 请求配置
        this.requestHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        
        // 缓存策略
        this.cacheStrategy = options.cacheStrategy || 'cache-first'; // 可选: 'network-first', 'cache-only', 'network-only'
    }
    
    /**
     * 加载数据
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Object>} 返回包含数据的Promise
     */
    async loadData(forceRefresh = false) {
        switch (this.cacheStrategy) {
            case 'cache-first':
                return this.loadCacheFirst(forceRefresh);
            case 'network-first':
                return this.loadNetworkFirst(forceRefresh);
            case 'cache-only':
                return this.loadFromCache();
            case 'network-only':
                return this.loadFromNetwork();
            default:
                return this.loadCacheFirst(forceRefresh);
        }
    }
    
    /**
     * 缓存优先策略
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Object>} 返回包含数据的Promise
     */
    async loadCacheFirst(forceRefresh = false) {
        // 如果不强制刷新，先尝试从缓存加载
        if (!forceRefresh) {
            try {
                const cachedData = this.loadFromCache();
                if (cachedData) {
                    console.log('DataFetcher: Loaded from cache');
                    return cachedData;
                }
            } catch (error) {
                console.warn('DataFetcher: Failed to load from cache, falling back to network', error);
            }
        }
        
        // 从网络加载数据
        try {
            const data = await this.loadFromNetwork();
            this.saveToCache(data);
            console.log('DataFetcher: Loaded from network');
            return data;
        } catch (error) {
            console.error('DataFetcher: Failed to load from network', error);
            
            // 如果网络加载失败，尝试使用本地备份
            if (this.useLocalFallback) {
                try {
                    const fallbackData = await this.loadLocalFallback();
                    console.log('DataFetcher: Using local fallback data');
                    return fallbackData;
                } catch (fallbackError) {
                    console.error('DataFetcher: Local fallback also failed', fallbackError);
                }
            }
            
            // 如果所有方法都失败，抛出错误
            throw new Error('Failed to load resume data from all sources');
        }
    }
    
    /**
     * 网络优先策略
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Object>} 返回包含数据的Promise
     */
    async loadNetworkFirst(forceRefresh = false) {
        // 尝试从网络加载数据
        try {
            const data = await this.loadFromNetwork();
            this.saveToCache(data);
            console.log('DataFetcher: Loaded from network');
            return data;
        } catch (error) {
            console.error('DataFetcher: Failed to load from network, falling back to cache', error);
            
            // 如果网络加载失败，尝试从缓存加载
            if (!forceRefresh) {
                try {
                    const cachedData = this.loadFromCache();
                    if (cachedData) {
                        console.log('DataFetcher: Loaded from cache as fallback');
                        return cachedData;
                    }
                } catch (cacheError) {
                    console.warn('DataFetcher: Cache also failed', cacheError);
                }
            }
            
            // 如果网络和缓存都失败，尝试使用本地备份
            if (this.useLocalFallback) {
                try {
                    const fallbackData = await this.loadLocalFallback();
                    console.log('DataFetcher: Using local fallback data');
                    return fallbackData;
                } catch (fallbackError) {
                    console.error('DataFetcher: Local fallback also failed', fallbackError);
                }
            }
            
            // 如果所有方法都失败，抛出错误
            throw new Error('Failed to load resume data from all sources');
        }
    }
    
    /**
     * 从网络加载数据
     * @returns {Promise<Object>} 返回包含数据的Promise
     */
    async loadFromNetwork() {
        const response = await fetch(this.dataSource, {
            method: 'GET',
            headers: this.requestHeaders,
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 验证数据结构
        if (!this.validateDataStructure(data)) {
            throw new Error('Invalid data structure');
        }
        
        return data;
    }
    
    /**
     * 从缓存加载数据
     * @returns {Object|null} 返回缓存的数据或null
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) {
                return null;
            }
            
            const { data, timestamp } = JSON.parse(cached);
            
            // 检查缓存是否过期
            if (Date.now() - timestamp > this.cacheExpiry) {
                console.log('DataFetcher: Cache expired');
                localStorage.removeItem(this.cacheKey);
                return null;
            }
            
            // 验证数据结构
            if (!this.validateDataStructure(data)) {
                console.warn('DataFetcher: Invalid cached data structure');
                localStorage.removeItem(this.cacheKey);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('DataFetcher: Failed to load from cache', error);
            localStorage.removeItem(this.cacheKey);
            return null;
        }
    }
    
    /**
     * 保存数据到缓存
     * @param {Object} data - 要缓存的数据
     */
    saveToCache(data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('DataFetcher: Failed to save to cache', error);
        }
    }
    
    /**
     * 加载本地备份数据
     * @returns {Promise<Object>} 返回包含备份数据的Promise
     */
    async loadLocalFallback() {
        try {
            // 尝试加载本地备份文件
            const response = await fetch(this.dataSource, {
                method: 'GET',
                headers: this.requestHeaders
            });
            
            if (!response.ok) {
                throw new Error(`Local fallback response was not ok: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 验证数据结构
            if (!this.validateDataStructure(data)) {
                throw new Error('Invalid local fallback data structure');
            }
            
            return data;
        } catch (error) {
            console.error('DataFetcher: Failed to load local fallback', error);
            
            // 如果本地文件也加载失败，使用硬编码的默认数据
            return this.getDefaultData();
        }
    }
    
    /**
     * 获取默认数据
     * @returns {Object} 默认的简历数据结构
     */
    getDefaultData() {
        return {
            meta: {
                siteTitle: "Becky's Resume",
                siteDescription: "Personal resume of Becky, a Product Designer.",
                lastUpdated: new Date().toISOString().split('T')[0]
            },
            personalInfo: {
                name: "Becky",
                title: "Product Designer",
                tagline: "热衷于创建直观且愉悦的用户体验。",
                location: "未知",
                email: "contact@example.com",
                phone: "+86 138 0000 0000",
                avatarUrl: "",
                socialLinks: []
            },
            education: [],
            workExperience: [],
            skills: {
                design: [],
                development: [],
                other: []
            },
            projects: []
        };
    }
    
    /**
     * 验证数据结构
     * @param {Object} data - 要验证的数据
     * @returns {boolean} 验证结果
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // 检查必需的顶级字段
        const requiredFields = ['meta', 'personalInfo'];
        for (const field of requiredFields) {
            if (!data[field]) {
                console.warn(`DataFetcher: Missing required field: ${field}`);
                return false;
            }
        }
        
        // 检查个人信息字段
        const personalInfoFields = ['name', 'title'];
        for (const field of personalInfoFields) {
            if (!data.personalInfo[field]) {
                console.warn(`DataFetcher: Missing required personal info field: ${field}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 清除缓存
     */
    clearCache() {
        localStorage.removeItem(this.cacheKey);
    }
    
    /**
     * 设置数据源
     * @param {string} dataSource - 新的数据源URL
     */
    setDataSource(dataSource) {
        this.dataSource = dataSource;
    }
    
    /**
     * 设置缓存策略
     * @param {string} strategy - 缓存策略 ('cache-first', 'network-first', 'cache-only', 'network-only')
     */
    setCacheStrategy(strategy) {
        if (['cache-first', 'network-first', 'cache-only', 'network-only'].includes(strategy)) {
            this.cacheStrategy = strategy;
        } else {
            console.error(`DataFetcher: Invalid cache strategy: ${strategy}`);
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataFetcher;
} else {
    window.DataFetcher = DataFetcher;
}