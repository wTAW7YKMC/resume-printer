<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Printer - 登录</title>
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

        .login-container {
            max-width: 600px;
            width: 90%;
            margin: 0 auto;
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
            height: 40px;
            border-radius: 5px 5px 0 0;
            position: relative;
            margin-bottom: 0;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .typewriter-roller {
            position: absolute;
            left: 15px;
            top: 15px;
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

        .typewriter-keys {
            display: flex;
            gap: 5px;
            margin-left: auto;
            margin-right: 15px;
        }

        .key {
            width: 12px;
            height: 12px;
            background-color: #8b7355;
            border-radius: 2px;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
            animation: keyPress 3s ease-in-out infinite;
        }

        .key:nth-child(2) { animation-delay: 0.2s; }
        .key:nth-child(3) { animation-delay: 0.4s; }
        .key:nth-child(4) { animation-delay: 0.6s; }
        .key:nth-child(5) { animation-delay: 0.8s; }
        .key:nth-child(6) { animation-delay: 1s; }
        .key:nth-child(7) { animation-delay: 1.2s; }
        .key:nth-child(8) { animation-delay: 1.4s; }
        .key:nth-child(9) { animation-delay: 1.6s; }
        .key:nth-child(10) { animation-delay: 1.8s; }

        @keyframes keyPress {
            0%, 90%, 100% { transform: translateY(0); }
            95% { transform: translateY(2px); background-color: #a68b5b; }
        }

        .paper-container {
            background-color: #f5f1e6;
            position: relative;
            padding: 50px 40px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            min-height: 550px;

            background-image: linear-gradient(rgba(139, 69, 19, 0.1) 1px, transparent 1px);
            background-size: 100% 24px;

            filter: contrast(105%) brightness(95%);

            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .main-title {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 36px;
            color: #8b4513;
            margin-bottom: 15px;
            display: inline-block;
            position: relative;
        }

        .subtitle {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 16px;
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

        .login-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .login-form {
            width: 100%;
            max-width: 400px;
            transition: all 0.3s ease;
        }

        .login-form.active {
            display: block;
        }

        .form-container {
            width: 100%;
        }

        .input-group {
            margin-bottom: 25px;
        }

        .input-label {
            display: block;
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 14px;
            color: #8b4513;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .input-field {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #a67c52;
            background-color: #fffef9;
            font-family: 'Courier New', 'Courier Prime', monospace;
            font-size: 16px;
            transition: all 0.3s ease;
            outline: none;
        }

        .input-field:focus {
            border-color: #8b4513;
            box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .error-message {
            background-color: #fff0f0;
            border: 2px solid #cc0000;
            color: #cc0000;
            padding: 15px 20px;
            margin-bottom: 25px;
            font-size: 14px;
            font-weight: bold;
            font-family: 'Special Elite', 'Courier New', monospace;
            border-radius: 3px;
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }

        .submit-btn {
            width: 100%;
            padding: 14px 30px;
            background-color: #8b4513;
            color: #fffef9;
            border: none;
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 2px;
            border-radius: 3px;
            margin-top: 10px;
        }

        .submit-btn:hover {
            background-color: #6d360f;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
        }

        .submit-btn:active {
            transform: translateY(0);
        }

        .divider {
            display: flex;
            align-items: center;
            margin: 30px 0;
            width: 100%;
        }

        .divider-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(to right, transparent, #a67c52, transparent);
        }

        .divider-symbol {
            padding: 0 15px;
            color: #a67c52;
            font-size: 18px;
        }

        .guest-login-section {
            text-align: center;
            width: 100%;
            max-width: 400px;
        }

        .guest-btn {
            width: 100%;
            padding: 14px 30px;
            background-color: transparent;
            color: #8b4513;
            border: 2px solid #8b4513;
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 1px;
            border-radius: 3px;
            margin-bottom: 10px;
        }

        .guest-btn:hover {
            background-color: #8b4513;
            color: #fffef9;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
        }

        .btn-icon {
            font-size: 18px;
            margin-right: 8px;
        }

        .btn-text {
            font-weight: bold;
        }

        .btn-hint {
            display: block;
            font-size: 12px;
            color: #a67c52;
            margin-top: 5px;
            font-weight: normal;
        }

        .guest-hint {
            font-size: 13px;
            color: #a67c52;
            margin-top: 10px;
            font-family: 'Special Elite', 'Courier New', monospace;
        }

        .hint {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8dcc8;
            border-left: 4px solid #8b4513;
            font-size: 13px;
            color: #654321;
            line-height: 1.6;
            font-family: 'Special Elite', 'Courier New', monospace;
        }

        .hint strong {
            color: #8b4513;
        }

        .login-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #d4c4a8;
        }

        .footer-text {
            font-size: 12px;
            color: #a67c52;
            font-family: 'Special Elite', 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <!-- 打字机机身装饰 -->
        <div class="typewriter-body">
            <div class="typewriter-roller"></div>
            <div class="typewriter-keys">
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
                <div class="key"></div>
            </div>
        </div>

        <!-- 纸张区域 -->
        <div class="paper-container">
            <!-- 标题区域 -->
            <header class="header">
                <h1 id="main-title" class="main-title">
                    <span id="title-text">Welcome Back</span><span class="cursor">|</span>
                </h1>
                <p class="subtitle">请输入您的用户名和密码登录系统</p>
            </header>

            <!-- 登录表单区域 -->
            <main class="login-content">
                <!-- 错误信息显示 -->
                <s:if test="errorMsg != null && !errorMsg.isEmpty()">
                    <div class="error-message">
                        ❌ <s:property value="errorMsg"/>
                    </div>
                </s:if>

                <s:if test="#request.errorMsg != null">
                    <div class="error-message">
                        ⚠️ <s:property value="#request.errorMsg"/>
                    </div>
                </s:if>

                <!-- 登录表单 -->
                <div id="email-login" class="login-form active">
                    <s:form action="doLogin" method="post" namespace="/" cssClass="form-container">
                        <div class="input-group">
                            <label for="username" class="input-label">👤 用户名</label>
                            <s:textfield id="username"
                                        name="username"
                                        cssClass="input-field"
                                        placeholder="请输入用户名"
                                        autocomplete="off"/>
                        </div>

                        <div class="input-group">
                            <label for="password" class="input-label">🔐 密码</label>
                            <s:password id="password"
                                       name="password"
                                       cssClass="input-field"
                                       placeholder="请输入密码"/>
                        </div>

                        <button type="submit" class="submit-btn">
                            登 录 →
                        </button>
                    </s:form>
                </div>

                <!-- 测试账号提示 -->
                <div class="hint">
                    <strong>📝 测试账号：</strong><br/>
                    用户名：admin &nbsp;|&nbsp; 密码：admin123
                </div>
            </main>

            <!-- 页脚信息 -->
            <footer class="login-footer">
                <p class="footer-text">Resume Printer © 2026 | Struts2 权限控制系统</p>
            </footer>
        </div>
    </div>
</body>
</html>
