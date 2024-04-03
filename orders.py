import pandas as pd
from models import Order

def create_order(order):
        customer_id = order.get("customer_id") #тут либо айдишник будет у каждого свой, либо по логину
        pickup_location = order.get("pickup_location")
        desstination = order.get("desstination")
        distance = order.get("distance")
        car_category = order.get("car_category")
        start_time = order.get("start_time")
        end_time = order.get("end_time")
        total_ride_time = order.get("total_ride_time")
        order_amount = order.get("order_amount")

        # нужно будет потом сделать поиск водителей и тд в классе как я понимаю, поэтому пока только черновой вариант
        #путь надо будет поменять у data_base
        data_base = pd.read_csv("./data_base_orders.csv")
        new_order = Order(data_base.shape[0], customer_id, pickup_location, desstination, distance, car_category, 
                          start_time, end_time, total_ride_time, order_amount)
        data_base.loc[data_base.shape[0]] = [data_base.shape[0], new_order.customer_id, new_order.pickup_location, new_order.desstination, new_order.distance, 
                                             new_order.car_category, new_order.start_time, new_order.end_time, new_order.total_ride_time, new_order.order_amount]
        data_base.to_csv("./data_base_orders.csv", index=False)
        return new_order.get_order_details(), 201




def get_all():
        return pd.read_csv("./data_base_orders.csv").to_json(orient="records")



