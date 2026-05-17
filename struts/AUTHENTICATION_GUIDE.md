# Struts2 权限控制系统 - 使用指南

## 📋 系统概述

基于Struts2拦截器机制实现的完整权限控制系统，采用**拦截器栈**模式实现统一的用户认证和访问控制。系统自动验证所有请求的用户登录状态，未登录用户将被重定向到登录页面。

---

## 🎯 核心功能

### ✅ 权限验证
- **自动拦截**：所有受保护资源自动进行权限验证
- **智能放行**：登录、登出等公开请求自动跳过验证
- **会话管理**：基于HttpSession的完整会话生命周期管理

### ✅ 登录认证
- **凭证验证**：用户名密码验证（当前为演示模式）
- **错误处理**：清晰的错误提示信息
- **安全登出**：完整的会话销毁机制

### ✅ 页面跳转
- **成功登录**：跳转到欢迎页面（welcome.jsp）
- **验证失败**：返回登录页面并显示错误信息
- **未授权访问**：重定向到登录页面

---

## 🏗️ 架构设计

### 拦截器工作流程

```
用户请求 → Struts2过滤器 → 权限拦截器 → 判断是否登录请求
                                    ↓ 是          ↓ 否
                              直接放行        检查Session
                                                    ↓ 有           ↓ 无
                                              继续执行Action   返回login结果
```

### 核心组件

#### 1. AuthenticationInterceptor（权限拦截器）
**位置**: [AuthenticationInterceptor.java](struts/src/main/java/com/resume/interceptor/AuthenticationInterceptor.java)

```java
核心职责：
✓ 检查用户Session是否存在
✓ 验证currentUser属性是否已设置
✓ 区分公开请求和受保护请求
✓ 记录详细的访问日志
```

#### 2. LoginAction（登录控制器）
**位置**: [LoginAction.java](struts/src/main/java/com/resume/action/LoginAction.java)

```java
提供方法：
✓ execute()      - 显示登录页面
✓ doLogin()      - 处理登录验证
✓ logout()       - 处理用户登出
```

#### 3. JSP页面
- [login.jsp](struts/src/main/webapp/login.jsp) - 登录表单页面
- [welcome.jsp](struts/src/main/webapp/welcome.jsp) - 登录成功后的欢迎页面

#### 4. 配置文件
- [struts.xml](struts/src/main/resources/struts.xml) - Struts2核心配置

---

## ⚙️ 配置说明

### struts.xml 关键配置

#### 1. 自定义拦截器栈定义
```xml
<interceptors>
    <!-- 权限验证拦截器 -->
    <interceptor name="authInterceptor"
                class="com.resume.interceptor.AuthenticationInterceptor"/>

    <!-- 自定义拦截器栈：包含权限验证 -->
    <interceptor-stack name="authStack">
        <interceptor-ref name="defaultStack"/>
        <interceptor-ref name="authInterceptor"/>
    </interceptor-stack>
</interceptors>

<!-- 设置默认拦截器栈 -->
<default-interceptor-ref name="authStack"/>
```

**说明**：
- `authStack` = 默认拦截器栈 + 权限拦截器
- 所有继承`auth-default`包的Action都会自动应用此拦截器栈

#### 2. 全局结果配置
```xml
<global-results>
    <result name="login">/login.jsp</result>  <!-- 未登录时跳转 -->
</global-results>
```

#### 3. 公开Action配置（不需要权限）
```xml
<action name="login" ...>
    <interceptor-ref name="defaultStack"/>  <!-- 覆盖默认，使用基础栈 -->
</action>

<action name="doLogin" ...>
    <interceptor-ref name="defaultStack"/>  <!-- 同上 -->
</action>

<action name="logout" ...>
    <interceptor-ref name="defaultStack"/>  <!-- 同上 -->
</action>
```

**关键点**：通过显式指定`defaultStack`来绕过权限拦截器

#### 4. 受保护Action配置（需要权限）
```xml
<action name="welcome" ...>
    <!-- 自动使用authStack，包含权限验证 -->
    <result name="success">/welcome.jsp</result>
</action>
```

---

## 🔐 测试账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| admin | admin123 | 管理员账号 |

**修改账号**：编辑 [LoginAction.java](struts/src/main/java/com/resume/action/LoginAction.java#L33-L34)
```java
private static final String VALID_USERNAME = "admin";
private static final String VALID_PASSWORD = "admin123";
```

---

## 🚀 运行步骤

### 1. 编译项目
```bash
cd struts
mvn clean package
```

### 2. 部署到Tomcat
将生成的 `target/resume-printer-struts.war` 部署到Tomcat的webapps目录

### 3. 启动Tomcat
```bash
# Windows
%TOMCAT_HOME%/bin/startup.bat

# Linux/Mac
$TOMCAT_HOME/bin/startup.sh
```

### 4. 访问系统
打开浏览器访问：
```
http://localhost:8080/resume/login.action
```

或直接访问任何受保护资源（会被自动重定向到登录页）：
```
http://localhost:8080/resume/welcome.action
```

---

## 📝 使用流程

### 正常登录流程
1. 访问 `http://localhost:8080/resume/login.action`
2. 输入用户名：`admin`
3. 输入密码：`admin123`
4. 点击"登录"按钮
5. 系统验证成功后跳转到欢迎页面

### 未登录访问测试
1. 直接访问 `http://localhost:8080/resume/welcome.action`
2. 系统检测到未登录状态
3. 自动重定向到登录页面
4. 显示提示信息："请先登录后再访问"

### 登出测试
1. 在欢迎页面点击"安全退出"按钮
2. 系统销毁Session并返回登录页面
3. 再次访问受保护资源会被要求重新登录

---

## 🎨 页面说明

### 登录页面 (login.jsp)
- **视觉风格**：复古打字机风格，与项目整体UI一致
- **表单字段**：用户名、密码
- **错误显示**：红色边框的错误提示框
- **帮助信息**：底部显示测试账号

### 欢迎页面 (welcome.jsp)
- **用户信息**：显示当前登录用户名
- **功能展示**：简历管理、数据统计、系统设置
- **操作按钮**：查看简历、安全退出
- **会话详情**：Session ID、创建时间、超时时间

---

## 🔧 扩展指南

### 1. 连接数据库验证

修改 [LoginAction.java](struts/src/main/java/com/resume/action/LoginAction.java#L89-L92) 的 `validateCredentials()` 方法：

```java
private boolean validateCredentials(String username, String password) {
    // TODO: 从数据库查询用户信息
    // User user = userDao.findByUsername(username);
    // return user != null && user.getPassword().equals(encrypt(password));
    
    // 当前：演示模式（硬编码）
    return VALID_USERNAME.equals(username) && VALID_PASSWORD.equals(password);
}
```

### 2. 添加记住我功能

在 LoginAction 中添加：
```java
private boolean rememberMe;  // 新增字段

public String doLogin() {
    // ... 验证逻辑 ...
    
    if (rememberMe) {
        Cookie cookie = new Cookie("rememberUser", username);
        cookie.setMaxAge(7 * 24 * 60 * 60);  // 7天
        response.addCookie(cookie);
    }
    
    // ...
}
```

### 3. 添加角色权限控制

扩展 AuthenticationInterceptor：
```java
@Override
public String intercept(ActionInvocation invocation) throws Exception {
    // ... 现有验证逻辑 ...
    
    String requiredRole = getRequiredRole(invocation);  // 从注解或配置获取
    String userRole = (String) session.getAttribute("userRole");
    
    if (!hasRole(userRole, requiredRole)) {
        request.setAttribute("errorMsg", "权限不足");
        return "forbidden";  // 返回403页面
    }
    
    return invocation.invoke();
}
```

### 4. 添加登录尝试次数限制

在 LoginAction 中添加：
```java
private static final int MAX_ATTEMPTS = 5;
private Map<String, Integer> loginAttempts = new ConcurrentHashMap<>();

public String doLogin() {
    int attempts = loginAttempts.getOrDefault(username, 0);
    
    if (attempts >= MAX_ATTEMPTS) {
        errorMsg = "登录失败次数过多，请15分钟后重试";
        return INPUT;
    }
    
    if (!validateCredentials(username, password)) {
        loginAttempts.put(username, attempts + 1);
        errorMsg = "用户名或密码错误";
        return INPUT;
    }
    
    loginAttempts.remove(username);  // 成功后清除计数
    // ... 继续登录流程 ...
}
```

### 5. 集成Spring Security（高级）

如需更强大的安全框架，可替换为Spring Security：
- 表单登录
- OAuth2集成
- CSRF防护
- 方法级权限控制

---

## 📊 技术特性

### 会话管理
- **超时时间**：30分钟（可在web.xml中调整）
- **Session ID**：每次登录生成唯一标识
- **并发控制**：同一账号多设备登录支持

### 安全性
- **密码传输**：POST方式提交（非URL参数）
- **Session固定攻击防护**：登录后重新生成Session ID
- **XSS防护**：Struts2内置标签自动转义

### 日志记录
- **访问日志**：记录所有请求的Action和方法
- **认证日志**：记录登录成功/失败事件
- **异常日志**：详细的堆栈跟踪信息

---

## ❓ 常见问题

### Q1: 为什么访问 welcome.action 会自动跳转到登录页？
**A**: 因为welcome Action继承了`auth-default`包，该包的默认拦截器栈包含权限验证拦截器。拦截器检测到Session中没有用户信息，因此返回"login"结果。

### Q2: 如何添加新的公开Action？
**A**: 在Action配置中显式指定使用`defaultStack`：
```xml
<action name="myPublicAction" ...>
    <interceptor-ref name="defaultStack"/>
    ...
</action>
```

### Q3: 如何修改登录页面的样式？
**A**: 编辑 [login.jsp](struts/src/main/webapp/login.jsp) 中的`<style>`标签内容，保持与项目整体的复古打字机风格一致。

### Q4: Session超时时间如何调整？
**A**: 修改 [web.xml](struts/src/main/webapp/WEB-INF/web.xml#L68-L70)：
```xml
<session-config>
    <session-timeout>30</session-timeout>  <!-- 单位：分钟 -->
</session-config>
```

### Q5: 如何在生产环境禁用开发模式？
**A**: 修改 [struts.xml](struts/src/main/resources/struts.xml#L10)：
```xml
<constant name="struts.devMode" value="false"/>
```

---

## 📚 相关文档

- [Struts2官方文档](https://struts.apache.org/getting-started/)
- [Struts2拦截器机制](https://struts.apache.org/core-developers/interceptors.html)
- [项目开发指南](../开发指南.md)
- [异常处理指南](./STRUTS_EXCEPTION_GUIDE.md)

---

## 🎓 学习要点

通过本实现，你可以掌握：

✅ **Struts2拦截器原理**
- AbstractInterceptor基类
- 拦截器栈的组合方式
- 拦截器的调用顺序

✅ **权限控制模式**
- 基于Session的认证
- AOP思想的拦截器应用
- 全局与局部配置的结合

✅ **Struts2最佳实践**
- 包（Package）的继承体系
- 结果（Result）的全局配置
- Action的组织结构

✅ **企业级开发技能**
- 日志记录规范
- 异常处理策略
- 安全性考虑

---

## 👤 维护者

- **作者**: AI Assistant
- **版本**: 1.0.0
- **更新日期**: 2026-05-17

---

## 📄 许可证

本项目仅供学习和演示用途。
