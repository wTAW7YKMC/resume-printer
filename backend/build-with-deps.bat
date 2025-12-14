@echo off
echo 正在准备Spring Boot项目构建...

:: 设置Java路径（请根据您的Java安装路径调整）
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

:: 创建输出目录
if not exist "target" mkdir target
if not exist "target\classes" mkdir target
if not exist "target\lib" mkdir target

:: 下载依赖的PowerShell脚本
echo 正在创建依赖下载脚本...
(
echo $ProgressPreference = 'SilentlyContinue'
echo $libDir = "target\lib"
echo if ^(Test-Path $libDir^) ^(Remove-Item $libDir -Recurse -Force^)
echo New-Item -ItemType Directory -Path $libDir -Force
echo.
echo $dependencies = @(
echo     @{url="https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-web/3.2.0/spring-boot-starter-web-3.2.0.jar"; file="spring-boot-starter-web-3.2.0.jar"},
echo     @{url="https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-data-jpa/3.2.0/spring-boot-starter-data-jpa-3.2.0.jar"; file="spring-boot-starter-data-jpa-3.2.0.jar"},
echo     @{url="https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-validation/3.2.0/spring-boot-starter-validation-3.2.0.jar"; file="spring-boot-starter-validation-3.2.0.jar"},
echo     @{url="https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.6.1.jre11/mssql-jdbc-12.6.1.jre11.jar"; file="mssql-jdbc-12.6.1.jre11.jar"},
echo     @{url="https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-loader/3.2.0/spring-boot-loader-3.2.0.jar"; file="spring-boot-loader-3.2.0.jar"}
echo ^)
echo.
echo Write-Host "正在下载依赖..."
echo foreach ^($dep in $dependencies^) {
echo     $filePath = Join-Path $libDir $dep.file
echo     Write-Host "下载: $($dep.file)"
echo     try {
echo         Invoke-WebRequest -Uri $dep.url -OutFile $filePath -ErrorAction Stop
echo         Write-Host "完成: $($dep.file)" -ForegroundColor Green
echo     } catch {
echo         Write-Host "失败: $($dep.file) - $($_.Exception.Message)" -ForegroundColor Red
echo     }
echo }
echo.
echo Write-Host "依赖下载完成！" -ForegroundColor Green
) > download-deps.ps1

:: 执行下载脚本
echo 正在下载必要的依赖...
powershell -ExecutionPolicy Bypass -File download-deps.ps1

:: 检查关键依赖是否下载成功
if not exist "target\lib\spring-boot-starter-web-3.2.0.jar" (
    echo 依赖下载失败，将使用简化的构建方式...
    goto simple_build
)

echo 正在创建Spring Boot可执行JAR...

:: 使用Spring Boot的打包方式创建可执行JAR
dir /s /b src\main\java\*.java > sources.txt

:: 编译Java源文件
javac -d target\classes -cp "target\lib\*" @sources.txt

if %ERRORLEVEL% neq 0 (
    echo 编译失败！
    pause
    exit /b 1
)

:: 复制资源文件
xcopy /E /I /Y src\main\resources target\classes

:: 创建BOOT-INF目录结构
if not exist "target\temp\BOOT-INF\classes" mkdir target\temp\BOOT-INF\classes
if not exist "target\temp\BOOT-INF\lib" mkdir target\temp\BOOT-INF\lib

:: 复制编译后的类和资源
xcopy /E /I /Y target\classes\* target\temp\BOOT-INF\classes\

:: 复制依赖
copy target\lib\*.jar target\temp\BOOT-INF\lib\

:: 复制Spring Boot Loader
copy target\lib\spring-boot-loader-3.2.0.jar target\temp\

:: 创建MANIFEST.MF
(
echo Manifest-Version: 1.0
echo Main-Class: org.springframework.boot.loader.JarLauncher
echo Start-Class: com.resume.message.MessageApplication
echo Spring-Boot-Classpath-Index: BOOT-INF/classpath.idx
echo Spring-Boot-Layers-Index: BOOT-INF/layers.idx
) > target\temp\META-INF\MANIFEST.MF

:: 创建最终的JAR
cd target\temp
jar cvfm ..\resume-message-backend.jar META-INF\MANIFEST.MF *
cd ..\..

goto end

:simple_build
echo 使用简化方式创建可执行JAR...

:: 创建简化的MANIFEST.MF
(
echo Manifest-Version: 1.0
echo Main-Class: com.resume.message.MessageApplication
echo Class-Path: .
) > target\MANIFEST.MF

:: 编译Java源文件
dir /s /b src\main\java\*.java > sources.txt
javac -d target\classes @sources.txt

:: 复制资源文件
xcopy /E /I /Y src\main\resources target\classes

:: 创建JAR文件
cd target
jar cvfm resume-message-backend.jar MANIFEST.MF -C classes .
cd ..

:end
echo.
echo ========================================
echo 构建完成！
echo JAR文件位置: f:\数智编程\resume printer\backend\target\resume-message-backend.jar
echo.
echo 运行方法：
echo 1. 双击运行: 双击 target\resume-message-backend.jar
echo 2. 命令行运行: java -jar target\resume-message-backend.jar
echo.
echo 注意：如果双击运行，控制台窗口可能会一闪而过，
echo 建议使用命令行运行以便查看日志和错误信息。
echo ========================================
pause