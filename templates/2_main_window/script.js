ymaps.ready(init);

let multiRoute;
let searchTimeout;

function init() {
    var centerCoords = [55.809732, 37.498923];
    var myMap = new ymaps.Map("map", {
        center: centerCoords,
        zoom: 16,
        controls: []
    });

    var myPlacemark = new ymaps.Placemark(myMap.getCenter(), {}, {
        iconLayout: 'default#image',
        iconImageHref: 'https://cdn.glitch.global/a86765e8-1541-4f1b-a7f0-d84ed902069d/untitled.svg?v=1710322216857', // Сюда вставьте ваш URL
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
        iconImageHref: 'https://cdn.glitch.global/a86765e8-1541-4f1b-a7f0-d84ed902069d/free-icon-finish-flag-1986872%202.svg?v=1711293853074',
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
}