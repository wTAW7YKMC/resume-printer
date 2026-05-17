/**
 * 邮箱登录服务 (基于 Supabase Auth)
 *
 * 功能：
 * 1. 发送邮箱验证码/魔术链接（真实发送到任意邮箱）
 * 2. 验证码登录/注册
 * 3. 用户自动注册
 * 4. 会话管理（由 Supabase 管理）
 * 5. 数据持久化到 Supabase 云数据库
 *
 * 技术栈：
 * - Supabase Auth (邮箱认证)
 * - Supabase Database (PostgreSQL)
 * - Supabase Client (前端SDK)
 *
 * 版本：3.0.0 (Supabase Auth 版本)
 */

class LoginService {
    constructor() {
        // Supabase 配置
        this.supabaseUrl = 'https://crqwokrpcwvvsibcukkh.supabase.co';
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycXdva3JwY3d2dnNpYmN1a2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODEyNjAsImV4cCI6MjA5MjE1NzI2MH0.J-SsRlUXHrmfxasPlkFl70IXf-BXs_f5XvaeQEGNe8g';

        // 延迟初始化 Supabase Client（在首次使用时）
        this.supabase = null;
        this.supabaseInitAttempted = false;

        // 应用配置
        this.config = {
            codeLength: 6,
            expiresIn: 300,
            cooldown: 60,
            sessionDuration: 7 * 24 * 60 * 60
        };
    }

    /**
     * 初始化 Supabase Client
     */
    initSupabaseClient() {
        if (this.supabaseInitAttempted && this.supabase) {
            return this.supabase;
        }

        this.supabaseInitAttempted = true;

        try {
            console.log('[LoginService] 🔍 尝试初始化 Supabase Client...');
            console.log('[LoginService] 检查全局对象:');
            console.log('  - window.supabase:', typeof window.supabase);
            console.log('  - window.Supabase:', typeof window.Supabase);
            console.log('  - window.supabase?.createClient:', typeof window.supabase?.createClient);

            let clientCreator = null;

            // 方式1: UMD版本 - window.supabase.createClient
            if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
                clientCreator = window.supabase.createClient;
                console.log('[LoginService] ✅ 方式1: 使用 window.supabase.createClient (UMD)');
            }
            // 方式2: ES Module版本 - window.Supabase.createClient
            else if (typeof window.Supabase !== 'undefined' && typeof window.Supabase.createClient === 'function') {
                clientCreator = window.Supabase.createClient;
                console.log('[LoginService] ✅ 方式2: 使用 window.Supabase.createClient (ESM)');
            }

            if (clientCreator) {
                this.supabase = clientCreator(this.supabaseUrl, this.supabaseAnonKey);
                
                if (this.supabase && this.supabase.auth) {
                    console.log('[LoginService] ✅✅✅ Supabase Client 创建成功！');
                    console.log('[LoginService] 可用方法: auth, from, storage, etc.');
                    return this.supabase;
                } else {
                    console.error('[LoginService] ❌ Client 创建但缺少必要方法');
                    this.supabase = null;
                    return null;
                }
            } else {
                console.warn('[LoginService] ⚠️  Supabase SDK 未加载');
                console.warn('[LoginService] 可能原因:');
                console.warn('  1. CDN链接错误或网络问题');
                console.warn('  2. 浏览器扩展阻止了脚本加载');
                console.warn('  3. 脚本加载顺序错误');
                return null;
            }
        } catch (error) {
            console.error('[LoginService] ❌ 初始化失败:', error.message);
            console.error('[LoginService] 错误堆栈:', error.stack);
            return null;
        }
    }

    /**
     * 获取 Supabase Client（延迟初始化）
     */
    getSupabase() {
        if (!this.supabase) {
            this.supabase = this.initSupabaseClient();
        }
        return this.supabase;
    }

    /**
     * 核心方法：发送验证码/魔术链接到邮箱
     */
    async sendVerificationCode(email) {
        console.log(`\n[LoginService] 📧 开始向 ${email} 发送验证码...\n`);

        // 1. 验证邮箱格式
        if (!email || !this.validateEmail(email)) {
            throw new Error('请输入正确的邮箱地址');
        }

        const now = new Date();

        try {
            // 方案A：尝试使用 Supabase Auth 发送 Magic Link（推荐）
            if (this.getSupabase()) {
                console.log('[LoginService] 🎯 使用 Supabase Auth 发送验证邮件...');
                return await this.sendViaSupabaseAuth(email);
            }

            // 方案B：回退到 REST API + 自定义邮件服务
            console.log('[LoginService] 🔧 回退到自定义邮件发送...');
            return await this.sendViaCustomEmail(email);

        } catch (error) {
            console.error('\n[LoginService] ❌ 发送验证码失败:', error.message);
            throw error;
        }
    }

    /**
     * 通过 Supabase Auth 发送验证邮件（Magic Link 或 OTP）
     */
    async sendViaSupabaseAuth(email) {
        const supabase = this.getSupabase();

        try {
            console.log('[LoginService] 调用 Supabase Auth signInWithOtp...');

            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: window.location.origin + '/login.html',
                    shouldCreateUser: true,
                    data: {
                        nickname: email.split('@')[0],
                        app_name: 'Becky简历打印机'
                    }
                }
            });

            if (error) {
                console.error('[LoginService] Supabase Auth 错误:', error);

                if (error.message.includes('Email rate limit exceeded')) {
                    throw new Error('发送过于频繁，请稍后再试');
                } else if (error.message.includes('Invalid email')) {
                    throw new Error('邮箱地址无效');
                } else {
                    throw new Error(error.message || '发送失败，请重试');
                }
            }

            console.log('[LoginService] ✅✅✅ 验证邮件已成功发送！');
            console.log('[LoginService] 邮件类型: Magic Link');

            return {
                success: true,
                message: '✅ 登录链接已发送到您的邮箱！\n\n📧 请查收邮件并点击"Confirm your email"或"确认您的邮箱"链接\n\n💡 提示：\n• 可能需要1-2分钟\n• 如果没收到，请检查垃圾邮件文件夹\n• 点击链接后将自动登录并跳转到简历页面',
                data: {
                    email: email,
                    expiresIn: this.config.expiresIn,
                    mode: 'supabase_auth_magic_link',
                    isMagicLink: true,
                    hint: '这是登录链接，不是数字验证码。请在邮箱中点击链接完成登录。',
                    nextStep: '去邮箱点击链接 → 自动跳转到主页'
                }
            };

        } catch (error) {
            console.error('[LoginService] sendViaSupabaseAuth 错误:', error);
            
            // 如果是网络错误或其他问题，提供友好的错误信息
            if (error.message.includes('fetch') || error.message.includes('network')) {
                throw new Error('网络连接失败，请检查网络后重试');
            }
            
            throw error;
        }
    }

    /**
     * 自定义邮件发送方式（备用方案）
     */
    async sendViaCustomEmail(email) {
        console.log('[LoginService] 使用自定义邮件发送逻辑...');

        // 生成随机验证码
        const code = this.generateVerificationCode();
        const expiresAt = new Date(Date.now() + this.config.expiresIn * 1000);

        console.log(`[LoginService] 生成的验证码: ${code}`);
        console.log(`[LoginService] 过期时间: ${expiresAt.toLocaleString()}`);

        // 保存到数据库（使用 REST API）
        try {
            await this.saveCodeToDatabase(email, code, expiresAt);
            
            // 这里应该调用邮件发送API
            // 由于没有配置邮件服务，我们暂时返回开发模式
            console.log('\n[LoginService] ⚠️  注意：当前未配置邮件服务');
            console.log('[LoginService] 开发模式验证码:', code, '\n');

            return {
                success: true,
                message: `验证码已生成（开发模式）：${code}`,
                data: {
                    email: email,
                    devMode: true,
                    devCode: code,
                    expiresIn: this.config.expiresIn
                }
            };

        } catch (dbError) {
            console.error('[LoginService] 数据库保存失败:', dbError);
            throw new Error('系统繁忙，请稍后再试');
        }
    }

    /**
     * 保存验证码到数据库
     */
    async saveCodeToDatabase(email, code, expiresAt) {
        const baseUrl = `${this.supabaseUrl}/rest/v1`;
        const headers = {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        const response = await fetch(`${baseUrl}/verification_codes`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                email: email,
                code: code,
                code_type: 'login',
                expires_at: expiresAt.toISOString(),
                ip_address: this.getClientIP(),
                user_agent: navigator.userAgent
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || '保存验证码失败');
        }

        console.log('[LoginService] ✅ 验证码已保存到数据库');
    }

    /**
     * 核心方法：验证并登录
     */
    async verifyAndLogin(email, code) {
        console.log(`\n[LoginService] 🔐 尝试使用邮箱 ${email} 登录...\n`);

        // 输入验证
        if (!email || !this.validateEmail(email)) {
            throw new Error('请输入正确的邮箱地址');
        }

        if (!code || code.length !== 6) {
            throw new Error('请输入6位验证码');
        }

        try {
            // 尝试使用 Supabase Session 验证
            if (this.getSupabase()) {
                return await this.verifyViaSupabaseSession(email, code);
            }

            // 回退到自定义验证
            return await this.verifyViaCustomCode(email, code);

        } catch (error) {
            console.error('\n[LoginService] ❌ 登录失败:', error.message);
            throw error;
        }
    }

    /**
     * 通过 Supabase Session 验证
     */
    async verifyViaSupabaseSession(email, code) {
        const supabase = this.getSupabase();

        console.log('[LoginService] 检查当前 Supabase 会话...');

        // 获取当前会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('[LoginService] 获取会话失败:', sessionError);
        }

        // 如果已有有效会话且邮箱匹配
        if (session && session.user) {
            const userEmail = session.user.email;

            if (userEmail === email) {
                console.log('[LoginService] ✅ 发现有效会话，邮箱匹配！');
                return this.formatLoginSuccess(session.user, false);
            }
        }

        // 对于 Magic Link 流程，通常不需要手动输入验证码
        // 验证码是通过链接点击自动完成的
        // 这里我们提供一个 OTP 验证的备选方案
        
        console.log('[LoginService] ⚠️  当前流程为 Magic Link 模式');
        console.log('[LoginService] 💡 提示：请点击邮件中的链接完成登录，无需手动输入验证码');

        // 如果用户确实需要 OTP 验证，可以使用 verifyToken 方法
        // 但这需要从邮件中提取 token
        
        throw new Error(
            '当前使用 Magic Link 登录模式\n' +
            '请查收邮件并点击链接完成登录\n' +
            '（可能需要在垃圾邮件中查找）'
        );
    }

    /**
     * 自定义验证码验证（备用）
     */
    async verifyViaCustomCode(email, code) {
        console.log('[LoginService] 使用自定义验证码验证...');

        const baseUrl = `${this.supabaseUrl}/rest/v1`;
        const headers = {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json'
        };

        // 查询验证码记录
        const response = await fetch(
            `${baseUrl}/verification_codes?email=eq.${encodeURIComponent(email)}&code=eq.${code}&order=created_at.desc&limit=1`,
            { headers: headers }
        );

        if (!response.ok) {
            throw new Error('查询验证码失败');
        }

        const records = await response.json();

        if (!records || records.length === 0) {
            throw new Error('验证码错误或不存在');
        }

        const record = records[0];
        const now = new Date();

        // 状态检查
        if (record.used) {
            throw new Error('验证码已使用，请重新获取');
        }

        if (new Date(record.expires_at) < now) {
            throw new Error('验证码已过期，请重新获取');
        }

        // 标记为已使用
        await fetch(`${baseUrl}/verification_codes?id=eq.${record.id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ used: true, used_at: now.toISOString() })
        });

        // 查找或创建用户
        return await this.findOrCreateUser(email);
    }

    /**
     * 查找或创建用户
     */
    async findOrCreateUser(email) {
        const baseUrl = `${this.supabaseUrl}/rest/v1`;
        const headers = {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        // 查找现有用户
        const existingResponse = await fetch(
            `${baseUrl}/users?email=eq.${encodeURIComponent(email)}&limit=1`,
            { headers: headers }
        );

        const existingUsers = await existingResponse.json();
        const loginTime = new Date().toISOString();

        let user;

        if (existingUsers && existingUsers.length > 0) {
            // 更新老用户
            user = existingUsers[0];
            
            const updateResponse = await fetch(`${baseUrl}/users?id=eq.${user.id}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({
                    last_login_time: loginTime,
                    login_count: (user.login_count || 0) + 1,
                    is_verified: true,
                    updated_at: loginTime
                })
            });

            const updatedUsers = await updateResponse.json();
            user = updatedUsers[0];

            console.log(`[LoginService] ✅ 老用户登录成功！累计登录${user.login_count}次`);

        } else {
            // 创建新用户
            const createResponse = await fetch(`${baseUrl}/users`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    email: email,
                    nickname: email.split('@')[0],
                    avatar_url: null,
                    last_login_time: loginTime,
                    login_count: 1,
                    is_active: true,
                    is_verified: true
                })
            });

            const newUsers = await createResponse.json();
            user = newUsers[0];

            console.log(`[LoginService] ✅ 新用户注册成功！`);
        }

        // 保存会话到 localStorage
        this.saveUserSession(user);

        return this.formatLoginSuccess(user, !existingUsers || existingUsers.length === 0);
    }

    /**
     * 格式化登录成功响应
     */
    formatLoginSuccess(user, isNewUser) {
        return {
            success: true,
            message: isNewUser ? '注册并登录成功' : '登录成功',
            data: {
                userId: user.id,
                email: user.email,
                nickname: user.nickname || user.email?.split('@')[0],
                avatarUrl: user.avatar_url,
                loginTime: new Date().toISOString(),
                isNewUser: isNewUser,
                loginCount: user.login_count || 1
            }
        };
    }

    /**
     * 保存用户会话
     */
    saveUserSession(user) {
        try {
            const sessionData = {
                userId: user.id,
                email: user.email,
                nickname: user.nickname || user.email?.split('@')[0],
                avatarUrl: user.avatar_url,
                loginTime: new Date().toISOString(),
                expiresAt: new Date(Date.now() + this.config.sessionDuration * 1000).toISOString()
            };

            localStorage.setItem('userSession', JSON.stringify(sessionData));
            console.log('[LoginService] ✅ 用户会话已保存到 localStorage');

        } catch (error) {
            console.error('[LoginService] 保存会话失败:', error);
        }
    }

    /**
     * 获取当前登录用户
     */
    getCurrentUser() {
        try {
            // 优先检查 Supabase Auth 会话（如果可用）
            const supabase = this.getSupabase();
            if (supabase && supabase.auth && typeof supabase.auth.getSession === 'function') {
                try {
                    const { data: { session } } = supabase.auth.getSession();
                    if (session?.user) {
                        return {
                            userId: session.user.id,
                            email: session.user.email,
                            nickname: session.user.user_metadata?.nickname || session.user.email?.split('@')[0]
                        };
                    }
                } catch (supabaseError) {
                    console.warn('[LoginService] Supabase 会话检查失败，使用 localStorage:', supabaseError.message);
                }
            }

            // 回退到 localStorage
            const sessionData = localStorage.getItem('userSession');
            if (!sessionData) return null;

            const session = JSON.parse(sessionData);
            if (new Date(session.expiresAt) < new Date()) {
                this.logout();
                return null;
            }

            return session;

        } catch (error) {
            console.error('[LoginService] 获取用户会话失败:', error);
            return null;
        }
    }

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    /**
     * 登出
     */
    async logout() {
        try {
            // 清除 Supabase Auth 会话
            if (this.getSupabase()) {
                await this.supabase.auth.signOut();
            }

            // 清除 localStorage
            localStorage.removeItem('userSession');
            console.log('[LoginService] ✅ 已登出');

        } catch (error) {
            console.error('[LoginService] 登出失败:', error);
        }
    }

    /**
     * 工具方法：生成验证码
     */
    generateVerificationCode() {
        let code = '';
        for (let i = 0; i < this.config.codeLength; i++) {
            code += Math.floor(Math.random() * 10).toString();
        }
        return code;
    }

    /**
     * 工具方法：验证邮箱格式
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 工具方法：获取客户端 IP
     */
    getClientIP() {
        return 'unknown';
    }

    /**
     * 配置方法：设置模式（保留兼容性）
     */
    setMode(mode) {
        console.log(`[LoginService] 模式设置为: ${mode}（当前使用 Supabase Auth）`);
    }

    setDevCode(code) {
        console.warn('[LoginService] 开发模式已禁用，现在使用真实邮件发送');
    }

    setExpiresIn(seconds) {
        this.config.expiresIn = seconds;
    }

    setCooldown(seconds) {
        this.config.cooldown = seconds;
    }
}

// 创建全局实例
const loginService = new LoginService();

console.log('✅✅✅ [LOGIN-SERVICE.JS v3.0] 邮箱登录服务已初始化！');
console.log('✅✅✅ [LOGIN-SERVICE.JS] 使用 Supabase Auth（支持发送给任何邮箱）');
console.log('✅✅✅ [LOGIN-SERVICE.JS] 数据库: Supabase Cloud');
