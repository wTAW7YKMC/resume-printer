<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>错误 - 系统提示 | Becky's Resume</title>
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
                <h1 class="error-code">⚠</h1>
                <div class="error-divider"></div>
                
                <p class="error-title">
                    <s:if test="errorMessage != null">
                        <s:property value="errorMessage"/>
                    </s:if>
                    <s:else>
                        操作失败
                    </s:else>
                </p>
                
                <p class="error-description">
                    <s:if test="errorDetail != null">
                        <s:property value="errorDetail"/>
                    </s:if>
                    <s:else>
                        在处理您的请求时发生了错误，请检查输入后重试。
                    </s:else>
                    
                    <s:if test="hasActionErrors()">
                        <div class="action-errors">
                            <s:actionerror/>
                        </div>
                    </s:if>
                    
                    <s:if test="hasFieldErrors()">
                        <div class="field-errors">
                            <s:fielderror/>
                        </div>
                    </s:if>
                </p>

                <!-- 异常详细信息（开发模式） -->
                <s:if test="#attr.exception != null && struts.devMode == true">
                    <div class="exception-detail-box">
                        <h4>🔍 业务异常详情（仅开发模式可见）</h4>
                        
                        <div class="alert alert-warning">
                            <strong>⚠️ 异常类型：</strong>
                            <code><s:property value="#attr.exceptionType" default="BusinessException"/></code>
                            <br><strong>错误码：</strong>
                            <code><s:property value="#attr.errorCode" default="N/A"/></code>
                            <br><strong>用户消息：</strong>
                            <code><s:property value="#attr.userMessage" default="操作失败"/></code>
                        </div>

                        <table class="exception-table">
                            <tr>
                                <td><strong>请求URI：</strong></td>
                                <td><code><s:property value="requestUri" default="unknown"/></code></td>
                            </tr>
                            <tr>
                                <td><strong>发生时间：</strong></td>
                                <td><s:property value="timestamp" default="unknown"/></td>
                            </tr>
                        </table>

                        <s:if test="stackTrace != null">
                            <details class="stack-trace-details">
                                <summary>查看完整堆栈跟踪 ▼</summary>
                                <pre class="stack-trace"><s:property value="stackTrace"/></pre>
                            </details>
                        </s:if>
                    </div>
                </s:if>

                <div class="action-area">
                    <a href="javascript:history.back()" class="home-button">← 返回上一页</a>
                </div>

                <div class="action-area secondary-action">
                    <a href="${pageContext.request.contextPath}/index.jsp" class="home-button">🏠 返回首页</a>
                </div>

                <nav class="quick-links">
                    <p class="links-label">需要帮助？</p>
                    <div class="links-container">
                        <a href="${pageContext.request.contextPath}/resume/viewResume.action" class="nav-link">查看简历</a>
                        <span class="separator">|</span>
                        <a href="mailto:support@example.com" class="nav-link">技术支持</a>
                    </div>
                </nav>

                <span class="cursor">|</span>
            </main>
        </div>
        
        <footer class="error-footer">
            <p>💡 如果问题持续出现，请联系技术支持团队</p>
        </footer>
    </div>

    <script src="${pageContext.request.contextPath}/js/error-interactions.js?v=20250515"></script>
</body>
</html>