import json
import sqlite3
import sqlite_query
from hashlib import sha256
from pathlib import Path
from flask import jsonify, request, Response
from http import HTTPStatus


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_USERS_PATH = BASE_DIR / "dataUsers.db"


def hash_password(password):
    hashed_password = sha256()  # Хэширование данных, используемых для аутентификации
    hashed_password.update(password.encode())
    hashed_password_result = hashed_password.hexdigest()
    return hashed_password_result


def change_fullname():

    conn = sqlite3.connect(DATA_USERS_PATH)
    cur = conn.cursor()

    # В  ДАТЕ  БУДЕТ (1) id, (2) ФИО ДЛЯ ИЗМЕНЕНИЯ И (3) ПАРОЛЬ ДЛЯ УДОСТОВЕРЕНИЯ ЛИЧНОСТИ
    data = request.get_json() 

    cur.execute(sqlite_query.check_user_password, (data["id"]))

    if (
        hash_password(data["password"]) == cur.fetchone()[0]
    ):
        cur.execute(
            sqlite_query.update_user_fullname, (data["new_fullname"], data["id"])
        )
    else:
        return (jsonify({"message": "Неверный пароль."}),
                HTTPStatus.BAD_REQUEST)

    # ПОДГОТОВКА ТЕЛА ДЛЯ ОТВЕТА
    cur.execute(sqlite_query.check_user_by_id, (data["id"]))
    rows = cur.fetchone()

    data = [0] * 6
    for i, row in enumerate(rows):
        data[i] = row

    cur_id = data[0]
    cur_name = data[1]
    cur_login = data[2]
    cur_email = data[3]
    cur_payment_method = data[5]

    body = {
        "id": cur_id,
        "fullname": cur_name,
        "username": cur_login,
        "email": cur_email,
        "payment_method": cur_payment_method,
    }

    return Response(
        json.dumps(body), HTTPStatus.OK, mimetype="application/json"
    )


def change_password():

    conn = sqlite3.connect(DATA_USERS_PATH)
    cur = conn.cursor()

    # В  ДАТЕ  БУДЕТ (1) id, (2) ПАРОЛЬ ДЛЯ ИЗМЕНЕНИЯ И (3) ТЕКУЩИЙ ПАРОЛЬ ДЛЯ УДОСТОВЕРЕНИЯ ЛИЧНОСТИ
    data = request.get_json()

    cur.execute(sqlite_query.check_user_password, (data["id"]))

    if (
        hash_password(data["password"]) == cur.fetchone()[0]
    ):
        cur.execute(
            sqlite_query.update_user_password, (hash_password(data["new_password"]), data["id"])
        )
    else:
        return (jsonify({"message": "Неверный пароль."}),
                HTTPStatus.BAD_REQUEST)
    
    # ПОДГОТОВКА ТЕЛА ДЛЯ ОТВЕТА
    cur.execute(sqlite_query.check_user_by_id, (data["id"]))
    rows = cur.fetchone()

    data = [0] * 6
    for i, row in enumerate(rows):
        data[i] = row

    cur_id = data[0]
    cur_name = data[1]
    cur_login = data[2]
    cur_email = data[3]
    cur_password = data[4]
    cur_payment_method = data[5]

    body = {
        "id": cur_id,
        "fullname": cur_name,
        "username": cur_login,
        "email": cur_email,
        "password": cur_password,
        "payment_method": cur_payment_method,
    }

    return Response(
        json.dumps(body), HTTPStatus.OK, mimetype="application/json"
    )


def change_payment_method():

    conn = sqlite3.connect(DATA_USERS_PATH)
    cur = conn.cursor()

    # В ДАТЕ БУДЕТ (1) id, (2) НОВЫЙ СПОСОБ ОПЛАТЫ (1, ЕСЛИ КАРТОЙ; 0, ЕСЛИ НАЛИЧНЫМИ), (3) ПАРОЛЬ ДЛЯ УДОСТОВЕРЕНИЯ ЛИЧНОСТИ 
    data = request.get_json()

    cur.execute(sqlite_query.check_user_password, (data["id"]))

    if (
        hash_password(data["password"]) == cur.fetchone()[0]
    ):
        
        cur.execute(sqlite_query.check_user_payment_method, (data["id"]))

        if (
            data["new_payment_method"] == cur.fetchone()[0]
        ):
            return (jsonify({"message": "Такой способ оплаты уже выбран."}),
                    HTTPStatus.BAD_REQUEST)
        else:
            cur.execute(
                sqlite_query.update_user_payment_method, (data["new_payment_method"], data["id"])
            )
    else:
        return (jsonify({"message": "Неверный пароль."}),
                    HTTPStatus.BAD_REQUEST)
    
    # ПОДГОТОВКА ТЕЛА ДЛЯ ОТВЕТА
    cur.execute(sqlite_query.check_user_by_id, (data["id"]))
    rows = cur.fetchone()

    data = [0] * 6
    for i, row in enumerate(rows):
        data[i] = row

    cur_id = data[0]
    cur_name = data[1]
    cur_login = data[2]
    cur_email = data[3]
    cur_payment_method = data[5]

    body = {
        "id": cur_id,
        "fullname": cur_name,
        "username": cur_login,
        "email": cur_email,
        "payment_method": cur_payment_method,
    }

    return Response(
        json.dumps(body), HTTPStatus.OK, mimetype="application/json"
    )


# def add_card():

#     conn = sqlite3.connect(DATA_USERS_PATH)
#     cur = conn.cursor()

#     data = request.get_json()

#     cur.execute(sqlite_query.insert_card, (
#         data["id"], data["card"]
#     ))