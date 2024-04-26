from typing import Any
import pandas as pd
from ..models.models import Order
from ..models.models import Driver
import json
from pathlib import Path
from flask import request
import sqlite3
import sqlite_query

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_ORDERS_PATH = BASE_DIR / "dataUsers.db"
TRIPS_PATH = BASE_DIR / "trips.csv"


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

    new_order = Order(
        user_id,
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
                    new_order.user_id,
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
