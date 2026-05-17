package com.resume.exception;

/**
 * PDF导出异常
 * 当PDF生成或导出过程中出现错误时抛出
 */
public class PDFExportException extends RuntimeException {

    private String exportType;

    public PDFExportException() {
        super("PDF导出失败");
    }

    public PDFExportException(String message) {
        super(message);
    }

    public PDFExportException(String message, Throwable cause) {
        super(message, cause);
    }

    public PDFExportException(String exportType, String reason) {
        super(String.format("%s导出失败：%s", exportType, reason));
        this.exportType = exportType;
    }

    public String getExportType() {
        return exportType;
    }

    public void setExportType(String exportType) {
        this.exportType = exportType;
    }
}