package com.resume.action;

import com.opensymphony.xwork2.ActionSupport;
import com.opensymphony.xwork2.ModelDriven;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import javax.servlet.http.HttpServletRequest;
import org.apache.struts2.ServletActionContext;

/**
 * 错误处理Action
 * 负责处理所有异常并准备错误信息供页面显示
 */
public class ErrorAction extends ActionSupport {

    private static final Logger logger = LogManager.getLogger(ErrorAction.class);

    private int errorCode;              // HTTP状态码
    private String errorMessage;        // 错误消息
    private String errorDetail;         // 详细错误信息
    private String exceptionType;       // 异常类型
    private String stackTrace;          // 异常堆栈（仅开发模式）
    private String requestUri;          // 请求的URI
    private String timestamp;           // 错误发生时间

    /**
     * 处理404错误
     */
    public String handle404() {
        HttpServletRequest request = ServletActionContext.getRequest();
        
        this.errorCode = 404;
        this.errorMessage = "页面未找到";
        this.errorDetail = "您访问的页面可能已被移除、名称更改或暂时不可用。";
        this.exceptionType = "PageNotFoundException";
        
        if (request != null) {
            this.requestUri = request.getRequestURI();
            logger.warn("404错误: 访问不存在的页面 - {}", request.getRequestURI());
        }
        
        this.timestamp = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
                .format(new java.util.Date());
        
        return SUCCESS;
    }

    /**
     * 处理500错误
     */
    public String handleError() {
        HttpServletRequest request = ServletActionContext.getRequest();
        
        Object exception = request.getAttribute("javax.servlet.error.exception");
        
        this.errorCode = 500;
        this.errorMessage = "服务器内部错误";
        this.errorDetail = "服务器遇到了意外情况，无法完成您的请求。";
        
        if (exception instanceof Throwable) {
            Throwable ex = (Throwable) exception;
            this.exceptionType = ex.getClass().getSimpleName();
            
            // 记录详细日志
            logger.error("500错误: {} - {}", ex.getClass().getName(), ex.getMessage(), ex);
            
            // 开发模式下显示堆栈信息
            if (isDevMode()) {
                this.stackTrace = getStackTraceAsString(ex);
            }
            
            // 根据异常类型定制错误消息
            customizeErrorMessage(ex);
        } else {
            logger.error("500错误: 未知异常");
            this.exceptionType = "UnknownException";
        }
        
        if (request != null) {
            this.requestUri = (String) request.getAttribute("javax.servlet.error.request_uri");
        }
        
        this.timestamp = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
                .format(new java.util.Date());
        
        return SUCCESS;
    }

    /**
     * 根据异常类型定制错误消息
     */
    private void customizeErrorMessage(Throwable ex) {
        if (ex instanceof com.resume.exception.BusinessException) {
            com.resume.exception.BusinessException bex = 
                    (com.resume.exception.BusinessException) ex;
            this.errorMessage = bex.getUserMessage();
            this.errorDetail = "业务逻辑处理出错，请联系管理员。";
        } else if (ex instanceof com.resume.exception.DataLoadException) {
            this.errorMessage = "数据加载失败";
            this.errorDetail = "无法从数据源获取所需信息，请稍后重试。";
        } else if (ex instanceof com.resume.exception.PDFExportException) {
            this.errorMessage = "PDF导出失败";
            this.errorDetail = "文档生成过程中出现错误，请检查数据格式后重试。";
        } else if (ex instanceof java.sql.SQLException) {
            this.errorMessage = "数据库访问失败";
            this.errorDetail = "数据库连接或查询出现问题，管理员已收到通知。";
        } else if (ex instanceof NullPointerException) {
            this.errorMessage = "系统内部错误";
            this.errorDetail = "空指针异常，开发团队正在修复此问题。";
        }
    }

    /**
     * 判断是否为开发模式
     */
    private boolean isDevMode() {
        String devMode = ServletActionContext.getServletContext()
                .getInitParameter("struts.devMode");
        return "true".equalsIgnoreCase(devMode);
    }

    /**
     * 将异常堆栈转换为字符串
     */
    private String getStackTraceAsString(Throwable ex) {
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        ex.printStackTrace(pw);
        return sw.toString();
    }

    // Getter和Setter方法
    public int getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(int errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorDetail() {
        return errorDetail;
    }

    public void setErrorDetail(String errorDetail) {
        this.errorDetail = errorDetail;
    }

    public String getExceptionType() {
        return exceptionType;
    }

    public void setExceptionType(String exceptionType) {
        this.exceptionType = exceptionType;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
    }

    public String getRequestUri() {
        return requestUri;
    }

    public void setRequestUri(String requestUri) {
        this.requestUri = requestUri;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}