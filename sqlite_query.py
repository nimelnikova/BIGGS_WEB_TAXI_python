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

insert_user = (
    """INSERT INTO users (fullname, username, email, password, payment_method) VALUES (?, ?, ?, ?, ?);"""
)

select_users = """SELECT * FROM users;"""

check_user_login_exists = """SELECT EXISTS(SELECT 1 FROM users WHERE username = ?);"""

check_user_email_exists = """SELECT EXISTS(SELECT 1 FROM users WHERE email = ?);"""

find_id = """SELECT id FROM users WHERE username = ?;"""

check_user = """SELECT * FROM users WHERE username = ? OR email = ?;"""



#ЗАПРОСЫ, СВЯЗАННЫЕ С ЗАКАЗОМ ТАКСИ (RL-17)

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