@echo off
echo Building resume website message backend executable JAR...

:: Create output directory
if not exist "target\classes" mkdir target\classes

:: Compile Java source files
echo Compiling Java source files...
javac -d target\classes target\classes\com\resume\message\StandaloneMessageApplication.java

if %ERRORLEVEL% neq 0 (
    echo Compilation failed!
    echo Please ensure Java 17 or higher is installed and JAVA_HOME environment variable is set
    pause
    exit /b 1
)

:: Create JAR file
echo Creating JAR file...
cd target
jar cvfm resume-message-backend.jar MANIFEST.MF -C classes .
cd ..

if %ERRORLEVEL% neq 0 (
    echo JAR creation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo JAR file location: f:\数智编程\resume printer\backend\target\resume-message-backend.jar
echo.
echo To run the application:
echo 1. Double-click the JAR file
echo 2. Or run from command line: java -jar target\resume-message-backend.jar
echo.
echo After starting, access: http://localhost:8080
echo.
pause