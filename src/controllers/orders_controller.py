from typing import Any
import pandas as pd
from ..models.models import Order
from ..models.models import Driver
import json
from pathlib import Path
from flask import request
import sqlite3
import sqlite_query

BASE_DIR = Path(__file__).resolve().parent.parent
ORDERS_PATH = BASE_DIR / "data_base_orders.db"
TRIPS_PATH = BASE_DIR / "trips.csv"


def create_order():
    conn = sqlite3.connect(ORDERS_PATH) 
    cur = conn.cursor()
    cur.execute(sqlite_query.create_table_orders)
    conn.commit()    


    order_data = request.get_json()

    customer_id = order_data["customer_id"] 
    pickup_location = order_data["pickup_location"]
    destination = order_data["destination"]
    distance = order_data["distance"]
    car_category = order_data["car_category"]
    start_time = order_data["start_time"]                                                                                                                                                                                                                                                                                                   
    end_time = order_data["end_time"]
    total_ride_time = order_data["total_ride_time"]
    order_amount = order_data["order_amount"]

    
    new_order = Order(
        customer_id,
        pickup_location,
        destination,
        distance,
        car_category,
        start_time,
        end_time,
        total_ride_time,
        order_amount,
    )
    
    cur.execute(sqlite_query.insert_orders,
                (
                    new_order.customer_id,
                    new_order.pickup_location,
                    new_order.destination,
                    new_order.distance,
                    new_order.car_category,
                    new_order.start_time,
                    new_order.end_time,
                    new_order.total_ride_time,
                    new_order.order_amount,
                ),
    )

    conn.commit()
    cur.close()
    conn.close()
    return new_order.get_order_details(), 201


def get_all_person(id_person: str) -> str:
    data_person = pd.read_csv("./data_base_orders.csv")
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
    return pd.read_csv(ORDERS_PATH).to_json(orient="records")
