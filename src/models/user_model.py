class User:

    def __init__(self, fullname, username, email, password):
        self.fullname = fullname
        self.username = username
        self.email = email
        self.__password = password

    def get_password(self):
        return self.__password

    def __str__(self):
        return f"Пользователь {self.username} с электронной почтой {self.email}."
