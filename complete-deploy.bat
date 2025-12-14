@echo off
title Complete GitHub Deploy

echo.
echo ========================================
echo   Resume Website Complete Deploy
echo ========================================
echo.

echo Step 1: Creating GitHub repository...
echo Opening GitHub in your browser...
start https://github.com/new

echo.
echo Please follow these steps:
echo 1. Repository name: resume-printer
echo 2. Select Public
echo 3. Click "Create repository"
echo.
echo After creating the repository, press any key to continue...
pause

echo.
echo Step 2: Pushing code to GitHub...
git remote add origin https://github.com/wTAW7YKMC/resume-printer.git
git branch -M main
git push -u origin main

echo.
echo Step 3: Enabling GitHub Pages...
echo Opening GitHub Pages settings...
start https://github.com/wTAW7YKMC/resume-printer/settings/pages

echo.
echo Please follow these steps:
echo 1. Select "Deploy from a branch"
echo 2. Choose "main" branch and "/ (root)" folder
echo 3. Click "Save"
echo.
echo Your website will be available at:
echo https://wTAW7YKMC.github.io/resume-printer
echo.
echo Press any key to exit...
pause