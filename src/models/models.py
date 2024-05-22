from dataclasses import dataclass


@dataclass
class Order:
    user_id: int  # id клиент
    driver_id: int
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
    payment_method: str
    waiting_time: int
    status: str

    def get_order_details(self):
        return {
            "user_id": self.user_id,
            "driver_id": self.driver_id,
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
            "payment_method": self.payment_method,
            "waiting_time": self.waiting_time,
            "status": self.status,
        }


class User:

    def __init__(self, fullname, username, email, password, payment_method):
        self.fullname = fullname
        self.username = username
        self.email = email
        self.__password = password
        # payment_methos = 0, если оплата наличными, = 1, если оплата картой
        self.payment_method = payment_method

    def get_password(self):
        return self.__password

    def __str__(self):
        return f"Пользователь {self.username} с электронной почтой {self.email}."
