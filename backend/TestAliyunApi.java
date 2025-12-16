import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * 测试阿里云API接口连通性
 */
public class TestAliyunApi {
    public static void main(String[] args) {
        try {
            // 阿里云函数计算URL
            String urlStr = "https://message-server-uutepmlola.cn-hangzhou.fcapp.run/api/resume/message/list";
            
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
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
            conn.setRequestProperty("Connection", "keep-alive");
            
            // 不设置Authorization头，尝试空授权
            
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
                    response.append(line);
                }
                reader.close();
                
                System.out.println("阿里云API响应成功:");
                System.out.println(response.toString());
            } else {
                System.out.println("阿里云API响应失败");
                
                // 尝试读取错误响应
                try {
                    BufferedReader errorReader = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream()));
                    String errorLine;
                    StringBuilder errorResponse = new StringBuilder();
                    
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorResponse.append(errorLine);
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