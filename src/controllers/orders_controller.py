from typing import Any
import pandas as pd
from ..models.models import Order
import json
from pathlib import Path
from flask import request, jsonify
import sqlite3
import sqlite_query
import random
from http import HTTPStatus

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_ORDERS_PATH = BASE_DIR / "dataUsers.db"
TRIPS_PATH = BASE_DIR / "trips.csv"


def select_random_driver(car_category):
    conn = sqlite3.connect(DATA_ORDERS_PATH)
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
    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()
    cur.execute(sqlite_query.create_table_orders)
    conn.commit()
    conn.commit()

    order_data = request.get_json()

    user_id = order_data["user_id"]
    user_id = order_data["user_id"]
    pickup_location = order_data["pickup_location"]
    destination = order_data["destination"]
    distance = order_data["distance"]
    car_category = order_data["car_category"]
    start_time = order_data["start_time"]
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
    driver_average_raiting = driver[7]
    driver_name = driver[1]
    car = driver[2]
    
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
        waiting_time
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
                ),
    )

    cur.execute(sqlite_query.update_driver_status_busy, (driver_id,))

    conn.commit()
    cur.close()
    conn.close()
    return new_order.get_order_details(), HTTPStatus.CREATED


def complete_order():
    #Получаем инфу о заказе и завершаем его
    order_data = request.get_json()
    order_id = order_data["order_id"]
    driver_id = order_data["driver_id"]
    user_rating = order_data["user_rating"]

    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()
    cur.execute(sqlite_query.select_id_order, (order_id,))
    order_info = cur.fetchone()
    cur.close()
    conn.close()

    if order_info is None:
        return (
            jsonify({"message": "Заказ с указанным ID не найден."}), HTTPStatus.NOT_FOUND,
        )
    driver_name = order_info[2]

    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()
    cur.execute(sqlite_query.update_driver_status_free, (driver_name,))
    conn.commit()

    #Обновляем рейтинг водителя
    cur.execute(sqlite_query.select_driver_id, (driver_id,))
    driver = cur.fetchone()
    
    current_rating = driver[7]
    total_orders = driver[6]
    new_rating = round((current_rating * total_orders + user_rating) / (total_orders + 1), 2)
    total_orders += 1

    cur.execute(sqlite_query.update_driver_rating_and_orders, (new_rating, total_orders, driver_id))
    conn.commit()
    conn.close()

    return (
        jsonify({"message": "Заказ успешно завершен"}), HTTPStatus.OK
    )


def get_all_person(id_person: str) -> str:
    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()

    cur.execute("SELECT * FROM orders WHERE user_id=?", (id_person,))
    orders = cur.fetchall()

    trips = []
    for order in orders:
        trip = Order(*order)
        trips.append(trip.get_order_details())

    cur.close()
    conn.close()

    return json.dumps(trips)


def delete_trip_by_id(trip_id: Any) -> None:
    conn = sqlite3.connect(TRIPS_PATH)
    cur = conn.cursor()

    cur.execute("DELETE FROM trips WHERE trip_id=?", (trip_id,))
    conn.commit()

    cur.close()
    conn.close()


def get_all():
    conn = sqlite3.connect(TRIPS_PATH)
    cur = conn.cursor()

    cur.execute("SELECT * FROM trips")
    trips = cur.fetchall()

    cur.close()
    conn.close()

    return pd.DataFrame(trips,
                        columns=["trip_id", "user_id", "pickup_location", "destination", "car_category", "start_time",
                                 "end_time", "total_ride_time", "order_amount"]).to_json(orient="records")
