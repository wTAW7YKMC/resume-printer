@echo off
echo 正在创建简历网站留言后端可执行JAR...

:: 创建输出目录
if not exist "target\classes" mkdir target\classes

:: 编译Java源文件
echo 正在编译Java源文件...
javac -d target\classes target\classes\com\resume\message\StandaloneMessageApplication.java

if %ERRORLEVEL% neq 0 (
    echo 编译失败！
    echo 请确保已安装Java 17或更高版本，并设置了JAVA_HOME环境变量
    pause
    exit /b 1
)

:: 创建JAR文件
echo 正在创建JAR文件...
cd target
jar cvfm resume-message-backend.jar MANIFEST.MF -C classes .
cd ..

:: 创建运行脚本
echo 正在创建运行脚本...

:: 创建前台运行脚本
(
echo @echo off
echo title 简历网站留言后端服务
echo echo ==================================
echo echo    简历网站留言后端服务
echo echo ==================================
echo echo.
echo echo 正在启动服务...
echo echo 请确保SQL Server正在运行，并已创建resume_message数据库
echo echo.
echo java -jar resume-message-backend.jar
echo.
echo echo.
echo echo 服务已停止，按任意键关闭窗口...
echo pause >nul
) > target\run.bat

:: 创建后台运行脚本
(
echo @echo off
echo start "简历网站留言后端" /min java -jar resume-message-backend.jar
echo timeout /t 2 >nul
echo echo 服务已在后台启动，端口: 8080
echo echo 访问 http://localhost:8080 查看API说明
echo echo.
echo pause
) > target\start-background.bat

:: 创建停止脚本
(
echo @echo off
echo taskkill /f /im java.exe
echo echo 服务已停止
echo pause
) > target\stop.bat

:: 复制HTML查看页面到target目录
copy message-list.html target\ >nul 2>&1

echo.
echo ========================================
echo 构建完成！
echo.
echo 文件位置：
echo - 可执行JAR: f:\数智编程\resume printer\backend\target\resume-message-backend.jar
echo - 前台运行脚本: f:\数智编程\resume printer\backend\target\run.bat
echo - 后台运行脚本: f:\数智编程\resume printer\backend\target\start-background.bat
echo - 停止服务脚本: f:\数智编程\resume printer\backend\target\stop.bat
echo - 留言查看页面: f:\数智编程\resume printer\backend\target\message-list.html
echo.
echo 运行方法：
echo 1. 双击运行: 双击 target\start-background.bat 在后台启动服务
echo 2. 前台运行: 双击 target\run.bat 在前台启动服务（可查看日志）
echo 3. 命令行运行: 
echo    - 进入target目录: cd target
echo    - 运行: java -jar resume-message-backend.jar
echo.
echo 注意事项：
echo - 此版本使用Java内置HTTP服务器，无需任何外部依赖
echo - 需要Java 17或更高版本
echo - 需要SQL Server JDBC驱动（通常已包含在SQL Server安装中）
echo - 确保SQL Server正在运行，并已创建resume_message数据库
echo - 确保已执行create_table.sql创建message表
echo.
echo 测试方法：
echo 1. 启动服务后，访问 http://localhost:8080 查看API说明
echo 2. 打开target\message-list.html查看留言列表
echo ========================================
pause