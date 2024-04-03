// Функция, которая будет вызвана при нажатии на кнопку входа
function onLoginClick(event) {
    event.preventDefault();
    alert('Вход временно не доступен. Скоро функционал будет реализован.');
    // Здесь будет код для открытия основного окна
}

// Функция, которая будет вызвана при нажатии на кнопку регистрации
function onRegisterClick(event) {
    event.preventDefault();
    alert('Регистрация временно не доступна. Скоро функционал будет реализован.');
    // Здесь будет код для открытия основного окна
}

document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.querySelector('.card-front .btn');
    const registerButton = document.querySelector('.card-back .btn');

    loginButton.addEventListener('click', onLoginClick);
    registerButton.addEventListener('click', onRegisterClick);
});
