from models import User
from hashlib import sha256
import json
import pandas as pd
from flask import jsonify, request, Response
from http import HTTPStatus
import pathlib

PATH = pathlib.Path(__name__).parent.resolve() / "dataUsers.csv"


def registration():
    DataBase = pd.read_csv(PATH)

    data = request.get_json()  # получаем данные формы пост запросом

    hashed_login = sha256()  # хэширование данных, используемых для аутентификации
    hashed_login.update(data["username"].encode())
    hashed_logemail = sha256()
    hashed_logemail.update(data["email"].encode())
    hashed_logpass = sha256()
    hashed_logpass.update(data["password"].encode())

    user = User(
        len(DataBase),
        data["fullname"],
        hashed_login.hexdigest(),
        hashed_logemail.hexdigest(),
        hashed_logpass.hexdigest(),
    )

    if user.username in DataBase["username"].to_list():
        return jsonify({"message": "Этот логин уже занят."}), HTTPStatus.BAD_REQUEST
    elif user.email in DataBase["email"].to_list():
        return (
            jsonify({"message": "Аккаунт с такой электронной почтой уже существует."}),
            HTTPStatus.BAD_REQUEST,
        )

    body = {  # формирование тела для response
        "user_id": len(DataBase),
        "fullname": user.fullname,
        "username": user.username,
        "email": user.email,
        "password": user.get_password(),
    }

    DataBase.loc[len(DataBase.index)] = [
        user.user_id,
        user.fullname,
        user.username,
        user.email,
        user._User__password,
    ]
    DataBase.to_csv(
        PATH,
        index=False,
    )

    return Response(json.dumps(body), HTTPStatus.OK, mimetype="application/json")


def entrance():

    DataBase = pd.read_csv(PATH)
    data = request.get_json()

    hashed_cur_log = sha256()  # хэширование полученных данных для сравнения
    hashed_cur_log.update(data["login_or_email"].encode())
    hashed_cur_log = hashed_cur_log.hexdigest()

    hashed_cur_logpass = sha256()
    hashed_cur_logpass.update(data["password"].encode())
    hashed_cur_logpass = hashed_cur_logpass.hexdigest()
    # проверка полученных данных и формирование запроса
    user_row = None

    # Попытка найти пользователя по username или email
    if (
        hashed_cur_log in DataBase["username"].values
        or hashed_cur_log in DataBase["email"].values
    ):
        user_row = DataBase.loc[
            (DataBase["username"] == hashed_cur_log)
            | (DataBase["email"] == hashed_cur_log)
        ]

    if user_row is not None and not user_row.empty:
        # Получаем первую строку, соответствующую пользователю
        user_data = user_row.iloc[0]

        # Подготавливаем данные пользователя для ответа
        body = {
            "user_id": str(user_data["user_id"]),
            "fullname": user_data["fullname"],
            "username": user_data["username"],
            "email": user_data["email"],
            "password": user_data["password"],
        }
        print(body)
        # Отправляем ответ
        return Response(json.dumps(body), HTTPStatus.OK, mimetype="application/json")

    return (
        jsonify({"message": "Неверный адрес электронной почты или логин."}),
        HTTPStatus.BAD_REQUEST,
    )
