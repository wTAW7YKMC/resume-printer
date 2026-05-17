/**
 * 邮箱登录页面交互逻辑 (v3.0 - 清理版)
 */

console.log('✅✅✅ [LOGIN.JS v3.0] 文件开始加载...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 [LOGIN.JS] DOM 加载完成');

    const emailInput = document.getElementById('email-input');
    const codeInput = document.getElementById('code-input');
    const sendCodeBtn = document.getElementById('send-code-btn');
    const emailForm = document.getElementById('email-form');
    const emailSubmit = document.getElementById('email-submit');
    const guestLoginBtn = document.getElementById('guest-login-btn');

    let countdownTimer = null;
    let countdownSeconds = 60;

    console.log('🔍 [DEBUG] DOM元素:', {
        emailInput: !!emailInput,
        sendCodeBtn: !!sendCodeBtn,
        loginService: typeof loginService !== 'undefined'
    });

    function initLoginPage() {
        console.log('🎬 初始化登录页面...');

        if (!sendCodeBtn || !emailInput) {
            console.error('❌ 找不到必要的DOM元素！');
            return;
        }

        sendCodeBtn.addEventListener('click', handleSendCode);
        console.log('✅ 已绑定: 获取验证码按钮');

        emailForm.addEventListener('submit', handleEmailLogin);
        console.log('✅ 已绑定: 表单提交');

        guestLoginBtn.addEventListener('click', handleGuestLogin);
        console.log('✅ 已绑定: 游客登录按钮');

        checkExistingSession();
    }

    async function handleSendCode(e) {
        e.preventDefault();
        console.log('🔘 点击了获取验证码按钮');

        const emailAddress = emailInput.value.trim();
        console.log('📧 输入的邮箱:', emailAddress);

        if (!emailAddress) {
            alert('请输入邮箱地址');
            return;
        }

        if (!validateEmail(emailAddress)) {
            alert('请输入正确的邮箱地址');
            return;
        }

        console.log('✅ 邮箱格式正确，开始发送...');

        sendCodeBtn.disabled = true;
        sendCodeBtn.textContent = '发送中...';

        try {
            if (typeof loginService === 'undefined') {
                throw new Error('loginService 未加载');
            }

            console.log('📡 调用 loginService.sendVerificationCode()...');
            const result = await loginService.sendVerificationCode(emailAddress);
            console.log('✅ 发送结果:', result);

            if (result.success) {
                if (result.data && result.data.devMode) {
                    alert(`【开发者模式】验证码是: ${result.data.devCode}`);
                } else {
                    alert(result.message || '✅ 验证邮件已发送！请查收邮箱（可能需要1-2分钟）\n\n💡 提示：如果没收到，请检查垃圾邮件文件夹');
                }
                startCountdown();
            } else {
                alert(result.message || '发送失败');
                resetButton();
            }
        } catch (error) {
            console.error('❌ 发送失败:', error);
            alert('发送失败: ' + error.message);
            resetButton();
        }
    }

    async function handleEmailLogin(e) {
        e.preventDefault();
        console.log('🔐 提交登录表单');

        const emailAddress = emailInput.value.trim();
        const verificationCode = codeInput.value.trim();

        if (!validateEmail(emailAddress)) {
            alert('请输入正确的邮箱地址');
            return;
        }

        if (!verificationCode || verificationCode.length !== 6) {
            alert('请输入6位验证码');
            return;
        }

        emailSubmit.disabled = true;
        emailSubmit.innerHTML = '<span class="btn-text">登录中...</span>';

        try {
            const result = await loginService.verifyAndLogin(emailAddress, verificationCode);
            console.log('✅ 登录结果:', result);

            if (result.success) {
                alert('🎉 登录成功！正在跳转...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                alert(result.message || '登录失败');
                resetSubmitButton();
            }
        } catch (error) {
            console.error('❌ 登录失败:', error);
            alert('登录失败: ' + error.message);
            resetSubmitButton();
        }
    }

    function handleGuestLogin(e) {
        e.preventDefault();
        if (confirm('以游客身份访问？')) {
            localStorage.setItem('userType', 'guest');
            window.location.href = 'index.html';
        }
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function startCountdown() {
        countdownSeconds = 60;
        sendCodeBtn.disabled = true;

        countdownTimer = setInterval(() => {
            countdownSeconds--;
            if (countdownSeconds <= 0) {
                resetButton();
            } else {
                sendCodeBtn.textContent = `${countdownSeconds}秒后重新获取`;
            }
        }, 1000);
    }

    function resetButton() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = '获取验证码';
        countdownSeconds = 60;
    }

    function resetSubmitButton() {
        emailSubmit.disabled = false;
        emailSubmit.innerHTML = '<span class="btn-text">登 录</span><span class="btn-arrow">→</span>';
    }

    function checkExistingSession() {
        if (typeof loginService !== 'undefined' && loginService.isLoggedIn()) {
            const user = loginService.getCurrentUser();
            console.log('🔄 发现已有会话:', user?.email);
        }
    }

    initLoginPage();
    console.log('✅ [LOGIN.JS] 初始化完成！');
});
