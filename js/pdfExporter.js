/**
 * PDF导出模块
 * 负责将简历内容导出为PDF文件
 */
class PdfExporter {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.filename - PDF文件名
     * @param {string} options.title - PDF标题
     * @param {Object} options.options - jsPDF配置选项
     */
    constructor(options = {}) {
        this.filename = options.filename || 'resume.pdf';
        this.title = options.title || '个人简历';
        this.options = {
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            ...options.options
        };
        
        // PDF库是否可用
        this.pdfLibAvailable = this.checkPdfLibrary();
    }
    
    /**
     * 检查PDF库是否可用
     * @returns {boolean} PDF库是否可用
     */
    checkPdfLibrary() {
        return typeof window.jspdf !== 'undefined' || 
               typeof window.jsPDF !== 'undefined' || 
               typeof window.html2canvas !== 'undefined';
    }
    
    /**
     * 导出当前内容为PDF
     * @param {HTMLElement} element - 要导出的元素
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     */
    async exportCurrentContent(element, onSuccess, onError) {
        if (!element) {
            if (onError) onError(new Error('没有找到要导出的内容'));
            return;
        }
        
        if (!this.pdfLibAvailable) {
            this.downloadAsText(element, onSuccess, onError);
            return;
        }
        
        try {
            // 显示加载状态
            this.showLoadingState();
            
            // 创建PDF文档
            const pdf = await this.createPdfFromElement(element);
            
            // 下载PDF
            this.downloadPdf(pdf);
            
            // 隐藏加载状态
            this.hideLoadingState();
            
            // 调用成功回调
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('PDF导出失败:', error);
            
            // 隐藏加载状态
            this.hideLoadingState();
            
            // 尝试降级方案：导出为文本
            this.downloadAsText(element, onSuccess, onError);
        }
    }
    
    /**
     * 导出全部内容为PDF
     * @param {Object} data - 简历数据
     * @param {ContentRenderer} contentRenderer - 内容渲染器
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     */
    async exportFullResume(data, contentRenderer, onSuccess, onError) {
        if (!data || !contentRenderer) {
            if (onError) onError(new Error('缺少必要的参数'));
            return;
        }
        
        if (!this.pdfLibAvailable) {
            this.downloadFullResumeAsText(data, contentRenderer, onSuccess, onError);
            return;
        }
        
        try {
            // 显示加载状态
            this.showLoadingState();
            
            // 创建临时容器
            const tempContainer = this.createTempContainer();
            
            // 渲染所有内容
            const sections = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];
            sections.forEach(section => {
                const sectionContent = contentRenderer.render(section, data);
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'resume-section';
                sectionDiv.innerHTML = `<h3>${this.getSectionTitle(section)}</h3><pre>${sectionContent}</pre>`;
                tempContainer.appendChild(sectionDiv);
            });
            
            // 创建PDF
            const pdf = await this.createPdfFromElement(tempContainer);
            
            // 清理临时容器
            document.body.removeChild(tempContainer);
            
            // 下载PDF
            this.downloadPdf(pdf);
            
            // 隐藏加载状态
            this.hideLoadingState();
            
            // 调用成功回调
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('完整PDF导出失败:', error);
            
            // 隐藏加载状态
            this.hideLoadingState();
            
            // 尝试降级方案：导出为文本
            this.downloadFullResumeAsText(data, contentRenderer, onSuccess, onError);
        }
    }
    
    /**
     * 从元素创建PDF
     * @param {HTMLElement} element - 要转换的元素
     * @returns {Promise<Object>} Promise对象，包含jsPDF实例
     */
    async createPdfFromElement(element) {
        // 使用html2canvas将元素转换为图像
        const canvas = await html2canvas(element, {
            scale: 2, // 提高清晰度
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f5f1e6' // 与背景色一致
        });
        
        // 创建PDF文档
        const pdf = new jsPDF(this.options);
        
        // 获取图像数据
        const imgData = canvas.toDataURL('image/png');
        
        // 计算图像尺寸以适应PDF页面
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // 添加图像到PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        return pdf;
    }
    
    /**
     * 下载PDF文件
     * @param {Object} pdf - jsPDF实例
     */
    downloadPdf(pdf) {
        // 生成当前日期
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
        
        // 生成文件名
        const filename = this.filename.replace('.pdf', '') + `_${dateStr}.pdf`;
        
        // 下载文件
        pdf.save(filename);
    }
    
    /**
     * 下载内容为文本文件（降级方案）
     * @param {HTMLElement} element - 要导出的元素
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     */
    downloadAsText(element, onSuccess, onError) {
        try {
            // 获取文本内容
            const textContent = element.textContent || element.innerText;
            
            // 生成当前日期
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
            
            // 生成文件名
            const filename = this.filename.replace('.pdf', '') + `_${dateStr}.txt`;
            
            // 创建Blob对象
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            
            // 添加到DOM并点击
            document.body.appendChild(link);
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 100);
            
            // 调用成功回调
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('文本导出失败:', error);
            if (onError) onError(error);
        }
    }
    
    /**
     * 下载完整简历为文本文件（降级方案）
     * @param {Object} data - 简历数据
     * @param {ContentRenderer} contentRenderer - 内容渲染器
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     */
    downloadFullResumeAsText(data, contentRenderer, onSuccess, onError) {
        try {
            // 生成当前日期
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
            
            // 生成文件名
            const filename = this.filename.replace('.pdf', '') + `_full_${dateStr}.txt`;
            
            // 渲染所有内容
            const sections = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];
            let fullContent = `${this.title}\n${'='.repeat(this.title.length)}\n\n`;
            
            sections.forEach(section => {
                fullContent += `${this.getSectionTitle(section)}\n${'-'.repeat(this.getSectionTitle(section).length)}\n\n`;
                fullContent += contentRenderer.render(section, data);
                fullContent += '\n\n';
            });
            
            // 创建Blob对象
            const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            
            // 添加到DOM并点击
            document.body.appendChild(link);
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 100);
            
            // 调用成功回调
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('完整文本导出失败:', error);
            if (onError) onError(error);
        }
    }
    
    /**
     * 获取部分标题
     * @param {string} section - 部分名称
     * @returns {string} 部分标题
     */
    getSectionTitle(section) {
        const titles = {
            about: '个人简介',
            experience: '工作经历',
            education: '教育经历',
            skills: '专业技能',
            projects: '项目经历',
            contact: '联系方式'
        };
        return titles[section] || section;
    }
    
    /**
     * 创建临时容器
     * @returns {HTMLElement} 临时容器元素
     */
    createTempContainer() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '210mm'; // A4宽度
        container.style.padding = '20mm';
        container.style.backgroundColor = '#f5f1e6';
        container.style.fontFamily = 'Courier New, monospace';
        container.style.whiteSpace = 'pre-wrap';
        
        document.body.appendChild(container);
        
        return container;
    }
    
    /**
     * 显示加载状态
     */
    showLoadingState() {
        // 可以在这里显示加载指示器
        const loadingIndicator = document.getElementById('pdf-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        // 隐藏加载指示器
        const loadingIndicator = document.getElementById('pdf-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    /**
     * 设置文件名
     * @param {string} filename - 新的文件名
     */
    setFilename(filename) {
        this.filename = filename;
    }
    
    /**
     * 设置标题
     * @param {string} title - 新的标题
     */
    setTitle(title) {
        this.title = title;
    }
    
    /**
     * 检查是否支持PDF导出
     * @returns {boolean} 是否支持PDF导出
     */
    isPdfExportSupported() {
        return this.pdfLibAvailable;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PdfExporter;
} else {
    window.PdfExporter = PdfExporter;
}