create_table_users = '''CREATE TABLE IF NOT EXISTS users(
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  fullname TEXT NOT NULL,
                  username TEXT NOT NULL,
                  email TEXT NOT NULL,
                  password TEXT NOT NULL
                );'''

insert_user = '''INSERT INTO users (fullname, username, email, password) VALUES (?, ?, ?, ?);'''

select_users = '''SELECT * FROM users;'''

check_user_login = '''SELECT EXISTS(SELECT 1 FROM users WHERE username = ?);'''

check_user_email = '''SELECT EXISTS(SELECT 1 FROM users WHERE email = ?);'''

find_id = '''SELECT id FROM users WHERE username = ?;'''

check_user = '''SELECT * FROM users WHERE username = ? OR email = ?;'''