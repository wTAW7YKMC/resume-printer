@echo off
chcp 65001 >nul
echo 正在准备SQL Server Windows身份验证所需的DLL文件...
echo.

cd /d "f:\数智编程\resume printer\backend\target"

echo 请按照以下步骤操作：
echo.
echo 1. 手动下载sqljdbc_auth.dll文件：
echo    访问 https://docs.microsoft.com/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server
echo    下载 Microsoft JDBC Driver for SQL Server
echo    从下载的压缩包中提取 sqljdbc_auth.dll (x64版本)
echo.
echo 2. 将下载的sqljdbc_auth.dll文件复制到当前目录：
echo    f:\数智编程\resume printer\backend\target
echo.
echo 3. 运行以下命令将DLL添加到JAR中：
echo    java AddDllToJar sqljdbc_auth.dll resume-message-windows-auth.jar
echo.
echo 4. 完成后，双击run.bat启动应用程序
echo.

echo 按任意键打开下载页面...
pause >nul

start https://docs.microsoft.com/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server

echo.
echo 下载完成后，请将sqljdbc_auth.dll复制到此目录，然后运行上述命令。
pause