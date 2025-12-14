@echo off
echo 正在编译Spring Boot项目...

:: 设置Java路径（请根据您的Java安装路径调整）
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

:: 创建输出目录
if not exist "target" mkdir target
if not exist "target\classes" mkdir target\classes
if not exist "target\lib" mkdir target\lib

:: 下载必要的依赖（如果不存在）
echo 检查依赖文件...
if not exist "target\lib\spring-boot-starter-web-3.2.0.jar" (
    echo 需要手动下载以下JAR文件到 target\lib 目录：
    echo 1. spring-boot-starter-web-3.2.0.jar
    echo 2. spring-boot-starter-data-jpa-3.2.0.jar
    echo 3. spring-boot-starter-validation-3.2.0.jar
    echo 4. mssql-jdbc-12.6.1.jre11.jar
    echo 5. hibernate-core-6.3.1.Final.jar
    echo 6. spring-data-jpa-3.2.0.jar
    echo 7. spring-boot-3.2.0.jar
    echo 8. spring-context-6.1.2.jar
    echo 9. spring-beans-6.1.2.jar
    echo 10. spring-core-6.1.2.jar
    echo 11. spring-web-6.1.2.jar
    echo 12. spring-webmvc-6.1.2.jar
    echo 13. jakarta.persistence-api-3.1.0.jar
    echo 14. jakarta.validation-api-3.0.2.jar
    echo 15. jakarta.servlet-api-6.0.0.jar
    echo 16. jackson-databind-2.15.3.jar
    echo 17. jackson-core-2.15.3.jar
    echo 18. jackson-annotations-2.15.3.jar
    echo.
    echo 请从Maven中央仓库下载这些文件：https://repo1.maven.org/maven2/
    echo 或者使用在线Maven仓库：https://search.maven.org/
    echo.
    pause
    exit /b 1
)

:: 编译Java源文件
echo 正在编译Java源文件...
dir /s /b src\main\java\*.java > sources.txt

javac -d target\classes -cp "target\lib\*" @sources.txt

if %ERRORLEVEL% neq 0 (
    echo 编译失败！
    pause
    exit /b 1
)

:: 复制资源文件
echo 正在复制资源文件...
xcopy /E /I /Y src\main\resources target\classes

:: 创建MANIFEST.MF文件
echo 正在创建MANIFEST.MF...
(
echo Manifest-Version: 1.0
echo Main-Class: com.resume.message.MessageApplication
echo Class-Path: . lib\spring-boot-starter-web-3.2.0.jar lib\spring-boot-starter-data-jpa-3.2.0.jar lib\spring-boot-starter-validation-3.2.0.jar lib\mssql-jdbc-12.6.1.jre11.jar lib\hibernate-core-6.3.1.Final.jar lib\spring-data-jpa-3.2.0.jar lib\spring-boot-3.2.0.jar lib\spring-context-6.1.2.jar lib\spring-beans-6.1.2.jar lib\spring-core-6.1.2.jar lib\spring-web-6.1.2.jar lib\spring-webmvc-6.1.2.jar lib\jakarta.persistence-api-3.1.0.jar lib\jakarta.validation-api-3.0.2.jar lib\jakarta.servlet-api-6.0.0.jar lib\jackson-databind-2.15.3.jar lib\jackson-core-2.15.3.jar lib\jackson-annotations-2.15.3.jar
) > target\MANIFEST.MF

:: 创建JAR文件
echo 正在创建JAR文件...
cd target
jar cvfm resume-message-backend.jar MANIFEST.MF -C classes .
cd ..

echo.
echo ========================================
echo 编译完成！
echo JAR文件位置: f:\数智编程\resume printer\backend\target\resume-message-backend.jar
echo.
echo 运行方法：
echo 1. 双击运行: 双击 target\resume-message-backend.jar
echo 2. 命令行运行: java -jar target\resume-message-backend.jar
echo ========================================
pause