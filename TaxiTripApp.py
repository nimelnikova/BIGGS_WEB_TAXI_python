import requests
from datetime import datetime


class TripForm:
    def __init__(self, start_location, end_location, start_time, end_time):
        self.start_location = start_location
        self.end_location = end_location
        self.start_time = start_time
        self.end_time = end_time

    def geocode_location(self, location_name):
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={location_name}"
        try:
            response = requests.get(url)
            data = response.json()
            if data:
                return float(data[0]['lat']), float(data[0]['lon'])
            else:
                return None, None
        except Exception as e:
            print(f"Ошибка при получении координат: {str(e)}")
            return None, None

    def calculate_distance(self):
        start_lat, start_lon = self.geocode_location(self.start_location)
        end_lat, end_lon = self.geocode_location(self.end_location)

        if start_lat is None or end_lat is None:
            return "Не удалось найти координаты для одного из мест", None

        url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=false"
        try:
            response = requests.get(url)
            data = response.json()

            if 'routes' in data and data['routes']:
                distance = data['routes'][0]['distance']
                duration = data['routes'][0]['duration']
                distance_text = f"{distance / 1000:.2f} km"
                duration_text = f"{int(duration / 60)} min"
                return distance_text, duration_text
            else:
                return "Ошибка при получении данных о маршруте", None
        except Exception as e:
            return f"Ошибка: {str(e)}", None


# Пример использования
if __name__ == "__main__":
    start_location_name = input("Введите название места отправления: ")
    end_location_name = input("Введите название места назначения: ")

    start_time = datetime.strptime(input("Введите время начала поездки (в формате ГГГГ-ММ-ДД ЧЧ:ММ): "),
                                   "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(input("Введите время окончания поездки (в формате ГГГГ-ММ-ДД ЧЧ:ММ): "),
                                 "%Y-%m-%d %H:%M")

    trip = TripForm(start_location_name, end_location_name, start_time, end_time)
    distance_text, duration_text = trip.calculate_distance()

    if distance_text is not None:
        print(f"Расстояние от {start_location_name} до {end_location_name}: {distance_text}")
        print(f"Примерная длительность поездки: {duration_text}")
        print(f"Время начала поездки: {start_time.strftime('%Y-%m-%d %H:%M')}")
        print(f"Время окончания поездки: {end_time.strftime('%Y-%m-%d %H:%M')}")
    else:
        print(
            "Не удалось рассчитать расстояние. Пожалуйста, проверьте введенные данные и ваше подключение к интернету.")
