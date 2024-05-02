ymaps.ready(init);

let multiRoute;
let searchTimeout;

function init() {
    updateUserProfile();
    var centerCoords = [55.809732, 37.498923];
    var myMap = new ymaps.Map("map", {
        center: centerCoords,
        zoom: 16,
        controls: []
    });
    // попробую машинки 
    // Создаем макет метки с возможностью вращения изображения
    var carLayout = ymaps.templateLayoutFactory.createClass('<div style="transform: rotate($[properties.rotate]deg);">' +
        '<img src="../static/icons/getimage.png" style="width: 30px; height: 60px;" /></div>');

    // Создаем метку с кастомным макетом
    var carPlacemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0 // начальный угол вращения
    }, {
        iconLayout: carLayout,
        iconShape: {   // Определяем форму иконки, чтобы она корректно реагировала на события мыши
            type: 'Rectangle',
            coordinates: [
                [-15, -30], [15, 30]
            ]
        }
    });

    // Вторая машинка
    var car2Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0 // начальный угол вращения
    }, {
        iconLayout: carLayout
    });

    // Третья машинка
    var car3Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0 // начальный угол вращения
    }, {
        iconLayout: carLayout
    });

    // Четвертая машинка
    var car4Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0 // начальный угол вращения
    }, {
        iconLayout: carLayout
    });

    // Добавляем машинки на карту
    myMap.geoObjects.add(carPlacemark);
    myMap.geoObjects.add(car2Placemark);
    myMap.geoObjects.add(car3Placemark);
    myMap.geoObjects.add(car4Placemark);


    // Получаем маршрут и начинаем анимацию
    ymaps.route([
        'Москва, метро Войковская',
        'Москва, метро Сокол'

    ]).then(function (route) {
        // Создание маршрута и анимация машинки
        animateRoute(route, carPlacemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    // Маршрут для второй машинки
    ymaps.route([
        'Москва, Дубосековская улица, 5', // Стартовая точка маршрута - МАИ
        'Москва, метро Тверская' // Конечная точка маршрута - метро Тверская
    ]).then(function (route) {
        // Создание маршрута и анимация машинки
        animateRoute(route, car2Placemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    //третья машинка
    ymaps.route([
        'Москва, Волоколамское шоссе, 24', // Стартовая точка маршрута - МАИ
        'Москва, Дубосековская, 5' // Конечная точка маршрута - метро Тверская
    ]).then(function (route) {
        // Создание маршрута и анимация машинки
        animateRoute(route, car3Placemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    // четвертая 
    // Получаем маршрут и начинаем анимацию
    ymaps.route([
        'Москва, Волоколамское шоссе, 4к31',
        'Москва, Часовая улица, 30'

    ]).then(function (route) {
        // Создание маршрута и анимация машинки
        animateRoute(route, car4Placemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    function animateRoute(route, placemark) {
        var paths = route.getPaths(),
            points = [];

        paths.each(function (path) {
            points = points.concat(path.getSegments().reduce(function (acc, segment) {
                return acc.concat(segment.getCoordinates());
            }, []));
        });

        animateAlongRoute(points, 0, placemark);
    }

    function animateAlongRoute(points, index, placemark) {
        if (index < points.length - 1) {
            var startPos = points[index],
                endPos = points[index + 1];

            animateCar(startPos, endPos, 2000, function () {
                animateAlongRoute(points, index + 1, placemark);
            }, placemark);
        }
    }

    function getRotationAngle(from, to) {
        var angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
        return (angle * (180 / Math.PI) + 360) % 360;
    }

    function animateCar(startCoords, endCoords, duration, callback, placemark) {
        var angle = getRotationAngle(startCoords, endCoords);
        placemark.properties.set('rotate', angle);

        var startTime = new Date().getTime();
        var deltaLat = endCoords[0] - startCoords[0];
        var deltaLng = endCoords[1] - startCoords[1];

        function move() {
            var currentTime = new Date().getTime();
            var progress = (currentTime - startTime) / duration;
            if (progress > 1) progress = 1;

            var currentCoords = [
                startCoords[0] + deltaLat * progress,
                startCoords[1] + deltaLng * progress
            ];

            if (progress < 1) {
                var nextAngle = getRotationAngle(currentCoords, endCoords);
                placemark.properties.set('rotate', nextAngle);
                placemark.geometry.setCoordinates(currentCoords);
                requestAnimationFrame(move);
            } else {
                placemark.geometry.setCoordinates(endCoords);
                callback && callback();
            }
        }

        move();
    }


    // конец машинок

    var myPlacemark = new ymaps.Placemark(myMap.getCenter(), {}, {
        iconLayout: 'default#image',
        iconImageHref: '../static/icons/ballon.svg', // Сюда вставьте ваш URL
        iconImageSize: [100, 100], // Укажите размер иконки
        iconImageOffset: [-48, -73], // Смещение иконки
        draggable: true // Делаем метку перетаскиваемой
    });

    // Тут добавляем обработчик события окончания перетаскивания метки
    myPlacemark.events.add('dragend', function () {
        var coords = myPlacemark.geometry.getCoordinates();
        getAddress(coords, function (address) {
            fromInput.value = address;
            updateRoute(address, toInput.value); // Обновляем маршрут с новыми координатами метки "Откуда"
        });
    });

    var myPlacemarkTo = new ymaps.Placemark([0, 0], {}, {
        iconLayout: 'default#image',
        iconImageHref: '../static/icons/finish.svg',
        iconImageSize: [70, 70],
        iconImageOffset: [-13, -65],
        visible: false
    });

    getAddress(centerCoords, function (address) {
        fromInput.value = address;
    });

    myMap.geoObjects.add(myPlacemark);
    myMap.geoObjects.add(myPlacemarkTo);

    var fromInput = document.getElementById('from-input');
    var toInput = document.getElementById('to-input');

    document.querySelector('.zoom-in').addEventListener('click', function () {
        myMap.setZoom(myMap.getZoom() + 1);
    });

    document.querySelector('.zoom-out').addEventListener('click', function () {
        myMap.setZoom(myMap.getZoom() - 1);
    });

    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        myPlacemark.geometry.setCoordinates(coords);
        myPlacemarkTo.options.set('visible', false); // Скрываем myPlacemarkTo после клика по карте
        getAddress(coords);
    });

    // Функция геолокации пользователя
    document.getElementById('geolocation-button').addEventListener('click', function () {
        navigator.geolocation.getCurrentPosition(success, error);

        function success(position) {
            var coords = [position.coords.latitude, position.coords.longitude];
            myMap.setCenter(coords, 16);
            myPlacemark.geometry.setCoordinates(coords);
            getAddress(coords);
        }

        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
    });

    var fromInput = document.getElementById('from-input');

    fromInput.addEventListener('input', function (e) {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        var val = e.target.value;
        if (val) {
            searchTimeout = setTimeout(function () {
                if (window.lastGeocodeRequest) {
                    window.lastGeocodeRequest.abort();
                }
                var geocodeRequest = ymaps.geocode(val);
                window.lastGeocodeRequest = geocodeRequest;

                geocodeRequest.then(function (res) {
                    var firstGeoObject = res.geoObjects.get(0);
                    var coords = firstGeoObject.geometry.getCoordinates();
                    // Установить координаты для метки.
                    myPlacemark.geometry.setCoordinates(coords);
                    // Центрировать карту по координатам.
                    myMap.setCenter(coords, 16);
                    // Обновить маршрут с новым адресом.
                    updateRoute(val, toInput.value);
                }).finally(function () {
                    window.lastGeocodeRequest = null;
                });
            }, 500);
        }
    });


    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        myPlacemark.geometry.setCoordinates(coords);
        getAddress(coords, function (address) {
            fromInput.value = address; // Убедитесь, что здесь используется правильное поле ввода
            updateRoute(address, toInput.value);
        });
    });

    function getAddress(coords, callback) {
        ymaps.geocode(coords).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            callback(firstGeoObject.getAddressLine());
        });
    }

    var multiRoute = new ymaps.multiRouter.MultiRoute({
        referencePoints: [
            centerCoords,
            [0, 0]
        ],
        params: {
            routingMode: 'auto',
        }
    }, {
        boundsAutoApply: false,
        wayPointVisible: false, // скрыть стандартные метки на маршруте
        routeMarkerVisible: false // если вы также хотите скрыть маршрутные маркеры
    });


    myMap.geoObjects.add(multiRoute);

    fromInput.addEventListener('input', function () {
        clearTimeout(searchTimeout); // Очищаем предыдущий таймер, если он был установлен
        searchTimeout = setTimeout(function () {
            updateRoute(fromInput.value, toInput.value);
            // Скрываем конечную иконку, если адрес начальной точки изменился
            if (fromInput.value && !toInput.value) {
                myPlacemarkTo.options.set('visible', false);
            }
        }, 1000); // Задержка в 1 секунду
    });

    // Обработчик ввода для конечной точки маршрута
    toInput.addEventListener('input', function () {
        clearTimeout(searchTimeout); // Очищаем предыдущий таймер, если он был установлен
        searchTimeout = setTimeout(function () {
            updateRoute(fromInput.value, toInput.value);
            // Отображаем конечную иконку, только если введён конечный адрес
            if (toInput.value) {
                myPlacemarkTo.options.set('visible', true);
            } else {
                myPlacemarkTo.options.set('visible', false);
            }
        }, 1000); // Задержка в 1 секунду
    });

    function getAddress(coords, callback) {
        ymaps.geocode(coords).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            callback(firstGeoObject.getAddressLine());
        });
    }

    let currentDistance = 0; // Переменная для хранения текущего расстояния

    // Функция для обновления маршрута
    function updateRoute(from, to) {
        clearTimeout(searchTimeout);
        if (!from || !to) {
            myPlacemarkTo.options.set('visible', false);
            return;
        }

        let coordsFrom;
        let coordsTo;

        ymaps.geocode(from).then(function (resFrom) {
            coordsFrom = resFrom.geoObjects.get(0).geometry.getCoordinates();
            myPlacemark.geometry.setCoordinates(coordsFrom);
            return ymaps.geocode(to);
        }).then(function (resTo) {
            coordsTo = resTo.geoObjects.get(0).geometry.getCoordinates();
            myPlacemarkTo.geometry.setCoordinates(coordsTo);
            myPlacemarkTo.options.set('visible', true);
            multiRoute.model.setReferencePoints([coordsFrom, coordsTo]);
            multiRoute.model.events.once('requestsuccess', function () {
                myMap.setBounds(multiRoute.getBounds(), {
                    checkZoomRange: true,
                    duration: 1000
                });
                // После успешного построения маршрута получаем и обновляем расстояние
                let activeRoute = multiRoute.getActiveRoute();
                if (activeRoute) {
                    // Получаем расстояние в метрах и конвертируем в километры
                    currentDistance = activeRoute.properties.get('distance').value / 1000;
                    console.log(`Текущее расстояние: ${currentDistance} км.`);

                    // Здесь вы можете вызвать функцию обновления цены, если это необходимо
                    // Например, updatePriceForCurrentTariff();
                }
            });
        }).catch(function (error) {
            console.error('Произошла ошибка при геокодировании адресов: ', error);
        });
    }

    document.querySelectorAll('.tariff').forEach(function (tariff) {
        tariff.addEventListener('click', function () {
            // Убираем класс .active у всех тарифов
            document.querySelectorAll('.tariff').forEach(function (item) {
                item.classList.remove('active');
            });
            // Добавляем класс .active к выбранному тарифу
            this.classList.add('active');

            // Вызываем обновление цены
            updatePriceForCurrentTariff();
        });
    });

    function updatePriceForCurrentTariff() {
        const selectedTariff = document.querySelector('.tariff.active');
        if (selectedTariff) {
            const tariffType = selectedTariff.getAttribute('data-tariff-type');
            const calculatedPrice = calculatePrice(tariffType, currentDistance);
            // Предположим, что у вас есть элемент для отображения общей стоимости поездки
            const priceDisplay = document.querySelector('#total-price'); // Убедитесь, что добавили такой элемент в HTML
            if (priceDisplay) {
                priceDisplay.textContent = `Стоимость поездки: ${calculatedPrice}₽`;
            }
        }
    }

    // рассчет цены поездки
    function calculatePrice(tariffType, distance) {
        // Здесь коэффициенты для расчета стоимости можно настроить под вашу бизнес-модель
        let pricePerKm;
        let basePrice;

        switch (tariffType) {
            case 'standard':
                pricePerKm = 20; // цена за км для стандартного тарифа
                basePrice = 555;
                break;
            case 'premium':
                pricePerKm = 50; // цена за км для премиум тарифа
                basePrice = 1555;
                break;
            case 'vip':
                pricePerKm = 100; // цена за км для VIP тарифа
                basePrice = 5555;
                break;
            default:
                return 0; // в случае ошибки или неизвестного типа тарифа
        }
        const finalPrice = basePrice + (distance * pricePerKm);
        return finalPrice.toFixed(0); // округление до двух знаков после запятой
    }

    // Функция для обновления цен в интерфейсе
    function updatePricesBasedOnDistance() {
        if (currentDistance > 0) {
            // Проходимся по каждому тарифу
            document.querySelectorAll('.tariff').forEach(function (tariff) {
                const tariffType = tariff.getAttribute('data-tariff-type');
                const price = calculatePrice(tariffType, currentDistance);
                // Находим элемент цены внутри текущего блока тарифа и обновляем его
                tariff.querySelector('.tariff-price').textContent = `${price}₽`;
            });
        }
    }

    // Предполагается, что эта функция вызывается каждый раз, когда успешно построен маршрут
    multiRoute.model.events.add('requestsuccess', function () {
        let activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
            currentDistance = activeRoute.properties.get('distance').value / 1000; // Получаем расстояние в км
            let totalMinutes = Math.round(activeRoute.properties.get('duration').value / 60); // Получаем время в минутах

            // Вычисляем часы и минуты
            let hours = Math.floor(totalMinutes / 60);
            let minutes = totalMinutes % 60;

            // Формируем строку с информацией о времени в пути
            let timeString = hours > 0 ? `${hours} ч. ${minutes} мин.` : `${minutes} мин.`;

            // Обновляем поле ввода с информацией о маршруте
            let routeInfoText = `Время в пути: ${timeString} и ${currentDistance.toFixed(1)} км.`;
            document.getElementById('route-info').value = routeInfoText;

            updatePricesBasedOnDistance(); // Обновляем цены на основе нового расстояния
        }
    });

    function parseRouteInfo(routeInfo) {
        const timeAndDistance = routeInfo.split(' и ');
        const travelTime = parseInt(timeAndDistance[0].match(/\d+/)[0]); // Извлекаем время в минутах
        const distance = parseFloat(timeAndDistance[1].match(/\d+\.\d+/)[0]); // Извлекаем расстояние в километрах
        return {
            travelTime, // время в пути в минутах
            distance // расстояние в километрах
        };
    }

    // Инициализация переменных для модального окна и кнопки способа оплаты
    const paymentModal = document.getElementById('payment-modal');
    const paymentMethodButton = document.getElementById('payment-method-button');
    const paymentMethodValue = document.getElementById('payment-method-value');

    // Обработчик клика для кнопки способа оплаты
    paymentMethodButton.addEventListener('click', function () {
        paymentModal.style.display = 'block';
    });

    // Обработчики для закрытия модального окна
    const closeModalElements = document.querySelectorAll('.close-modal');
    closeModalElements.forEach(function (element) {
        element.addEventListener('click', function () {
            paymentModal.style.display = 'none';
        });
    });

    // Закрытие модального окна при клике вне его области
    window.addEventListener('click', function (event) {
        if (event.target == paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    // Обработчики для опций способа оплаты
    document.querySelectorAll('.payment-option').forEach(function (option) {
        option.addEventListener('click', function () {
            // Извлекаем информацию о выбранном способе оплаты
            const paymentMethodText = this.querySelector('.payment-option-text').textContent;
            const paymentMethodIcon = this.querySelector('.payment-option-icon').outerHTML; // Получаем HTML иконки

            // %Обновляем кнопку способа оплаты новым текстом и иконкой
            paymentMethodValue.innerHTML = `${paymentMethodIcon} ${paymentMethodText}`;

            // Закрываем модальное окно
            paymentModal.style.display = 'none';
        });
    });

    // Глобальная переменная для хранения последних 4 цифр карты
    let lastFourDigits = null;

    // Функция для обработки добавления карты
    function handleCardAdded(event) {
        lastFourDigits = event.detail; // Сохраняем последние 4 цифры карты
        updatePaymentMethodDisplay(); // Обновляем отображение способа оплаты
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Пытаемся получить данные из localStorage
        let storedCardData = localStorage.getItem('cardData');
        if (storedCardData) {
            let cardData = JSON.parse(storedCardData);
            lastFourDigits = cardData.cardNumber.slice(-4);
        } else {
            lastFourDigits = null;
        }

        // Обновляем UI
        updatePaymentMethodDisplay();
    });


    // логика связи с бекендом / отправка данных
    document.getElementById('order-button').addEventListener('click', function () {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Пожалуйста, войдите в систему перед созданием заказа.');
            return;
        }

        const routeInfoText = document.getElementById('route-info').value;
        const { travelTime, distance } = parseRouteInfo(routeInfoText); // Извлечение времени и расстояния

        if (!currentDistance || currentDistance === 0 || !travelTime) {
            alert('Пожалуйста, уточните маршрут перед оформлением заказа.');
            return;
        }

        const pickupLocation = document.getElementById('from-input').value;
        const destination = document.getElementById('to-input').value;
        if (!pickupLocation || !destination) {
            alert('Пожалуйста, укажите место отправления и назначения.');
            return;
        }

        const selectedTariffElement = document.querySelector('.tariff.active');
        if (!selectedTariffElement) {
            alert('Пожалуйста, выберите тариф.');
            return;
        }

        const tariffType = selectedTariffElement.getAttribute('data-tariff-type');
        const orderAmountText = selectedTariffElement.querySelector('.tariff-price').textContent;
        const orderAmount = parseInt(orderAmountText.replace(' от ', '').replace(' ₽', ''), 10);

        // Расчет времени окончания поездки
        const startTime = new Date().toISOString();
        const endTime = new Date(new Date().getTime() + travelTime * 60000).toISOString(); // предполагаем, что travelTime в минутах

        const orderData = {
            user_id: userId,
            pickup_location: pickupLocation,
            destination: destination,
            distance: distance,
            car_category: tariffType,
            start_time: startTime,
            end_time: endTime, // Теперь это поле будет заполнено здесь, а не позже
            total_ride_time: travelTime, // Время поездки в минутах
            order_amount: orderAmount
        };

        sendOrder(orderData);
    });

    function sendOrder(orderData) {
        orderData.user_id = parseInt(orderData.user_id, 10);

        // Проверка, что user_id является числом
        if (isNaN(orderData.user_id)) {
            alert('Ошибка: user_id не является числом.');
            return;
        }

        fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(`Ошибка заказа! Статус: ${response.status}, сообщение: ${errorData.message}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Заказ успешно создан:', data);
                alert('Ваш заказ успешно оформлен!');
            })
            .catch(error => {
                console.error('Ошибка при создании заказа:', error);
                alert(`Ошибка при оформлении заказа: ${error.message}. Пожалуйста, попробуйте снова.`);
            });
    }

    function updateUserProfile() {
        console.log('Попытка обновить данные пользователя.');

        // Пытаемся получить полное имя из localStorage
        const fullname = localStorage.getItem('fullname');
        console.log('Полученное полное имя:', fullname);

        // Проверяем, существует ли имя пользователя
        if (fullname) {
            // Обновляем DOM, если имя пользователя существует
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                console.log('Элемент с именем пользователя найден, обновляем его содержимое.');
                userNameElement.textContent = fullname;
            } else {
                console.error('Элемент для отображения имени пользователя не найден.');
            }
        } else {
            console.error('Имя пользователя не найдено в localStorage.');
        }
    }

    function closeEditModal() {
        const modal = document.getElementById('edit-user-modal');
        if (modal) {
            modal.style.display = 'none';
        } else {
            console.error('Не удалось найти модальное окно с ID "edit-user-modal".');
        }
    }
    // Установка обработчика событий
    document.querySelector('.user-name').addEventListener('click', openEditModal);
    document.querySelector('.close-edit-modal').addEventListener('click', closeEditModal);


    function openEditModal() {
        const modal = document.getElementById('edit-user-modal');
        const fullnameInput = document.getElementById('modal-fullname');
        const currentPasswordInput = document.getElementById('modal-password');
        const newPasswordInput = document.getElementById('modal-new-password');

        if (modal) {
            modal.style.display = 'block';
            fullnameInput.value = localStorage.getItem('fullname') || '';  // Загрузка сохранённого ФИО
            currentPasswordInput.value = '';  // Поля пароля должны быть пустыми
            newPasswordInput.value = '';  // Поля пароля должны быть пустыми
        } else {
            console.error('Не удалось найти модальное окно для редактирования профиля.');
        }
    }

    document.getElementById('edit-profile-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const fullname = document.getElementById('modal-fullname').value;
        const currentPassword = document.getElementById('modal-password').value;
        const newPassword = document.getElementById('modal-new-password').value; // Получаем новый пароль
        const userId = Number(localStorage.getItem('userId'));

        if (!userId) {
            alert('Ошибка: ID пользователя не найден. Попробуйте перелогиниться.');
            return;
        }

        // Обновление ФИО, если поля не пусты
        if (fullname && currentPassword) {
            updateFullname(userId, fullname, currentPassword);
        }

        // Смена пароля, если заполнены поля текущего и нового пароля
        if (currentPassword && newPassword) {
            changeUserPassword(userId, currentPassword, newPassword);
        }
    });

    function updateFullname(userId, fullname, currentPassword) {
        fetch('/api/changes/change_fullname', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                new_fullname: fullname,
                password: currentPassword
            })
        })
            .then(handleResponse)
            .then(data => {
                console.log('ФИО успешно обновлено:', data);
                localStorage.setItem('fullname', data.fullname);
                updateUserProfile();
                closeEditModal();
                showNotification('ФИО успешно обновлено!', true);
            })
            .catch(handleError);
    }

    function changeUserPassword(userId, currentPassword, newPassword) {
        fetch('/api/changes/change_password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                password: currentPassword,
                new_password: newPassword
            })
        })
            .then(handleResponse)
            .then(data => {
                console.log('Пароль успешно изменен:', data);
                alert('Пароль успешно изменен!');
                closeEditModal();
                showNotification('Пароль успешно изменен!', true);
            })
            .catch(handleError);
    }

    function handleResponse(response) {
        if (response.ok) {
            return response.json();
        } else {
            // Преобразование неудачного ответа в JSON для получения деталей ошибки и выброс исключения
            return response.json().then(errorData => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            });
        }
    }

    function handleError(error) {
        console.error('Ошибка:', error);
        alert('Ошибка при выполнении запроса: ' + error.message);
    }

    function showNotification(message, isSuccess = true) {
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000); // Уведомление исчезает через 3 секунды
    }


}




