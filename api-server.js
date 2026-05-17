const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database('./resume.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('已连接到SQLite数据库');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS personal_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT,
            tagline TEXT,
            location TEXT,
            email TEXT,
            phone TEXT,
            avatar_url TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            institution TEXT NOT NULL,
            degree TEXT,
            major TEXT,
            period TEXT,
            location TEXT,
            achievements TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS work_experience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            position TEXT,
            period TEXT,
            location TEXT,
            description TEXT,
            highlights TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT,
            period TEXT,
            description TEXT,
            technologies TEXT,
            outcomes TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            proficiency INTEGER DEFAULT 3
        )`);

        console.log('数据库表创建/检查完成');

        checkAndImportData();
    });
}

function checkAndImportData() {
    db.get("SELECT COUNT(*) as count FROM personal_info", (err, row) => {
        if (err) {
            console.error('查询数据失败:', err);
            return;
        }

        if (row.count === 0) {
            console.log('数据库为空，正在导入初始数据...');
            importInitialData();
        } else {
            console.log(`数据库已有 ${row.count} 条个人数据`);
        }
    });
}

function importInitialData() {
    const dataPath = path.join(__dirname, 'resume-data.json');

    if (!fs.existsSync(dataPath)) {
        console.log('未找到resume-data.json文件，跳过导入');
        return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const resumeData = JSON.parse(rawData);

    db.serialize(() => {
        if (resumeData.personalInfo) {
            const pi = resumeData.personalInfo;
            db.run(`INSERT INTO personal_info (name, title, tagline, location, email, phone, avatar_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [pi.name, pi.title, pi.tagline, pi.location, pi.email, pi.phone, pi.avatarUrl],
                function(err) {
                    if (err) console.error('导入个人信息失败:', err);
                    else console.log('✓ 个人信息导入成功');
                });
        }

        if (resumeData.education && Array.isArray(resumeData.education)) {
            resumeData.education.forEach((edu, index) => {
                db.run(`INSERT INTO education (institution, degree, major, period, location, achievements)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                    [edu.institution, edu.degree, edu.major, edu.period, edu.location,
                     JSON.stringify(edu.achievements || [])],
                    function(err) {
                        if (err) console.error(`导入教育经历${index + 1}失败:`, err);
                        else console.log(`✓ 教育经历${index + 1}导入成功`);
                    });
            });
        }

        if (resumeData.workExperience && Array.isArray(resumeData.workExperience)) {
            resumeData.workExperience.forEach((work, index) => {
                db.run(`INSERT INTO work_experience (company, position, period, location, description, highlights)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                    [work.company, work.position, work.period, work.location, work.description,
                     JSON.stringify(work.highlights || [])],
                    function(err) {
                        if (err) console.error(`导入工作经历${index + 1}失败:`, err);
                        else console.log(`✓ 工作经历${index + 1}导入成功`);
                    });
            });
        }

        if (resumeData.projects && Array.isArray(resumeData.projects)) {
            resumeData.projects.forEach((proj, index) => {
                db.run(`INSERT INTO projects (name, role, period, description, technologies, outcomes)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                    [proj.name, proj.role, proj.period, proj.description,
                     JSON.stringify(proj.technologies || []),
                     JSON.stringify(proj.outcomes || [])],
                    function(err) {
                        if (err) console.error(`导入项目${index + 1}失败:`, err);
                        else console.log(`✓ 项目${index + 1}导入成功`);
                    });
            });
        }

        if (resumeData.skills) {
            const categories = ['design', 'development', 'other'];
            categories.forEach(category => {
                if (resumeData.skills[category] && Array.isArray(resumeData.skills[category])) {
                    resumeData.skills[category].forEach((skill, index) => {
                        db.run(`INSERT INTO skills (category, name, proficiency)
                                VALUES (?, ?, ?)`,
                            [category, skill.name, skill.proficiency],
                            function(err) {
                                if (err) console.error(`导入技能${skill.name}失败:`, err);
                                else console.log(`✓ 技能 ${skill.name} 导入成功`);
                            });
                    });
                }
            });
        }

        console.log('\n🎉 初始数据导入完成！');
    });
}

// ========== API 路由 ==========

// 获取完整简历数据（Read）
app.get('/api/resume', (req, res) => {
    const resume = {
        personalInfo: null,
        education: [],
        workExperience: [],
        projects: [],
        skills: { design: [], development: [], other: [] }
    };

    db.get("SELECT * FROM personal_info LIMIT 1", (err, row) => {
        if (err) {
            return res.status(500).json({ code: 500, message: '获取个人信息失败', error: err.message });
        }
        if (row) {
            resume.personalInfo = {
                id: row.id,
                name: row.name,
                title: row.title,
                tagline: row.tagline,
                location: row.location,
                email: row.email,
                phone: row.phone,
                avatarUrl: row.avatar_url
            };
        }

        db.all("SELECT * FROM education ORDER BY id", (err, rows) => {
            if (err) {
                return res.status(500).json({ code: 500, message: '获取教育经历失败', error: err.message });
            }
            resume.education = rows.map(row => ({
                id: row.id,
                institution: row.institution,
                degree: row.degree,
                major: row.major,
                period: row.period,
                location: row.location,
                achievements: JSON.parse(row.achievements || '[]')
            }));

            db.all("SELECT * FROM work_experience ORDER BY id", (err, rows) => {
                if (err) {
                    return res.status(500).json({ code: 500, message: '获取工作经历失败', error: err.message });
                }
                resume.workExperience = rows.map(row => ({
                    id: row.id,
                    company: row.company,
                    position: row.position,
                    period: row.period,
                    location: row.location,
                    description: row.description,
                    highlights: JSON.parse(row.highlights || '[]')
                }));

                db.all("SELECT * FROM projects ORDER BY id", (err, rows) => {
                    if (err) {
                        return res.status(500).json({ code: 500, message: '获取项目经验失败', error: err.message });
                    }
                    resume.projects = rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        role: row.role,
                        period: row.period,
                        description: row.description,
                        technologies: JSON.parse(row.technologies || '[]'),
                        outcomes: JSON.parse(row.outcomes || '[]')
                    }));

                    db.all("SELECT * FROM skills ORDER BY category, id", (err, rows) => {
                        if (err) {
                            return res.status(500).json({ code: 500, message: '获取技能列表失败', error: err.message });
                        }
                        rows.forEach(row => {
                            if (resume.skills[row.category]) {
                                resume.skills[row.category].push({
                                    id: row.id,
                                    name: row.name,
                                    proficiency: row.proficiency
                                });
                            }
                        });

                        res.json({
                            code: 200,
                            message: '获取简历数据成功',
                            data: resume
                        });
                    });
                });
            });
        });
    });
});

// 更新个人信息（Update）
app.put('/api/resume/personal/:id', (req, res) => {
    const { id } = req.params;
    const { name, title, tagline, location, email, phone, avatarUrl } = req.body;

    db.run(`UPDATE personal_info SET name=?, title=?, tagline=?, location=?, email=?, phone=?, avatar_url=? WHERE id=?`,
        [name, title, tagline, location, email, phone, avatarUrl, id],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '更新失败', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ code: 404, message: '未找到该记录' });
            }
            res.json({ code: 200, message: '个人信息更新成功' });
        });
});

// 新增工作经历（Create）
app.post('/api/resume/work', (req, res) => {
    const { company, position, period, location, description, highlights } = req.body;

    db.run(`INSERT INTO work_experience (company, position, period, location, description, highlights)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [company, position, period, location, description, JSON.stringify(highlights || [])],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '添加失败', error: err.message });
            }
            res.json({
                code: 200,
                message: '工作经历添加成功',
                data: { id: this.lastID }
            });
        });
});

// 更新工作经历（Update）
app.put('/api/resume/work/:id', (req, res) => {
    const { id } = req.params;
    const { company, position, period, location, description, highlights } = req.body;

    db.run(`UPDATE work_experience SET company=?, position=?, period=?, location=?, description=?, highlights=? WHERE id=?`,
        [company, position, period, location, description, JSON.stringify(highlights || []), id],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '更新失败', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ code: 404, message: '未找到该记录' });
            }
            res.json({ code: 200, message: '工作经历更新成功' });
        });
});

// 删除工作经历（Delete）
app.delete('/api/resume/work/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM work_experience WHERE id=?", [id], function(err) {
        if (err) {
            return res.status(500).json({ code: 500, message: '删除失败', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ code: 404, message: '未找到该记录' });
        }
        res.json({ code: 200, message: '删除成功' });
    });
});

// 新增项目经验（Create）
app.post('/api/resume/project', (req, res) => {
    const { name, role, period, description, technologies, outcomes } = req.body;

    db.run(`INSERT INTO projects (name, role, period, description, technologies, outcomes)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [name, role, period, description, JSON.stringify(technologies || []), JSON.stringify(outcomes || [])],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '添加失败', error: err.message });
            }
            res.json({
                code: 200,
                message: '项目经验添加成功',
                data: { id: this.lastID }
            });
        });
});

// 更新项目经验（Update）
app.put('/api/resume/project/:id', (req, res) => {
    const { id } = req.params;
    const { name, role, period, description, technologies, outcomes } = req.body;

    db.run(`UPDATE projects SET name=?, role=?, period=?, description=?, technologies=?, outcomes=? WHERE id=?`,
        [name, role, period, description, JSON.stringify(technologies || []),
         JSON.stringify(outcomes || []), id],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '更新失败', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ code: 404, message: '未找到该记录' });
            }
            res.json({ code: 200, message: '项目经验更新成功' });
        });
});

// 删除项目经验（Delete）
app.delete('/api/resume/project/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM projects WHERE id=?", [id], function(err) {
        if (err) {
            return res.status(500).json({ code: 500, message: '删除失败', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ code: 404, message: '未找到该记录' });
        }
        res.json({ code: 200, message: '删除成功' });
    });
});

// 新增教育经历（Create）
app.post('/api/resume/education', (req, res) => {
    const { institution, degree, major, period, location, achievements } = req.body;

    db.run(`INSERT INTO education (institution, degree, major, period, location, achievements)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [institution, degree, major, period, location, JSON.stringify(achievements || [])],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '添加失败', error: err.message });
            }
            res.json({
                code: 200,
                message: '教育经历添加成功',
                data: { id: this.lastID }
            });
        });
});

// 更新教育经历（Update）
app.put('/api/resume/education/:id', (req, res) => {
    const { id } = req.params;
    const { institution, degree, major, period, location, achievements } = req.body;

    db.run(`UPDATE education SET institution=?, degree=?, major=?, period=?, location=?, achievements=? WHERE id=?`,
        [institution, degree, major, period, location, JSON.stringify(achievements || []), id],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '更新失败', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ code: 404, message: '未找到该记录' });
            }
            res.json({ code: 200, message: '教育经历更新成功' });
        });
});

// 删除教育经历（Delete）
app.delete('/api/resume/education/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM education WHERE id=?", [id], function(err) {
        if (err) {
            return res.status(500).json({ code: 500, message: '删除失败', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ code: 404, message: '未找到该记录' });
        }
        res.json({ code: 200, message: '删除成功' });
    });
});

// 新增技能（Create）
app.post('/api/resume/skill', (req, res) => {
    const { category, name, proficiency } = req.body;

    db.run("INSERT INTO skills (category, name, proficiency) VALUES (?, ?, ?)",
        [category, name, proficiency || 3],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '添加失败', error: err.message });
            }
            res.json({
                code: 200,
                message: '技能添加成功',
                data: { id: this.lastID }
            });
        });
});

// 更新技能（Update）
app.put('/api/resume/skill/:id', (req, res) => {
    const { id } = req.params;
    const { category, name, proficiency } = req.body;

    db.run("UPDATE skills SET category=?, name=?, proficiency=? WHERE id=?",
        [category, name, proficiency, id],
        function(err) {
            if (err) {
                return res.status(500).json({ code: 500, message: '更新失败', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ code: 404, message: '未找到该记录' });
            }
            res.json({ code: 200, message: '技能更新成功' });
        });
});

// 删除技能（Delete）
app.delete('/api/resume/skill/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM skills WHERE id=?", [id], function(err) {
        if (err) {
            return res.status(500).json({ code: 500, message: '删除失败', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ code: 404, message: '未找到该记录' });
        }
        res.json({ code: 200, message: '删除成功' });
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 API服务器运行在 http://localhost:${PORT}`);
    console.log(`\n可用的API接口:`);
    console.log(`  GET    /api/resume              - 获取完整简历`);
    console.log(`  PUT    /api/resume/personal/:id  - 更新个人信息`);
    console.log(`  POST   /api/resume/work          - 添加工作经历`);
    console.log(`  PUT    /api/resume/work/:id      - 更新工作经历`);
    console.log(`  DELETE /api/resume/work/:id      - 删除工作经历`);
    console.log(`  POST   /api/resume/project       - 添加项目经验`);
    console.log(`  PUT    /api/resume/project/:id   - 更新项目经验`);
    console.log(`  DELETE /api/resume/project/:id   - 删除项目经验`);
    console.log(`  POST   /api/resume/education     - 添加教育经历`);
    console.log(`  PUT    /api/resume/education/:id - 更新教育经历`);
    console.log(`  DELETE /api/resume/education/:id - 删除教育经历`);
    console.log(`  POST   /api/resume/skill         - 添加技能`);
    console.log(`  PUT    /api/resume/skill/:id     - 更新技能`);
    console.log(`  DELETE /api/resume/skill/:id     - 删除技能\n`);
});
