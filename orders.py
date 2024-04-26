from typing import Any
import pandas as pd
from models import Order
import json


def create_order(order):
    customer_id = order.get("customer_id")  # тут либо айдишник будет у каждого свой, либо по логину
    pickup_location = order.get("pickup_location")
    destination = order.get("destination")
    distance = order.get("distance")
    car_category = order.get("car_category")
    start_time = order.get("start_time")
    end_time = order.get("end_time")
    total_ride_time = order.get("total_ride_time")
    order_amount = order.get("order_amount")

    # нужно будет потом сделать поиск водителей и тд в классе как я понимаю, поэтому пока только черновой вариант
    # путь надо будет поменять у data_base
    data_base = pd.read_csv("./data_base_orders.csv")
    new_order = Order(data_base.shape[0], customer_id, pickup_location, destination, distance, car_category,
                      start_time, end_time, total_ride_time, order_amount)
    data_base.loc[data_base.shape[0]] = [data_base.shape[0], new_order.customer_id, new_order.pickup_location,
                                         new_order.desstination, new_order.distance,
                                         new_order.car_category, new_order.start_time, new_order.end_time,
                                         new_order.total_ride_time, new_order.order_amount]
    data_base.to_csv("./data_base_orders.csv", index=False)
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

