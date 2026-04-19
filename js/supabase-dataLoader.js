/**
 * Supabase 数据加载器
 * 用于替代 DataFetcher 从云端数据库加载数据
 */
class SupabaseDataLoader {
    constructor(options = {}) {
        this.supabaseUrl = options.url || localStorage.getItem('supabase_url');
        this.supabaseKey = options.anonKey || localStorage.getItem('supabase_key');
        this.enabled = options.enabled !== undefined ? options.enabled : true;
        this.fallbackToJSON = options.fallbackToJSON !== undefined ? options.fallbackToJSON : true;
        
        // 初始化客户端（如果配置存在）
        this.client = null;
        
        if (this.supabaseUrl && this.supabaseKey) {
            this.initClient();
        }
    }

    /**
     * 初始化 Supabase 客户端
     */
    initClient() {
        if (typeof window.SupabaseDB === 'undefined') {
            console.warn('SupabaseDB 未加载，请确保已引入 supabase-client.js');
            return false;
        }

        try {
            this.client = new window.SupabaseDB({
                url: this.supabaseUrl,
                anonKey: this.supabaseKey
            });
            console.log('✅ SupabaseDataLoader: 客户端初始化成功');
            return true;
        } catch (error) {
            console.error('❌ SupabaseDataLoader: 初始化失败', error);
            return false;
        }
    }

    /**
     * 检查是否可用
     */
    isAvailable() {
        return this.enabled && this.client !== null && 
               this.supabaseUrl && this.supabaseKey;
    }

    /**
     * 加载简历数据
     * @returns {Promise<Object>} 简历数据对象
     */
    async loadData() {
        if (!this.isAvailable()) {
            console.warn('⚠️ Supabase 不可用，尝试使用备用方案...');
            
            if (this.fallbackToJSON) {
                return await this.loadFromLocalJSON();
            } else {
                throw new Error('Supabase 不可用且未启用本地回退');
            }
        }

        try {
            console.log('📡 正在从 Supabase 加载数据...');
            const result = await this.client.getFullResume();

            if (result.code === 200 && result.data) {
                console.log('✅ Supabase 数据加载成功');
                
                // 缓存到 sessionStorage（用于快速访问）
                sessionStorage.setItem('resumeData', JSON.stringify(result.data));
                
                return result.data;
            } else {
                throw new Error(result.message || '获取数据失败');
            }

        } catch (error) {
            console.error('❌ Supabase 加载失败:', error);
            
            if (this.fallbackToJSON) {
                console.log('🔄 回退到本地 JSON 文件...');
                return await this.loadFromLocalJSON();
            } else {
                throw error;
            }
        }
    }

    /**
     * 从本地 JSON 加载（备用方案）
     */
    async loadFromLocalJSON() {
        try {
            const response = await fetch('resume-data.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            console.log('📄 已从本地 JSON 加载数据');
            return data;
        } catch (error) {
            console.error('❌ 本地 JSON 加载也失败:', error);
            throw new Error('所有数据源都不可用');
        }
    }

    /**
     * 强制刷新数据（清除缓存）
     */
    async forceRefresh() {
        sessionStorage.removeItem('resumeData');
        return await this.loadData();
    }

    /**
     * 更新配置
     */
    updateConfig(url, key) {
        this.supabaseUrl = url;
        this.supabaseKey = key;
        
        // 保存到 localStorage
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);

        // 重新初始化客户端
        return this.initClient();
    }
}

// 导出全局类
window.SupabaseDataLoader = SupabaseDataLoader;
