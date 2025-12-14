@echo off
echo 正在创建完全自包含的可执行JAR...

:: 设置Java路径（请根据您的Java安装路径调整）
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

:: 创建输出目录
if not exist "target" mkdir target
if not exist "target\classes" mkdir target

:: 创建一个不依赖Spring Boot的简化版本
echo 正在创建简化版留言应用...

:: 创建简化的主类
(
echo package com.resume.message;
echo.
echo import java.io.*;
echo import java.net.*;
echo import java.sql.*;
echo import java.text.*;
echo import java.util.*;
echo import com.sun.net.httpserver.*;
echo.
echo public class StandaloneMessageApplication {
echo     private static Connection connection;
echo     private static final String DB_URL = "jdbc:sqlserver://LAPTOP-0M4DC4I9:1433;databaseName=resume_message;encrypt=false;trustServerCertificate=true;";
echo     private static final String DB_USER = "HONOR";
echo     private static final String DB_PASSWORD = "";
echo.
echo     public static void main(String[] args) throws Exception {
echo         System.out.println("=================================");
echo         System.out.println("    简历网站留言后端服务");
echo         System.out.println("=================================");
echo         System.out.println("正在初始化数据库连接...");
echo.
echo         // 初始化数据库连接
echo         try {
echo             initDatabase();
echo             System.out.println("数据库连接成功！");
echo         } catch (Exception e) {
echo             System.err.println("数据库连接失败: " + e.getMessage());
echo             System.err.println("请确保:");
echo             System.err.println("1. SQL Server正在运行");
echo             System.err.println("2. 已创建resume_message数据库");
echo             System.err.println("3. 已执行create_table.sql创建message表");
echo             System.err.println("");
echo             System.err.println("按任意键退出...");
echo             System.in.read();
echo             return;
echo         }
echo.
echo         // 创建HTTP服务器
echo         try {
echo             HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
echo             server.createContext("/api/resume/message", new MessageHandler());
echo             server.createContext("/api/resume/message/list", new MessageListHandler());
echo             server.createContext("/", new HomeHandler());
echo             server.setExecutor(null);
echo             server.start();
echo.
echo             System.out.println("服务已启动，端口: 8080");
echo             System.out.println("API接口:");
echo             System.out.println("  POST /api/resume/message - 提交留言");
echo             System.out.println("  GET  /api/resume/message/list - 获取留言列表");
echo             System.out.println("  GET  / - 查看API说明");
echo             System.out.println("");
echo             System.out.println("按Ctrl+C停止服务");
echo         } catch (Exception e) {
echo             System.err.println("服务器启动失败: " + e.getMessage());
echo             System.err.println("按任意键退出...");
echo             System.in.read();
echo         }
echo     }
echo.
echo     private static void initDatabase() throws Exception {
echo         // 尝试加载SQL Server驱动
echo         try {
echo             Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
echo         } catch (ClassNotFoundException e) {
echo             throw new Exception("未找到SQL Server JDBC驱动，请确保已安装SQL Server");
echo         }
echo.
echo         connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
echo     }
echo.
echo     static class MessageHandler implements HttpHandler {
echo         @Override
echo         public void handle(HttpExchange exchange) throws IOException {
echo             // 处理CORS预检请求
echo             if ("OPTIONS".equals(exchange.getRequestMethod())) {
echo                 exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
echo                 exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
echo                 exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
echo                 exchange.sendResponseHeaders(200, -1);
echo                 return;
echo             }
echo.
echo             if (!"POST".equals(exchange.getRequestMethod())) {
echo                 sendResponse(exchange, 405, "{\"code\":405,\"msg\":\"不支持的请求方法\"}");
echo                 return;
echo             }
echo.
echo             try {
echo                 // 读取请求体
echo                 InputStream requestBody = exchange.getRequestBody();
echo                 String body = new String(requestBody.readAllBytes(), "UTF-8");
echo.
echo                 // 简单解析JSON
echo                 String name = extractValue(body, "name");
echo                 String email = extractValue(body, "email");
echo                 String content = extractValue(body, "content");
echo.
echo                 // 验证输入
echo                 if (name == null || name.trim().isEmpty()) {
echo                     sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"姓名不能为空\"}");
echo                     return;
echo                 }
echo.
echo                 if (email == null || email.trim().isEmpty() || !email.contains("@")) {
echo                     sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"请输入有效的邮箱地址\"}");
echo                     return;
echo                 }
echo.
echo                 if (content == null || content.trim().isEmpty()) {
echo                     sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"留言内容不能为空\"}");
echo                     return;
echo                 }
echo.
echo                 if (content.length() > 500) {
echo                     sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"留言内容不能超过500个字符\"}");
echo                     return;
echo                 }
echo.
echo                 // 插入数据库
echo                 String sql = "INSERT INTO message (name, email, content) VALUES (?, ?, ?)";
echo                 PreparedStatement stmt = connection.prepareStatement(sql);
echo                 stmt.setString(1, name.trim());
echo                 stmt.setString(2, email.trim());
echo                 stmt.setString(3, content.trim());
echo                 stmt.executeUpdate();
echo                 stmt.close();
echo.
echo                 sendResponse(exchange, 200, "{\"code\":200,\"msg\":\"留言提交成功\"}");
echo             } catch (SQLException e) {
echo                 sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"数据库错误: " + e.getMessage() + "\"}");
echo             } catch (Exception e) {
echo                 sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"服务器错误: " + e.getMessage() + "\"}");
echo             }
echo         }
echo     }
echo.
echo     static class MessageListHandler implements HttpHandler {
echo         @Override
echo         public void handle(HttpExchange exchange) throws IOException {
echo             // 处理CORS预检请求
echo             if ("OPTIONS".equals(exchange.getRequestMethod())) {
echo                 exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
echo                 exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
echo                 exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
echo                 exchange.sendResponseHeaders(200, -1);
echo                 return;
echo             }
echo.
echo             if (!"GET".equals(exchange.getRequestMethod())) {
echo                 sendResponse(exchange, 405, "{\"code\":405,\"msg\":\"不支持的请求方法\"}");
echo                 return;
echo             }
echo.
echo             try {
echo                 String sql = "SELECT id, name, email, content, createTime FROM message ORDER BY createTime DESC";
echo                 Statement stmt = connection.createStatement();
echo                 ResultSet rs = stmt.executeQuery(sql);
echo.
echo                 StringBuilder json = new StringBuilder();
echo                 json.append("{\"code\":200,\"data\":[");
echo                 boolean first = true;
echo.
echo                 while (rs.next()) {
echo                     if (!first) json.append(",");
echo                     json.append("{");
echo                     json.append("\"id\":").append(rs.getInt("id")).append(",");
echo                     json.append("\"name\":\"").append(escapeJson(rs.getString("name"))).append("\",");
echo                     json.append("\"email\":\"").append(escapeJson(rs.getString("email"))).append("\",");
echo                     json.append("\"content\":\"").append(escapeJson(rs.getString("content"))).append("\",");
echo                     
echo                     // 格式化时间
echo                     Timestamp timestamp = rs.getTimestamp("createTime");
echo                     SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
echo                     json.append("\"createTime\":\"").append(sdf.format(timestamp)).append("\"");
echo                     json.append("}");
echo                     first = false;
echo                 }
echo.
echo                 json.append("]}");
echo                 rs.close();
echo                 stmt.close();
echo.
echo                 sendResponse(exchange, 200, json.toString());
echo             } catch (SQLException e) {
echo                 sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"数据库错误: " + e.getMessage() + "\"}");
echo             } catch (Exception e) {
echo                 sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"服务器错误: " + e.getMessage() + "\"}");
echo             }
echo         }
echo     }
echo.
echo     static class HomeHandler implements HttpHandler {
echo         @Override
echo         public void handle(HttpExchange exchange) throws IOException {
echo             String response = "<!DOCTYPE html>" +
echo                 "<html>" +
echo                 "<head>" +
echo                 "<title>简历网站留言后端API</title>" +
echo                 "<meta charset=\"UTF-8\">" +
echo                 "<style>" +
echo                 "body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
echo                 "h1 { color: #333; }" +
echo                 ".api { background-color: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }" +
echo                 "code { background-color: #eee; padding: 2px 4px; border-radius: 3px; }" +
echo                 "</style>" +
echo                 "</head>" +
echo                 "<body>" +
echo                 "<h1>简历网站留言后端API</h1>" +
echo                 "<h2>接口说明</h2>" +
echo                 "<div class=\"api\">" +
echo                 "<h3>提交留言</h3>" +
echo                 "<p><strong>请求地址:</strong> <code>POST /api/resume/message</code></p>" +
echo                 "<p><strong>请求格式:</strong> <code>application/json</code></p>" +
echo                 "<p><strong>请求参数:</strong></p>" +
echo                 "<ul>" +
echo                 "<li>name (必填): 姓名，最大50个字符</li>" +
echo                 "<li>email (必填): 邮箱地址，最大100个字符</li>" +
echo                 "<li>content (必填): 留言内容，最大500个字符</li>" +
echo                 "</ul>" +
echo                 "<p><strong>请求示例:</strong></p>" +
echo                 "<pre>{" +
echo                 "  \"name\": \"张三\"," +
echo                 "  \"email\": \"zhangsan@example.com\"," +
echo                 "  \"content\": \"这是一条测试留言\"" +
echo                 "}</pre>" +
echo                 "<p><strong>响应示例:</strong></p>" +
echo                 "<pre>{\"code\":200,\"msg\":\"留言提交成功\"}</pre>" +
echo                 "</div>" +
echo                 "<div class=\"api\">" +
echo                 "<h3>获取留言列表</h3>" +
echo                 "<p><strong>请求地址:</strong> <code>GET /api/resume/message/list</code></p>" +
echo                 "<p><strong>响应示例:</strong></p>" +
echo                 "<pre>{" +
echo                 "  \"code\": 200," +
echo                 "  \"data\": [" +
echo                 "    {" +
echo                 "      \"id\": 1," +
echo                 "      \"name\": \"张三\"," +
echo                 "      \"email\": \"zhangsan@example.com\"," +
echo                 "      \"content\": \"这是一条测试留言\"," +
echo                 "      \"createTime\": \"2024-01-01T12:00:00\"" +
echo                 "    }" +
echo                 "  ]" +
echo                 "}</pre>" +
echo                 "</div>" +
echo                 "</body>" +
echo                 "</html>";
echo.
echo             exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
echo             exchange.sendResponseHeaders(200, response.getBytes("UTF-8").length);
echo             OutputStream os = exchange.getResponseBody();
echo             os.write(response.getBytes("UTF-8"));
echo             os.close();
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
echo     private static String escapeJson(String str) {
echo         if (str == null) return "";
echo         return str.replace("\\", "\\\\")
echo                   .replace("\"", "\\\"")
echo                   .replace("\n", "\\n")
echo                   .replace("\r", "\\r")
echo                   .replace("\t", "\\t");
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
) > target\classes\com\resume\message\StandaloneMessageApplication.java

:: 重新编译简化版应用
javac -d target\classes target\classes\com\resume\message\StandaloneMessageApplication.java

:: 创建MANIFEST.MF
(
echo Manifest-Version: 1.0
echo Main-Class: com.resume.message.StandaloneMessageApplication
echo Class-Path: .
) > target\MANIFEST.MF

:: 创建JAR文件
cd target
jar cvfm resume-message-backend.jar MANIFEST.MF -C classes .
cd ..

:: 创建运行脚本
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

:: 创建后台运行脚本（双击版本）
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
copy message-list.html target\

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