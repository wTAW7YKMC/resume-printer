@echo off
chcp 65001 >nul
echo Starting Resume Message Backend (JSON Storage)...
echo.

cd /d "f:\数智编程\resume printer\backend\target"

echo Starting application...
java -jar resume-message-json.jar

echo.
echo Application stopped.
pause
