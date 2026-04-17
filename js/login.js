// 登录页面交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const phoneInput = document.getElementById('phone-input');
    const codeInput = document.getElementById('code-input');
    const sendCodeBtn = document.getElementById('send-code-btn');
    const phoneForm = document.getElementById('phone-form');
    const phoneSubmit = document.getElementById('phone-submit');
    const guestLoginBtn = document.getElementById('guest-login-btn');

    // 验证码倒计时配置
    let countdownTimer = null;
    let countdownSeconds = 60;

    // 初始化登录页面
    initLoginPage();

    function initLoginPage() {
        // 绑定发送验证码按钮事件
        sendCodeBtn.addEventListener('click', handleSendCode);

        // 绑定表单提交事件
        phoneForm.addEventListener('submit', handlePhoneLogin);

        // 绑定游客登录按钮事件
        guestLoginBtn.addEventListener('click', handleGuestLogin);

        // 输入框格式化
        phoneInput.addEventListener('input', formatPhoneNumber);
        codeInput.addEventListener('input', formatVerificationCode);

        // 添加输入框焦点效果
        addInputFocusEffects();
    }

    // 格式化手机号输入
    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        e.target.value = value;
    }

    // 格式化验证码输入
    function formatVerificationCode(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 6) {
            value = value.substring(0, 6);
        }

        e.target.value = value;
    }

    // 添加输入框焦点效果
    function addInputFocusEffects() {
        const inputs = [phoneInput, codeInput];

        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
                playTypeSound();
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }

    // 处理发送验证码
    function handleSendCode(e) {
        e.preventDefault();

        const phoneNumber = phoneInput.value.trim();

        // 验证手机号
        if (!validatePhone(phoneNumber)) {
            showError(phoneInput, '请输入正确的11位手机号码');
            return;
        }

        // 清除之前的错误信息
        clearError(phoneInput);

        // 模拟发送验证码（实际项目中应调用后端API）
        simulateSendCode(phoneNumber);

        // 开始倒计时
        startCountdown();
    }

    // 验证手机号格式
    function validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    // 模拟发送验证码（实际项目中应替换为API调用）
    function simulateSendCode(phoneNumber) {
        console.log(`正在向 ${phoneNumber} 发送验证码...`);

        // 模拟成功提示
        showSuccessMessage('验证码已发送，请注意查收');

        // 实际项目中的API调用示例：
        /*
        fetch('/api/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: phoneNumber })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessMessage('验证码已发送');
                startCountdown();
            } else {
                showError(sendCodeBtn, data.message || '发送失败，请重试');
            }
        })
        .catch(error => {
            showError(sendCodeBtn, '网络错误，请检查网络连接');
        });
        */
    }

    // 开始验证码倒计时
    function startCountdown() {
        sendCodeBtn.disabled = true;
        sendCodeBtn.classList.add('counting');
        countdownSeconds = 60;

        updateCountdownDisplay();

        countdownTimer = setInterval(() => {
            countdownSeconds--;

            if (countdownSeconds <= 0) {
                clearInterval(countdownTimer);
                resetCountdownButton();
            } else {
                updateCountdownDisplay();
            }
        }, 1000);
    }

    // 更新倒计时显示
    function updateCountdownDisplay() {
        sendCodeBtn.textContent = `${countdownSeconds}秒后重新获取`;
    }

    // 重置验证码按钮
    function resetCountdownButton() {
        sendCodeBtn.disabled = false;
        sendCodeBtn.classList.remove('counting');
        sendCodeBtn.textContent = '获取验证码';
    }

    // 处理手机号登录提交
    function handlePhoneLogin(e) {
        e.preventDefault();

        const phoneNumber = phoneInput.value.trim();
        const verificationCode = codeInput.value.trim();

        // 验证手机号
        if (!validatePhone(phoneNumber)) {
            showError(phoneInput, '请输入正确的11位手机号码');
            return;
        }

        clearError(phoneInput);

        // 验证验证码
        if (!verificationCode || verificationCode.length !== 6) {
            showError(codeInput, '请输入6位验证码');
            return;
        }

        clearError(codeInput);

        // 显示加载状态
        showLoading(true);

        // 模拟登录请求（实际项目中应调用后端API）
        simulatePhoneLogin(phoneNumber, verificationCode);
    }

    // 模拟手机号登录（实际项目中应替换为API调用）
    function simulatePhoneLogin(phoneNumber, code) {
        console.log(`尝试使用手机号 ${phoneNumber} 登录...`);

        // 模拟网络延迟
        setTimeout(() => {
            // 模拟登录成功（实际项目中应根据API返回结果判断）
            const loginSuccess = true; // 测试时设为true

            if (loginSuccess) {
                console.log('手机号登录成功');

                // 保存用户登录状态到sessionStorage
                saveUserSession({
                    type: 'phone',
                    phone: phoneNumber,
                    loginTime: new Date().toISOString(),
                    isGuest: false
                });

                // 跳转到主页
                navigateToMain();
            } else {
                showLoading(false);
                showError(phoneSubmit, '登录失败，请检查验证码是否正确');
            }
        }, 1500);

        // 实际项目中的API调用示例：
        /*
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: phoneNumber,
                code: verificationCode
            })
        })
        .then(response => response.json())
        .then(data => {
            showLoading(false);

            if (data.success) {
                // 保存用户会话
                saveUserSession({
                    type: 'phone',
                    phone: phoneNumber,
                    token: data.token,
                    loginTime: new Date().toISOString(),
                    isGuest: false
                });

                // 跳转主页
                navigateToMain();
            } else {
                showError(phoneSubmit, data.message || '登录失败');
            }
        })
        .catch(error => {
            showLoading(false);
            showError(phoneSubmit, '网络错误，请检查网络连接');
        });
        */
    }

    // 处理游客登录
    function handleGuestLogin() {
        playTypeSound();

        console.log('选择游客访问...');

        // 保存游客会话信息
        saveUserSession({
            type: 'guest',
            guestId: generateGuestId(),
            loginTime: new Date().toISOString(),
            isGuest: true
        });

        // 直接跳转到主页
        navigateToMain();
    }

    // 生成游客ID
    function generateGuestId() {
        return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 保存用户会话信息
    function saveUserSession(userData) {
        try {
            sessionStorage.setItem('userSession', JSON.stringify(userData));
            sessionStorage.setItem('isLoggedIn', 'true');
            console.log('用户会话已保存:', userData);
        } catch (e) {
            console.error('保存会话信息失败:', e);
        }
    }

    // 导航到主页
    function navigateToMain() {
        // 设置从登录页面跳转的标记
        sessionStorage.setItem('fromLogin', 'true');

        // 添加淡出效果
        document.body.style.transition = 'opacity 0.3s ease-out';
        document.body.style.opacity = '0';

        // 延迟跳转，等待淡出效果完成
        setTimeout(() => {
            window.location.href = 'index.html?showSplash=false';
        }, 300);
    }

    // 显示错误信息
    function showError(element, message) {
        let errorElement = element.parentElement.querySelector('.error-message');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            element.parentElement.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.classList.add('show');

        element.style.borderColor = '#c62828';

        // 播放错误音效
        playErrorSound();

        // 3秒后自动隐藏错误
        setTimeout(() => {
            hideError(element);
        }, 3000);
    }

    // 隐藏错误信息
    function hideError(element) {
        const errorElement = element.parentElement.querySelector('.error-message');

        if (errorElement) {
            errorElement.classList.remove('show');
        }

        element.style.borderColor = '';
    }

    // 清除错误信息
    function clearError(element) {
        hideError(element);
    }

    // 显示成功消息
    function showSuccessMessage(message) {
        let successElement = document.querySelector('.success-message');

        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'success-message';
            document.querySelector('.login-content').appendChild(successElement);
        }

        successElement.textContent = message;
        successElement.classList.add('show');

        // 3秒后自动隐藏
        setTimeout(() => {
            successElement.classList.remove('show');
        }, 3000);
    }

    // 显示/隐藏加载状态
    function showLoading(show) {
        let loadingOverlay = document.querySelector('.loading-overlay');

        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(loadingOverlay);
        }

        if (show) {
            loadingOverlay.classList.add('active');
            phoneSubmit.disabled = true;
            phoneSubmit.textContent = '登录中...';
        } else {
            loadingOverlay.classList.remove('active');
            phoneSubmit.disabled = false;
            phoneSubmit.innerHTML = '<span class="btn-text">登 录</span><span class="btn-arrow">→</span>';
        }
    }

    // 播放打字音效（与splash页面保持一致）
    function playTypeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // 忽略音频错误
        }
    }

    // 播放错误音效
    function playErrorSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 300;
            oscillator.type = 'sawtooth';

            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) {
            // 忽略音频错误
        }
    }

    // 页面可见性变化监听
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.querySelectorAll('.key, .floating-element').forEach(elem => {
                elem.style.animationPlayState = 'paused';
            });
        } else {
            // 页面可见时恢复动画
            document.querySelectorAll('.key, .floating-element').forEach(elem => {
                elem.style.animationPlayState = 'running';
            });
        }
    });
});