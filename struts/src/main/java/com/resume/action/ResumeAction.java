package com.resume.action;

import com.opensymphony.xwork2.ActionSupport;
import com.resume.exception.DataLoadException;
import com.resume.exception.PDFExportException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * 简历相关操作Action
 * 演示局部异常映射的使用
 */
public class ResumeAction extends ActionSupport {

    private static final Logger logger = LogManager.getLogger(ResumeAction.class);

    private String resumeId;
    private String fileName;
    private java.io.InputStream fileStream;

    /**
     * 查看简历
     */
    public String view() {
        try {
            logger.info("查看简历 - ID: {}", resumeId);

            // 模拟数据加载（实际项目中从数据库查询）
            if ("error".equals(resumeId)) {
                throw new DataLoadException("数据库", "简历信息",
                        new RuntimeException("模拟的数据库连接失败"));
            }

            // 正常流程：加载数据到ValueStack
            addActionMessage("简历数据加载成功");

            return SUCCESS;

        } catch (DataLoadException e) {
            logger.error("加载简历数据失败", e);
            throw e;  // 抛出异常，由struts.xml中的局部异常映射捕获
        }
    }

    /**
     * 导出PDF
     */
    public String exportPDF() {
        try {
            logger.info("导出PDF简历");

            // 模拟PDF生成过程
            if ("fail".equals(resumeId)) {
                throw new PDFExportException("完整简历",
                        "PDF库初始化失败");
            }

            // 设置文件下载流
            this.fileName = "resume_" + System.currentTimeMillis() + ".pdf";
            this.fileStream = getClass().getResourceAsStream("/template/resume.pdf");

            if (this.fileStream == null) {
                throw new PDFExportException("模板文件未找到");
            }

            addActionMessage("PDF导出成功");
            return SUCCESS;

        } catch (PDFExportException e) {
            logger.error("PDF导出失败", e);
            throw e;  // 由局部异常映射捕获
        }
    }

    // Getter和Setter方法
    public String getResumeId() {
        return resumeId;
    }

    public void setResumeId(String resumeId) {
        this.resumeId = resumeId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public java.io.InputStream getFileStream() {
        return fileStream;
    }

    public void setFileStream(java.io.InputStream fileStream) {
        this.fileStream = fileStream;
    }
}