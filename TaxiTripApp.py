import datetime
from geopy.geocoders import Nominatim

class TaxiTrip:

    @property
    def __current_time(self):
        self._current_time = datetime.datetime.now()
        return self._current_time

    def __get_coordinates(self, city_name):
        geolocator = Nominatim(user_agent="geoapiExercises")
        location = geolocator.geocode(city_name)
        if location:
            return location.latitude, location.longitude
        else:
            return None

    @staticmethod
    def calculate_duration(start_time, end_time):
        duration = end_time - start_time
        return duration

    def __init__(self, place_start, place_finish, time_begin, time_end):
        self.place_start = place_start
        self.place_finish = place_finish
        self.time_begin = time_begin
        self.time_end = time_end

    def time_duration(self):
        return self.calculate_duration(self.time_begin, self.time_end)

    def calculate_distance(self):
        coords_start = self.__get_coordinates(self.place_start)
        coords_finish = self.__get_coordinates(self.place_finish)
        # вычислить расстояние при помощи яндекс карт и ключа к ним

