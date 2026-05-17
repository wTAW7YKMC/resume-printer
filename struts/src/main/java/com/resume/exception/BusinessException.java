package com.resume.exception;

/**
 * 业务逻辑异常
 * 用于处理业务规则违反等异常情况
 */
public class BusinessException extends RuntimeException {

    private String errorCode;
    private String userMessage;  // 用户友好的错误信息
    private Object[] args;       // 消息参数

    public BusinessException() {
        super("业务逻辑错误");
    }

    public BusinessException(String message) {
        super(message);
        this.userMessage = message;
    }

    public BusinessException(String errorCode, String userMessage) {
        super(userMessage);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.userMessage = message;
    }

    public BusinessException(String errorCode, String userMessage, Throwable cause) {
        super(userMessage, cause);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public Object[] getArgs() {
        return args;
    }

    public void setArgs(Object[] args) {
        this.args = args;
    }

    /**
     * 创建常用的业务异常实例
     */
    public static BusinessException dataNotFound(String entityName) {
        return new BusinessException("DATA_NOT_FOUND",
                String.format("%s数据不存在", entityName));
    }

    public static BusinessException invalidParameter(String paramName) {
        return new BusinessException("INVALID_PARAMETER",
                String.format("参数%s无效", paramName));
    }

    public static BusinessException operationFailed(String operation) {
        return new BusinessException("OPERATION_FAILED",
                String.format("%s操作失败，请稍后重试", operation));
    }

    public static BusinessException unauthorizedAccess() {
        return new BusinessException("UNAUTHORIZED",
                "您没有权限执行此操作");
    }

    @Override
    public String toString() {
        return String.format("BusinessException{errorCode='%s', message='%s'}",
                errorCode, getUserMessage());
    }
}