package com.resume.exception;

/**
 * 页面未找到异常
 * 当请求的资源不存在时抛出此异常
 */
public class PageNotFoundException extends RuntimeException {

    private String requestPath;
    private String errorMessage;

    public PageNotFoundException() {
        super("页面未找到");
    }

    public PageNotFoundException(String message) {
        super(message);
        this.errorMessage = message;
    }

    public PageNotFoundException(String message, String requestPath) {
        super(message);
        this.requestPath = requestPath;
        this.errorMessage = message;
    }

    public PageNotFoundException(String message, Throwable cause) {
        super(message, cause);
        this.errorMessage = message;
    }

    public String getRequestPath() {
        return requestPath;
    }

    public void setRequestPath(String requestPath) {
        this.requestPath = requestPath;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public String toString() {
        return String.format("PageNotFoundException{requestPath='%s', message='%s'}",
                requestPath, getMessage());
    }
}