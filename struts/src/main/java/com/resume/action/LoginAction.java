package com.resume.action;

import com.opensymphony.xwork2.ActionSupport;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.apache.struts2.ServletActionContext;

/**
 * 登录Action
 * 处理用户登录认证逻辑，包括登录验证、会话管理和登出功能
 */
public class LoginAction extends ActionSupport {

    private static final Logger logger = LogManager.getLogger(LoginAction.class);

    private String username;           // 用户名
    private String password;           // 密码
    private String errorMsg;           // 错误信息

    private static final String VALID_USERNAME = "admin";
    private static final String VALID_PASSWORD = "admin123";
    private static final String SESSION_USER_KEY = "currentUser";

    /**
     * 显示登录页面
     */
    public String execute() {
        logger.info("显示登录页面");
        return SUCCESS;
    }

    /**
     * 处理用户登录请求
     * 验证用户名和密码，成功则创建会话并跳转到欢迎页面
     */
    public String doLogin() {
        logger.info("=== 用户登录请求 ===");
        logger.info("尝试登录的用户名: {}", username);

        HttpServletRequest request = ServletActionContext.getRequest();

        if (username == null || username.trim().isEmpty()) {
            logger.warn("用户名为空");
            errorMsg = "请输入用户名";
            return INPUT;
        }

        if (password == null || password.trim().isEmpty()) {
            logger.warn("密码为空");
            errorMsg = "请输入密码";
            return INPUT;
        }

        if (validateCredentials(username.trim(), password)) {
            logger.info("用户 {} 登录成功", username);

            HttpSession session = request.getSession(true);
            session.setAttribute(SESSION_USER_KEY, username);
            session.setMaxInactiveInterval(30 * 60);  // 30分钟超时

            logger.info("会话已创建，Session ID: {}", session.getId());
            return SUCCESS;
        } else {
            logger.warn("用户 {} 登录失败：用户名或密码错误", username);
            errorMsg = "用户名或密码错误，请重新输入";
            return INPUT;
        }
    }

    /**
     * 用户登出
     * 销毁会话并重定向到登录页面
     */
    public String logout() {
        logger.info("=== 用户登出请求 ===");

        HttpServletRequest request = ServletActionContext.getRequest();
        HttpSession session = request.getSession(false);

        if (session != null) {
            Object currentUser = session.getAttribute(SESSION_USER_KEY);
            logger.info("用户 {} 正在登出", currentUser);
            session.invalidate();
            logger.info("会话已销毁");
        }

        return LOGIN;
    }

    /**
     * 验证用户凭证（模拟数据库验证）
     * 实际项目中应该从数据库或LDAP等验证
     */
    private boolean validateCredentials(String username, String password) {
        return VALID_USERNAME.equals(username) && VALID_PASSWORD.equals(password);
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }
}
