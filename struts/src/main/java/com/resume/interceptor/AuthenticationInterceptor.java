package com.resume.interceptor;

import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.interceptor.AbstractInterceptor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.apache.struts2.ServletActionContext;

/**
 * 权限控制拦截器
 * 用于验证用户是否已登录，未登录用户将被重定向到登录页面
 */
public class AuthenticationInterceptor extends AbstractInterceptor {

    private static final Logger logger = LogManager.getLogger(AuthenticationInterceptor.class);

    private static final String LOGIN_ACTION = "login";
    private static final String SESSION_USER_KEY = "currentUser";

    @Override
    public String intercept(ActionInvocation invocation) throws Exception {
        HttpServletRequest request = ServletActionContext.getRequest();
        HttpSession session = request.getSession(false);

        String actionName = invocation.getProxy().getActionName();
        String methodName = invocation.getProxy().getMethod();

        logger.info("=== 权限拦截器检查 ===");
        logger.info("请求Action: {}#{}", actionName, methodName);
        logger.info("请求URI: {}", request.getRequestURI());

        if (isLoginRequest(actionName)) {
            logger.info("登录请求，放行");
            return invocation.invoke();
        }

        if (session == null) {
            logger.warn("会话不存在，重定向到登录页面");
            return "login";
        }

        Object currentUser = session.getAttribute(SESSION_USER_KEY);

        if (currentUser == null) {
            logger.warn("用户未登录，重定向到登录页面");
            request.setAttribute("errorMsg", "请先登录后再访问");
            return "login";
        }

        logger.info("用户已登录: {}", currentUser);
        logger.info("权限验证通过，继续执行");

        return invocation.invoke();
    }

    /**
     * 判断是否为登录相关请求（不需要权限验证）
     */
    private boolean isLoginRequest(String actionName) {
        if (actionName == null) {
            return false;
        }
        return LOGIN_ACTION.equalsIgnoreCase(actionName) ||
               "doLogin".equalsIgnoreCase(actionName) ||
               "logout".equalsIgnoreCase(actionName);
    }
}
