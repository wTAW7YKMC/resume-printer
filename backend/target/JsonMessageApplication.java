package com.resume.message;

import java.io.*;
import java.net.*;
import java.text.*;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import com.sun.net.httpserver.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

public class JsonMessageApplication {
    private static final String MESSAGES_FILE = "messages.json";
    private static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            .setPrettyPrinting()
            .create();
    private static final ReentrantReadWriteLock fileLock = new ReentrantReadWriteLock();
    
    // 留言数据模型
    public static class Message {
        private int id;
        private String name;
        private String email;
        private String content;
        private String createTime;
        
        public Message() {}
        
        public Message(int id, String name, String email, String content, String createTime) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.content = content;
            this.createTime = createTime;
        }
        
        // Getters and setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public String getCreateTime() { return createTime; }
        public void setCreateTime(String createTime) { this.createTime = createTime; }
    }
    
    // API响应模型
    public static class ApiResponse<T> {
        private int code;
        private String msg;
        private T data;
        
        public ApiResponse() {}
        
        public ApiResponse(int code, String msg) {
            this.code = code;
            this.msg = msg;
        }
        
        public ApiResponse(int code, String msg, T data) {
            this.code = code;
            this.msg = msg;
            this.data = data;
        }
        
        // Getters and setters
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }
        
        public String getMsg() { return msg; }
        public void setMsg(String msg) { this.msg = msg; }
        
        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=================================");
        System.out.println("    简历网站留言后端服务");
        System.out.println("       (JSON文件存储版)");
        System.out.println("=================================");
        
        // 初始化消息文件
        initMessagesFile();
        System.out.println("消息存储初始化完成！");

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
    
    // 初始化消息文件
    private static void initMessagesFile() {
        fileLock.writeLock().lock();
        try {
            File file = new File(MESSAGES_FILE);
            if (!file.exists()) {
                // 创建空的消息列表
                List<Message> messages = new ArrayList<>();
                saveMessagesToFile(messages);
                System.out.println("已创建新的消息文件: " + MESSAGES_FILE);
            } else {
                System.out.println("消息文件已存在: " + MESSAGES_FILE);
            }
        } catch (Exception e) {
            System.err.println("初始化消息文件失败: " + e.getMessage());
        } finally {
            fileLock.writeLock().unlock();
        }
    }
    
    // 从文件加载消息
    private static List<Message> loadMessagesFromFile() {
        fileLock.readLock().lock();
        try {
            File file = new File(MESSAGES_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            
            try (FileReader reader = new FileReader(file)) {
                List<Message> messages = gson.fromJson(reader, 
                    new TypeToken<List<Message>>(){}.getType());
                return messages != null ? messages : new ArrayList<>();
            }
        } catch (Exception e) {
            System.err.println("加载消息文件失败: " + e.getMessage());
            return new ArrayList<>();
        } finally {
            fileLock.readLock().unlock();
        }
    }
    
    // 保存消息到文件
    private static void saveMessagesToFile(List<Message> messages) {
        fileLock.writeLock().lock();
        try (FileWriter writer = new FileWriter(MESSAGES_FILE)) {
            gson.toJson(messages, writer);
        } catch (Exception e) {
            System.err.println("保存消息文件失败: " + e.getMessage());
        } finally {
            fileLock.writeLock().unlock();
        }
    }
    
    // 生成下一个消息ID
    private static int getNextId(List<Message> messages) {
        return messages.stream()
                .mapToInt(Message::getId)
                .max()
                .orElse(0) + 1;
    }
    
    // 获取当前时间字符串
    private static String getCurrentTime() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        return sdf.format(new Date());
    }
    
    // 处理提交留言请求
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
                sendResponse(exchange, 405, gson.toJson(new ApiResponse<>(405, "不支持的请求方法")));
                return;
            }

            try {
                // 读取请求体
                InputStream inputStream = exchange.getRequestBody();
                String requestBody = new String(inputStream.readAllBytes(), "UTF-8");
                
                // 解析JSON
                Message newMessage = gson.fromJson(requestBody, Message.class);
                
                // 验证必填字段
                if (newMessage.getName() == null || newMessage.getName().trim().isEmpty() ||
                    newMessage.getEmail() == null || newMessage.getEmail().trim().isEmpty() ||
                    newMessage.getContent() == null || newMessage.getContent().trim().isEmpty()) {
                    sendResponse(exchange, 400, gson.toJson(new ApiResponse<>(400, "姓名、邮箱和内容不能为空")));
                    return;
                }
                
                // 加载现有消息
                List<Message> messages = loadMessagesFromFile();
                
                // 创建新消息
                Message message = new Message();
                message.setId(getNextId(messages));
                message.setName(newMessage.getName().trim());
                message.setEmail(newMessage.getEmail().trim());
                message.setContent(newMessage.getContent().trim());
                message.setCreateTime(getCurrentTime());
                
                // 添加到列表并保存
                messages.add(message);
                saveMessagesToFile(messages);
                
                // 返回成功响应
                sendResponse(exchange, 200, gson.toJson(new ApiResponse<>(200, "留言提交成功")));
                
            } catch (Exception e) {
                sendResponse(exchange, 500, gson.toJson(new ApiResponse<>(500, "服务器内部错误: " + e.getMessage())));
            }
        }
    }
    
    // 处理获取留言列表请求
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
                sendResponse(exchange, 405, gson.toJson(new ApiResponse<>(405, "不支持的请求方法")));
                return;
            }

            try {
                // 加载消息列表
                List<Message> messages = loadMessagesFromFile();
                
                // 按创建时间倒序排列
                messages.sort((a, b) -> b.getCreateTime().compareTo(a.getCreateTime()));
                
                // 返回响应
                ApiResponse<List<Message>> response = new ApiResponse<>(200, "获取成功", messages);
                sendResponse(exchange, 200, gson.toJson(response));
                
            } catch (Exception e) {
                sendResponse(exchange, 500, gson.toJson(new ApiResponse<>(500, "服务器内部错误: " + e.getMessage())));
            }
        }
    }
    
    // 处理首页请求
    static class HomeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, gson.toJson(new ApiResponse<>(405, "不支持的请求方法")));
                return;
            }

            String html = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "    <title>简历留言后端API</title>\n" +
                    "    <meta charset=\"UTF-8\">\n" +
                    "    <style>\n" +
                    "        body { font-family: Arial, sans-serif; margin: 40px; }\n" +
                    "        h1 { color: #333; }\n" +
                    "        .endpoint { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }\n" +
                    "        .method { display: inline-block; padding: 5px 10px; color: white; border-radius: 3px; font-weight: bold; }\n" +
                    "        .get { background-color: #61affe; }\n" +
                    "        .post { background-color: #49cc90; }\n" +
                    "        pre { background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }\n" +
                    "    </style>\n" +
                    "</head>\n" +
                    "<body>\n" +
                    "    <h1>简历留言后端API (JSON文件存储版)</h1>\n" +
                    "    <p>这是一个基于JSON文件存储的留言系统后端服务。</p>\n" +
                    "    \n" +
                    "    <div class=\"endpoint\">\n" +
                    "        <h3><span class=\"method post\">POST</span> /api/resume/message</h3>\n" +
                    "        <p>提交留言</p>\n" +
                    "        <h4>请求参数:</h4>\n" +
                    "        <pre>{\n" +
                    "  \"name\": \"张三\",\n" +
                    "  \"email\": \"zhangsan@example.com\",\n" +
                    "  \"content\": \"这是一条测试留言\"\n" +
                    "}</pre>\n" +
                    "        <h4>响应示例:</h4>\n" +
                    "        <pre>{\"code\":200,\"msg\":\"留言提交成功\"}</pre>\n" +
                    "    </div>\n" +
                    "    \n" +
                    "    <div class=\"endpoint\">\n" +
                    "        <h3><span class=\"method get\">GET</span> /api/resume/message/list</h3>\n" +
                    "        <p>获取留言列表</p>\n" +
                    "        <h4>响应示例:</h4>\n" +
                    "        <pre>{\n" +
                    "  \"code\": 200,\n" +
                    "  \"msg\": \"获取成功\",\n" +
                    "  \"data\": [\n" +
                    "    {\n" +
                    "      \"id\": 1,\n" +
                    "      \"name\": \"张三\",\n" +
                    "      \"email\": \"zhangsan@example.com\",\n" +
                    "      \"content\": \"这是一条测试留言\",\n" +
                    "      \"createTime\": \"2024-01-01T12:00:00\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}</pre>\n" +
                    "    </div>\n" +
                    "    \n" +
                    "    <p><strong>注意:</strong> 所有留言数据存储在本地文件 <code>messages.json</code> 中</p>\n" +
                    "</body>\n" +
                    "</html>";
            
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            sendResponse(exchange, 200, html);
        }
    }
    
    // 发送HTTP响应
    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        byte[] responseBytes = response.getBytes("UTF-8");
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }
}