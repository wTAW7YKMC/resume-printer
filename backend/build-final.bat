@echo off
echo 正在创建自包含的可执行JAR...

:: 设置Java路径（请根据您的Java安装路径调整）
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

:: 创建输出目录
if not exist "target" mkdir target
if not exist "target\classes" mkdir target
if not exist "target\lib" mkdir target\lib

:: 下载SQL Server JDBC驱动
echo 正在下载SQL Server JDBC驱动...
powershell -Command "& {try { Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.6.1.jre11/mssql-jdbc-12.6.1.jre11.jar' -OutFile 'target\lib\mssql-jdbc-12.6.1.jre11.jar' -ErrorAction Stop; Write-Host 'JDBC驱动下载成功' -ForegroundColor Green } catch { Write-Host 'JDBC驱动下载失败，将使用内置驱动' -ForegroundColor Red }}"

:: 编译Java源文件
echo 正在编译Java源文件...
dir /s /b src\main\java\*.java > sources.txt

javac -d target\classes -cp "target\lib\*" @sources.txt

if %ERRORLEVEL% neq 0 (
    echo 编译失败！
    echo 请确保已安装Java 17或更高版本，并检查JAVA_HOME环境变量
    pause
    exit /b 1
)

:: 复制资源文件
echo 正在复制资源文件...
xcopy /E /I /Y src\main\resources target\classes

:: 创建MANIFEST.MF
(
echo Manifest-Version: 1.0
echo Main-Class: com.resume.message.MessageApplication
echo Class-Path: . lib\mssql-jdbc-12.6.1.jre11.jar
) > target\MANIFEST.MF

:: 创建JAR文件
cd target
jar cvfm resume-message-backend.jar MANIFEST.MF -C classes .
cd ..

:: 创建运行脚本
(
echo @echo off
echo echo 正在启动留言后端服务...
echo echo 请确保SQL Server正在运行，并已创建resume_message数据库
echo echo.
echo java -jar -Dloader.path=lib resume-message-backend.jar
echo pause
) > target\run.bat

:: 创建启动脚本（双击版本）
(
echo @echo off
echo start "留言后端服务" java -jar -Dloader.path=lib resume-message-backend.jar
) > target\start-service.bat

echo.
echo ========================================
echo 构建完成！
echo.
echo 文件位置：
echo - 可执行JAR: f:\数智编程\resume printer\backend\target\resume-message-backend.jar
echo - 运行脚本: f:\数智编程\resume printer\backend\target\run.bat
echo - 服务启动脚本: f:\数智编程\resume printer\backend\target\start-service.bat
echo.
echo 运行方法：
echo 1. 双击运行: 双击 target\start-service.bat 启动服务
echo 2. 命令行运行: 
echo    - 进入target目录: cd target
echo    - 运行: java -jar resume-message-backend.jar
echo    - 或使用: run.bat
echo.
echo 注意事项：
echo - 此版本需要SQL Server JDBC驱动
echo - 如果JDBC驱动下载失败，请手动下载并放入target\lib目录
echo - 下载地址: https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.6.1.jre11/mssql-jdbc-12.6.1.jre11.jar
echo - 确保SQL Server正在运行，并已创建resume_message数据库
echo ========================================
pause