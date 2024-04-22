from dataclasses import dataclass


@dataclass
class Order:
    customer_id: int  # id клиент
    pickup_location: str
    destination: str
    distance: float  # km
    car_category: str
    # taxi_driver: str пока хз как реализовать лучше
    start_time: str
    end_time: str
    total_ride_time: int  # в минутах рассчитывается
    order_amount: int

    def get_order_details(self):
        return {
            "customer_id": self.customer_id,
            "pickup_location": self.pickup_location,
            "destination": self.destination,
            "distance": self.distance,
            "car_category": self.car_category,
            # "taxi_driver": self.taxi_driver,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "total_ride_time": self.total_ride_time,
            "order_amount": self.order_amount,
        }
    
class Driver:
    driver_id: int
    name: str
    car_model: str
    current_location: str
    status: str   
    
    def change_status(self, new_status):
        self.status = new_status

    def update_location(self, new_location):
        self.update_location = new_location
