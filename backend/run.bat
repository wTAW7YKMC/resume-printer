@echo off
echo Starting Resume Message Backend...
echo.

cd /d "f:\数智编程\resume printer\backend\target"

echo Checking for JDBC driver...
if not exist "mssql-jdbc-*.jar" (
    echo WARNING: SQL Server JDBC driver not found!
    echo Please download from: https://docs.microsoft.com/en-us/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server
    echo Place the driver JAR file in this directory and update the driver name in this batch file.
    echo.
    echo Continuing anyway...
    echo.
)

echo Starting application...
java -cp "resume-message-backend.jar;mssql-jdbc-11.2.2.jre17.jar" com.resume.message.StandaloneMessageApplication

echo.
echo Application stopped.
pause