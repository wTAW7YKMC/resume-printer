# 🚀 GitHub Pages 部署指南

## 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`resume-printer`（或你喜欢的名字）
3. 设置为 **Public**
4. 不要初始化 README
5. 点击 "Create repository"

## 步骤 2: 连接本地仓库

在终端中执行以下命令（替换 YOUR_USERNAME）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/resume-printer.git
git branch -M main
git push -u origin main
```

## 步骤 3: 启用 GitHub Pages

1. 进入你的仓库页面
2. 点击 "Settings" 标签
3. 向下滚动到 "Pages" 部分
4. 在 "Source" 下选择 "Deploy from a branch"
5. 选择 "main" 分支和 "/ (root)" 目录
6. 点击 "Save"

## 步骤 4: 等待部署

- GitHub Actions 会自动运行部署工作流
- 等待几分钟，你的简历网站就会上线！
- 访问地址：`https://YOUR_USERNAME.github.io/resume-printer`

## 🔧 自定义域名（可选）

如果你想使用自定义域名：

1. 在 Settings > Pages 中添加自定义域名
2. 配置 DNS 记录指向 GitHub Pages

## 📋 网站特性

✅ 打字机效果动画
✅ 打字音效（可调节音量）
✅ PDF 导出功能
✅ 响应式设计
✅ 触摸手势支持
✅ 自动从 JSON 文件加载简历数据

## 🎨 自定义内容

编辑 `resume-data.json` 文件来更新你的简历内容。

## 🔊 音效设置

网站支持打字音效，你可以在网页上点击音效按钮来控制开关。

---

部署完成后，你的专业简历网站就可以通过 GitHub Pages 访问了！🎉