@echo off
echo 正在编译Java源代码（Java 8兼容版本）...

REM 设置Java路径 - 使用Java 8或更早版本
REM 如果您有Java 8，请修改以下路径
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_291
set PATH=%JAVA_HOME%\bin;%PATH%

REM 检查Java版本
java -version

REM 创建输出目录
if not exist target\classes-java8 mkdir target\classes-java8

REM 编译Java源代码，指定目标版本为Java 8
javac -d target\classes-java8 -cp "gson-2.9.0.jar" --release 8 JsonMessageApplication.java

if %ERRORLEVEL% neq 0 (
    echo 编译失败！请检查Java 8是否正确安装。
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
copy gson-2.9.0.jar target\

REM 创建JAR文件
cd target
jar cvfm resume-message-json-java8.jar MANIFEST-Java8.MF -C classes-java8 .

cd ..

echo 构建完成！生成的文件：target\resume-message-json-java8.jar

echo 请将以下文件上传到阿里云：
echo 1. target\resume-message-json-java8.jar
echo 2. target\gson-2.9.0.jar

REM 测试运行（可选）
echo 正在测试运行JAR文件...
cd target
java -jar resume-message-json-java8.jar &
cd ..

echo 服务已启动，监听端口9000
echo 请访问 http://localhost:9000 测试服务
echo 按Ctrl+C停止服务

pause