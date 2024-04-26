import sqlite3
import random
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DRIVERS_PATH = BASE_DIR / "dataUsers.db"

conn = sqlite3.connect(DATA_DRIVERS_PATH)

cur = conn.cursor()

cur.execute("""CREATE TABLE IF NOT EXISTS drivers(
    driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    car_model TEXT,
    car_category TEXT,
    car_number TEXT,
    status TEXT,
    total_trips INTEGER,
    average_rating REAL
    )""")

def generate_car_number(region_code="77"):
    valid_letters = 'АВЕКМНОРСТУХ'
    car_number = ''.join(random.choices(valid_letters, k=1))  # Первая буква
    car_number += ''.join(random.choices('0123456789', k=3))  # Три цифры
    car_number += ''.join(random.choices(valid_letters, k=2))  # Две буквы
    car_number += ''.join(random.choices('0123456789', k=2))  # Две цифры
    car_number += region_code
    return car_number


male_first_names = ['Иван', 'Петр', 'Александр', 'Дмитрий', 'Михаил', 'Сергей', 'Николай', 'Андрей', 'Алексей', 'Владимир']
male_last_names = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Васильев', 'Павлов', 'Семенов', 'Голубев']
male_patronymics = ['Иванович', 'Петрович', 'Александрович', 'Дмитриевич', 'Михайлович', 'Сергеевич', 'Николаевич', 'Андреевич', 'Алексеевич', 'Владимирович']

def generate_male_full_name():
    first_name = random.choice(male_first_names)
    last_name = random.choice(male_last_names)
    patronymic = random.choice(male_patronymics)
    return f'{last_name} {first_name} {patronymic}'



drivers_data = []
statuses = ['busy'] * 30 + ['free'] * 70
driver_statuses = [random.choice(statuses) for _ in range(200)]

car_models = {
    "Standart": ["BMW 5er", "Hongqi H5", "Hongqi H9"],
    "Premium": ["Mercedes-Benz S-klasse", "Mercedes-Benz Maybach S-klasse", "Mercedes-Benz S-klasse AMG", "BMW 7er"],
    "VIP": ["Rolls Royce Ghost", "Rolls-Royce Cullinan", "Rolls Royce Phantom", "Bentley Flying Spur", "Bentley Mulsanne"]
}

for i in range(200):
    full_name = generate_male_full_name()
    car_category = random.choice(["Standart", "Premium", "VIP"])
    car_model = random.choice(car_models[car_category])
    car_number = generate_car_number()
    status = driver_statuses[i]
    total_trips = random.randint(50, 500)
    average_rating = round(random.uniform(3.5, 5.0), 1)
    drivers_data.append((full_name, car_model, car_category, car_number, status, total_trips, average_rating))

cur.executemany('''INSERT INTO drivers (full_name, car_model, car_category, car_number, status, total_trips, average_rating)
                   VALUES (?, ?, ?, ?, ?, ?, ?)''', drivers_data)

conn.commit()

cur.close()
conn.close()
