// Функция для отправки POST-запроса
function sendPostRequest(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            return response.json().then(body => {
                if (!response.ok) {
                    throw new Error(body.message || 'Произошла неизвестная ошибка');
                }
                return body;
            });
        })
        .catch(error => {
            console.error('Network error:', error.message);
            throw error;
        });
}
// валидация введенных данных 
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}


function isValidPassword(password) {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(password);
}

function onLoginClick(event) {
    event.preventDefault();
    const login_or_email = document.getElementById('login-or-email').value;
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');

    loginError.textContent = ''; // Очистка предыдущего сообщения об ошибке

    if (!login_or_email || !password) {
        loginError.textContent = 'Пожалуйста, заполните все поля';
        return;
    }

    if (!isValidPassword(password)) {
        loginError.textContent = 'Неверный пароль. Попробуйте еще раз';
        return;
    }

    sendPostRequest('/api/entrance', { login_or_email, password })
        .then(data => {
            console.log('Login Success:', data);
            onSuccessfulLogin(data);  // Передача данных для дальнейшей обработки
        })
        .catch(error => {
            if (error.message.includes('не зарегистрирован')) {
                loginError.textContent = 'Этот логин не зарегистрирован. Пожалуйста, проверьте данные или зарегистрируйтесь.';
            } else {
                loginError.textContent = 'Этот логин не зарегистрирован. Пожалуйста, проверьте данные или зарегистрируйтесь.';
            }
            document.getElementById('login-password').value = '';
        });
}


function onSuccessfulLogin(data) {
    console.log(data);

    if (data.user_id && data.fullname) {
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('fullname', data.fullname);
        localStorage.setItem('password', data.password);
        console.log('user_id и fullname и паролик успешно сохранены:', data.user_id, data.fullname);
        window.location.href = '/main.html';
    } else {
        console.error('Не удалось получить user_id или fullname');
        alert('Не удалось получить данные пользователя. Пожалуйста, войдите снова.');
        window.location.href = '/login.html';
    }
}

function onRegisterClick(event) {
    event.preventDefault();
    const fullname = document.getElementById('register-name').value;
    const username = document.getElementById('register-login').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const registerError = document.getElementById('register-error');

    registerError.textContent = '';

    if (!fullname || !username || !email || !password) {
        registerError.textContent = 'Пожалуйста, заполните все поля';
        return;
    }

    if (!isValidEmail(email)) {
        registerError.textContent = 'Пожалуйста, введите корректный адрес электронной почты';
        return;
    }

    if (!isValidPassword(password)) {
        registerError.textContent = 'Некорректный пароль. Пароль должен содержать минимум 8 символов, включая хотя бы одну заглавную и одну строчную букву, а также одну цифру';
        return;
    }

    sendPostRequest('/api/registration', { fullname, username, email, password })
        .then(data => {
            if (data.id !== undefined && data.fullname) {
                onSuccessfulRegistration(data);
            } else {
                registerError.textContent = 'Ошибка регистрации: необходимые данные пользователя не получены.';
            }
        })
        .catch(error => {
            registerError.textContent = 'Ошибка при запросе: ' + error.message; // Показываем сообщение об ошибке от сервера
        });

}

function onSuccessfulRegistration(data) {
    console.log(data); // Для отладки

    if (data.id !== undefined && data.fullname) {
        localStorage.setItem('userId', data.id);
        localStorage.setItem('fullname', data.fullname);
        localStorage.setItem('password', data.password);
        console.log('userId и fullname успешно сохранены:', data.id, data.fullname);
        window.location.href = '/main.html';
    } else {
        console.error('Не удалось получить userId или fullname или паролик');
        alert('Не удалось получить данные пользователя. Пожалуйста, войдите снова.');
        window.location.href = '/login.html';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginLabel = document.querySelector('.login-spacing');
    const registrationLabel = document.querySelector('.registration-spacing');

    const toggleToLogin = () => {
        document.getElementById('reg-log').checked = false;
    };

    const toggleToRegistration = () => {
        document.getElementById('reg-log').checked = true;
    };

    loginLabel.addEventListener('click', toggleToLogin);
    registrationLabel.addEventListener('click', toggleToRegistration);

    const loginButton = document.querySelector('.card-front .btn');
    const registerButton = document.querySelector('.card-back .btn');

    loginButton.addEventListener('click', onLoginClick);
    registerButton.addEventListener('click', onRegisterClick);

    const loginInputFields = document.querySelectorAll('.card-front input');
    loginInputFields.forEach((field, index) => {
        field.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (index < loginInputFields.length - 1) {
                    loginInputFields[index + 1].focus();
                } else {
                    if (document.getElementById('login-or-email').value && document.getElementById('login-password').value) {
                        onLoginClick(event);
                    }
                }
            }
        });
    });

    const registerInputFields = document.querySelectorAll('.card-back input');
    registerInputFields.forEach((field, index) => {
        field.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (index < registerInputFields.length - 1) {
                    registerInputFields[index + 1].focus();
                } else {
                    if (document.getElementById('register-name').value &&
                        document.getElementById('register-login').value &&
                        document.getElementById('register-email').value &&
                        document.getElementById('register-password').value) {
                        onRegisterClick(event);
                    }
                }
            }
        });
    });
    document.querySelectorAll('.toggle-password').forEach(function (toggleIcon) {
        toggleIcon.addEventListener('click', function () {
            const passwordInput = document.querySelector(this.getAttribute('toggle'));
            if (passwordInput.getAttribute('type') === 'password') {
                passwordInput.setAttribute('type', 'text');
                this.classList.replace('uil-eye-slash', 'uil-eye');
            } else {
                passwordInput.setAttribute('type', 'password');
                this.classList.replace('uil-eye', 'uil-eye-slash');
            }
        });
    });
});



