<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Printer - 欢迎页面</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Courier New', 'Courier Prime', monospace;
            background-color: #3e2723;
            color: #212121;
            line-height: 1.6;
            overflow-x: hidden;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            max-width: 900px;
            width: 90%;
            position: relative;
            z-index: 10;
            animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .typewriter-body {
            background-color: #3e2723;
            height: 30px;
            border-radius: 5px 5px 0 0;
            position: relative;
            margin-bottom: 0;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .typewriter-roller {
            position: absolute;
            left: 10px;
            top: 10px;
            width: 10px;
            height: 10px;
            background-color: #555;
            border-radius: 50%;
            animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .paper-container {
            background-color: #f5f1e6;
            position: relative;
            padding: 40px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            min-height: 600px;

            background-image: linear-gradient(rgba(139, 69, 19, 0.1) 1px, transparent 1px);
            background-size: 100% 24px;

            filter: contrast(105%) brightness(95%);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #a67c52;
        }

        .main-title {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 42px;
            color: #8b4513;
            margin-bottom: 15px;
            display: inline-block;
            position: relative;
        }

        .greeting {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 18px;
            color: #a67c52;
            margin-top: 10px;
        }

        .cursor {
            animation: blink 1s step-end infinite;
            color: #8b4513;
            font-weight: bold;
            margin-left: 2px;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }

        .content-area {
            margin-top: 30px;
        }

        .info-section {
            background-color: #fffef9;
            border-left: 4px solid #8b4513;
            padding: 25px;
            margin-bottom: 25px;
            border-radius: 3px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .info-section h2 {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 22px;
            color: #8b4513;
            margin-bottom: 15px;
        }

        .info-section p {
            color: #555;
            line-height: 1.8;
            font-size: 15px;
            margin-bottom: 12px;
        }

        .username-display {
            color: #8b4513;
            font-weight: bold;
            font-size: 20px;
            background-color: #f5f1e6;
            padding: 8px 16px;
            border: 2px solid #a67c52;
            display: inline-block;
            margin-top: 10px;
            font-family: 'Special Elite', 'Courier New', monospace;
            border-radius: 3px;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 25px;
        }

        .feature-card {
            background-color: #fffef9;
            border: 2px solid #a67c52;
            padding: 25px;
            text-align: center;
            transition: all 0.3s ease;
            border-radius: 5px;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(139, 69, 19, 0.2);
            border-color: #8b4513;
        }

        .feature-icon {
            font-size: 40px;
            margin-bottom: 12px;
        }

        .feature-card h3 {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 18px;
            color: #8b4513;
            margin-bottom: 10px;
        }

        .feature-card p {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }

        .actions {
            text-align: center;
            padding-top: 30px;
            margin-top: 30px;
            border-top: 2px dashed #a67c52;
        }

        .btn {
            display: inline-block;
            padding: 14px 35px;
            margin: 0 10px;
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
            letter-spacing: 1px;
            border-radius: 3px;
            border: none;
        }

        .btn-primary {
            background-color: #8b4513;
            color: #fffef9;
        }

        .btn-primary:hover {
            background-color: #6d360f;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
        }

        .btn-secondary {
            background-color: transparent;
            color: #8b4513;
            border: 2px solid #8b4513;
        }

        .btn-secondary:hover {
            background-color: #8b4513;
            color: #fffef9;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
        }

        .session-info {
            background-color: #e8dcc8;
            border: 2px solid #d4c4a8;
            padding: 20px;
            margin-top: 25px;
            border-radius: 5px;
            font-size: 13px;
            color: #654321;
            font-family: 'Courier New', 'Courier Prime', monospace;
        }

        .session-info strong {
            color: #8b4513;
            display: block;
            margin-bottom: 8px;
            font-size: 15px;
        }

        .session-info p {
            margin: 5px 0;
            line-height: 1.6;
        }

        .controls {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #d4c4a8;
        }

        .control-btn {
            background-color: #e8dcc8;
            border: 2px solid #a67c52;
            color: #333;
            padding: 10px 20px;
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 5px;
            margin: 0 8px;
        }

        .control-btn:hover {
            background-color: #8b4513;
            color: #fffef9;
            transform: translateY(-2px);
        }

        .success-badge {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 打字机机身装饰 -->
        <div class="typewriter-body">
            <div class="typewriter-roller"></div>
        </div>

        <!-- 纸张区域 -->
        <div class="paper-container">
            <!-- 标题区域 -->
            <header class="header">
                <h1 class="main-title">
                    🎉 Welcome!<span class="success-badge">已认证</span><span class="cursor">|</span>
                </h1>
                <p class="greeting">您已成功登录 Resume Printer 系统</p>
            </header>

            <!-- 内容区域 -->
            <main class="content-area">
                <!-- 用户信息 -->
                <section class="info-section">
                    <h2>👋 用户信息</h2>
                    <p>欢迎回来！您现在可以访问系统的所有功能。</p>
                    <p>当前登录用户：<span class="username-display"><s:property value="#session.currentUser"/></span></p>
                </section>

                <!-- 功能模块 -->
                <section class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">📄</div>
                        <h3>简历管理</h3>
                        <p>查看和编辑您的个人简历信息</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>数据统计</h3>
                        <p>查看简历访问量和用户反馈统计</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">⚙️</div>
                        <h3>系统设置</h3>
                        <p>配置系统参数和个人偏好设置</p>
                    </div>
                </section>

                <!-- 会话信息 -->
                <section class="session-info">
                    <strong>📊 会话信息</strong>
                    <p>Session ID: <%= session.getId() %></p>
                    <p>创建时间: <%= new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date(session.getCreationTime())) %></p>
                    <p>最后访问: <%= new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date(session.getLastAccessedTime())) %></p>
                    <p>超时时间: <%= session.getMaxInactiveInterval() / 60 %> 分钟</p>
                </section>
            </main>

            <!-- 操作按钮 -->
            <div class="actions">
                <s:a action="viewResume" namespace="/resume" cssClass="btn btn-primary">
                    查看简历 →
                </s:a>
                <s:a action="logout" cssClass="btn btn-secondary">
                    安全退出
                </s:a>
            </div>

            <!-- 控制区域 -->
            <footer class="controls">
                <span style="color: #a67c52; font-size: 12px; font-family: 'Special Elite', monospace;">
                    Resume Printer © 2026 | Struts2 权限控制系统
                </span>
            </footer>
        </div>
    </div>
</body>
</html>
