@echo off
echo 🚀 GitHub Pages 部署助手
echo.

set /p username=请输入你的GitHub用户名: 
set /p reponame=请输入仓库名称（默认: resume-printer）: 

if "%reponame%"=="" set reponame=resume-printer

echo.
echo 📡 正在添加远程仓库...
git remote add origin https://github.com/%username%/%reponame%.git

echo.
echo 📤 正在推送代码到GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ 代码推送完成！
echo.
echo 📋 下一步操作：
echo 1. 访问 https://github.com/%username%/%reponame%/settings/pages
echo 2. 在 "Source" 部分选择 "Deploy from a branch"
echo 3. 选择 "main" 分支和 "/ (root)" 目录
echo 4. 点击 "Save"
echo.
echo 🌐 部署完成后，你的网站将可以通过以下地址访问：
echo https://%username%.github.io/%reponame%
echo.
pause