# 简历网站留言后端 - 运行说明

## JAR包信息

**JAR包位置**: `f:\数智编程\resume printer\backend\target\resume-message-backend.jar`

**JAR包大小**: 3,294 字节

## 运行前准备

### 1. 安装Java环境
确保已安装Java 17或更高版本，并设置了JAVA_HOME环境变量。

### 2. 安装SQL Server JDBC驱动
由于JAR包不包含SQL Server JDBC驱动，您需要下载并添加驱动：

1. 下载Microsoft SQL Server JDBC驱动：
   - 访问：https://docs.microsoft.com/en-us/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server
   - 下载适合您Java版本的JAR文件（如mssql-jdbc-11.2.2.jre17.jar）

2. 将JDBC驱动JAR文件放在与`resume-message-backend.jar`相同的目录下

3. 修改运行命令，包含JDBC驱动：
   ```
   java -cp "resume-message-backend.jar;mssql-jdbc-11.2.2.jre17.jar" com.resume.message.StandaloneMessageApplication
   ```

### 3. 配置数据库
1. 确保SQL Server 2022正在运行
2. 创建名为`resume_message`的数据库
3. 执行`create_table.sql`脚本创建`message`表

## 运行方法

### 方法1：命令行运行
打开命令提示符(cmd)，切换到JAR文件所在目录，执行：

```
cd "f:\数智编程\resume printer\backend\target"
java -cp "resume-message-backend.jar;mssql-jdbc-11.2.2.jre17.jar" com.resume.message.StandaloneMessageApplication
```

### 方法2：双击运行（需要额外配置）
1. 创建批处理文件`run.bat`，内容如下：
   ```
   @echo off
   cd /d "f:\数智编程\resume printer\backend\target"
   java -cp "resume-message-backend.jar;mssql-jdbc-11.2.2.jre17.jar" com.resume.message.StandaloneMessageApplication
   pause
   ```
2. 双击`run.bat`文件运行

## 服务访问

服务启动后，您可以通过以下方式访问：

1. **API接口**：
   - 提交留言：POST http://localhost:8080/api/resume/message
   - 获取留言列表：GET http://localhost:8080/api/resume/message/list

2. **查看API说明**：
   - 浏览器访问：http://localhost:8080

## 注意事项

1. 首次运行前，请确保数据库配置正确
2. 如果端口8080被占用，可以修改Java代码中的端口号
3. 服务启动后，会在控制台显示运行状态和访问信息
4. 按Ctrl+C停止服务

## 故障排除

1. **数据库连接失败**：
   - 检查SQL Server是否运行
   - 确认数据库`resume_message`已创建
   - 确认表`message`已创建
   - 检查用户名和密码是否正确（用户名：HONOR，无密码）

2. **JDBC驱动错误**：
   - 确保JDBC驱动JAR文件路径正确
   - 确保JDBC驱动版本与Java版本兼容

3. **端口占用**：
   - 修改Java代码中的端口号（默认8080）
   - 或者停止占用8080端口的其他服务