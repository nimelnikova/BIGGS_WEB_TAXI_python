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
    data_person = pd.read_csv("./data_base_orders.csv")
    trips = []
    filtered_df = data_person[data_person['customer_id'] == id_person]
    for index, row in filtered_df.iterrows():
        order = Order(row['order_id'], row['customer_id'], row['pickup_location'], row['destination'],
                      row['car_category'], row['order_amount'], row['start_time'], row['end_time'],
                      row['total_ride_time'])
        trips.append(order.get_order_details())
    return json.dumps(trips)


def get_all():
    return pd.read_csv("./data_base_orders.csv").to_json(orient="records")
