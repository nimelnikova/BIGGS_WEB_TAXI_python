from typing import Any
import pandas as pd
from ..models.models import Order
from .drivers_controller import generate_table
import json
from pathlib import Path
from flask import request, jsonify
import sqlite3
import sqlite_query
import random
from http import HTTPStatus

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_ORDERS_PATH = BASE_DIR / "data.db"
TRIPS_PATH = BASE_DIR / "trips.csv"


def select_random_driver(car_category):
    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cursor = conn.cursor()
    if cursor.fetchone() is None:
        generate_table()

    cursor.execute(sqlite_query.checking_existence_table)
    cur = conn.cursor()
    cur.execute(sqlite_query.select_free_drivers, (car_category,))
    drivers = cur.fetchall()
    if not drivers:
        return None

    driver = random.choice(drivers)
    cur.close()
    conn.close()
    return driver


def create_order():
    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()
    cur.execute(sqlite_query.create_table_orders)
    conn.commit()
    conn.commit()

    order_data = request.get_json()

    user_id = order_data["user_id"]
    pickup_location = order_data["pickup_location"]
    destination = order_data["destination"]
    distance = order_data["distance"]
    car_category = order_data["car_category"]
    start_time = order_data["start_time"]
    end_time = order_data["end_time"]
    total_ride_time = order_data["total_ride_time"]
    order_amount = order_data["order_amount"]
    payment_method = order_data["payment_method"]

    driver = select_random_driver(car_category)
    if driver is None:
        return (
            jsonify({"message": "Нет доступных водителей. Попробуйте заказать позже."}),
            HTTPStatus.BAD_REQUEST,
        )

    waiting_time = random.randint(5, 30)
    driver_id = driver[0]
    car_number = driver[5]
    driver_average_raiting = driver[7]
    driver_name = driver[1]
    car = driver[2]
    car_image = driver[3]

    new_order = Order(
        user_id,
        driver_id,
        driver_name,
        driver_average_raiting,
        pickup_location,
        destination,
        distance,
        car_category,
        car,
        start_time,
        end_time,
        total_ride_time,
        order_amount,
        payment_method,
        waiting_time,
        "active",
    )

    cur.execute(sqlite_query.insert_orders,
                (
                    new_order.user_id,
                    new_order.driver_id,
                    new_order.driver_name,
                    new_order.driver_average_raiting,
                    new_order.pickup_location,
                    new_order.destination,
                    new_order.distance,
                    new_order.car_category,
                    new_order.car,
                    new_order.start_time,
                    new_order.end_time,
                    new_order.total_ride_time,
                    new_order.order_amount,
                    new_order.payment_method,
                    new_order.waiting_time,
                    new_order.status,
                ),
                )

    cur.execute(sqlite_query.update_driver_status_busy, (driver_id,))

    conn.commit()
    cur.close()
    conn.close()

    # return new_order.get_order_details(), HTTPStatus.CREATED
    # Возвращаем только сообщение об успешном заказе
    return (
        jsonify(
            {
                "message": "Заказ успешно создан",
                "driver": {
                    "name": driver_name,
                    "car": car,
                    "car_number": car_number,
                    "average_rating": driver_average_raiting,
                    "waiting_time": waiting_time,
                    "image": car_image,
                },
            }
        ),
        HTTPStatus.CREATED,
    )


def get_order_id():
    user_id = request.args.get("user_id")

    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()
    cur.execute(sqlite_query.get_user_order, (user_id,))
    orders = cur.fetchone()

    if orders is None:
        return (
            jsonify({"message": "Заказ не найден для данного user_id"}),
            HTTPStatus.BAD_REQUEST,
        )

    order_id = orders[0]
    driver_id = orders[1]

    cur.close()
    conn.close()

    return jsonify(
        {
            "order_id": order_id,
            "driver_id": driver_id,
        }
    )




def complete_order():
    order_data = request.get_json()
    order_id = order_data["order_id"]
    driver_id = order_data["driver_id"]
    user_rating = int(order_data["user_rating"])

    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()

    # Получаем информацию о заказе
    cur.execute(sqlite_query.select_id_order, (order_id,))
    order_info = cur.fetchone()

    if order_info is None:
        return (
            jsonify({"message": "Заказ с указанным ID не найден."}), HTTPStatus.NOT_FOUND,
        )

    # Обновляем статус водителя
    cur.execute(sqlite_query.update_driver_status_free, (driver_id,))
    conn.commit()

    # Обновляем рейтинг водителя
    cur.execute(sqlite_query.select_driver_id, (driver_id,))
    driver = cur.fetchone()

    if driver is None:
        return (
            jsonify({"message": "Водитель с указанным ID не найден."}),
            HTTPStatus.NOT_FOUND,
        )

    current_rating = float(driver[8])  # Преобразование из строки в float
    total_trips = int(driver[7])  # Преобразование из строки в int

    # Вычисление нового рейтинга
    new_rating = round(
        (current_rating * total_trips + user_rating) / (total_trips + 1), 2
    )
    total_trips += 1

    # Обновление рейтинга и количества поездок водителя
    cur.execute(
        sqlite_query.update_driver_rating_and_orders,
        (new_rating, total_trips, driver_id),
    )

    conn.commit()

    # Меняем статус заказа на завершенный
    cur.execute(sqlite_query.update_order_status_completed, (order_id,))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Заказ успешно завершен"}), HTTPStatus.OK



def get_user_trip_history(user_id):
    # Функция для получения истории поездок пользователя.

    try:
        conn = sqlite3.connect(DATA_ORDERS_PATH)
        cur = conn.cursor()
        cur.execute("SELECT pickup_location, destination, order_amount, start_time FROM orders WHERE user_id = ?",
                    (user_id,))
        orders = cur.fetchall()
        cur.close()
        conn.close()

        if not orders:
            return jsonify({"message": "История поездок не найдена для данного пользователя."}), HTTPStatus.NOT_FOUND

        trip_history = [
            {
                "pickup_location": order[0],
                "destination": order[1],
                "order_amount": order[2],
                "start_time": order[3]
            }
            for order in orders
        ]
        return jsonify(trip_history), HTTPStatus.OK

    except sqlite3.Error as e:
        return jsonify({"message": f"Ошибка базы данных: {e}"}), HTTPStatus.INTERNAL_SERVER_ERROR


def delete_trip_by_id(trip_id):
    # Функция для удаления поездки по её ID.

    try:
        conn = sqlite3.connect(DATA_ORDERS_PATH)
        cur = conn.cursor()
        cur.execute("DELETE FROM orders WHERE order_id = ?", (trip_id,))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Поездка успешно удалена."}), HTTPStatus.OK

    except sqlite3.Error as e:
        return jsonify({"message": f"Ошибка базы данных: {e}"}), HTTPStatus.INTERNAL_SERVER_ERROR


def get_all_trips():
    # Функция для получения всех поездок из базы данных.

    try:
        conn = sqlite3.connect(DATA_ORDERS_PATH)
        cur = conn.cursor()

        # Выполняем SQL-запрос для получения всех поездок
        cur.execute("SELECT * FROM orders")
        orders = cur.fetchall()

        cur.close()
        conn.close()

        if not orders:
            return jsonify({"message": "Нет поездок в базе данных."}), HTTPStatus.NOT_FOUND

        all_trips = [Order(*order).get_order_details() for order in orders]
        return jsonify(all_trips), HTTPStatus.OK

    except sqlite3.Error as e:
        return jsonify({"message": f"Ошибка базы данных: {e}"}), HTTPStatus.INTERNAL_SERVER_ERROR
