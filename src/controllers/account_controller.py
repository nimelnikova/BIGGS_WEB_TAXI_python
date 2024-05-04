import json
import sqlite3
import sqlite_query
from hashlib import sha256
from pathlib import Path
from flask import jsonify, request, Response
from http import HTTPStatus


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_USERS_PATH = BASE_DIR / "data.db"


def hash_password(password):
    hashed_password = sha256()  # Хэширование данных, используемых для аутентификации
    hashed_password.update(password.encode())
    hashed_password_result = hashed_password.hexdigest()
    return hashed_password_result


def change_fullname():
    data = request.get_json()
    if not all(k in data for k in ["id", "password", "new_fullname"]):
        return (
            jsonify({"message": "Не все данные предоставлены."}),
            HTTPStatus.BAD_REQUEST,
        )

    try:
        with sqlite3.connect(DATA_USERS_PATH) as conn:
            cur = conn.cursor()
            # В  ДАТЕ  БУДЕТ (1) id, (2) ФИО ДЛЯ ИЗМЕНЕНИЯ И (3) ПАРОЛЬ ДЛЯ УДОСТОВЕРЕНИЯ ЛИЧНОСТИ

            # Проверяем пароль
            cur.execute(sqlite_query.check_user_password, (data["id"],))
            record = cur.fetchone()
            if record is None:
                return (
                    jsonify({"message": "Пользователь не найден."}),
                    HTTPStatus.NOT_FOUND,
                )

            if hash_password(data["password"]) == record[0]:
                # Обновляем ФИО
                cur.execute(
                    sqlite_query.update_user_fullname,
                    (data["new_fullname"], data["id"]),
                )
                conn.commit()

                # Возвращаем обновленные данные пользователя
                cur.execute(sqlite_query.check_user_by_id, (data["id"],))
                user_data = cur.fetchone()
                user_info = {
                    "id": user_data[0],
                    "fullname": user_data[1],
                    "username": user_data[2],
                    "email": user_data[3],
                    "payment_method": user_data[5],
                }
                return jsonify(user_info), HTTPStatus.OK
            else:
                return jsonify({"message": "Неверный пароль."}), HTTPStatus.BAD_REQUEST
    except sqlite3.DatabaseError as e:
        return (
            jsonify({"message": "Ошибка базы данных: " + str(e)}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


def change_password():

    conn = sqlite3.connect(DATA_USERS_PATH)
    cur = conn.cursor()

    # В  ДАТЕ  БУДЕТ (1) id, (2) ПАРОЛЬ ДЛЯ ИЗМЕНЕНИЯ И (3) ТЕКУЩИЙ ПАРОЛЬ ДЛЯ УДОСТОВЕРЕНИЯ ЛИЧНОСТИ
    data = request.get_json()

    if not all(k in data for k in ["id", "password", "new_password"]):
        return (
            jsonify({"message": "Необходимые данные не предоставлены."}),
            HTTPStatus.BAD_REQUEST,
        )

    user_id = int(data["id"])  # Преобразование типа id в целочисленный
    current_password = data["password"]
    new_password = data["new_password"]

    try:
        with sqlite3.connect(DATA_USERS_PATH) as conn:
            cur = conn.cursor()

            # Проверка текущего пароля пользователя
            cur.execute(sqlite_query.check_user_password, (user_id,))
            record = cur.fetchone()
            if not record:
                return (
                    jsonify({"message": "Пользователь не найден."}),
                    HTTPStatus.NOT_FOUND,
                )

            # Сверяем хеш текущего пароля с хранимым в базе
            if hash_password(current_password) != record[0]:
                return (
                    jsonify({"message": "Неверный текущий пароль."}),
                    HTTPStatus.UNAUTHORIZED,
                )

            # Обновление пароля пользователя
            hashed_new_password = hash_password(new_password)
            cur.execute(
                sqlite_query.update_user_password, (hashed_new_password, user_id)
            )
            conn.commit()

            return jsonify({"message": "Пароль успешно изменен."}), HTTPStatus.OK

    except sqlite3.Error as e:
        return (
            jsonify({"message": f"Ошибка базы данных: {e}"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


def change_payment_method():

    conn = sqlite3.connect(DATA_USERS_PATH)
    cur = conn.cursor()

    # В ДАТЕ БУДЕТ (1) id, (2) НОВЫЙ СПОСОБ ОПЛАТЫ (1, ЕСЛИ КАРТОЙ; 0, ЕСЛИ НАЛИЧНЫМИ)
    data = request.get_json()

    cur.execute(sqlite_query.check_user_payment_method, (data["id"]))

    if data["new_payment_method"] == cur.fetchone()[0]:

        cur.execute(sqlite_query.check_user_payment_method, (data["id"]))

        if data["new_payment_method"] == cur.fetchone()[0]:

            return (
                jsonify({"message": "Такой способ оплаты уже выбран."}),
                HTTPStatus.BAD_REQUEST,
            )
        else:
            cur.execute(
                sqlite_query.update_user_payment_method,
                (data["new_payment_method"], data["id"]),
            )
            conn.commit()
    else:

        return (jsonify({"message": "Неверный пароль."}), HTTPStatus.BAD_REQUEST)

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

    return Response(json.dumps(body), HTTPStatus.OK, mimetype="application/json")
