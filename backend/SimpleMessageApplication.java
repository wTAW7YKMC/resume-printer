package com.resume.message;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.*;

public class SimpleMessageApplication {
    private static final int PORT = 9000;
    private static final String MESSAGES_FILE = "messages.json";
    // 内存存储留言列表，用于阿里云函数计算环境
    private static List<Message> memoryMessages = null;
    
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        // 创建上下文，处理不同的API路径
        server.createContext("/", new HomeHandler());
        server.createContext("/messages", new MessageApiHandler()); // 处理GET和POST请求
        
        server.setExecutor(null);
        server.start();
        System.out.println("Server started on port " + PORT);
    }
    
    // 首页处理器
    static class HomeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "留言服务运行中";
            exchange.sendResponseHeaders(200, response.getBytes().length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }
    
    // 留言API处理器 - 处理GET和POST请求
    static class MessageApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // 设置CORS头
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
            
            // 处理OPTIONS预检请求
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            if ("GET".equals(exchange.getRequestMethod())) {
                // 处理获取留言列表请求
                handleGetMessages(exchange);
            } else if ("POST".equals(exchange.getRequestMethod())) {
                // 处理添加留言请求
                handleAddMessage(exchange);
            } else {
                exchange.sendResponseHeaders(405, 0); // Method Not Allowed
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(new byte[0]);
                }
            }
        }
        
        private void handleGetMessages(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            
            try {
                List<Message> messages = loadMessages();
                String response = "{\"code\":200,\"message\":\"获取成功\",\"data\":" + messagesToJson(messages) + "}";
                
                exchange.sendResponseHeaders(200, response.getBytes("UTF-8").length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes("UTF-8"));
                }
            } catch (Exception e) {
                e.printStackTrace();
                String response = "{\"code\":500,\"message\":\"服务器错误\",\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}";
                
                exchange.sendResponseHeaders(500, response.getBytes("UTF-8").length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes("UTF-8"));
                }
            }
        }
        
        private void handleAddMessage(HttpExchange exchange) throws IOException {
            try {
                // 读取请求体
                StringBuilder requestBodyBuilder = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(exchange.getRequestBody(), "UTF-8"))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        requestBodyBuilder.append(line).append("\n");
                    }
                }
                String requestBody = requestBodyBuilder.toString();
                
                // 解析请求JSON
                Map<String, String> requestMap = parseJsonToMap(requestBody);
                
                // 获取参数
                String name = requestMap.get("name");
                String email = requestMap.get("email");
                String content = requestMap.get("content");
                
                // 参数验证
                if (name == null || name.trim().isEmpty() || 
                    email == null || email.trim().isEmpty() || 
                    content == null || content.trim().isEmpty()) {
                    sendJsonResponse(exchange, 400, "{\"code\":400,\"message\":\"参数不能为空\"}");
                    return;
                }
                
                // 创建留言对象
                Message message = new Message();
                message.setId(String.valueOf(System.currentTimeMillis()));
                message.setName(name.trim());
                message.setEmail(email.trim());
                message.setContent(content.trim());
                message.setCreateTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                
                // 读取现有留言
                List<Message> messages = loadMessages();
                
                // 添加新留言
                messages.add(0, message);  // 添加到列表开头
                
                // 限制留言数量
                if (messages.size() > 100) {
                    messages = messages.subList(0, 100);
                }
                
                // 保存留言
                saveMessages(messages);
                
                // 返回成功响应
                sendJsonResponse(exchange, 200, "{\"code\":200,\"message\":\"留言成功\"}");
                
            } catch (Exception e) {
                e.printStackTrace();
                sendJsonResponse(exchange, 500, "{\"code\":500,\"message\":\"服务器错误\",\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
            }
        }
    }
    
    // 发送JSON响应
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(statusCode, response.getBytes("UTF-8").length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes("UTF-8"));
        }
    }
    
    // 加载留言列表
    private static List<Message> loadMessages() {
        // 如果内存中已有数据，直接返回
        if (memoryMessages != null) {
            return memoryMessages;
        }
        
        try {
            // 尝试从文件加载
            if (Files.exists(Paths.get(MESSAGES_FILE))) {
                String content = new String(Files.readAllBytes(Paths.get(MESSAGES_FILE)), "UTF-8");
                memoryMessages = jsonToMessages(content);
                return memoryMessages;
            }
        } catch (Exception e) {
            // 文件读取失败，继续使用内存初始化
            System.err.println("无法从文件加载留言，将使用内存初始化: " + e.getMessage());
        }
        
        // 初始化内存中的默认留言
        memoryMessages = new ArrayList<>();
        Message defaultMessage = new Message();
        defaultMessage.setId("1");
        defaultMessage.setName("系统");
        defaultMessage.setEmail("system@resume.com");
        defaultMessage.setContent("欢迎使用留言板");
        defaultMessage.setCreateTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        memoryMessages.add(defaultMessage);
        
        return memoryMessages;
    }
    
    // 保存留言列表
    private static void saveMessages(List<Message> messages) throws IOException {
        // 更新内存中的留言列表
        memoryMessages = new ArrayList<>(messages);
        
        // 尝试保存到文件（本地环境使用）
        try {
            String json = messagesToJson(messages);
            Files.write(Paths.get(MESSAGES_FILE), json.getBytes("UTF-8"), 
                       StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (Exception e) {
            // 文件写入失败，但不影响内存存储
            System.err.println("无法保存留言到文件，但数据已保存在内存中: " + e.getMessage());
        }
    }
    
    // 将留言列表转换为JSON字符串
    private static String messagesToJson(List<Message> messages) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < messages.size(); i++) {
            if (i > 0) {
                json.append(",");
            }
            json.append(messageToJson(messages.get(i)));
        }
        json.append("]");
        return json.toString();
    }
    
    // 将单个留言转换为JSON字符串
    private static String messageToJson(Message message) {
        return "{" +
               "\"id\":\"" + escapeJson(message.getId()) + "\"," +
               "\"name\":\"" + escapeJson(message.getName()) + "\"," +
               "\"email\":\"" + escapeJson(message.getEmail()) + "\"," +
               "\"content\":\"" + escapeJson(message.getContent()) + "\"," +
               "\"createTime\":\"" + escapeJson(message.getCreateTime()) + "\"" +
               "}";
    }
    
    // 将JSON字符串转换为留言列表
    private static List<Message> jsonToMessages(String json) {
        List<Message> messages = new ArrayList<>();
        
        // 简单解析JSON数组
        Pattern pattern = Pattern.compile("\\{([^}]*)\\}");
        Matcher matcher = pattern.matcher(json);
        
        while (matcher.find()) {
            String messageJson = "{" + matcher.group(1) + "}";
            Message message = jsonToMessage(messageJson);
            if (message != null) {
                messages.add(message);
            }
        }
        
        return messages;
    }
    
    // 将JSON字符串转换为单个留言
    private static Message jsonToMessage(String json) {
        try {
            Message message = new Message();
            
            // 简单解析JSON对象
            Pattern idPattern = Pattern.compile("\"id\":\"([^\"]*)\"");
            Pattern namePattern = Pattern.compile("\"name\":\"([^\"]*)\"");
            Pattern emailPattern = Pattern.compile("\"email\":\"([^\"]*)\"");
            Pattern contentPattern = Pattern.compile("\"content\":\"([^\"]*)\"");
            Pattern createTimePattern = Pattern.compile("\"createTime\":\"([^\"]*)\"");
            
            Matcher idMatcher = idPattern.matcher(json);
            if (idMatcher.find()) {
                message.setId(idMatcher.group(1));
            }
            
            Matcher nameMatcher = namePattern.matcher(json);
            if (nameMatcher.find()) {
                message.setName(nameMatcher.group(1));
            }
            
            Matcher emailMatcher = emailPattern.matcher(json);
            if (emailMatcher.find()) {
                message.setEmail(emailMatcher.group(1));
            }
            
            Matcher contentMatcher = contentPattern.matcher(json);
            if (contentMatcher.find()) {
                message.setContent(contentMatcher.group(1));
            }
            
            Matcher createTimeMatcher = createTimePattern.matcher(json);
            if (createTimeMatcher.find()) {
                message.setCreateTime(createTimeMatcher.group(1));
            }
            
            return message;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    // 将JSON字符串转换为Map
    private static Map<String, String> parseJsonToMap(String json) {
        Map<String, String> map = new HashMap<>();
        
        // 简单解析JSON对象
        Pattern pattern = Pattern.compile("\"([^\"]*)\":\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        
        while (matcher.find()) {
            map.put(matcher.group(1), matcher.group(2));
        }
        
        return map;
    }
    
    // 转义JSON字符串中的特殊字符
    private static String escapeJson(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
    
    // 留言实体类
    static class Message {
        private String id;
        private String name;
        private String email;
        private String content;
        private String createTime;
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public String getCreateTime() { return createTime; }
        public void setCreateTime(String createTime) { this.createTime = createTime; }
    }
}