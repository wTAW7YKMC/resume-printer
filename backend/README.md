# 个人简历网站留言功能后端

这是一个基于Spring Boot 3.x + SQL Server 2022的留言功能后端系统，专为个人简历网站设计，提供完整的留言存储和查询功能。

## 技术栈

- **后端框架**: Spring Boot 3.2.0
- **数据库**: SQL Server 2022
- **ORM框架**: Spring Data JPA
- **构建工具**: Maven
- **验证框架**: Spring Boot Validation
- **Java版本**: JDK 17

## 项目结构

```
backend/
├── pom.xml                              # Maven配置文件
├── create_table.sql                      # SQL Server建表语句
├── message-list.html                     # 后台留言查看页面
└── src/
    ├── main/
    │   ├── java/com/resume/message/
    │   │   ├── MessageApplication.java   # 主应用程序类
    │   │   ├── config/
    │   │   │   └── CorsConfig.java       # 跨域配置
    │   │   ├── controller/
    │   │   │   └── MessageController.java # REST API控制器
    │   │   ├── exception/
    │   │   │   └── GlobalExceptionHandler.java # 全局异常处理器
    │   │   ├── model/
    │   │   │   └── Message.java          # 留言实体类
    │   │   ├── repository/
    │   │   │   └── MessageRepository.java # 数据访问层
    │   │   └── service/
    │   │       ├── MessageService.java   # 服务接口
    │   │       └── MessageServiceImpl.java # 服务实现
    │   └── resources/
    │       └── application.properties    # 应用配置文件
    └── test/                              # 测试目录
```

## API接口

### 1. 提交留言

- **接口地址**: `POST /api/resume/message`
- **请求格式**: JSON
- **请求参数**:
  ```json
  {
    "name": "张三",
    "email": "zhangsan@example.com",
    "content": "这是留言内容"
  }
  ```
- **成功响应**:
  ```json
  {
    "code": 200,
    "msg": "留言成功",
    "data": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "content": "这是留言内容",
      "createTime": "2024-01-01T12:00:00"
    }
  }
  ```
- **失败响应**:
  ```json
  {
    "code": 400,
    "msg": "参数验证失败",
    "errors": {
      "email": "邮箱格式不正确"
    }
  }
  ```

### 2. 获取留言列表

- **接口地址**: `GET /api/resume/message/list`
- **请求参数**: 无
- **成功响应**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": 2,
        "name": "李四",
        "email": "lisi@example.com",
        "content": "第二条留言",
        "createTime": "2024-01-01T13:00:00"
      },
      {
        "id": 1,
        "name": "张三",
        "email": "zhangsan@example.com",
        "content": "这是留言内容",
        "createTime": "2024-01-01T12:00:00"
      }
    ]
  }
  ```

## 本地开发环境搭建

### 1. 环境要求

- JDK 17 或更高版本
- Maven 3.6 或更高版本
- SQL Server 2022
- IDE (推荐 IntelliJ IDEA 或 Eclipse)

### 2. 数据库配置

1. 在SQL Server中创建数据库：
   ```sql
   CREATE DATABASE resume_message;
   ```

2. 执行`create_table.sql`文件创建message表：
   ```sql
   -- 在SSMS中打开并执行create_table.sql文件
   ```

3. 修改`src/main/resources/application.properties`中的数据库连接信息：
   ```properties
   spring.datasource.url=jdbc:sqlserver://LAPTOP-0M4DC4I9:1433;databaseName=resume_message;encrypt=false;trustServerCertificate=true;
   spring.datasource.username=HONOR
   # spring.datasource.password= (无密码)
   ```

### 3. 运行项目

1. 克隆或下载项目到本地
2. 在项目根目录执行Maven命令：
   ```bash
   mvn clean install
   ```

3. 运行应用程序：
   ```bash
   mvn spring-boot:run
   ```

4. 或者在IDE中直接运行`MessageApplication.java`主类

5. 应用程序将在`http://localhost:8080`启动

### 4. 测试API接口

可以使用Postman、curl或其他API测试工具测试接口：

1. 测试提交留言：
   ```bash
   curl -X POST http://localhost:8080/api/resume/message \
   -H "Content-Type: application/json" \
   -d '{"name":"测试用户","email":"test@example.com","content":"这是一条测试留言"}'
   ```

2. 测试获取留言列表：
   ```bash
   curl http://localhost:8080/api/resume/message/list
   ```

### 5. 查看留言

打开`message-list.html`文件，或在浏览器中访问该文件，可以查看所有留言记录。

## 云部署指南 (Render平台)

### 1. 准备工作

1. 将项目代码推送到GitHub仓库
2. 注册并登录Render账户

### 2. 配置数据库

1. 在Render控制台创建新的SQL Server实例
2. 记录数据库连接信息（主机、端口、数据库名、用户名、密码）

### 3. 部署应用

1. 在Render控制台创建新的Web Service
2. 连接GitHub仓库
3. 配置构建环境：
   - Build Command: `mvn clean install`
   - Start Command: `java -jar target/message-backend-1.0.0.jar`
4. 添加环境变量：
   - `DATABASE_URL`: 完整的数据库连接字符串
   - `DATABASE_USERNAME`: 数据库用户名
   - `DATABASE_PASSWORD`: 数据库密码
5. 修改`application.properties`以使用环境变量：
   ```properties
   spring.datasource.url=${DATABASE_URL}
   spring.datasource.username=${DATABASE_USERNAME}
   spring.datasource.password=${DATABASE_PASSWORD}
   ```

### 4. 配置跨域

如果前端部署在GitHub Pages，确保后端允许跨域访问。项目已配置允许所有来源的跨域请求。

### 5. 测试部署

部署完成后，使用Render提供的URL测试API接口。

## 常见问题

### 1. 数据库连接失败

- 检查SQL Server服务是否启动
- 确认数据库连接信息是否正确
- 检查防火墙设置，确保端口1433可访问

### 2. 跨域问题

- 确认后端已正确配置CORS
- 检查前端请求URL是否正确

### 3. 验证失败

- 确认请求体格式正确
- 检查必填字段是否提供
- 验证邮箱格式是否正确

## 更新日志

- **v1.0.0** (2024-01-01): 初始版本，支持基本的留言提交和查询功能

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: your-email@example.com
- GitHub: https://github.com/your-username/resume-message-backend

## 许可证

本项目采用 MIT 许可证。详情请参阅 LICENSE 文件。