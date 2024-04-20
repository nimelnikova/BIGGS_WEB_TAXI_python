from ..models.user_model import User
from hashlib import sha256
import json
import pandas as pd
from flask import jsonify, request, Response, session
from http import HTTPStatus
from pathlib import Path
import sqlite3
import sqlite_query


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_USERS_PATH = BASE_DIR / "dataUsers.db"


def registration():
    conn = sqlite3.connect(DATA_USERS_PATH)  # создаем базу данных, если ее еще нет
    cur = conn.cursor()

    data = request.get_json()  # получаем данные формы пост запросом

    hashed_login = sha256()  # Хэширование данных, используемых для аутентификации
    hashed_login.update(data["username"].encode())
    hashed_login_result = hashed_login.hexdigest()

    hashed_logemail = sha256()
    hashed_logemail.update(data["email"].encode())
    hashed_logemail_result = hashed_logemail.hexdigest()

    hashed_password = sha256()
    hashed_password.update(data["password"].encode())
    hashed_password_result = hashed_password.hexdigest()

    user = User(
        data["fullname"],
        hashed_login_result,
        hashed_logemail_result,
        hashed_password_result,
    )

    # проверка на существование пользователя с таким логином
    cur.execute(sqlite_query.check_user_login, (user.username,))
    exists = cur.fetchone()[0]

    if exists:
        return jsonify({"message": "Этот логин уже занят."}), HTTPStatus.BAD_REQUEST

    # проверка на существование пользователя с такой почтой
    cur.execute(sqlite_query.check_user_email, (user.email,))
    exists = cur.fetchone()[0]

    if exists:
        return (
            jsonify({"message": "Аккаунт с такой электронной почтой уже существует."}),
            HTTPStatus.BAD_REQUEST,
        )

    cur.execute(
        sqlite_query.insert_user,
        (
            user.fullname,
            user.username,
            user.email,
            user._User__password,
        ),
    )

    user_id = cur.lastrowid  # Получаем ID вставленного пользователя

    session["user_id"] = user_id  # Устанавливаем user_id в сессию

    # Тело ответа должно содержать только необходимую информацию
    body = {
        "id": user_id,
        "fullname": user.fullname,
        "username": user.username,
        "email": user.email,
    }

    conn.commit()
    cur.close()
    conn.close()

    # Возвращаем ответ без пароля и с правильным MIME типом
    return jsonify(body), HTTPStatus.CREATED


def entrance():

    conn = sqlite3.connect(DATA_USERS_PATH)
    cur = conn.cursor()

    data = request.get_json()

    # хэширование полученных данных для сравнения
    hashed_log = sha256()
    hashed_log.update(data["login_or_email"].encode())
    hashed_log_result = hashed_log.hexdigest()

    hashed_password = sha256()
    hashed_password.update(data["password"].encode())
    hashed_password_result = hashed_password.hexdigest()

    # Попытка найти пользователя по username или email
    cur.execute(sqlite_query.check_user_login, (hashed_log_result,))
    login_exists = cur.fetchone()[0]

    cur.execute(sqlite_query.check_user_email, (hashed_log_result,))
    email_exists = cur.fetchone()[0]

    # Получаем пароль пользователя
    cur.execute(
        sqlite_query.check_user,
        (
            hashed_log_result,
            hashed_log_result,
        ),
    )
    rows = cur.fetchone()
    data = [0] * 5
    for i, row in enumerate(rows):
        data[i] = row

    cur_id = data[0]
    cur_name = data[1]
    cur_login = data[2]
    cur_email = data[3]
    cur_password = data[4]

    if login_exists or email_exists:
        if (  # Сравниваем пароль пользователя с переданным
            hashed_password_result == cur_password
        ):
            body = {  # Формируем тело пользователя для ответа
                "user_id": cur_id,
                "fullname": cur_name,
                "username": cur_login,
                "email": cur_email,
                "password": cur_password,
            }
            conn.close()
            # Отправляем ответ
            return Response(
                json.dumps(body), HTTPStatus.OK, mimetype="application/json"
            )
        conn.close()
        return (
            jsonify({"message": "Неверный пароль."}),
            HTTPStatus.BAD_REQUEST,
        )
    conn.close()
    return (
        jsonify({"message": "Неверный адрес электронной почты или логин."}),
        HTTPStatus.BAD_REQUEST,
    )
