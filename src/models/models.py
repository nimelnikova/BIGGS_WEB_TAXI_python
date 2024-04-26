from dataclasses import dataclass


@dataclass
class Order:
    user_id: int  # id клиент
    driver_name: str
    driver_average_raiting: float
    pickup_location: str
    destination: str
    distance: float  # km
    car_category: str
    car: str
    start_time: str
    end_time: str
    total_ride_time: int  # в минутах рассчитывается
    order_amount: int
    waiting_time: int

    def get_order_details(self):
        return {
            "user_id": self.user_id,
            "driver_name": self.driver_name,
            "driver_average_raiting": self.driver_average_raiting,
            "pickup_location": self.pickup_location,
            "destination": self.destination,
            "distance": self.distance,
            "car_category": self.car_category,
            "car": self.car,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "total_ride_time": self.total_ride_time,
            "order_amount": self.order_amount,
            "waiting_time": self.waiting_time
        }
    
