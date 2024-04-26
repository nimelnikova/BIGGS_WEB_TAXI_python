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
                pickup_location TEXT,
                destination TEXT,
                distance REAL,
                car_category TEXT,
                start_time TEXT,
                end_time TEXT,
                total_ride_time INTEGER,
                order_amount INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id)

    )"""

insert_orders = """INSERT INTO orders (user_id, pickup_location, destination, distance, car_category, start_time, end_time, total_ride_time, order_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);"""
