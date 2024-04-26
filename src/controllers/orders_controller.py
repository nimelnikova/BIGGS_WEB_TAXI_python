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


def select_random_driver():
    conn = sqlite3.connect(DATA_ORDERS_PATH)
    cur = conn.cursor()
    cur.execute(sqlite_query.select_free_drivers)
    drivers = cur.fetchall()
    conn.close()
    
    if not drivers:
        return None
    
    driver = random.choice(drivers)
    return driver



def create_order():
    conn = sqlite3.connect(DATA_ORDERS_PATH) 
    cur = conn.cursor()
    cur.execute(sqlite_query.create_table_orders)
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


    driver = select_random_driver()
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
        waiting_time
    )
    
    cur.execute(sqlite_query.insert_orders,
                (
                    new_order.user_id,
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
                    new_order.waiting_time,
                ),
    )

    cur.execute(sqlite_query.update_driver_status_busy, (driver_id,))

    conn.commit()
    cur.close()
    conn.close()
    return new_order.get_order_details(), HTTPStatus.CREATED













def get_all_person(id_person: str) -> str:
    data_person = pd.read_csv("./data_base_orders.db")
    trips = []
    filtered_df = data_person[data_person["customer_id"] == id_person]
    for index, row in filtered_df.iterrows():
        order = Order(
            row["order_id"],
            row["customer_id"],
            row["pickup_location"],
            row["destination"],
            row["car_category"],
            row["order_amount"],
            row["start_time"],
            row["end_time"],
            row["total_ride_time"],
        )
        trips.append(order.get_order_details())
    return json.dumps(trips)


def delete_trip_by_id(trip_id: Any) -> None:
    # Чтение данных из CSV файла
    data_base = pd.read_csv("trips.csv")

    # Поиск строки с указанным trip_id и удаление ее из DataFrame
    data_base = data_base[data_base["trip_id"] != trip_id]

    # Запись обновленных данных обратно в CSV файл
    data_base = pd.read_csv(TRIPS_PATH)

def get_all():
    return pd.read_csv(TRIPS_PATH).to_json(orient="records")