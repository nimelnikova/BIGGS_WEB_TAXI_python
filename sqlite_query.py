create_table_users = """CREATE TABLE IF NOT EXISTS users(
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  fullname TEXT NOT NULL,
                  username TEXT NOT NULL,
                  email TEXT NOT NULL,
                  password TEXT NOT NULL
                );"""

insert_user = (
    """INSERT INTO users (fullname, username, email, password) VALUES (?, ?, ?, ?);"""
)

select_users = """SELECT * FROM users;"""

check_user_login = """SELECT EXISTS(SELECT 1 FROM users WHERE username = ?);"""

check_user_email = """SELECT EXISTS(SELECT 1 FROM users WHERE email = ?);"""

find_id = """SELECT id FROM users WHERE username = ?;"""

check_user = """SELECT * FROM users WHERE username = ? OR email = ?;"""


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
                FOREIGN KEY (user_id) REFERENCES users(id)

    )"""

insert_orders = """INSERT INTO orders (user_id, driver_id, driver_name, driver_average_raiting, pickup_location, destination, distance, car_category, car, start_time, end_time, total_ride_time, order_amount, payment_method, waiting_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"""

select_free_drivers = """SELECT * FROM drivers WHERE status = 'free' AND car_category = ?""";

update_driver_status_busy = "UPDATE drivers SET status = 'busy' WHERE driver_id = ?;"

select_id_order = """SELECT * FROM orders WHERE order_id = ?;"""

update_driver_status_free = "UPDATE drivers SET status = 'free' WHERE driver_id = ?;"

select_driver_id = """SELECT * FROM drivers WHERE driver_id = ?;"""

update_driver_rating_and_orders = "UPDATE drivers SET average_rating = ?, total_trips = ? WHERE driver_id = ?"
