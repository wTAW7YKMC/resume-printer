package com.resume.action;

import com.opensymphony.xwork2.ActionSupport;
import com.resume.exception.BusinessException;
import com.resume.exception.DataLoadException;
import com.resume.exception.PageNotFoundException;
import com.resume.exception.PDFExportException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * 测试异常触发的Action
 * 用于演示Struts2异常处理机制的工作原理
 */
public class TestExceptionAction extends ActionSupport {

    private static final Logger logger = LogManager.getLogger(TestExceptionAction.class);

    private String exceptionType;  // 要测试的异常类型

    @Override
    public String execute() throws Exception {
        logger.info("测试异常触发 - 类型: {}", exceptionType);

        switch (exceptionType == null ? "" : exceptionType.toLowerCase()) {
            case "404":
            case "pagenotfound":
                throw new PageNotFoundException("测试页面不存在", "/test/nonexistent-page");

            case "business":
            case "businessexception":
                throw BusinessException.invalidParameter("测试参数");

            case "data":
            case "dataload":
                throw new DataLoadException("数据库", "简历数据", 
                        new RuntimeException("连接超时"));

            case "pdf":
            case "pdfexport":
                throw new PDFExportException("完整简历", "内存不足");

            case "nullpointer":
            case "npe":
                String str = null;
                str.length();  // 触发NullPointerException

            case "sql":
            case "sqlexception":
                throw new java.sql.SQLException("数据库连接失败");

            case "io":
            case "ioexception":
                throw new java.io.IOException("文件读取失败");

            default:
                addActionMessage("这是一个正常的响应，没有触发任何异常");
                return SUCCESS;
        }
    }

    // Getter和Setter
    public String getExceptionType() {
        return exceptionType;
    }

    public void setExceptionType(String exceptionType) {
        this.exceptionType = exceptionType;
    }
}