class User:

    def __init__(self, user_id, fullname, username, email, password):
        self.user_id = user_id
        self.fullname = fullname
        self.username = username
        self.email = email
        self.__password = password

    def get_password(self):
        return self.__password

    def __str__(self):
        return f"Пользователь {self.username} с электронной почтой {self.email}."
