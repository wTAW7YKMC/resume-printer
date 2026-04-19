/**
 * Supabase 数据库客户端
 * 用于连接云端数据库，实现简历数据的增删改查
 */

class SupabaseClient {
    constructor(config = {}) {
        this.url = config.url || 'https://YOUR_PROJECT_ID.supabase.co';
        this.anonKey = config.anonKey || 'YOUR_ANON_KEY';
        this.baseUrl = `${this.url}/rest/v1`;
        
        // 默认请求头
        this.headers = {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'  // 返回插入/更新的数据
        };
    }

    /**
     * 通用请求方法
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // 根据方法返回不同格式
            const method = (options.method || 'GET').toUpperCase();
            if (method === 'DELETE') {
                return { success: true };
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('SupabaseClient 请求失败:', error);
            throw error;
        }
    }

    // ========== 个人信息 ==========

    /**
     * 获取个人信息
     */
    async getPersonalInfo() {
        const data = await this.request('/personal_info?limit=1&order=created_at.desc');
        return data && data.length > 0 ? data[0] : null;
    }

    /**
     * 更新个人信息
     */
    async updatePersonalInfo(id, updates) {
        const result = await this.request(`/personal_info?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...updates,
                updated_at: new Date().toISOString()
            })
        });
        return result && result.length > 0 ? result[0] : null;
    }

    // ========== 教育经历 ==========

    /**
     * 获取所有教育经历（按排序）
     */
    async getEducation() {
        return await this.request('/education?order=sort_order.asc,created_at.asc');
    }

    /**
     * 添加教育经历
     */
    async addEducation(eduData) {
        const result = await this.request('/education', {
            method: 'POST',
            body: JSON.stringify(eduData)
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 更新教育经历
     */
    async updateEducation(id, updates) {
        const result = await this.request(`/education?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...updates,
                updated_at: new Date().toISOString()
            })
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 删除教育经历
     */
    async deleteEducation(id) {
        return await this.request(`/education?id=eq.${id}`, {
            method: 'DELETE'
        });
    }

    // ========== 工作经历 ==========

    /**
     * 获取所有工作经历
     */
    async getWorkExperience() {
        return await this.request('/work_experience?order=sort_order.asc,created_at.asc');
    }

    /**
     * 添加工作经历
     */
    async addWorkExperience(workData) {
        const result = await this.request('/work_experience', {
            method: 'POST',
            body: JSON.stringify(workData)
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 更新工作经历
     */
    async updateWorkExperience(id, updates) {
        const result = await this.request(`/work_experience?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...updates,
                updated_at: new Date().toISOString()
            })
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 删除工作经历
     */
    async deleteWorkExperience(id) {
        return await this.request(`/work_experience?id=eq.${id}`, {
            method: 'DELETE'
        });
    }

    // ========== 项目经验 ==========

    /**
     * 获取所有项目
     */
    async getProjects() {
        return await this.request('/projects?order=sort_order.asc,created_at.asc');
    }

    /**
     * 添加项目
     */
    async addProject(projectData) {
        const result = await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 更新项目
     */
    async updateProject(id, updates) {
        const result = await this.request(`/projects?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...updates,
                updated_at: new Date().toISOString()
            })
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 删除项目
     */
    async deleteProject(id) {
        return await this.request(`/projects?id=eq.${id}`, {
            method: 'DELETE'
        });
    }

    // ========== 技能管理 ==========

    /**
     * 获取所有技能（按分类和排序）
     */
    async getSkills() {
        const allSkills = await this.request('/skills?order=category,sort_order.asc,created_at.asc');
        
        // 按分类分组
        const grouped = {
            design: [],
            development: [],
            other: []
        };

        allSkills.forEach(skill => {
            if (grouped[skill.category]) {
                grouped[skill.category].push(skill);
            }
        });

        return grouped;
    }

    /**
     * 添加技能
     */
    async addSkill(skillData) {
        const result = await this.request('/skills', {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 更新技能
     */
    async updateSkill(id, updates) {
        const result = await this.request(`/skills?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...updates,
                updated_at: new Date().toISOString()
            })
        });
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * 删除技能
     */
    async deleteSkill(id) {
        return await this.request(`/skills?id=eq.${id}`, {
            method: 'DELETE'
        });
    }

    // ========== 获取完整简历数据 ==========

    /**
     * 获取完整的简历数据（用于展示）
     */
    async getFullResume() {
        try {
            // 并行获取所有数据
            const [personalInfo, education, workExperience, projects, skills] = await Promise.all([
                this.getPersonalInfo(),
                this.getEducation(),
                this.getWorkExperience(),
                this.getProjects(),
                this.getSkills()
            ]);

            return {
                code: 200,
                message: '获取成功',
                data: {
                    personalInfo,
                    education,
                    workExperience,
                    projects,
                    skills
                }
            };
        } catch (error) {
            console.error('获取完整简历失败:', error);
            return {
                code: 500,
                message: '获取失败: ' + error.message,
                data: null
            };
        }
    }

    /**
     * 测试连接
     */
    async testConnection() {
        try {
            await this.getPersonalInfo();
            return { success: true, message: '✅ 连接成功' };
        } catch (error) {
            return { success: false, message: '❌ 连接失败: ' + error.message };
        }
    }
}

// 导出全局实例（稍后会初始化）
window.SupabaseDB = SupabaseClient;
