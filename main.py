from flask import render_template, session, jsonify
from http import HTTPStatus
import connexion
import os
import sys
import sqlite3
import sqlite_query
from pathlib import Path


# секретный ключ
def generate_secret_key():
    return os.urandom(24)


BASE_DIR = Path(__file__).resolve().parent
DATA_USERS_PATH = BASE_DIR / "data.db"


current_dir = os.path.abspath(os.path.dirname(__file__))
src_dir = os.path.join(current_dir, "src")
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

app = connexion.App(__name__, specification_dir="./")
app.add_api("swagger.yml")

# установка ключа
app.app.secret_key = generate_secret_key()

conn = sqlite3.connect(DATA_USERS_PATH)  # создаем базу данных, если ее еще нет
cur = conn.cursor()
cur.execute(sqlite_query.create_table_users)
cur.execute(sqlite_query.create_table_cards)


@app.route("/")
def index():
    return render_template("login.html")  # главное окно с формой


@app.route("/main.html")
def main():
    return render_template("main.html")


@app.route("/standart.html")
def standart():
    return render_template("standart.html")


@app.route("/premium.html")
def premium():
    return render_template("premium.html")


@app.route("/VIP.html")
def vip():
    return render_template("VIP.html")


@app.route("/credit_card.html")
def credit_card():
    return render_template("credit_card.html")


@app.route("/get-user-id")
def get_user_id():
    user_id = session.get("user_id", None)
    if user_id:
        return jsonify({"user_id": user_id})
    else:
        return jsonify({"error": "User not logged in"}), HTTPStatus.UNAUTHORIZED


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
