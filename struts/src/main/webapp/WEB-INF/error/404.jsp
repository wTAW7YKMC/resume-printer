<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - 页面未找到 | Becky's Resume</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/error-style.css">
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap"></noscript>
</head>
<body>
    <div class="container">
        <!-- 打字机机身装饰 -->
        <div class="typewriter-body">
            <div class="typewriter-roller"></div>
        </div>

        <!-- 纸张区域 -->
        <div class="paper-container">
            <main class="error-content">
                <!-- 从Action获取错误代码 -->
                <h1 class="error-code"><s:property value="errorCode" default="404"/></h1>
                <div class="error-divider"></div>
                
                <!-- 错误标题 -->
                <p class="error-title"><s:property value="errorMessage" default="页面未找到"/></p>
                
                <!-- 错误描述 -->
                <p class="error-description">
                    哎呀！看起来这个页面卡在了打字机的纸带中...<br>
                    <s:property value="errorDetail" default="您访问的页面可能已被移除、名称更改或暂时不可用。"/>
                </p>

                <!-- 异常详细信息（开发模式） -->
                <s:if test="#attr.exception != null && struts.devMode == true">
                    <div class="exception-detail-box">
                        <h4>🔍 技术详情（仅开发模式可见）</h4>
                        <table class="exception-table">
                            <tr>
                                <td><strong>异常类型：</strong></td>
                                <td><s:property value="#attr.exceptionType" default="Unknown"/></td>
                            </tr>
                            <tr>
                                <td><strong>请求路径：</strong></td>
                                <td><code><s:property value="requestUri" default="unknown"/></code></td>
                            </tr>
                            <tr>
                                <td><strong>发生时间：</strong></td>
                                <td><s:property value="timestamp" default="unknown"/></td>
                            </tr>
                        </table>
                        
                        <details class="stack-trace-details">
                            <summary>查看完整堆栈跟踪 ▼</summary>
                            <pre class="stack-trace"><s:property value="stackTrace"/></pre>
                        </details>
                    </div>
                </s:if>

                <!-- 返回主页按钮 -->
                <div class="action-area">
                    <a href="${pageContext.request.contextPath}/index.jsp" class="home-button">⌨️ 返回主页</a>
                </div>

                <!-- 快速导航 -->
                <nav class="quick-links">
                    <p class="links-label">或者您可以尝试：</p>
                    <div class="links-container">
                        <a href="${pageContext.request.contextPath}/resume/viewResume.action" class="nav-link">关于我</a>
                        <span class="separator">|</span>
                        <a href="${pageContext.request.contextPath}/projects.html" class="nav-link">项目展示</a>
                        <span class="separator">|</span>
                        <a href="mailto:your-email@example.com" class="nav-link">联系方式</a>
                    </div>
                </nav>

                <span class="cursor">|</span>
            </main>
        </div>
        
        <footer class="error-footer">
            <p>💡 提示：如果您认为这是一个错误，请<a href="mailto:your-email@example.com" class="footer-link">联系我们</a></p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">⌨️ 试试按键盘或点击错误代码，有惊喜哦~</p>
        </footer>
    </div>

    <!-- 互动功能脚本 -->
    <script src="${pageContext.request.contextPath}/js/error-interactions.js?v=20250515"></script>
</body>
</html>