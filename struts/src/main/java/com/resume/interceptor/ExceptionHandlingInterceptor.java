package com.resume.interceptor;

import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.interceptor.AbstractInterceptor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import javax.servlet.http.HttpServletRequest;
import org.apache.struts2.ServletActionContext;

/**
 * 全局异常处理拦截器
 * 统一捕获、记录和处理所有Action中抛出的异常
 */
public class ExceptionHandlingInterceptor extends AbstractInterceptor {

    private static final Logger logger = LogManager.getLogger(ExceptionHandlingInterceptor.class);

    private boolean logStackTrace;     // 是否记录完整堆栈
    private String errorPage;          // 错误页面路径
    private boolean sendEmailAlert;    // 是否发送邮件告警

    @Override
    public String intercept(ActionInvocation invocation) throws Exception {
        try {
            // 执行目标Action
            String result = invocation.invoke();
            return result;

        } catch (Exception e) {
            // 记录异常信息
            logException(e, invocation);

            // 将异常信息存储到request中
            storeExceptionToRequest(e);

            // 发送告警（如果配置了）
            if (sendEmailAlert) {
                sendAlert(e);
            }

            // 重新抛出异常，让Struts2的异常映射机制处理
            throw e;
        }
    }

    /**
     * 记录异常详细信息
     */
    private void logException(Exception e, ActionInvocation invocation) {
        HttpServletRequest request = ServletActionContext.getRequest();
        
        String actionName = invocation.getProxy().getActionName();
        String method = invocation.getProxy().getMethod();
        String uri = request != null ? request.getRequestURI() : "unknown";
        String queryString = request != null ? request.getQueryString() : "";
        String clientIP = request != null ? request.getRemoteAddr() : "unknown";
        String userAgent = request != null ? request.getHeader("User-Agent") : "unknown";

        logger.error("=== 异常拦截器捕获到错误 ===");
        logger.error("Action: {}#{}", actionName, method);
        logger.error("请求URI: {}?{}", uri, queryString);
        logger.error("客户端IP: {}", clientIP);
        logger.error("User-Agent: {}", userAgent);
        logger.error("异常类型: {}", e.getClass().getName());
        logger.error("异常消息: {}", e.getMessage());

        if (logStackTrace) {
            logger.error("堆栈跟踪:", e);
        }

        logger.error("=== 异常信息记录完毕 ===");
    }

    /**
     * 将异常信息存入request属性
     */
    private void storeExceptionToRequest(Exception e) {
        HttpServletRequest request = ServletActionContext.getRequest();
        if (request != null) {
            request.setAttribute("exception", e);
            request.setAttribute("exceptionType", e.getClass().getSimpleName());
            request.setAttribute("exceptionMessage", e.getMessage());
            request.setAttribute("exceptionTime", 
                    new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
                            .format(new java.util.Date()));
            
            // 如果是自定义业务异常，提取额外信息
            if (e instanceof com.resume.exception.BusinessException) {
                com.resume.exception.BusinessException be = 
                        (com.resume.exception.BusinessException) e;
                request.setAttribute("errorCode", be.getErrorCode());
                request.setAttribute("userMessage", be.getUserMessage());
            }
            
            if (e instanceof com.resume.exception.PageNotFoundException) {
                com.resume.exception.PageNotFoundException pne =
                        (com.resume.exception.PageNotFoundException) e;
                request.setAttribute("requestPath", pne.getRequestPath());
            }
        }
    }

    /**
     * 发送告警通知（示例实现）
     */
    private void sendAlert(Exception e) {
        // TODO: 实现邮件或短信告警
        logger.warn("[告警] 检测到严重异常: {} - {}", 
                e.getClass().getName(), e.getMessage());
    }

    // Getter和Setter方法（用于Struts2依赖注入）
    public boolean isLogStackTrace() {
        return logStackTrace;
    }

    public void setLogStackTrace(boolean logStackTrace) {
        this.logStackTrace = logStackTrace;
    }

    public String getErrorPage() {
        return errorPage;
    }

    public void setErrorPage(String errorPage) {
        this.errorPage = errorPage;
    }

    public boolean isSendEmailAlert() {
        return sendEmailAlert;
    }

    public void setSendEmailAlert(boolean sendEmailAlert) {
        this.sendEmailAlert = sendEmailAlert;
    }
}