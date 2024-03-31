
class User:

    def __init__(self, user_id, logname, login, logemail, logpass):
        self.user_id = user_id
        self.logname = logname
        self.login = login
        self.logemail = logemail
        self.__logpass = logpass

    def get_password(self):
        return self.__logpass

    def __str__(self):
        return f"Пользователь {self.login} с электронной почтой {self.logemail}."
