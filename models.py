from dataclasses import dataclass

@dataclass
class Order:
    order_id: int #id заказа
    customer_id: int #id клиент
    pickup_location: str
    desstination: str
    distance: float #km
    car_category: str
    #taxi_driver: str пока хз как реализовать лучше
    start_time: str
    end_time: str
    total_ride_time: int #в минутах рассчитывается
    order_amount: int 
         

    def get_order_details(self):
        return {
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "pickup_location": self.pickup_location,
            "desstination": self.desstination,
            "car_category": self.car_category,
            #"taxi_driver": self.taxi_driver,
            "order_amount": self.order_amount,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "total_ride_time": self.total_ride_time 
        }
    
