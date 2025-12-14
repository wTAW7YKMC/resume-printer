import java.sql.*;

public class TestConnection {
    public static void main(String[] args) {
        String url = "jdbc:sqlserver://LAPTOP-0M4DC4I9:1433;DatabaseName=resume_message;encrypt=false;trustServerCertificate=true;";
        String user = "sa";
        String password = "123456";
        
        try {
            System.out.println("正在尝试连接SQL Server...");
            System.out.println("URL: " + url);
            System.out.println("用户: " + user);
            
            // 加载驱动
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            
            // 尝试连接
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("数据库连接成功！");
            
            // 测试查询
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT @@VERSION");
            if (rs.next()) {
                System.out.println("SQL Server版本: " + rs.getString(1).substring(0, Math.min(100, rs.getString(1).length())) + "...");
            }
            
            // 检查表是否存在
            rs = stmt.executeQuery("SELECT COUNT(*) FROM sys.tables WHERE name = 'message'");
            if (rs.next() && rs.getInt(1) > 0) {
                System.out.println("message表已存在");
            } else {
                System.out.println("message表不存在，需要创建");
            }
            
            conn.close();
            System.out.println("测试完成，连接已关闭");
        } catch (ClassNotFoundException e) {
            System.out.println("错误: 未找到JDBC驱动");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("错误: SQL连接失败");
            System.out.println("错误代码: " + e.getErrorCode());
            System.out.println("SQL状态: " + e.getSQLState());
            System.out.println("错误信息: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println("错误: " + e.getMessage());
            e.printStackTrace();
        }
    }
}