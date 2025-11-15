# 复古打字机风格个人简历网站

一个以"复古机械打字机"为视觉与交互核心的个人简历展示网站，具有独特的沉浸式体验，完全由GitHub驱动，内容与代码分离，可独立维护。

## 功能特点

- **复古打字机视觉效果**：米黄色纸张背景、打字机滚筒装饰、等宽字体、闪烁光标
- **数据驱动内容**：从`resume-data.json`异步获取数据并动态渲染
- **打字机交互效果**：主标题自动逐字打印、点击导航后内容切换的打字/清除效果
- **GitHub内容管理**：通过修改仓库JSON文件更新简历内容
- **音效系统**：打字音效及开关控制
- **PDF导出功能**：将简历内容导出为PDF文档
- **响应式设计**：适配桌面和移动设备

## 项目结构

```
retro-typewriter-resume/
├── index.html             # 网站主页面，定义HTML结构
├── css/
│   └── style.css          # 所有视觉样式和响应式规则
├── js/
│   └── main.js            # 入口文件，包含所有核心功能逻辑
├── assets/
│   ├── sounds/
│   │   └── typewriter.mp3 # 打字机音效文件（需自行添加）
│   └── icons/             # 社交平台或功能按钮图标（需自行添加）
├── resume-data.json       # 【核心】简历内容配置文件
└── README.md              # 项目说明文档
```

## 部署说明

### 1. GitHub初始化

1. 创建一个新的GitHub仓库（如`becky-resume`）
2. 将上述文件推送到仓库
3. 在仓库设置（Settings）中，开启GitHub Pages功能，选择main分支作为源

### 2. 更新简历内容

#### 方式一：网页端编辑

1. 访问GitHub仓库，找到`resume-data.json`文件
2. 点击右上角的"Edit"按钮（铅笔图标）
3. 在编辑器中修改JSON数据（注意语法正确性）
4. 填写提交信息（Commit changes），例如"Update work experience"
5. 点击"Commit changes"按钮

#### 方式二：本地编辑

```bash
# 克隆仓库到本地
git clone https://github.com/your-username/becky-resume.git

# 进入项目目录
cd becky-resume

# 编辑resume-data.json文件
# 使用您喜欢的编辑器进行修改

# 提交更改
git add .
git commit -m "Update work experience"

# 推送到远程仓库
git push origin main
```

### 3. 自动部署

提交后，GitHub Pages会自动检测到代码变更并开始构建和部署，通常在1-2分钟内完成。之后访问您的GitHub Pages地址（如`https://your-username.github.io/becky-resume/`）即可看到更新后的简历。

## 自定义说明

### 修改GitHub数据源

在`js/main.js`文件中找到以下行，将其中的URL替换为您自己的GitHub仓库地址：

```javascript
const response = await fetch('https://raw.githubusercontent.com/username/repo/main/resume-data.json');
```

### 添加打字机音效

1. 获取打字机音效文件（可从免版权音效网站下载）
2. 将其命名为`typewriter.mp3`并放入`assets/sounds/`目录下
3. 如果使用不同的文件名或路径，请更新`js/main.js`中`playTypeSound`函数的音频路径

### PDF导出功能

当前实现为模拟导出功能。要实现真正的PDF导出，需要：

1. 在`index.html`中添加以下库的引用：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

2. 在`js/main.js`中更新`exportToPDF`函数，使用这些库进行实际的PDF生成和导出

## 浏览器兼容性

- Chrome（最新两个版本）
- Firefox（最新两个版本）
- Safari（最新两个版本）
- Edge（最新两个版本）

## 转换为微信小程序

此项目使用原生HTML/CSS/JavaScript构建，技术栈简洁，便于后续转换为微信小程序。转换时需要：

1. 使用小程序的WXML替代HTML结构
2. 使用WXSS替代CSS样式
3. 调整JavaScript逻辑以符合小程序的框架和API
4. 适配小程序的生命周期和数据绑定方式

## 许可证

此项目仅供学习和个人使用。