@echo off
chcp 65001 >nul
title 🚀 简历网站一键部署到GitHub Pages

echo.
echo ========================================
echo   简历网站一键部署到GitHub Pages
echo ========================================
echo.

echo 📋 请先在GitHub上创建一个新仓库：
echo    1. 访问 https://github.com/new
echo    2. 仓库名称：resume-printer
echo    3. 选择 Public（公开）
echo    4. 点击 Create repository
echo.
pause

set /p username=请输入你的GitHub用户名: 
if "%username%"=="" (
    echo ❌ 用户名不能为空！
    pause
    exit
)

echo.
echo 📡 正在连接到GitHub仓库...
git remote add origin https://github.com/%username%/resume-printer.git 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  远程仓库可能已存在，继续执行...
)

echo.
echo 📤 正在推送代码到GitHub...
git branch -M main
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失败！请检查：
    echo    1. 用户名是否正确
    echo    2. 仓库是否已创建
    echo    3. 网络连接是否正常
    pause
    exit
)

echo.
echo ✅ 代码推送成功！
echo.
echo 🌐 接下来请手动完成最后一步：
echo    1. 访问 https://github.com/%username%/resume-printer/settings/pages
echo    2. 在 "Source" 部分选择 "Deploy from a branch"
echo    3. 选择 "main" 分支和 "/ (root)" 目录
echo    4. 点击 "Save"
echo.
echo 🎉 部署完成后，你的网站地址是：
echo    https://%username%.github.io/resume-printer
echo.
echo 📱 等待2-3分钟后即可访问！
echo.

echo 🌍 是否现在打开GitHub仓库设置页面？ (Y/N)
set /p choice=请选择: 
if /i "%choice%"=="Y" start https://github.com/%username%/resume-printer/settings/pages

pause