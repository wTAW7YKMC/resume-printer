# Struts2 异常处理系统 - 使用指南

## 📋 系统概述

这是一个完整的 **Struts2 异常处理框架**，包含：

✅ **全局异常映射**（Global Exception Mappings）  
✅ **局部异常映射**（Local Exception Mappings）  
✅ **自定义异常类体系**（Custom Exception Hierarchy）  
✅ **统一错误处理Action**（Error Action）  
✅ **异常拦截器**（Exception Interceptor）  
✅ **复古打字机风格错误页面**（Themed Error Pages）

---

## 🏗️ 架构设计

### 异常处理流程图

```
用户请求 → Struts2 Filter
    ↓
Action.execute()
    ↓ (抛出异常)
ExceptionHandlingInterceptor（拦截+记录日志）
    ↓
struts.xml 异常映射匹配
    ↓
┌─────────────────────────────┐
│ 全局/局部 exception-mapping │
│  • PageNotFoundException  → 404.jsp
│  • BusinessException      → error.jsp
│  • DataLoadException       → error.jsp
│  • PDFExportException      → error.jsp
│  • java.lang.Exception     → 500.jsp
│  • SQLException            → 500.jsp
│  • NullPointerException     → 500.jsp
│  • IOException             → 500.jsp
└─────────────────────────────┘
    ↓
ErrorAction（准备错误信息）
    ↓
JSP错误页面（展示给用户）
```

---

## 📁 项目结构

```
struts/
├── pom.xml                                    # Maven配置
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/
    │   │       └── resume/
    │   │           ├── action/
    │   │           │   ├── ErrorAction.java          # 错误处理Action
    │   │           │   ├── ResumeAction.java          # 简历操作Action（示例）
    │   │           │   └── TestExceptionAction.java   # 测试异常触发
    │   │           ├── exception/
    │   │           │   ├── BusinessException.java     # 业务逻辑异常
    │   │           │   ├── DataLoadException.java     # 数据加载异常
    │   │           │   ├── PageNotFoundException.java # 页面未找到异常
    │   │           │   └── PDFExportException.java    # PDF导出异常
    │   │           └── interceptor/
    │   │               └── ExceptionHandlingInterceptor.java  # 全局异常拦截器
    │   ├── resources/
    │   │   ├── struts.xml                    # Struts2核心配置（含异常映射）
    │   │   └── struts.properties             # Struts2属性配置
    │   └── webapp/
    │       ├── WEB-INF/
    │       │   ├── web.xml                  # Web应用部署描述符
    │       │   └── error/
    │       │       ├── 404.jsp              # 404错误页面
    │       │       ├── 500.jsp              # 500错误页面
    │       │       └── error.jsp            # 通用错误页面
    │       ├── css/
    │       │   └── error-style.css          # 错误页面样式
    │       └── js/
    │           └── error-interactions.js    # 互动功能脚本
    └── test/
        └── java/                            # 单元测试（可选）
```

---

## 🚀 快速开始

### 1. 环境要求

- **JDK**: 1.8+
- **Maven**: 3.6+
- **Tomcat**: 8.5+/9.0+
- **IDE**: IntelliJ IDEA / Eclipse

### 2. 构建项目

```bash
cd struts/

# 编译项目
mvn clean compile

# 打包WAR文件
mvn clean package

# 使用Tomcat插件运行（开发环境）
mvn tomcat7:run
```

访问：`http://localhost:8080/resume/`

### 3. 测试异常触发

#### 方式一：通过测试Action

```bash
# 触发404异常
http://localhost:8080/resume/testException.action?exceptionType=404

# 触发业务异常
http://localhost:8080/resume/testException.action?exceptionType=business

# 触发数据加载异常
http://localhost:8080/resume/testException.action?exceptionType=data

# 触发PDF导出异常
http://localhost:8080/resume/testException.action?exceptionType=pdf

# 触发空指针异常
http://localhost:8080/resume/testException.action?exceptionType=nullpointer

# 触发SQL异常
http://localhost:8080/resume/testException.action?exceptionType=sql

# 触发IO异常
http://localhost:8080/resume/testException.action?exceptionType=io
```

#### 方式二：在代码中手动抛出异常

```java
// 在任何Action方法中
public String someMethod() {
    // 场景1：页面不存在
    if (resourceNotFound) {
        throw new PageNotFoundException("资源不存在", "/some/path");
    }
    
    // 场景2：参数验证失败
    if (invalidParam) {
        throw BusinessException.invalidParameter("username");
    }
    
    // 场景3：数据库查询失败
    try {
        data = database.query();
    } catch (SQLException e) {
        throw new DataLoadException("MySQL", "用户数据", e);
    }
    
    // 场景4：PDF生成失败
    if (pdfGenerationFailed) {
        throw new PDFExportException("简历PDF", "字体缺失");
    }
}
```

---

## ⚙️ 配置详解

### 1. struts.xml - 核心配置

#### 全局异常映射（推荐用于通用异常）

```xml
<global-exception-mappings>
    <!-- 按优先级从上到下匹配 -->
    <exception-mapping exception="com.resume.exception.PageNotFoundException"
                      result="error404"/>
    <exception-mapping exception="java.lang.Exception"
                      result="error500"/>
</global-exception-mappings>
```

**特点：**
- ✅ 对所有Action生效
- ✅ 无需在每个Action中重复配置
- ✅ 适合通用异常类型（如NullPointerException、SQLException等）
- ⚠️ 匹配顺序很重要（子类在前，父类在后）

#### 局部异常映射（推荐用于特定业务异常）

```xml
<action name="exportPDF" class="...ResumeAction" method="exportPDF">
    <result name="success" type="stream">...</result>
    <exception-mapping exception="com.resume.exception.PDFExportException"
                      result="error"/>
</action>
```

**特点：**
- ✅ 仅对当前Action生效
- ✅ 可覆盖全局映射
- ✅ 适合特定业务的特殊异常处理
- ✅ 可以定义专门的错误结果页面

### 2. 自定义异常类使用示例

#### BusinessException（业务逻辑异常）

```java
// 基础用法
throw new BusinessException("用户名已存在");

// 带错误码（便于前端国际化）
throw new BusinessException("USER_EXISTS", "该用户名已被注册");

// 链式异常（保留原始原因）
throw new BusinessException("数据库操作失败", originalException);

// 使用工厂方法（推荐）
throw BusinessException.dataNotFound("简历");
throw BusinessException.invalidParameter("email");
throw BusinessException.operationFailed("保存");
throw BusinessException.unauthorizedAccess();
```

#### PageNotFoundException（404异常）

```java
// 简单用法
throw new PageNotFoundException();

// 带路径信息
throw new PageNotFoundException("页面不存在", request.getRequestURI());

// 链式异常
throw new PageNotFoundException("资源删除或移动了", e);
```

#### DataLoadException（数据加载异常）

```java
// 从数据库加载失败
throw new DataLoadException("MySQL", "用户信息", sqlException);

// 从文件加载失败
throw new DataLoadException("本地文件", "配置数据", ioException);
```

#### PDFExportException（PDF导出异常）

```java
// 导出失败
throw new PDFExportException("完整简历", "内存不足");

// 模板缺失
throw new PDFExportException("模板文件未找到");
```

---

## 🔧 高级配置

### 1. 启用异常拦截器

在 `struts.xml` 中注册自定义拦截器：

```xml
<package name="default" extends="struts-default">
    <!-- 定义拦截器栈 -->
    <interceptors>
        <interceptor name="exceptionHandler"
                     class="com.resume.interceptor.ExceptionHandlingInterceptor">
            <param name="logStackTrace">true</param>
            <param name="sendEmailAlert">false</param>
        </interceptor>
        
        <interceptor-stack name="customStack">
            <interceptor-ref name="exceptionHandler"/>
            <interceptor-ref name="defaultStack"/>
        </interceptor-stack>
    </interceptors>

    <!-- 默认使用自定义拦截器栈 -->
    <default-interceptor-ref name="customStack"/>

    <!-- 其余配置... -->
</package>
```

**拦截器功能：**
- 📝 统一日志记录（包含请求详情、客户端IP、User-Agent等）
- 💾 自动存储异常信息到request属性
- 📧 可选的邮件告警功能
- 🔍 完整的上下文信息记录

### 2. 生产环境优化

修改 `struts.properties`：

```properties
# 关闭开发模式（重要！）
struts.devMode=false

# 关闭详细错误信息（安全考虑）
struts.devMode=false

# 调整日志级别（生产环境建议INFO或WARN）
```

修改 `web.xml`：

```xml
<!-- 生产环境可以移除详细的错误页面 -->
<context-param>
    <param-name>struts.devMode</param-name>
    <param-value>false</param-value>
</context-param>
```

### 3. 错误页面国际化

创建 `error_zh_CN.properties`：

```properties
error.404.title=页面未找到
error.404.detail=您访问的页面可能已被移除...
error.500.title=服务器内部错误
error.500.detail=服务器遇到了意外情况...
error.business.title=操作失败
error.business.detail=请检查输入后重试
```

在JSP中使用：

```jsp
<s:text name="error.404.title"/>
```

---

## 🧪 测试指南

### 单元测试（JUnit + Struts2 Test Framework）

```java
public class TestExceptionActionTest {

    @Test
    public void testPageNotFoundException() throws Exception {
        // 创建Action代理
        ActionProxy proxy = getActionProxy("/testException.action");
        TestExceptionAction action = (TestExceptionAction) proxy.getAction();
        
        // 设置参数
        action.setExceptionType("404");
        
        // 执行并验证异常
        try {
            proxy.execute();
            fail("应该抛出PageNotFoundException");
        } catch (PageNotFoundException e) {
            assertEquals("测试页面不存在", e.getMessage());
        }
    }

    @Test
    public void testBusinessException() throws Exception {
        ActionProxy proxy = getActionProxy("/testException.action");
        TestExceptionAction action = (TestExceptionAction) proxy.getAction();
        
        action.setExceptionType("business");
        
        try {
            proxy.execute();
            fail("应该抛出BusinessException");
        } catch (BusinessException e) {
            assertEquals("INVALID_PARAMETER", e.getErrorCode());
        }
    }
}
```

### 集成测试（浏览器测试）

1. 启动Tomcat服务器
2. 访问测试URL列表（见上方"快速开始"部分）
3. 验证：
   - [ ] 正确跳转到对应的错误页面
   - [ ] 错误信息正确显示
   - [ ] 开发模式下可以看到堆栈跟踪
   - [ ] 返回主页按钮正常工作
   - [ ] 互动功能正常（点击、键盘、鼠标轨迹等）

---

## 🎨 自定义与扩展

### 1. 添加新的异常类型

步骤：
1. 创建新的异常类（继承 `RuntimeException` 或 `BusinessException`）
2. 在 `struts.xml` 中添加全局/局部映射
3. （可选）创建专用的错误JSP页面
4. 在Action中抛出新异常

**示例：**

```java
// 1. 新建 RateLimitException.java
public class RateLimitException extends RuntimeException {
    private int retryAfterSeconds;
    // ... 构造函数和getter/setter
}

// 2. 在 struts.xml 中添加映射
<exception-mapping exception="com.resume.exception.RateLimitException"
                  result="error429"/>

// 3. 创建 429.jsp 页面
// 4. 在限流逻辑中抛出异常
if (requestsExceededLimit()) {
    throw new RateLimitException(60);  // 60秒后重试
}
```

### 2. 自定义错误页面样式

编辑 `css/error-style.css`：

```css
/* 修改主色调 */
.error-code {
    color: #你的颜色;  /* 替换为你的品牌色 */
}

/* 添加公司Logo */
.paper-container::before {
    content: '';
    background-image: url('/images/logo.png');
    /* ... */
}
```

### 3. 集成监控系统

修改 `ExceptionHandlingInterceptor`：

```java
private void sendAlert(Exception e) {
    // 发送到Sentry
    Sentry.captureException(e);
    
    // 或发送到自定义API
    httpClient.post("https://monitoring.example.com/api/alerts", alertData);
    
    // 或记录到数据库
    errorLogService.log(e, contextInfo);
}
```

---

## ❓ 常见问题

### Q1: 为什么我的异常没有被捕获？

**A:** 检查以下几点：
1. 异常是否在 `struts.xml` 的 `<exception-mapping>` 中声明？
2. 是否使用了正确的异常类（注意包路径）？
3. 异常是在Action方法中抛出的吗？（拦截器只能捕获Action中的异常）
4. 检查是否有其他拦截器提前处理了异常？

### Q2: 如何区分开发和生产环境的错误显示？

**A:** 通过 `struts.devMode` 控制：

```jsp
<s:if test="struts.devMode == true">
    <!-- 显示详细堆栈 -->
    <pre><s:property value="stackTrace"/></pre>
</s:if>
<s:else>
    <!-- 只显示友好提示 -->
    <p>系统繁忙，请稍后重试</p>
</s:else>
```

### Q3: 如何让某些异常不显示技术细节？

**A:** 为这些异常创建专门的Result页面：

```xml
<exception-mapping exception="com.resume.exception.SecurityException"
                  result="securityError"/>
```

创建 `securityError.jsp`，只显示通用提示。

### Q4: AJAX请求如何处理异常？

**A:** 返回JSON格式的错误信息：

```xml
<action name="api/*" class="...">
    <result name="error" type="json">
        <param name="root">errorMessage</param>
    </result>
    <exception-mapping exception="java.lang.Exception" result="error"/>
</action>
```

前端JavaScript处理：
```javascript
$.ajax({
    url: 'api/data.action',
    error: function(xhr) {
        var response = JSON.parse(xhr.responseText);
        alert(response.errorMessage);  // 显示友好错误
    }
});
```

---

## 📊 最佳实践

### ✅ 推荐做法

1. **使用自定义异常类**：不要直接抛出原始异常
2. **分层处理**：DAO层用DataLoadException，Service层用BusinessException
3. **提供友好消息**：每个异常都应有面向用户的说明
4. **记录完整日志**：至少记录异常类型、消息、堆栈、请求上下文
5. **区分环境**：开发环境显示详细信息，生产环境隐藏敏感信息
6. **全局兜底**：始终有一个catch-all的Exception映射
7. **监控告警**：关键异常应通知运维人员

### ❌ 避免做法

1. ❌ 不要在JSP中硬编码错误信息
2. ❌ 不要暴露完整的SQL语句或内部路径
3. ❌ 不要忽略异常（空的catch块）
4. ❌ 不要在finally中抛出新异常
5. ❌ 不要在异常消息中包含敏感信息（密码、密钥等）

---

## 📚 参考资源

- [Struts2官方文档 - Exception Handling](https://struts.apache.org/core-developers/exception-handling.html)
- [Struts2 Interceptors](https://struts.apache.org/core-developers/interceptors.html)
- [Java异常处理最佳实践](https://www.oracle.com/technical-resources/articles/java/exceptions.html)

---

## 📄 许可证

此异常处理框架仅供学习和个人项目使用。