import sqlite3
import sqlite_query
from flask import request, jsonify
from http import HTTPStatus
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_CARDS_PATH = BASE_DIR / "data.db"


def add_card():

    conn = sqlite3.connect(DATA_CARDS_PATH)
    cur = conn.cursor()
    data = request.get_json()

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
            "card_number_last_four": row[1][(15 - 3):],
        })
    
    return jsonify(cards)
