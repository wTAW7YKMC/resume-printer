/**
 * 增强导出模块
 * 支持多种格式的简历导出，包括PDF、HTML和文本
 */
class EnhancedExporter {
    constructor(options = {}) {
        this.filename = options.filename || 'resume';
        this.title = options.title || '个人简历';
        
        // 检查可用的导出库
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
     * 导出当前内容为指定格式
     * @param {HTMLElement} element - 要导出的元素
     * @param {string} format - 导出格式 (pdf, html, txt)
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     */
    async exportCurrentContent(element, format = 'pdf', onSuccess, onError) {
        if (!element) {
            if (onError) onError(new Error('没有找到要导出的内容'));
            return;
        }
        
        try {
            // 显示加载状态
            this.showLoadingState(`正在准备导出${this.getFormatName(format)}...`, 10);
            
            switch (format.toLowerCase()) {
                case 'pdf':
                    await this.exportAsPdf(element);
                    break;
                case 'html':
                    this.exportAsHtml(element);
                    break;
                case 'txt':
                    this.exportAsText(element);
                    break;
                default:
                    throw new Error(`不支持的导出格式: ${format}`);
            }
            
            // 调用成功回调
            if (onSuccess) onSuccess();
        } catch (error) {
            // 隐藏加载状态
            this.hideLoadingState();
            console.error('导出当前内容时出错:', error);
            if (onError) onError(error);
        }
    }
    
    /**
     * 导出完整简历为指定格式
     * @param {Object} data - 简历数据
     * @param {ContentRenderer} contentRenderer - 内容渲染器
     * @param {string} format - 导出格式 (pdf, html, txt)
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     */
    async exportFullResume(data, contentRenderer, format = 'pdf', onSuccess, onError) {
        if (!data || !contentRenderer) {
            if (onError) onError(new Error('缺少必要的参数'));
            return;
        }
        
        try {
            // 显示加载状态
            this.showLoadingState(`正在准备导出完整${this.getFormatName(format)}...`, 10);
            
            // 创建临时容器
            this.updateLoadingProgress(20, '正在创建内容容器...');
            const tempContainer = this.createTempContainer();
            
            // 渲染所有内容
            this.updateLoadingProgress(40, '正在渲染所有内容...');
            const sections = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];
            sections.forEach(section => {
                const sectionContent = contentRenderer.render(section, data);
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'resume-section';
                sectionDiv.innerHTML = `<h3>${this.getSectionTitle(section)}</h3><pre>${sectionContent}</pre>`;
                tempContainer.appendChild(sectionDiv);
            });
            
            this.updateLoadingProgress(60, `正在生成${this.getFormatName(format)}文件...`);
            switch (format.toLowerCase()) {
                case 'pdf':
                    await this.exportAsPdf(tempContainer);
                    break;
                case 'html':
                    this.exportFullResumeAsHtml(data, contentRenderer);
                    break;
                case 'txt':
                    this.exportFullResumeAsText(data, contentRenderer);
                    break;
                default:
                    throw new Error(`不支持的导出格式: ${format}`);
            }
            
            // 清理临时容器
            document.body.removeChild(tempContainer);
            
            // 调用成功回调
            if (onSuccess) onSuccess();
        } catch (error) {
            // 隐藏加载状态
            this.hideLoadingState();
            console.error('导出完整简历时出错:', error);
            if (onError) onError(error);
        }
    }
    
    /**
     * 导出为PDF
     * @param {HTMLElement} element - 要导出的元素
     */
    async exportAsPdf(element) {
        if (!this.pdfLibAvailable) {
            throw new Error('PDF导出功能暂时不可用，请稍后再试或尝试其他格式');
        }
        
        try {
            this.showLoadingState('正在准备导出PDF...', 10);
            
            // 创建临时容器以应用复古打字机样式
            this.updateLoadingProgress(20, '正在准备导出内容...');
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = element.offsetWidth + 'px';
            tempContainer.style.fontFamily = "'Courier New', 'Courier Prime', monospace";
            tempContainer.style.backgroundColor = '#ffffff';
            tempContainer.style.color = '#333333';
            tempContainer.style.padding = '30px';
            tempContainer.style.lineHeight = '1.8';
            tempContainer.style.fontSize = '16px';
            tempContainer.innerHTML = element.innerHTML;
            
            document.body.appendChild(tempContainer);
            
            // 使用html2canvas将元素转换为图片
            this.updateLoadingProgress(30, '正在生成内容快照...');
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight
            });
            
            // 移除临时容器
            document.body.removeChild(tempContainer);
            
            this.updateLoadingProgress(60, '正在创建PDF文档...');
            // 创建PDF文档
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // 计算图片在PDF中的尺寸
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4宽度(mm)
            const pageHeight = 297; // A4高度(mm)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            this.updateLoadingProgress(80, '正在添加内容到PDF...');
            // 添加图片到PDF
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // 如果内容超过一页，添加新页面
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            this.updateLoadingProgress(95, '正在保存PDF文件...');
            // 下载PDF
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
            pdf.save(`${this.filename}_${dateStr}.pdf`);
            
            this.updateLoadingProgress(100, 'PDF导出完成！');
            setTimeout(() => this.hideLoadingState(), 1000);
        } catch (error) {
            console.error('PDF导出过程中出错:', error);
            this.hideLoadingState();
            throw new Error('PDF导出失败，请检查内容是否完整或尝试其他格式');
        }
    }
    
    /**
     * 导出为HTML
     * @param {HTMLElement} element - 要导出的元素
     */
    exportAsHtml(element) {
        try {
            this.showLoadingState('正在准备导出HTML...', 20);
            
            // 创建HTML内容
            this.updateLoadingProgress(40, '正在读取内容...');
            const htmlContent = this.createHtmlDocument(element.innerHTML);
            
            // 生成当前日期
            this.updateLoadingProgress(60, '正在创建HTML文档...');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
            
            // 创建Blob对象
            this.updateLoadingProgress(80, '正在创建HTML文件...');
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${this.filename}_${dateStr}.html`;
            link.style.display = 'none';
            
            this.updateLoadingProgress(95, '正在保存HTML文件...');
            // 添加到DOM并点击
            document.body.appendChild(link);
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 100);
            
            this.updateLoadingProgress(100, 'HTML导出完成！');
            setTimeout(() => this.hideLoadingState(), 1000);
        } catch (error) {
            console.error('HTML导出过程中出错:', error);
            this.hideLoadingState();
            throw new Error('HTML导出失败，请检查内容是否完整或尝试其他格式');
        }
    }
    
    /**
     * 导出完整简历为HTML
     * @param {Object} data - 简历数据
     * @param {ContentRenderer} contentRenderer - 内容渲染器
     */
    exportFullResumeAsHtml(data, contentRenderer) {
        try {
            // 渲染所有内容
            this.updateLoadingProgress(70, '正在读取所有内容...');
            const sections = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];
            let fullContent = `<h1>${this.title}</h1>`;
            
            sections.forEach(section => {
                const sectionContent = contentRenderer.render(section, data);
                fullContent += `<h2>${this.getSectionTitle(section)}</h2>`;
                fullContent += `<pre>${sectionContent}</pre>`;
            });
            
            // 创建HTML文档
            this.updateLoadingProgress(80, '正在创建HTML文档...');
            const htmlContent = this.createHtmlDocument(fullContent);
            
            // 生成当前日期
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
            
            // 创建Blob对象
            this.updateLoadingProgress(90, '正在创建HTML文件...');
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${this.filename}_full_${dateStr}.html`;
            link.style.display = 'none';
            
            // 添加到DOM并点击
            this.updateLoadingProgress(95, '正在保存HTML文件...');
            document.body.appendChild(link);
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 100);
            
            this.updateLoadingProgress(100, '完整HTML导出完成！');
            setTimeout(() => this.hideLoadingState(), 1000);
        } catch (error) {
            console.error('完整HTML导出过程中出错:', error);
            this.hideLoadingState();
            throw new Error('完整HTML导出失败，请检查内容是否完整');
        }
    }
    
    /**
     * 导出为文本
     * @param {HTMLElement} element - 要导出的元素
     */
    exportAsText(element) {
        try {
            this.showLoadingState('正在准备导出文本文件...', 20);
            
            // 获取文本内容
            this.updateLoadingProgress(40, '正在读取内容...');
            const textContent = element.textContent || element.innerText;
            
            // 生成当前日期
            this.updateLoadingProgress(60, '正在生成文件名...');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
            const filename = `${this.filename}_${dateStr}.txt`;
            
            // 创建Blob对象
            this.updateLoadingProgress(80, '正在创建文本文件...');
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            
            // 创建下载链接
            this.updateLoadingProgress(90, '正在保存文本文件...');
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
            
            this.updateLoadingProgress(100, '文本文件导出完成！');
            setTimeout(() => this.hideLoadingState(), 1000);
        } catch (error) {
            console.error('文本导出过程中出错:', error);
            this.hideLoadingState();
            throw new Error('文本导出失败，请检查内容是否完整或尝试其他格式');
        }
    }
    
    /**
     * 导出完整简历为文本
     * @param {Object} data - 简历数据
     * @param {ContentRenderer} contentRenderer - 内容渲染器
     */
    exportFullResumeAsText(data, contentRenderer) {
        try {
            // 生成当前日期
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
            
            // 生成文件名
            const filename = `${this.filename}_full_${dateStr}.txt`;
            
            // 渲染所有内容
            this.updateLoadingProgress(70, '正在读取所有内容...');
            const sections = ['about', 'experience', 'education', 'skills', 'projects', 'contact'];
            let fullContent = `${this.title}\n${'='.repeat(this.title.length)}\n\n`;
            
            sections.forEach(section => {
                fullContent += `${this.getSectionTitle(section)}\n${'-'.repeat(this.getSectionTitle(section).length)}\n\n`;
                fullContent += contentRenderer.render(section, data);
                fullContent += '\n\n';
            });
            
            // 创建Blob对象
            this.updateLoadingProgress(90, '正在创建文本文件...');
            const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            
            // 添加到DOM并点击
            this.updateLoadingProgress(95, '正在保存文本文件...');
            document.body.appendChild(link);
            link.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 100);
            
            this.updateLoadingProgress(100, '完整文本导出完成！');
            setTimeout(() => this.hideLoadingState(), 1000);
        } catch (error) {
            console.error('完整文本导出过程中出错:', error);
            this.hideLoadingState();
            throw new Error('完整文本导出失败，请检查内容是否完整');
        }
    }
    
    /**
     * 创建HTML文档
     * @param {string} content - 内容
     * @returns {string} HTML文档
     */
    createHtmlDocument(content) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.title}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        h1, h2, h3 {
            color: #333;
            margin-bottom: 10px;
        }
        h1 {
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        h2 {
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #333;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    ${content}
    <div class="footer">
        <p>生成时间: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
    }
    
    /**
     * 创建临时容器
     * @returns {HTMLElement} 临时容器元素
     */
    createTempContainer() {
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '800px';
        tempContainer.style.padding = '20px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.fontFamily = "'Courier New', monospace";
        tempContainer.style.fontSize = '14px';
        tempContainer.style.lineHeight = '1.6';
        tempContainer.style.color = '#333';
        
        document.body.appendChild(tempContainer);
        return tempContainer;
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
     * 获取格式名称
     * @param {string} format - 格式代码
     * @returns {string} 格式名称
     */
    getFormatName(format) {
        const names = {
            pdf: 'PDF文档',
            html: 'HTML网页',
            txt: '文本文件'
        };
        return names[format.toLowerCase()] || format;
    }
    
    /**
     * 显示加载状态
     * @param {string} message - 加载消息
     * @param {number} progress - 进度百分比 (0-100)
     */
    showLoadingState(message = '正在导出，请稍候...', progress = null) {
        let indicator = document.getElementById('enhanced-loading-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'enhanced-loading-indicator';
            indicator.className = 'loading-indicator';
            indicator.style.position = 'fixed';
            indicator.style.top = '0';
            indicator.style.left = '0';
            indicator.style.width = '100%';
            indicator.style.height = '100%';
            indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            indicator.style.color = '#fff';
            indicator.style.display = 'flex';
            indicator.style.justifyContent = 'center';
            indicator.style.alignItems = 'center';
            indicator.style.zIndex = '9999';
            indicator.style.fontSize = '18px';
            indicator.style.textAlign = 'center';
            indicator.style.fontFamily = "'Courier New', monospace";
            
            document.body.appendChild(indicator);
        }
        
        // 构建进度条HTML（如果有进度）
        const progressBarHtml = progress !== null ? `
            <div style="width: 300px; height: 20px; background-color: rgba(255, 255, 255, 0.3); border-radius: 10px; margin: 15px auto; overflow: hidden;">
                <div style="width: ${progress}%; height: 100%; background-color: #4CAF50; border-radius: 10px; transition: width 0.3s ease;"></div>
            </div>
            <div style="font-size: 14px;">${progress}%</div>
        ` : '';
        
        indicator.innerHTML = `
            <div style="text-align: center; max-width: 400px;">
                <div style="margin-bottom: 20px;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                </div>
                <div>${message}</div>
                ${progressBarHtml}
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        indicator.style.display = 'flex';
    }
    
    /**
     * 更新加载状态进度
     * @param {number} progress - 进度百分比 (0-100)
     * @param {string} message - 可选的更新消息
     */
    updateLoadingProgress(progress, message = null) {
        const indicator = document.getElementById('enhanced-loading-indicator');
        if (indicator) {
            const progressBar = indicator.querySelector('div[style*="background-color: #4CAF50"]');
            const progressText = indicator.querySelector('div[style*="font-size: 14px;"]');
            const messageDiv = indicator.querySelector('div:not([style])');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${progress}%`;
            }
            
            if (message && messageDiv) {
                messageDiv.textContent = message;
            }
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const indicator = document.getElementById('enhanced-loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    /**
     * 获取支持的导出格式
     * @returns {Array} 支持的格式列表
     */
    getSupportedFormats() {
        const formats = ['html', 'txt'];
        
        if (this.pdfLibAvailable) {
            formats.push('pdf');
        }
        
        return formats;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedExporter;
} else {
    window.EnhancedExporter = EnhancedExporter;
}