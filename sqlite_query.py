# ЗАПРОСЫ ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ SQLITE


create_table_cards = """CREATE TABLE IF NOT EXISTS cards(
                      id INTEGER,
                      card_number TEXT NOT NULL,
                      card_holder TEXT NOT NULL,
                      month TEXT NOT NULL,
                      year TEXT NOT NULL,
                      cvv TEXT NOT NULL
                    );"""


# ЗАПРОСЫ, СВЯЗАННЫЕ С РЕГИСТАРЦИЕЙ И ВХОДОМ (RL-7)

create_table_users = """CREATE TABLE IF NOT EXISTS users(
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      fullname TEXT NOT NULL,
                      username TEXT NOT NULL,
                      email TEXT NOT NULL,
                      password TEXT NOT NULL,
                      payment_method TEXT NOT NULL
                    );"""

insert_user = """INSERT INTO users (fullname, username, email, password, payment_method) VALUES (?, ?, ?, ?, ?);"""

select_users = """SELECT * FROM users;"""

check_user_login_exists = """SELECT EXISTS(SELECT 1 FROM users WHERE username = ?);"""

check_user_email_exists = """SELECT EXISTS(SELECT 1 FROM users WHERE email = ?);"""

find_id = """SELECT id FROM users WHERE username = ?;"""

check_user = """SELECT * FROM users WHERE username = ? OR email = ?;"""


# ЗАПРОСЫ, СВЯЗАННЫЕ С ЗАКАЗОМ ТАКСИ (RL-17)

create_table_orders = """CREATE TABLE IF NOT EXISTS orders(
                order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                driver_id INTEGER,
                driver_name TEXT,
                driver_average_raiting REAL,
                pickup_location TEXT,
                destination TEXT,
                distance REAL,
                car_category TEXT,
                car TEXT,
                start_time TEXT,
                end_time TEXT,
                total_ride_time INTEGER,
                order_amount INTEGER,
                payment_method TEXT,
                waiting_time INTEGER,
                status TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)

    )"""

insert_orders = """INSERT INTO orders (user_id, driver_id, driver_name, driver_average_raiting, pickup_location, destination, distance, car_category, car, start_time, end_time, total_ride_time, order_amount, payment_method, waiting_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"""

select_free_drivers = (
    """SELECT * FROM drivers WHERE status = 'free' AND car_category = ?"""
)

update_driver_status_busy = "UPDATE drivers SET status = 'busy' WHERE driver_id = ?;"

select_id_order = """SELECT * FROM orders WHERE order_id = ?;"""

update_driver_status_free = "UPDATE drivers SET status = 'free' WHERE driver_id = ?;"

select_driver_id = """SELECT * FROM drivers WHERE driver_id = ?;"""

update_driver_rating_and_orders = (
    "UPDATE drivers SET average_rating = ?, total_trips = ? WHERE driver_id = ?"
)


# ЗАПРОСЫ, СВЯЗАННЫЕ С ИЗМЕНЕНИЕМ ДАННЫХ ПОЛЬЗОВАТЕЛЯ (RL-27)

check_user_password = """SELECT password FROM users WHERE id = ?;"""

update_user_fullname = """UPDATE users SET fullname = ? WHERE id = ?;"""

update_user_password = """UPDATE users SET password = ? WHERE id = ?;"""

check_user_payment_method = """SELECT payment_method FROM users WHERE id = ?;"""

update_user_payment_method = """UPDATE users SET payment_method = ? WHERE id = ?;"""

check_user_by_id = """SELECT * FROM users WHERE id = ?;"""

insert_card = """INSERT INTO cards (id, card_number, card_holder, month, year, cvv) VALUES (?, ?, ?, ?, ?, ?);"""

check_card_exists = """SELECT EXISTS(SELECT 1 FROM cards WHERE card_number = ?);"""

get_user_card = """SELECT * FROM cards WHERE id = ?;"""


# ЗАПРОСЫ, СВЯЗАННЫЕ С ЗАКАЗОМ ВОДИТЕЛЯМИ

create_table_drivers = """CREATE TABLE IF NOT EXISTS drivers(
    driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    car_model TEXT,
    car_image TEXT,
    car_category TEXT,
    car_number TEXT,
    status TEXT,
    total_trips INTEGER,
    average_rating REAL
    )"""

insert_drivers = """INSERT INTO drivers (full_name, car_model, car_image, car_category, car_number, status, total_trips, average_rating)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?);"""

checking_existence_table = (
    "SELECT name FROM sqlite_master WHERE type='table' AND name='drivers'"
)


get_user_order = "SELECT order_id, driver_id FROM orders WHERE user_id=? AND status = 'active';"

update_order_status_completed = "UPDATE orders SET status = 'completed' WHERE order_id = ?;"
