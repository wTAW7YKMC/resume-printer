package com.resume.exception;

/**
 * 数据加载异常
 * 当从数据库或文件系统加载数据失败时抛出
 */
public class DataLoadException extends RuntimeException {

    private String dataSource;
    private String dataType;

    public DataLoadException() {
        super("数据加载失败");
    }

    public DataLoadException(String message) {
        super(message);
    }

    public DataLoadException(String message, String dataSource) {
        super(message);
        this.dataSource = dataSource;
    }

    public DataLoadException(String message, Throwable cause) {
        super(message, cause);
    }

    public DataLoadException(String dataSource, String dataType, Throwable cause) {
        super(String.format("加载%s的%s数据失败", dataSource, dataType), cause);
        this.dataSource = dataSource;
        this.dataType = dataType;
    }

    public String getDataSource() {
        return dataSource;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }
}