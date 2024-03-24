import connexion
import requests
from flask import render_template

# Создаем экземпляр приложения Connexion
app = connexion.App(__name__, specification_dir="./")

# Добавляем API, описанное в файле swagger.yml
app.add_api("swagger.yml")


# Обработчик маршрута для домашней страницы
@app.route("/")
def home():
    # Отправляем GET-запрос к локальному серверу на порт 8086 для получения данных о людях
    response = requests.get("http://127.0.0.1:8086/api/people", timeout=5)

    # Проверяем успешность запроса
    if response.status_code == 200:
        # Если запрос успешен, получаем данные в формате JSON
        people_data = response.json()
    else:
        # Если произошла ошибка, устанавливаем пустой список
        people_data = []

    # Рендерим шаблон home.html, передавая данные о людях для отображения
    return render_template("home.html", data=people_data)


@app.route("/trips")
def trips():
    response = requests.get("http://127.0.0.1:8086/api/trips", timeout=5)

    if response.status_code == 200:
        trips_data = response.json()
    else:
        trips_data = []

    return render_template("trips.html", data=trips_data)


# Если файл app.py запускается напрямую, запускаем приложение на локальном сервере
if __name__ == "__main__":
    app.run("app:app", host="127.0.0.1", port=8086)
