@echo off
echo 正在编译Java源代码（Java 8兼容版本）...

REM 设置Java路径 - 使用Java 21但编译为Java 8兼容
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%

REM 检查Java版本
java -version

REM 创建输出目录
if not exist target\classes-java8 mkdir target\classes-java8

REM 编译Java源代码，指定目标版本为Java 8（使用Java 21的交叉编译）
javac -d target\classes-java8 -cp "gson-2.9.0.jar" --release 8 JsonMessageApplication.java

if %ERRORLEVEL% neq 0 (
    echo 编译失败！如果出现错误，可能需要修改代码以兼容Java 8。
    pause
    exit /b 1
)

echo 编译成功！

echo 正在创建可执行JAR文件...

REM 创建MANIFEST.MF文件
echo Manifest-Version: 1.0 > target\MANIFEST-Java8.MF
echo Main-Class: JsonMessageApplication >> target\MANIFEST-Java8.MF
echo Class-Path: gson-2.9.0.jar >> target\MANIFEST-Java8.MF

REM 复制gson库到target目录
copy gson-2.9.0.jar target\ >nul 2>&1

REM 创建JAR文件
cd target
jar cvfm resume-message-json-java8.jar MANIFEST-Java8.MF -C classes-java8 .

cd ..

echo 构建完成！生成的文件：target\resume-message-json-java8.jar

echo 请将以下文件上传到阿里云：
echo 1. target\resume-message-json-java8.jar
echo 2. target\gson-2.9.0.jar

echo.
echo 部署到阿里云后的操作：
echo 1. 在阿里云函数计算控制台，修改启动命令为：
echo    java -jar resume-message-json-java8.jar
echo 2. 确保监听端口设置为9000
echo 3. 部署完成后测试API：
echo    https://message-server-uutepmlola.cn-hangzhou.fcapp.run/api/resume/message/list

echo.
echo 按任意键本地测试...
pause >nul

REM 测试运行（可选）
echo 正在测试运行JAR文件...
cd target
start "Message Server" java -jar resume-message-json-java8.jar
cd ..

echo 服务已启动，监听端口9000
echo 请访问 http://localhost:9000 测试服务
echo 控制台窗口将在10秒后自动关闭
timeout /t 10
pause