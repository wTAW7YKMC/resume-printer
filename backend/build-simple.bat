@echo off
echo 正在创建自包含的可执行JAR...

:: 设置Java路径（请根据您的Java安装路径调整）
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

:: 创建输出目录
if not exist "target" mkdir target
if not exist "target\classes" mkdir target

:: 编译Java源文件
echo 正在编译Java源文件...
dir /s /b src\main\java\*.java > sources.txt

javac -d target\classes @sources.txt

if %ERRORLEVEL% neq 0 (
    echo 编译失败！
    echo 请确保已安装Java 17或更高版本，并检查JAVA_HOME环境变量
    pause
    exit /b 1
)

:: 复制资源文件
echo 正在复制资源文件...
xcopy /E /I /Y src\main\resources target\classes

:: 创建简化的应用，不依赖Spring Boot，使用纯Java实现
echo 正在创建简化版留言应用...

:: 创建简化的主类
(
echo package com.resume.message;
echo.
echo import java.io.*;
echo import java.net.*;
echo import java.sql.*;
echo import java.util.*;
echo import com.sun.net.httpserver.*;
echo import com.sun.net.httpserver.HttpExchange;
echo import com.sun.net.httpserver.HttpHandler;
echo.
echo public class SimpleMessageApplication {
echo     private static Connection connection;
echo     private static final String DB_URL = "jdbc:sqlserver://LAPTOP-0M4DC4I9:1433;databaseName=resume_message;encrypt=false;trustServerCertificate=true;";
echo     private static final String DB_USER = "HONOR";
echo     private static final String DB_PASSWORD = "";
echo.
echo     public static void main(String[] args) throws Exception {
echo         // 初始化数据库连接
echo         initDatabase();
echo.
echo         // 创建HTTP服务器
echo         HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
echo         server.createContext("/api/resume/message", new MessageHandler());
echo         server.createContext("/api/resume/message/list", new MessageListHandler());
echo         server.setExecutor(null);
echo         server.start();
echo.
echo         System.out.println("留言后端服务已启动，端口: 8080");
echo         System.out.println("API接口:");
echo         System.out.println("  POST /api/resume/message - 提交留言");
echo         System.out.println("  GET  /api/resume/message/list - 获取留言列表");
echo     }
echo.
echo     private static void initDatabase() throws Exception {
echo         try {
echo             Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
echo             connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
echo             System.out.println("数据库连接成功");
echo         } catch (Exception e) {
echo             System.err.println("数据库连接失败: " + e.getMessage());
echo             System.err.println("请确保SQL Server正在运行，并已创建resume_message数据库");
echo             throw e;
echo         }
echo     }
echo.
echo     static class MessageHandler implements HttpHandler {
echo         @Override
echo         public void handle(HttpExchange exchange) throws IOException {
echo             if ("POST".equals(exchange.getRequestMethod())) {
echo                 try {
echo                     // 读取请求体
echo                     InputStream requestBody = exchange.getRequestBody();
echo                     String body = new String(requestBody.readAllBytes());
echo.
echo                     // 简单解析JSON（实际项目中应使用JSON库）
echo                     String name = extractValue(body, "name");
echo                     String email = extractValue(body, "email");
echo                     String content = extractValue(body, "content");
echo.
echo                     // 验证输入
echo                     if (name == null || name.trim().isEmpty() ||
echo                         email == null || email.trim().isEmpty() ||
echo                         content == null || content.trim().isEmpty()) {
echo                         sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"参数不能为空\"}");
echo                         return;
echo                     }
echo.
echo                     // 插入数据库
echo                     String sql = "INSERT INTO message (name, email, content) VALUES (?, ?, ?)";
echo                     PreparedStatement stmt = connection.prepareStatement(sql);
echo                     stmt.setString(1, name);
echo                     stmt.setString(2, email);
echo                     stmt.setString(3, content);
echo                     stmt.executeUpdate();
echo                     stmt.close();
echo.
echo                     sendResponse(exchange, 200, "{\"code\":200,\"msg\":\"留言提交成功\"}");
echo                 } catch (Exception e) {
echo                     sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"服务器错误: " + e.getMessage() + "\"}");
echo                 }
echo             } else {
echo                 sendResponse(exchange, 405, "{\"code\":405,\"msg\":\"不支持的请求方法\"}");
echo             }
echo         }
echo     }
echo.
echo     static class MessageListHandler implements HttpHandler {
echo         @Override
echo         public void handle(HttpExchange exchange) throws IOException {
echo             if ("GET".equals(exchange.getRequestMethod())) {
echo                 try {
echo                     String sql = "SELECT id, name, email, content, createTime FROM message ORDER BY createTime DESC";
echo                     Statement stmt = connection.createStatement();
echo                     ResultSet rs = stmt.executeQuery(sql);
echo.
echo                     StringBuilder json = new StringBuilder();
echo                     json.append("{\"code\":200,\"data\":[");
echo                     boolean first = true;
echo.
echo                     while (rs.next()) {
echo                         if (!first) json.append(",");
echo                         json.append("{");
echo                         json.append("\"id\":").append(rs.getInt("id")).append(",");
echo                         json.append("\"name\":\"").append(rs.getString("name")).append("\",");
echo                         json.append("\"email\":\"").append(rs.getString("email")).append("\",");
echo                         json.append("\"content\":\"").append(rs.getString("content")).append("\",");
echo                         json.append("\"createTime\":\"").append(rs.getTimestamp("createTime").toString()).append("\"");
echo                         json.append("}");
echo                         first = false;
echo                     }
echo.
echo                     json.append("]}");
echo                     rs.close();
echo                     stmt.close();
echo.
echo                     sendResponse(exchange, 200, json.toString());
echo                 } catch (Exception e) {
echo                     sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"服务器错误: " + e.getMessage() + "\"}");
echo                 }
echo             } else {
echo                 sendResponse(exchange, 405, "{\"code\":405,\"msg\":\"不支持的请求方法\"}");
echo             }
echo         }
echo     }
echo.
echo     private static String extractValue(String json, String key) {
echo         String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
echo         java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
echo         java.util.regex.Matcher m = p.matcher(json);
echo         if (m.find()) {
echo             return m.group(1);
echo         }
echo         return null;
echo     }
echo.
echo     private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
echo         exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
echo         exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
echo         exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
echo         exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
echo         exchange.sendResponseHeaders(statusCode, response.getBytes("UTF-8").length);
echo         OutputStream os = exchange.getResponseBody();
echo         os.write(response.getBytes("UTF-8"));
echo         os.close();
echo     }
echo }
) > target\classes\com\resume\message\SimpleMessageApplication.java

:: 重新编译简化版应用
javac -d target\classes target\classes\com\resume\message\SimpleMessageApplication.java

:: 创建MANIFEST.MF
(
echo Manifest-Version: 1.0
echo Main-Class: com.resume.message.SimpleMessageApplication
echo Class-Path: .
) > target\MANIFEST.MF

:: 创建JAR文件
cd target
jar cvfm resume-message-backend.jar MANIFEST.MF -C classes .
cd ..

echo.
echo ========================================
echo 构建完成！
echo JAR文件位置: f:\数智编程\resume printer\backend\target\resume-message-backend.jar
echo.
echo 运行方法：
echo 1. 双击运行: 双击 target\resume-message-backend.jar
echo 2. 命令行运行: java -jar target\resume-message-backend.jar
echo.
echo 注意事项：
echo - 此版本使用Java内置HTTP服务器，无需Spring Boot依赖
echo - 需要SQL Server JDBC驱动，请确保已安装或将其放在JAR同目录
echo - 如果双击运行，控制台窗口可能会一闪而过
echo - 建议使用命令行运行以便查看日志和错误信息
echo ========================================
pause