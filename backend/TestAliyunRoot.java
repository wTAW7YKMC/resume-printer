import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * 测试阿里云函数计算根路径访问
 */
public class TestAliyunRoot {
    public static void main(String[] args) {
        try {
            // 阿里云函数计算根URL
            String urlStr = "https://message-server-uutepmlola.cn-hangzhou.fcapp.run/";
            
            // 创建URL连接
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            // 设置请求方法为GET
            conn.setRequestMethod("GET");
            
            // 创建英文Date格式的字符串
            SimpleDateFormat dateFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
            dateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
            String dateString = dateFormat.format(new Date());
            
            // 设置请求头，模拟浏览器请求
            conn.setRequestProperty("Date", dateString);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            conn.setRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
            conn.setRequestProperty("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
            conn.setRequestProperty("Connection", "keep-alive");
            conn.setRequestProperty("Upgrade-Insecure-Requests", "1");
            conn.setRequestProperty("Sec-Fetch-Dest", "document");
            conn.setRequestProperty("Sec-Fetch-Mode", "navigate");
            conn.setRequestProperty("Sec-Fetch-Site", "none");
            conn.setRequestProperty("Cache-Control", "max-age=0");
            
            // 设置连接超时和读取超时
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            
            // 获取响应码
            int responseCode = conn.getResponseCode();
            System.out.println("响应码: " + responseCode);
            
            if (responseCode == 200) {
                // 读取响应
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String line;
                StringBuilder response = new StringBuilder();
                
                while ((line = reader.readLine()) != null) {
                    response.append(line).append("\n");
                }
                reader.close();
                
                System.out.println("阿里云根路径响应成功:");
                System.out.println(response.toString());
            } else {
                System.out.println("阿里云根路径响应失败");
                
                // 尝试读取错误响应
                try {
                    BufferedReader errorReader = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream()));
                    String errorLine;
                    StringBuilder errorResponse = new StringBuilder();
                    
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorResponse.append(errorLine).append("\n");
                    }
                    errorReader.close();
                    
                    System.out.println("错误响应内容:");
                    System.out.println(errorResponse.toString());
                } catch (Exception e) {
                    System.out.println("无法读取错误响应: " + e.getMessage());
                }
            }
            
            // 断开连接
            conn.disconnect();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}