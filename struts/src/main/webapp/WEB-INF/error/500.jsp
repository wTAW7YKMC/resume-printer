<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<%@ page isErrorPage="true" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - 服务器错误 | Becky's Resume</title>
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
                <!-- 从Action或异常对象获取错误代码 -->
                <h1 class="error-code">
                    <s:if test="errorCode != null">
                        <s:property value="errorCode"/>
                    </s:if>
                    <s:else>
                        500
                    </s:else>
                </h1>
                <div class="error-divider"></div>
                
                <!-- 错误标题 -->
                <p class="error-title">
                    <s:if test="errorMessage != null">
                        <s:property value="errorMessage"/>
                    </s:if>
                    <s:else>
                        服务器内部错误
                    </s:else>
                </p>
                
                <!-- 错误描述 -->
                <p class="error-description">
                  噢不！打字机的墨带似乎出了点问题...<br>
                  <s:if test="errorDetail != null">
                      <s:property value="errorDetail"/>
                  </s:if>
                  <s:else>
                      服务器遇到了意外情况，无法完成您的请求。<br>
                      请稍后再试，或返回主页继续浏览。
                  </s:else>
                </p>

                <!-- 异常详细信息（开发模式） -->
                <s:if test="#attr.exception != null || exception != null">
                    <div class="exception-detail-box">
                        <h4>🔧 技术诊断信息<s:if test="struts.devMode == true">（开发模式）</s:if></h4>
                        
                        <div class="alert alert-warning">
                            <strong>⚠️ 异常类型：</strong>
                            <s:if test="#attr.exceptionType != null">
                                <code><s:property value="#attr.exceptionType"/></code>
                            </s:if>
                            <s:elseif test="exception != null">
                                <code><%= exception.getClass().getSimpleName() %></code>
                            </s:elseif>
                            <s:else>
                                <code>UnknownException</code>
                            </s:else>
                        </div>

                        <table class="exception-table">
                            <tr>
                                <td><strong>请求URI：</strong></td>
                                <td><code><s:property value="requestUri" 
                                    default="<%= (request.getAttribute(\"javax.servlet.error.request_uri\") != null) ? request.getAttribute(\"javax.servlet.error.request_uri\") : \"unknown\" %>"/></code></td>
                            </tr>
                            <tr>
                                <td><strong>发生时间：</strong></td>
                                <td><s:property value="timestamp" 
                                    default="<%= new java.text.SimpleDateFormat(\"yyyy-MM-dd HH:mm:ss\").format(new java.util.Date()) %>"/></td>
                            </tr>
                            <tr>
                                <td><strong>错误消息：</strong></td>
                                <td><s:if test="#attr.userMessage != null">
                                        <s:property value="#attr.userMessage"/>
                                    </s:if>
                                    <s:elseif test="exception != null">
                                        <%= exception.getMessage() %>
                                    </s:elseif>
                                    <s:else>
                                        未知错误
                                    </s:else>
                                </td>
                            </tr>
                        </table>

                        <!-- 开发模式下显示堆栈 -->
                        <s:if test="struts.devMode == true && stackTrace != null">
                            <details class="stack-trace-details">
                                <summary>📋 查看完整堆栈跟踪（仅开发环境）▼</summary>
                                <pre class="stack-trace"><s:property value="stackTrace"/></pre>
                            </details>
                        </s:if>
                        <s:elseif test="struts.devMode == true && exception != null">
                            <details class="stack-trace-details">
                                <summary>📋 查看完整堆栈跟踪（仅开发环境）▼</summary>
                                <pre class="stack-trace"><%
                                    java.io.StringWriter sw = new java.io.StringWriter();
                                    java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                                    exception.printStackTrace(pw);
                                    out.println(sw.toString().replace("<", "&lt;").replace(">", "&gt;"));
                                %></pre>
                            </details>
                        </s:elseif>
                    </div>
                </s:if>

                <!-- 操作按钮 -->
                <div class="action-area">
                    <a href="${pageContext.request.contextPath}/index.jsp" class="home-button">⌨️ 返回主页</a>
                </div>

                <div class="action-area secondary-action">
                    <button onclick="location.reload()" class="refresh-button">🔄 刷新页面</button>
                </div>

                <!-- 快速导航 -->
                <nav class="quick-links">
                    <p class="links-label">您也可以访问：</p>
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
            <p>⚠️ 如果问题持续存在，请<a href="mailto:your-email@example.com" class="footer-link">联系管理员</a></p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
                错误ID: <%= java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase() %>
            </p>
        </footer>
    </div>

    <!-- 互动功能脚本 -->
    <script src="${pageContext.request.contextPath}/js/error-interactions.js?v=20250515"></script>
</body>
</html>