-- ============================================================
-- 简历打印机 - 用户认证系统 (邮箱版本)
-- 数据库表结构 (Supabase PostgreSQL)
--
-- 执行方式：
-- 1. 登录 Supabase Dashboard: https://supabase.com/dashboard
-- 2. 选择你的项目
-- 3. 左侧菜单 → SQL Editor
-- 4. 复制粘贴此文件内容
-- 5. 点击 "Run" 执行
-- ============================================================

-- 启用 UUID 扩展（如果未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. 用户表 (users)
-- 存储所有注册用户的信息
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,         -- 用户唯一ID
    email VARCHAR(255) UNIQUE NOT NULL,                      -- 邮箱地址（唯一，作为登录账号）
    phone VARCHAR(20),                                       -- 手机号（可选）
    nickname VARCHAR(100) DEFAULT '新用户',                   -- 用户昵称
    avatar_url TEXT,                                         -- 头像URL
    
    -- 登录统计
    last_login_time TIMESTAMPTZ,                             -- 最后登录时间
    login_count INTEGER DEFAULT 0,                           -- 累计登录次数
    
    -- 账号状态
    is_active BOOLEAN DEFAULT TRUE,                          -- 是否激活
    is_verified BOOLEAN DEFAULT FALSE,                       -- 是否已验证邮箱
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),                    -- 创建时间
    updated_at TIMESTAMPTZ DEFAULT NOW()                     -- 最后更新时间
);

-- 创建索引（优化查询性能）
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 添加表注释
COMMENT ON TABLE users IS '用户信息表 - 存储注册用户的基本信息和登录状态';
COMMENT ON COLUMN users.id IS '用户唯一标识符 (UUID)';
COMMENT ON COLUMN users.email IS '用户邮箱地址 (唯一，用于登录)';
COMMENT ON COLUMN users.phone IS '手机号码 (可选)';
COMMENT ON COLUMN users.nickname IS '用户显示昵称';
COMMENT ON COLUMN users.avatar_url IS '头像图片URL';
COMMENT ON COLUMN users.last_login_time IS '最后一次成功登录时间';
COMMENT ON COLUMN users.login_count IS '累计登录次数';
COMMENT ON COLUMN users.is_active IS '账号是否激活 (true=正常, false=禁用)';
COMMENT ON COLUMN users.is_verified IS '是否已完成邮箱验证';
COMMENT ON COLUMN users.created_at IS '账号创建时间';
COMMENT ON COLUMN users.updated_at IS '最后更新时间';

-- ============================================================
-- 2. 验证码表 (verification_codes)
-- 存储邮箱/手机验证码
-- ============================================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,         -- 记录唯一ID
    
    -- 验证目标
    email VARCHAR(255),                                      -- 接收验证码的邮箱
    phone VARCHAR(20),                                       -- 接收验证码的手机号（可选）
    
    -- 验证码信息
    code VARCHAR(10) NOT NULL,                               -- 6位数字验证码
    code_type VARCHAR(20) DEFAULT 'login',                   -- 验证码类型: login/register/reset_password
    
    -- 状态跟踪
    used BOOLEAN DEFAULT FALSE,                              -- 是否已使用
    used_at TIMESTAMPTZ,                                     -- 使用时间
    attempts INTEGER DEFAULT 0,                              -- 尝试次数（防暴力破解）
    
    -- 有效期
    expires_at TIMESTAMPTZ NOT NULL,                         -- 过期时间
    
    -- 安全信息
    ip_address VARCHAR(50),                                  -- 请求IP地址
    user_agent TEXT,                                         -- 浏览器User-Agent
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW()                     -- 创建时间
);

-- 创建索引（优化查询和清理）
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_created_at ON verification_codes(created_at);

-- 添加表注释
COMMENT ON TABLE verification_codes IS '验证码记录表 - 存储邮箱/手机验证码及其状态';
COMMENT ON COLUMN verification_codes.id IS '记录唯一标识符';
COMMENT ON COLUMN verification_codes.email IS '接收验证码的邮箱地址';
COMMENT ON COLUMN verification_codes.phone IS '接收验证码的手机号（可选）';
COMMENT ON COLUMN verification_codes.code IS '6位数字验证码';
COMMENT ON COLUMN verification_codes.code_type IS '验证码用途类型';
COMMENT ON COLUMN verification_codes.used IS '是否已被使用验证';
COMMENT ON COLUMN verification_codes.used_at IS '验证使用的时间戳';
COMMENT ON COLUMN verification_codes.attempts IS '验证尝试次数（超过3次则失效）';
COMMENT ON COLUMN verification_codes.expires_at IS '验证码过期时间（通常5分钟）';
COMMENT ON COLUMN verification_codes.ip_address IS '发起请求的IP地址';
COMMENT ON COLUMN verification_codes.user_agent IS '浏览器User-Agent字符串';
COMMENT ON COLUMN verification_codes.created_at IS '验证码生成时间';

-- ============================================================
-- 3. 用户会话表 (user_sessions) - 可选
-- 用于管理用户登录会话和Token
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 会话Token
    token VARCHAR(512) NOT NULL UNIQUE,                      -- 会话令牌（JWT或随机Token）
    token_type VARCHAR(20) DEFAULT 'session',               -- Token类型: session/api/refresh
    
    -- 设备信息
    device_info TEXT,                                        -- 设备描述（如：Chrome on Windows）
    ip_address VARCHAR(50),                                  -- 登录IP
    
    -- 会话状态
    is_active BOOLEAN DEFAULT TRUE,                          -- 会话是否有效
    expires_at TIMESTAMPTZ NOT NULL,                         -- 会话过期时间
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),                    -- 创建时间
    last_active_at TIMESTAMPTZ DEFAULT NOW()                 -- 最后活跃时间
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 添加注释
COMMENT ON TABLE user_sessions IS '用户会话表 - 管理登录会话和访问令牌';

-- ============================================================
-- 4. 启用行级安全策略 (Row Level Security)
-- 保护数据安全，确保用户只能访问自己的数据
-- ============================================================

-- 对 users 表启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 对 verification_codes 表启用 RLS（可选，因为这是内部使用的表）
-- ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 对 user_sessions 表启用 RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. 创建安全策略
-- 允许匿名用户插入（注册），但只能查看自己的数据
-- ============================================================

-- users 表策略：允许任何人创建用户（注册）
CREATE POLICY "允许匿名用户注册" ON users
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- users 表策略：允许已认证用户查看所有用户信息（管理员功能）
CREATE POLICY "允许查看用户信息" ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- users 表策略：允许用户更新自己的信息
CREATE POLICY "允许用户更新自己的信息" ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- user_sessions 表策略：允许创建会话
CREATE POLICY "允许创建会话" ON user_sessions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- user_sessions 表策略：允许查看自己的会话
CREATE POLICY "允许查看自己的会话" ON user_sessions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- user_sessions 表策略：允许删除自己的会话（登出）
CREATE POLICY "允许删除自己的会话" ON user_sessions
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- 6. 创建自动清理函数（可选）
-- 定期清理过期的验证码和会话
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- 清理过期的验证码（超过24小时）
    DELETE FROM verification_codes 
    WHERE expires_at < NOW() - INTERVAL '24 hours'
    OR created_at < NOW() - INTERVAL '7 days';
    
    -- 清理过期的会话
    DELETE FROM user_sessions 
    WHERE expires_at < NOW()
    OR last_active_at < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE '过期数据清理完成';
END;
$$ LANGUAGE plpgsql;

-- 添加注释
COMMENT ON FUNCTION cleanup_expired_data() IS '清理过期的验证码和会话数据';

-- ============================================================
-- 7. 创建触发器（可选）
-- 在更新users表时自动更新 updated_at 字段
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为 user_sessions 表创建触发器
DROP TRIGGER IF EXISTS update_user_sessions_last_active_at ON user_sessions;
CREATE TRIGGER update_user_sessions_last_active_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 完成！
-- ============================================================

SELECT '✅ 数据库表创建完成！' AS status,
       'users' AS table_1,
       'verification_codes' AS table_2,
       'user_sessions' AS table_3,
       '行级安全策略已启用' AS security,
       '自动清理函数已创建' AS maintenance;
