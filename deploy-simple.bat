@echo off
title GitHub Deploy

echo.
echo ========================================
echo   Resume Website GitHub Deploy
echo ========================================
echo.

echo Step 1: Create a new repository at https://github.com/new
echo Repository name: resume-printer
echo Make sure to select Public
echo.
pause

set /p username=Enter your GitHub username: 
if "%username%"=="" (
    echo Username cannot be empty!
    pause
    exit
)

echo.
echo Connecting to GitHub repository...
git remote add origin https://github.com/%username%/resume-printer.git
git branch -M main
git push -u origin main

echo.
echo Code pushed successfully!
echo.
echo Final step: Enable GitHub Pages
echo 1. Go to: https://github.com/%username%/resume-printer/settings/pages
echo 2. Select "Deploy from a branch"
echo 3. Choose "main" branch and "/ (root)" folder
echo 4. Click "Save"
echo.
echo Your website will be available at:
echo https://%username%.github.io/resume-printer
echo.
echo Would you like to open the GitHub Pages settings now? (Y/N)
set /p choice=Your choice: 
if /i "%choice%"=="Y" start https://github.com/%username%/resume-printer/settings/pages

pause