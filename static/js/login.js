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
            if (!response.ok) {
                // Конвертация ответа в JSON для получения детальной информации об ошибке
                return response.json().then(errorData => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
                });
            }
            return response.json();
        })
        .catch(error => {
            console.error('Network error:', error.message);
            throw error; // Проброс ошибки для дальнейшей обработки
        });
}

// Функция для проверки правильности формата электронной почты
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Функция для проверки правильности формата пароля
function isValidPassword(password) {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(password);
}

// Функция, которая будет вызвана при нажатии на кнопку входа
function onLoginClick(event) {
    event.preventDefault();
    const login_or_email = document.getElementById('login-or-email').value;
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');

    loginError.textContent = ''; // Сброс предыдущего сообщения об ошибке

    if (!login_or_email || !password) {
        loginError.textContent = 'Пожалуйста, заполните все поля';
        return;
    }

    if (!isValidPassword(password)) {
        loginError.textContent = 'Некорректный пароль. Пароль должен содержать минимум 8 символов, включая хотя бы одну заглавную и одну строчную букву, а также одну цифру';
        return;
    }

    sendPostRequest('/api/entrance', { login_or_email, password })
        .then(data => {
            console.log('Login Success:', data);
            onSuccessfulLogin();
            window.location.href = '/main.html';
        })
        .catch(error => {
            loginError.textContent = error.message; // Показываем сообщение об ошибке от сервера
            document.getElementById('login-password').value = '';
        });
}

// Предполагается, что эта функция вызывается после успешного входа в систему.
function onSuccessfulLogin() {
    // Запрос к серверу для получения user_id
    fetch('/get-user-id')
        .then(response => response.json())
        .then(data => {
            if (data.user_id) {
                localStorage.setItem('userId', data.user_id);
                // Теперь user_id доступен для использования при создании заказа
            } else {
                console.error('Не удалось получить user_id');
                // Возможно, вам следует перенаправить пользователя на страницу входа
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при попытке получить user_id:', error);
        });
}

// Функция для обработки регистрации
function onRegisterClick(event) {
    event.preventDefault();
    const fullname = document.getElementById('register-name').value;
    const username = document.getElementById('register-login').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const registerError = document.getElementById('register-error');

    registerError.textContent = ''; // Сброс предыдущего сообщения об ошибке

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
            // Проверяем, что в ответе есть user_id
            if (data.id !== undefined) {
                // Вызываем функцию для успешной регистрации
                onSuccessfulRegistration(data.id);
            } else {
                registerError.textContent = 'Ошибка регистрации: ID пользователя не получен.';
            }
        })
        .catch(error => {
            registerError.textContent = error.message; // Показываем сообщение об ошибке от сервера
        });
}

// Функция, которая будет вызвана после успешной регистрации пользователя.
function onSuccessfulRegistration(userId) {
    // Сохраняем user_id в localStorage
    localStorage.setItem('userId', userId);

    // Теперь user_id доступен для использования при создании заказа
    // Переход на главную страницу после успешной регистрации
    window.location.href = '/main.html';
}

document.addEventListener('DOMContentLoaded', function () {
    // Получаем элементы для входа и регистрации
    const loginLabel = document.querySelector('.login-spacing');
    const registrationLabel = document.querySelector('.registration-spacing');

    // Функция переключения на форму входа
    const toggleToLogin = () => {
        document.getElementById('reg-log').checked = false;
    };

    // Функция переключения на форму регистрации
    const toggleToRegistration = () => {
        document.getElementById('reg-log').checked = true;
    };

    // Добавляем обработчики событий для переключения форм
    loginLabel.addEventListener('click', toggleToLogin);
    registrationLabel.addEventListener('click', toggleToRegistration);

    const loginButton = document.querySelector('.card-front .btn');
    const registerButton = document.querySelector('.card-back .btn');

    loginButton.addEventListener('click', onLoginClick);
    registerButton.addEventListener('click', onRegisterClick);

    // Обработчик событий для полей формы входа
    const loginInputFields = document.querySelectorAll('.card-front input');
    loginInputFields.forEach((field, index) => {
        field.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (index < loginInputFields.length - 1) {
                    loginInputFields[index + 1].focus();
                } else {
                    // Имитация клика на кнопку входа, если все поля заполнены
                    if (document.getElementById('login-or-email').value && document.getElementById('login-password').value) {
                        onLoginClick(event);
                    }
                }
            }
        });
    });

    // Обработчик событий для полей формы регистрации
    const registerInputFields = document.querySelectorAll('.card-back input');
    registerInputFields.forEach((field, index) => {
        field.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (index < registerInputFields.length - 1) {
                    registerInputFields[index + 1].focus();
                } else {
                    // Имитация клика на кнопку регистрации, если все поля заполнены
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
