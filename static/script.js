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
            window.location.href = 'main_window/index.html';
        })
        .catch(error => {
            loginError.textContent = error.message; // Показываем сообщение об ошибке от сервера
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

    sendPostRequest('/api/registration', { fullname, username, email, password }) // Исправил URL на '/api/registration'
        .then(data => {
            console.log('Registration Success:', data);
            window.location.href = 'main_window/index.html'; // Переход на главную страницу после успешной регистрации
        })
        .catch(error => {
            registerError.textContent = error.message; // Показываем сообщение об ошибке от сервера
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.querySelector('.card-front .btn');
    loginButton.addEventListener('click', onLoginClick);

    const registerButton = document.querySelector('.card-back .btn');
    registerButton.addEventListener('click', onRegisterClick);
});
