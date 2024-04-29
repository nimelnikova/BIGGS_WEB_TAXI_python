import sqlite3
import sqlite_query
from cryptography.fernet import Fernet
from flask import request, jsonify
from http import HTTPStatus
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_CARDS_PATH = BASE_DIR / "data.db"


def add_card():

    conn = sqlite3.connect(DATA_CARDS_PATH)
    cur = conn.cursor()
    data = request.get_json()

    # ШИФРОВАНИЕ ДАННЫХ КАРТЫ С ВОЗМОЖНОСТЬЮ РАСШИФРОВКИ

    # key = Fernet.generate_key()
    # cipher = Fernet(key)

    # encrypted_data = {
    #     "id": data["id"],
    #     "card_number": cipher.encrypt(
    #         data["card_number"].encode("utf-8")
    #     ),
    #     "card_holder": cipher.encrypt(
    #         data["card_holder"].encode("utf-8")
    #     ),
    #     "month": cipher.encrypt(
    #         data["month"].encode("utf-8")
    #     ),
    #     "year": cipher.encrypt(
    #         data["year"].encode("utf-8")
    #     ),
    #     "cvv": cipher.encrypt(
    #         data["cvv"].encode("utf-8")
    #     ),
    # }

    # ПРОВЕРКА НА УЖЕ СУЩЕСТВОВАНИЕ ТАКОЙ КАРТЫ

    cur.execute(sqlite_query.check_card_exists, (
        data["card_number"],
    ))
    card_exists = cur.fetchone()[0]

    if card_exists:
        return (
            jsonify({"message": "Карта с таким номером уже существует."}),
            HTTPStatus.BAD_REQUEST
        )

    # ID ПОЛЬЗОВАТЕЛЯ И ДАЛЕЕ ДАННЫЕ КАРТЫ

    cur.execute(sqlite_query.insert_card, (
        data["id"],
        data["card_number"],
        data["card_holder"],
        data["month"],
        data["year"],
        data["cvv"],
    ))
    conn.commit()

    return (
        jsonify({"message": "Карта была успешно добавлена."}),
        HTTPStatus.OK
    )


def get_card():

    conn = sqlite3.connect(DATA_CARDS_PATH)
    cur = conn.cursor()

    data = request.get_json()

    cur.execute(sqlite_query.get_user_card, (
        data["id"],
    ))
    rows = cur.fetchall()

    cards = []
    for row in rows:
        cards.append({
            "id": row[0],
            "card_number": row[1],
            "card_holder": row[2],
            "month": row[3],
            "year": row[4],
            "cvv": row[5],
        })
    
    return jsonify(cards)
