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
    var carLayout1 = ymaps.templateLayoutFactory.createClass('<div style="transform: rotate($[properties.rotate]deg);">' +
        '<img src="../static/icons/blackCar.png" style="width: 30px; height: 60px;" /></div>');

    // Шаблон для второй машинки (черной)
    var carLayout2 = ymaps.templateLayoutFactory.createClass('<div style="transform: rotate($[properties.rotate]deg);">' +
        '<img src="../static/icons/whiteCar.png" style="width: 25px; height: 50px;" /></div>');

    var carPlacemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0 // начальный угол вращения
    }, {
        iconLayout: carLayout1,
        iconShape: {
            type: 'Rectangle',
            coordinates: [
                [-15, -30], [15, 30]
            ]
        }
    });


    // Вторая машинка
    var car2Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0
    }, {
        iconLayout: carLayout1
    });

    // Третья машинка
    var car3Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0
    }, {
        iconLayout: carLayout2
    });

    // Четвертая машинка
    var car4Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0
    }, {
        iconLayout: carLayout2
    });

    // Пятая машинка
    var car5Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0
    }, {
        iconLayout: carLayout2
    });

    //шестая 
    var car6Placemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0
    }, {
        iconLayout: carLayout1
    });

    // Добавляем машинки на карту
    myMap.geoObjects.add(carPlacemark);
    myMap.geoObjects.add(car2Placemark);
    myMap.geoObjects.add(car3Placemark);
    myMap.geoObjects.add(car4Placemark);
    myMap.geoObjects.add(car5Placemark);
    myMap.geoObjects.add(car6Placemark);


    // Получаем маршрут и начинаем анимацию
    ymaps.route([
        'Москва, метро Войковская',
        'Москва, метро Сокол'

    ]).then(function (route) {
        animateRoute(route, carPlacemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    // Маршрут для второй машинки
    ymaps.route([
        'Москва, Дубосековская улица, 5',
        'Москва, метро Тверская'
    ]).then(function (route) {
        animateRoute(route, car2Placemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    //третья машинка
    ymaps.route([
        'Москва, Волоколамское шоссе, 24',
        'Москва, Дубосековская, 5'
    ]).then(function (route) {
        animateRoute(route, car3Placemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    // четвертая 
    ymaps.route([
        'Москва, Волоколамское шоссе, 4к31',
        'Москва, Часовая улица, 30'

    ]).then(function (route) {
        animateRoute(route, car4Placemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    //пятая 
    ymaps.route([
        'Москва, метро Чистые пруды',
        'Москва, метро Сокол'

    ]).then(function (route) {
        animateRoute(route, car5Placemark);
    }, function (error) {
        alert('Возникла ошибка при построении маршрута: ' + error.message);
    });

    //шестая
    ymaps.route([
        'Москва, Панфиловская, 5',
        'Москва, метро Аэропорт'

    ]).then(function (route) {
        animateRoute(route, car6Placemark);
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
        iconImageHref: '../static/icons/ballon.svg',
        iconImageSize: [100, 100],
        iconImageOffset: [-48, -73],
        draggable: true
    });

    myPlacemark.events.add('dragend', function () {
        var coords = myPlacemark.geometry.getCoordinates();
        getAddress(coords, function (address) {
            fromInput.value = address;
            updateRoute(address, toInput.value);
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
        myPlacemarkTo.options.set('visible', false);
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
                    myPlacemark.geometry.setCoordinates(coords);
                    myMap.setCenter(coords, 16);
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
            fromInput.value = address;
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
        wayPointVisible: false, // скрываю стандартные метки на маршруте
        routeMarkerVisible: false // скрываю маршрутные маркеры
    });


    myMap.geoObjects.add(multiRoute);

    fromInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            updateRoute(fromInput.value, toInput.value);
            if (fromInput.value && !toInput.value) {
                myPlacemarkTo.options.set('visible', false);
            }
        }, 1000); // задержка в 1 секунду
    });

    // Обработчик ввода для конечной точки маршрута
    toInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            updateRoute(fromInput.value, toInput.value);
            if (toInput.value) {
                myPlacemarkTo.options.set('visible', true);
            } else {
                myPlacemarkTo.options.set('visible', false);
            }
        }, 1000); // задержка в 1 секунду
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
                    duration: 500
                });
                // После успешного построения маршрута получаем и обновляем расстояние
                let activeRoute = multiRoute.getActiveRoute();
                if (activeRoute) {
                    // Получаем расстояние в метрах и конвертируем в километры
                    currentDistance = activeRoute.properties.get('distance').value / 1000;
                    console.log(`Текущее расстояние: ${currentDistance} км.`);
                }
            });
        }).catch(function (error) {
            console.error('Произошла ошибка при геокодировании адресов: ', error);
        });
    }

    document.querySelectorAll('.tariff').forEach(function (tariff) {
        tariff.addEventListener('click', function () {
            document.querySelectorAll('.tariff').forEach(function (item) {
                item.classList.remove('active');
            });
            this.classList.add('active');

            // обновление цены
            updatePriceForCurrentTariff();
        });
    });

    function updatePriceForCurrentTariff() {
        const selectedTariff = document.querySelector('.tariff.active');
        if (selectedTariff) {
            const tariffType = selectedTariff.getAttribute('data-tariff-type');
            const calculatedPrice = calculatePrice(tariffType, currentDistance);
            const priceDisplay = document.querySelector('#total-price');
            if (priceDisplay) {
                priceDisplay.textContent = `Стоимость поездки: ${calculatedPrice}₽`;
            }
        }
    }

    // рассчет цены поездки
    function calculatePrice(tariffType, distance) {
        let pricePerKm;
        let basePrice;

        switch (tariffType) {
            case 'Standart':
                pricePerKm = 20; // цена за км для стандартного тарифа
                basePrice = 555;
                break;
            case 'Premium':
                pricePerKm = 50; // цена за км для премиум тарифа
                basePrice = 1555;
                break;
            case 'VIP':
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

    multiRoute.model.events.add('requestsuccess', function () {
        let activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
            currentDistance = activeRoute.properties.get('distance').value / 1000; // расстояние в км
            let totalMinutes = Math.round(activeRoute.properties.get('duration').value / 60); // время в минутах

            // часы и минуты
            let hours = Math.floor(totalMinutes / 60);
            let minutes = totalMinutes % 60;

            // информация о времени в пути
            let timeString = hours > 0 ? `${hours} ч. ${minutes} мин.` : `${minutes} мин.`;

            let routeInfoText = `Время в пути: ${timeString} и ${currentDistance.toFixed(1)} км.`;
            document.getElementById('route-info').value = routeInfoText;

            updatePricesBasedOnDistance(); // Обновляем цены на основе нового расстояния
        }
    });

    // Инициализация переменных для модального окна и кнопки способа оплаты
    const paymentModal = document.getElementById('payment-modal');
    const paymentMethodButton = document.getElementById('payment-method-button');
    const paymentMethodValue = document.getElementById('payment-method-value');

    let paymentMethod;

    paymentMethodButton.addEventListener('click', function () {
        paymentModal.style.display = 'block';
    });

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
            const paymentMethodIcon = this.querySelector('.payment-option-icon').outerHTML;
            paymentMethod = this.getAttribute('data-value'); // метод оплаты из атрибута

            paymentMethodValue.innerHTML = `${paymentMethodIcon} ${paymentMethodText}`;
            paymentModal.style.display = 'none';
        });
    });

    // логика связи с бекендом / отправка данных (заказ)
    document.getElementById('order-button').addEventListener('click', function () {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Пожалуйста, войдите в систему перед созданием заказа.');
            return;
        }

        const routeInfoText = document.getElementById('route-info').value;
        const { travelTime, distance } = parseRouteInfo(routeInfoText); // временя и расстояние

        if (!currentDistance || currentDistance === 0 || !travelTime) {
            alert('Пожалуйста, уточните маршрут перед оформлением заказа.');
            return;
        }

        if (!paymentMethod) {
            alert('Ошибка: не выбран метод оплаты.');
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
            end_time: endTime,
            total_ride_time: travelTime,
            order_amount: orderAmount,
            payment_method: paymentMethod
        };

        sendOrder(orderData);
    });

    function sendOrder(orderData) {
        orderData.user_id = parseInt(orderData.user_id, 10);

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
                const mapElement = document.getElementById('map');
                const loadingModal = document.getElementById('loadingModal');
                loadingModal.style.display = 'flex';
                mapElement.classList.add('map-shrink'); // Добавляем класс для уменьшения карты

                setTimeout(() => {
                    loadingModal.style.display = 'none';
                    mapElement.classList.remove('map-shrink'); // Удаляем класс после завершения поиска

                    if (data.driver) {
                        displayDriverInfo(data.driver); // Показываем информацию о водителе после скрытия модали
                    } else {
                        console.error('Информация о водителе не доступна');
                        alert('Информация о водителе не доступна.');
                    }
                }, 5000); // Время ожидания перед скрытием анимации
            })
            .catch(error => {
                console.error('Ошибка при создании заказа:', error);
                alert(`Ошибка при оформлении заказа: ${error.message}. Пожалуйста, попробуйте снова.`);
            });

    }

    function displayDriverInfo(driver) {
        // Отображение данных водителя
        if (!driver || !driver.name || !driver.car || !driver.average_rating || !driver.waiting_time || !driver.car_number) {
            console.error('Информация о водителе не доступна');
            alert('Информация о водителе не доступна.');
            return;
        }

        document.getElementById('driver-waiting-time').textContent = `Через ${driver.waiting_time} мин приедет`;
        document.getElementById('driver-car').textContent = `${driver.car}`;
        document.getElementById('car-number-box').textContent = `${driver.car_number}`;
        document.getElementById('driver-name').textContent = `Ваш водитель: ${driver.name}`;
        document.getElementById('driver-rating').textContent = `Рейтинг: ${driver.average_rating}`;

        // Добавление изображения автомобиля
        const carImage = document.getElementById('car-image');
        console.log(driver);
        if (carImage && driver.image) {
            carImage.src = driver.image;
            carImage.alt = `Image of ${driver.car}`;
        } else {
            console.error('No valid image URL provided.');
        }


        // Показ модального окна с информацией о водителе
        const modal = document.getElementById('driver-info-modal');
        modal.style.display = 'block';

        initCloseModalHandler(carOrderPlacemark);
    }

    function initCloseModalHandler(carOrderPlacemark) {
        // Закрытие модального окна и запуск анимации
        const closeBtn = document.querySelector('.close-driver-info-modal');
        closeBtn.onclick = closeModalAndStartAnimation;

        document.getElementById('close-modal-btn').addEventListener('click', closeModalAndStartAnimation);

        window.onclick = function (event) {
            const modal = document.getElementById('driver-info-modal');
            if (event.target === modal) {
                closeModalAndStartAnimation();
            }
        };

        function closeModalAndStartAnimation() {
            document.getElementById('driver-info-modal').style.display = 'none';

            if (multiRoute) {
                let activeRoute = multiRoute.getActiveRoute();
                if (activeRoute && activeRoute.getPaths().getLength() > 0) {
                    let paths = activeRoute.getPaths();
                    let firstPath = paths.get(0);
                    let lastPath = paths.get(paths.getLength() - 1);

                    let startPoint = firstPath.getSegments().get(0).geometry.getCoordinates()[0];
                    let endPoint = lastPath.getSegments().get(lastPath.getSegments().getLength() - 1).geometry.getCoordinates().slice(-1)[0];

                    console.log("Начальная точка:", startPoint);
                    console.log("Конечная точка:", endPoint);

                    buildUserRoute(startPoint, endPoint);
                } else {
                    console.error("Маршрут не содержит путей для анимации.");
                }
            } else {
                console.error("Маршрут не доступен для анимации.");
            }
        }

    }
    // скин для машинки
    var carOrderLayout = ymaps.templateLayoutFactory.createClass('<div style="transform: rotate($[properties.rotate]deg);">' +
        '<img src="../static/icons/ordercar.png" style="width: 22.6px; height:  51.4px;" /></div>');

    // метка для машинки
    var carOrderPlacemark = new ymaps.Placemark(myMap.getCenter(), {
        rotate: 0
    }, {
        iconLayout: carOrderLayout,
        iconShape: {
            type: 'Rectangle',
            coordinates: [[-556.5, -128.5], [-200, 128.5]]
        },
        iconImageSize: [22.6, 51.4], // Размер иконки
        iconImageOffset: [-756.5, -1128.5] // Смещение иконки для центрирования
    });

    myMap.geoObjects.add(carOrderPlacemark);


    function getUserId() {
        const userId = Number(localStorage.getItem('userId'));
        if (!userId || isNaN(userId)) {
            console.error("User ID не определен или недействителен:", userId);
            alert('Пожалуйста, войдите в систему перед завершением поездки.');
            return null;
        }
        return userId;
    }

    var userRoute;

    // Функция создания маршрута
    function buildUserRoute(startAddress, endAddress) {
        const userId = getUserId();
        if (!userId) {
            return;
        }

        console.log("Строим маршрут от:", startAddress, "до:", endAddress);
        ymaps.route([startAddress, endAddress]).then(function (route) {
            userRoute = route;
            myMap.geoObjects.add(route);

            fetchOrderDetails(userId, function (orderId, driverId) {
                animateUserRoute(route, carOrderPlacemark, function () {
                    console.log("Анимация завершена");
                    showRatingModal(orderId, driverId);
                });
            });
        }, function (error) {
            alert('Ошибка построения маршрута: ' + error.message);
        });
    }

    document.getElementById('rating-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const userId = getUserId();
        if (!userId) {
            return;
        }

        const userRating = parseInt(document.querySelector('input[name="rating"]:checked').value, 10);

        console.log('Выбранная оценка:', userRating);

        fetchOrderDetails(userId, function (orderId, driverId) {
            completeOrder(orderId, driverId, userRating);
        });
    });

    function fetchOrderDetails(userId, callback) {
        if (!userId || isNaN(userId)) {
            console.error("User ID не определен или недействителен:", userId);
            alert("User ID не определен. Пожалуйста, войдите в систему.");
            return;
        }

        const url = `/api/orders/get_order_id?user_id=${userId}`;
        console.log("Запрос на URL:", url);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    console.error("Ошибка ответа сервера:", response.status, response.statusText);
                    alert(`Ошибка получения данных заказа: ${response.statusText}`);
                    return null;
                }
                return response.json();
            })
            .then(order => {
                if (!order) {
                    return;
                }
                console.log("Данные заказа:", order);
                if (order.order_id && order.driver_id) {
                    callback(order.order_id, order.driver_id);
                } else {
                    console.error("Order ID или Driver ID не определены");
                    alert("Order ID или Driver ID не определены.");
                }
            })
            .catch(error => {
                console.error("Ошибка при получении данных заказа:", error);
                alert('Ошибка при получении данных заказа.');
            });
    }

    function completeOrder(orderId, driverId, userRating) {
        console.log('Начало завершения заказа', { orderId, driverId, userRating });
        const completionData = {
            order_id: orderId,
            driver_id: driverId,
            user_rating: parseInt(userRating, 10)
        };

        fetch('/api/orders/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(completionData)
        })
            .then(response => {
                console.log('Ответ получен от сервера', response);
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(`Ошибка завершения заказа! Статус: ${response.status}, сообщение: ${errorData.message}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Заказ успешно завершен:', data);
                document.getElementById('rating-modal').style.display = 'none';
                updateUIAfterOrderCompletion(orderId);
                showThankYouModal();
                location.reload();
            })
            .catch(error => {
                console.error('Ошибка при завершении заказа:', error);
                alert(`Ошибка при завершении заказа: ${error.message}. Пожалуйста, попробуйте снова.`);
            });
    }

    function updateUIAfterOrderCompletion(orderId) {
        console.log(`Заказ ${orderId} завершен. Обновление интерфейса.`);
    }

    // Функция для разбора информации о маршруте
    function parseRouteInfo(routeInfoText) {
        const travelTimeMatch = routeInfoText.match(/(\d+)\s*мин/);
        const distanceMatch = routeInfoText.match(/(\d+(\.\d+)?)\s*км/);

        const travelTime = travelTimeMatch ? parseInt(travelTimeMatch[1], 10) : 0;
        const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;

        return { travelTime, distance };
    }

    // Анимация по маршруту
    function animateUserRoute(route, placemark, onComplete) {
        var paths = route.getPaths();
        var points = [];

        paths.each(function (path) {
            points = points.concat(path.getSegments().reduce(function (acc, segment) {
                return acc.concat(segment.getCoordinates());
            }, []));
        });

        console.log("Total points for animation:", points.length);

        // Уменьшаем продолжительность анимации для ускорения
        animateAlongRouteUser(points, 0, placemark, function () {
            console.log("Анимация завершена");
            onComplete && onComplete();
        }, route, 1000); // Продолжительность анимации уменьшена до 1с 
    }

    // Анимация между двумя точками маршрута
    function animateAlongRouteUser(points, index, placemark, onComplete, route) {
        if (index < points.length - 1) {
            var startPos = points[index];
            var endPos = points[index + 1];

            // Рассчитываем продолжительность анимации в зависимости от расстояния
            var distance = Math.sqrt(Math.pow(endPos[0] - startPos[0], 2) + Math.pow(endPos[1] - startPos[1], 2));
            var duration = distance * 105000;

            animateUserCar(startPos, endPos, duration, function () {
                if (index === 0) {
                    updateRouteSegmentStyle(route);
                }
                animateAlongRouteUser(points, index + 1, placemark, onComplete, route);
            }, placemark);
        } else {
            onComplete && onComplete();
        }
    }

    // Анимация машинки между двумя точками
    function animateUserCar(startCoords, endCoords, duration, callback, placemark) {
        var startAngle = placemark.properties.get('rotate') || getRotationAngleUser(startCoords, endCoords);
        var endAngle = getRotationAngleUser(startCoords, endCoords);

        var startTime = new Date().getTime();
        var deltaLat = endCoords[0] - startCoords[0];
        var deltaLng = endCoords[1] - startCoords[1];

        function moveUser() {
            var currentTime = new Date().getTime();
            var progress = (currentTime - startTime) / duration;
            if (progress > 1) progress = 1;

            var currentCoords = [
                startCoords[0] + deltaLat * progress,
                startCoords[1] + deltaLng * progress
            ];
            var currentAngle = interpolateAngles(startAngle, endAngle, progress);

            placemark.properties.set('rotate', currentAngle);
            placemark.geometry.setCoordinates(currentCoords);

            if (progress < 1) {
                requestAnimationFrame(moveUser);
            } else {
                placemark.geometry.setCoordinates(endCoords);
                placemark.properties.set('rotate', endAngle);
                callback && callback();
            }
        }

        moveUser();
    }

    function interpolateAngles(startAngle, endAngle, progress) {
        var delta = (endAngle - startAngle + 360) % 360;
        if (delta > 180) {
            delta -= 360;
        }
        return startAngle + delta * progress;
    }

    function getRotationAngleUser(from, to) {
        var angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
        return (angle * (180 / Math.PI) + 360) % 360;
    }


    function updateRouteSegmentStyle(route) {
        var pathOptions = {
            strokeColor: '00FF00FF',  // Зеленый цвет с полупрозрачностью
            strokeWidth: 5
        };

        route.getPaths().each(function (path) {
            path.options.set(pathOptions);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const ratingModal = document.getElementById('rating-modal');
        const closeButton = document.querySelector('.rating-modal-content .close-rating-modal');
        const ratingForm = document.getElementById('rating-form');

        // Функция для закрытия модального окна
        function closeModal() {
            ratingModal.style.display = 'none';
        }

        closeButton.addEventListener('click', closeModal);

        // Закрытие модального окна при клике вне его содержимого
        window.onclick = function (event) {
            if (event.target === ratingModal) {
                closeModal();
            }
        };

        // Закрытие модального окна при нажатии на клавишу Esc
        window.addEventListener('keydown', function (event) {
            if (event.key === "Escape") {
                closeModal();
            }
        });

        ratingForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const orderId = ratingModal.getAttribute('data-order-id');
            const driverId = ratingModal.getAttribute('data-driver-id');
            const userRating = ratingForm.querySelector('input[name="rating"]:checked').value;

            // Функция для завершения заказа, принимает ID заказа, ID водителя и рейтинг
            completeOrder(orderId, driverId, parseInt(userRating, 10)); // Преобразуем значение рейтинга в целое число
        });
    });

    function showRatingModal(orderId, driverId) {
        const ratingModal = document.getElementById('rating-modal');
        const overlay = document.getElementById('rating-modal-overlay');
        overlay.style.display = 'block'; // Показ оверлея
        ratingModal.style.display = 'block'; // Показ модального окна
        ratingModal.setAttribute('data-order-id', orderId);
        ratingModal.setAttribute('data-driver-id', driverId);
    }

    function closeModal() {
        const ratingModal = document.getElementById('rating-modal');
        const overlay = document.getElementById('rating-modal-overlay');
        overlay.style.display = 'none';
        ratingModal.style.display = 'none';
    }

    function showThankYouModal() {
        const thankYouModal = document.getElementById('thank-you-modal');
        thankYouModal.style.display = 'block';
    }

    document.addEventListener("DOMContentLoaded", function () {
        const thankYouModal = document.getElementById('thank-you-modal');
        const closeThankYouModal = document.querySelector('.close-thank-you-modal');
        console.log("DOMContentLoaded - модальное окно и кнопка закрытия должны быть доступны");


        // Закрытие модального окна при клике на крестик
        closeThankYouModal.addEventListener('click', function () {
            thankYouModal.style.display = 'none';
            console.log("Клик на крестик - модальное окно закрыто");
        });

        // Закрытие модального окна при клике вне его содержимого
        window.onclick = function (event) {
            if (event.target === thankYouModal) {
                thankYouModal.style.display = 'none';
            }
        };

        // Закрытие модального окна при нажатии на клавишу Esc
        document.addEventListener('keydown', function (event) {
            if (event.key === "Escape" && thankYouModal.style.display === 'block') {
                thankYouModal.style.display = 'none';
            }
        });
    });

    //здесь все про изменение аккаунта 

    function updateUserProfile() {
        console.log('Попытка обновить данные пользователя.');

        const fullname = localStorage.getItem('fullname');
        console.log('Полученное полное имя:', fullname);
        if (fullname) {

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
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
        } else {
            console.error('Не удалось найти модальное окно для редактирования профиля.');
        }
    }

    document.getElementById('edit-profile-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const fullname = document.getElementById('modal-fullname').value.trim();
        const currentPassword = document.getElementById('modal-password').value;
        const newPassword = document.getElementById('modal-new-password').value;
        const userId = Number(localStorage.getItem('userId'));

        if (!userId) {
            showNotification('Ошибка: ID пользователя не найден. Попробуйте перелогиниться.', false);
            return;
        }

        if (fullname && currentPassword) {
            updateFullname(userId, fullname, currentPassword);
        } else if (!currentPassword) {
            showNotification('Ошибка: для изменения ФИО необходимо ввести текущий пароль.', false);
            return;
        }

        if (currentPassword && newPassword) {
            changeUserPassword(userId, currentPassword, newPassword);
        }
    });

    function showNotification(message, isSuccess) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.background = isSuccess ? '#4CAF50' : '#f44336';
        notification.style.color = 'white';
        notification.style.padding = '15px';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1000';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0px 2px 5px rgba(0,0,0,0.2)';
        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(function () {
            document.body.removeChild(notification);
        }, 5000);

        if (!isSuccess) { // это не работает 
            const modal = document.getElementById('edit-user-modal');
            setTimeout(() => {
                modal.classList.add('shake-animation');
                setTimeout(() => modal.classList.remove('shake-animation'), 820);
            }, 100); // Задержка перед началом анимации
        }
    }


    function updateFullname(userId, fullname, currentPassword) {
        if (!currentPassword) {
            showNotification('Ошибка: необходимо ввести текущий пароль для подтверждения изменений!', false);
            return;
        }

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
    // все для карт

    function fetchCardInfo() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Пожалуйста, войдите в систему.');
            return;
        }

        // Преобразуем userId в число
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) {
            alert('Идентификатор пользователя не является числом.');
            return;
        }

        fetch('/api/changes/get_card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: numericUserId })
        })
            .then(response => response.json())
            .then(data => {
                const cardInfoElement = document.getElementById('card-last-four');
                if (data && data.length > 0) {
                    cardInfoElement.textContent = `•••• ${data[0].card_number_last_four}`;
                } else {
                    cardInfoElement.textContent = 'не привязана';
                }
            })
            .catch(error => {
                console.error('Ошибка при получении данных о карте:', error);
                alert('Ошибка при получении информации о карте. Пожалуйста, попробуйте снова.');
            });
    }
    document.getElementById('payment-method-button').addEventListener('click', fetchCardInfo);
}



