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


    return render_template("./")


# Если файл app.py запускается напрямую, запускаем приложение на локальном сервере
if __name__ == "__main__":
    app.run("app:app", host="127.0.0.1", port=8086)