-- ============================================
-- Resume Printer 数据库表结构 (Supabase/PostgreSQL)
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 个人信息表
CREATE TABLE IF NOT EXISTS personal_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    tagline TEXT,
    location TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 教育经历表
CREATE TABLE IF NOT EXISTS education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    institution TEXT NOT NULL,
    degree TEXT,
    major TEXT,
    period TEXT,
    location TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 工作经历表
CREATE TABLE IF NOT EXISTS work_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company TEXT NOT NULL,
    position TEXT,
    period TEXT,
    location TEXT,
    description TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 项目经验表
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    period TEXT,
    description TEXT,
    technologies JSONB DEFAULT '[]'::jsonb,
    outcomes JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 技能表
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('design', 'development', 'other')),
    name TEXT NOT NULL,
    proficiency INTEGER DEFAULT 3 CHECK (proficiency >= 1 AND proficiency <= 5),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 创建索引以提升查询性能
-- ============================================
CREATE INDEX IF NOT EXISTS idx_education_sort ON education(sort_order);
CREATE INDEX IF NOT EXISTS idx_work_experience_sort ON work_experience(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category, sort_order);

-- ============================================
-- 设置行级安全策略 (Row Level Security)
-- 允许所有人读取数据（公开简历）
-- ============================================

ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（SELECT）
CREATE POLICY "允许公开查看个人信息" ON personal_info FOR SELECT USING (true);
CREATE POLICY "允许公开查看教育经历" ON education FOR SELECT USING (true);
CREATE POLICY "允许公开查看工作经历" ON work_experience FOR SELECT USING (true);
CREATE POLICY "允许公开查看项目" ON projects FOR SELECT USING (true);
CREATE POLICY "允许公开查看技能" ON skills FOR SELECT USING (true);

-- 允许通过 anon key 进行增删改（管理操作）
CREATE POLICY "允许管理员修改个人信息" ON personal_info FOR ALL USING (true);
CREATE POLICY "允许管理员管理教育经历" ON education FOR ALL USING (true);
CREATE POLICY "允许管理员管理工作经历" ON work_experience FOR ALL USING (true);
CREATE POLICY "允许管理员管理项目" ON projects FOR ALL USING (true);
CREATE POLICY "允许管理员管理技能" ON skills FOR ALL USING (true);

-- ============================================
-- 插入初始示例数据（从你的 resume-data.json 导入）
-- ============================================

INSERT INTO personal_info (name, title, tagline, location, email, phone, avatar_url) VALUES 
('喻贝贝（Becky）', '智能经济专业学生', 
'对宏观经济、数据分析充满热情的经济学学习者，擅长将理论知识应用于实践',
'武汉理工大学 经济学院', 'becky@example.com', '+86 138 0000 0000', 
'https://raw.githubusercontent.com/[your-username]/[your-repo]/main/assets/avatar.jpg')
ON CONFLICT DO NOTHING;

INSERT INTO education (institution, degree, major, period, location, achievements) VALUES 
('武汉理工大学', '经济学学士', '智能经济', '2020 - 2024', '武汉, 中国', 
'["参与校园经济调研项目", "参加金融模拟竞赛"]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO work_experience (company, position, period, location, description, highlights) VALUES 
('武汉理工大学经济学人协会', '办公室副部长', '', '', 
'策划并落地学术研讨、案例分享等活动；负责活动流程协调、物料准备', '[]'::jsonb),
('武汉理工大学经济学院科学技术协会', '干事', '', '', 
'参与统筹创新杯、品牌策划赛等科创赛事', '[]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO projects (name, role, period, description, technologies, outcomes) VALUES 
('健康管理App', '主导设计师', '2023', 
'一款帮助用户跟踪日常健康活动的移动应用', 
'["Figma", "React Native", "数据可视化"]'::jsonb,
'["上线首月获得1万+下载量", "App Store获得4.8星好评"]'::jsonb),
('智能家居控制平台', '产品设计师', '2022', 
'为智能家居设备打造的统一控制平台', 
'["Figma", "用户体验研究", "交互设计"]'::jsonb,
'["简化了80%的设备配置流程", "用户满意度提升45%"]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO skills (category, name, proficiency) VALUES 
('design', 'UI/UX设计', 5),
('design', 'Figma', 5),
('design', 'Sketch', 4),
('design', '用户研究', 4),
('design', '原型设计', 5),
('development', 'HTML/CSS', 3),
('development', 'JavaScript', 3),
('development', 'React', 2),
('other', '项目管理', 4),
('other', '数据分析', 3),
('other', '设计思维', 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- 创建自动更新时间戳的函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表添加触发器
DROP TRIGGER IF EXISTS update_personal_info_modtime ON personal_info;
CREATE TRIGGER update_personal_info_modtime BEFORE UPDATE ON personal_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_modtime ON education;
CREATE TRIGGER update_education_modtime BEFORE UPDATE ON education 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_experience_modtime ON work_experience;
CREATE TRIGGER update_work_experience_modtime BEFORE UPDATE ON work_experience 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_modtime ON projects;
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skills_modtime ON skills;
CREATE TRIGGER update_skills_modtime BEFORE UPDATE ON skills 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成！
SELECT '✅ 数据库初始化完成！已创建5张表并导入初始数据。' as status;
