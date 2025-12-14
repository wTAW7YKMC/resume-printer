package com.resume.message;

import java.io.*;
import java.net.*;
import java.sql.*;
import java.text.*;
import java.util.*;
import com.sun.net.httpserver.*;

public class StandaloneMessageApplication {
    private static Connection connection;
    private static final String DB_URL = "jdbc:sqlserver://LAPTOP-0M4DC4I9:1433;DatabaseName=resume_message;IntegratedSecurity=true;encrypt=false;trustServerCertificate=true;";
    private static final String DB_USER = null;
    private static final String DB_PASSWORD = null;

    public static void main(String[] args) throws Exception {
        System.out.println("=================================");
        System.out.println("    简历网站留言后端服务");
        System.out.println("=================================");
        System.out.println("正在初始化数据库连接...");

        // 初始化数据库连接
        try {
            initDatabase();
            System.out.println("数据库连接成功！");
        } catch (Exception e) {
            System.err.println("数据库连接失败: " + e.getMessage());
            System.err.println("请确保:");
            System.err.println("1. SQL Server正在运行");
            System.err.println("2. 已创建resume_message数据库");
            System.err.println("3. 已执行create_table.sql创建message表");
            System.err.println("");
            System.err.println("按任意键退出...");
            System.in.read();
            return;
        }

        // 创建HTTP服务器
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
            server.createContext("/api/resume/message", new MessageHandler());
            server.createContext("/api/resume/message/list", new MessageListHandler());
            server.createContext("/", new HomeHandler());
            server.setExecutor(null);
            server.start();

            System.out.println("服务已启动，端口: 8080");
            System.out.println("API接口:");
            System.out.println("  POST /api/resume/message - 提交留言");
            System.out.println("  GET  /api/resume/message/list - 获取留言列表");
            System.out.println("  GET  / - 查看API说明");
            System.out.println("");
            System.out.println("按Ctrl+C停止服务");
        } catch (Exception e) {
            System.err.println("服务器启动失败: " + e.getMessage());
            System.err.println("按任意键退出...");
            System.in.read();
        }
    }

    private static void initDatabase() throws Exception {
        // 尝试加载SQL Server驱动
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException e) {
            throw new Exception("未找到SQL Server JDBC驱动，请确保已安装SQL Server");
        }

        // 使用Windows身份验证连接数据库
        try {
            connection = DriverManager.getConnection(DB_URL);
        } catch (SQLException e) {
            throw new Exception("Windows身份验证失败: " + e.getMessage() + 
                              "\n请确保:\n" +
                              "1. SQL Server已启用Windows身份验证\n" +
                              "2. 当前Windows用户(LAPTOP-0M4DC4I9\\HONOR)有访问resume_message数据库的权限\n" +
                              "3. JDBC驱动支持Windows身份验证");
        }
    }

    static class MessageHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // 处理CORS预检请求
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"code\":405,\"msg\":\"不支持的请求方法\"}");
                return;
            }

            try {
                // 读取请求体
                InputStream requestBody = exchange.getRequestBody();
                String body = new String(requestBody.readAllBytes(), "UTF-8");

                // 简单解析JSON
                String name = extractValue(body, "name");
                String email = extractValue(body, "email");
                String content = extractValue(body, "content");

                // 验证输入
                if (name == null || name.trim().isEmpty()) {
                    sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"姓名不能为空\"}");
                    return;
                }

                if (email == null || email.trim().isEmpty() || !email.contains("@")) {
                    sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"请输入有效的邮箱地址\"}");
                    return;
                }

                if (content == null || content.trim().isEmpty()) {
                    sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"留言内容不能为空\"}");
                    return;
                }

                if (content.length() > 500) {
                    sendResponse(exchange, 400, "{\"code\":400,\"msg\":\"留言内容不能超过500个字符\"}");
                    return;
                }

                // 插入数据库
                String sql = "INSERT INTO message (name, email, content) VALUES (?, ?, ?)";
                PreparedStatement stmt = connection.prepareStatement(sql);
                stmt.setString(1, name.trim());
                stmt.setString(2, email.trim());
                stmt.setString(3, content.trim());
                stmt.executeUpdate();
                stmt.close();

                sendResponse(exchange, 200, "{\"code\":200,\"msg\":\"留言提交成功\"}");
            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"数据库错误: " + e.getMessage() + "\"}");
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"服务器错误: " + e.getMessage() + "\"}");
            }
        }
    }

    static class MessageListHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // 处理CORS预检请求
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            if (!"GET".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"code\":405,\"msg\":\"不支持的请求方法\"}");
                return;
            }

            try {
                String sql = "SELECT id, name, email, content, createTime FROM message ORDER BY createTime DESC";
                Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(sql);

                StringBuilder json = new StringBuilder();
                json.append("{\"code\":200,\"data\":[");
                boolean first = true;

                while (rs.next()) {
                    if (!first) json.append(",");
                    json.append("{");
                    json.append("\"id\":").append(rs.getInt("id")).append(",");
                    json.append("\"name\":\"").append(escapeJson(rs.getString("name"))).append("\",");
                    json.append("\"email\":\"").append(escapeJson(rs.getString("email"))).append("\",");
                    json.append("\"content\":\"").append(escapeJson(rs.getString("content"))).append("\",");
                    
                    // 格式化时间
                    Timestamp timestamp = rs.getTimestamp("createTime");
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                    json.append("\"createTime\":\"").append(sdf.format(timestamp)).append("\"");
                    json.append("}");
                    first = false;
                }

                json.append("]}");
                rs.close();
                stmt.close();

                sendResponse(exchange, 200, json.toString());
            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"数据库错误: " + e.getMessage() + "\"}");
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"code\":500,\"msg\":\"服务器错误: " + e.getMessage() + "\"}");
            }
        }
    }

    static class HomeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<title>简历网站留言后端API</title>" +
                "<meta charset=\"UTF-8\">" +
                "<style>" +
                "body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }" +
                "h1 { color: #333; }" +
                ".api { background-color: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }" +
                "code { background-color: #eee; padding: 2px 4px; border-radius: 3px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<h1>简历网站留言后端API</h1>" +
                "<h2>接口说明</h2>" +
                "<div class=\"api\">" +
                "<h3>提交留言</h3>" +
                "<p><strong>请求地址:</strong> <code>POST /api/resume/message</code></p>" +
                "<p><strong>请求格式:</strong> <code>application/json</code></p>" +
                "<p><strong>请求参数:</strong></p>" +
                "<ul>" +
                "<li>name (必填): 姓名，最大50个字符</li>" +
                "<li>email (必填): 邮箱地址，最大100个字符</li>" +
                "<li>content (必填): 留言内容，最大500个字符</li>" +
                "</ul>" +
                "<p><strong>请求示例:</strong></p>" +
                "<pre>{" +
                "  \"name\": \"张三\"," +
                "  \"email\": \"zhangsan@example.com\"," +
                "  \"content\": \"这是一条测试留言\"" +
                "}</pre>" +
                "<p><strong>响应示例:</strong></p>" +
                "<pre>{\"code\":200,\"msg\":\"留言提交成功\"}</pre>" +
                "</div>" +
                "<div class=\"api\">" +
                "<h3>获取留言列表</h3>" +
                "<p><strong>请求地址:</strong> <code>GET /api/resume/message/list</code></p>" +
                "<p><strong>响应示例:</strong></p>" +
                "<pre>{" +
                "  \"code\": 200," +
                "  \"data\": [" +
                "    {" +
                "      \"id\": 1," +
                "      \"name\": \"张三\"," +
                "      \"email\": \"zhangsan@example.com\"," +
                "      \"content\": \"这是一条测试留言\"," +
                "      \"createTime\": \"2024-01-01T12:00:00\"" +
                "    }" +
                "  ]" +
                "}</pre>" +
                "</div>" +
                "</body>" +
                "</html>";

            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, response.getBytes("UTF-8").length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes("UTF-8"));
            os.close();
        }
    }

    private static String extractValue(String json, String key) {
        String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.sendResponseHeaders(statusCode, response.getBytes("UTF-8").length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes("UTF-8"));
        os.close();
    }
}