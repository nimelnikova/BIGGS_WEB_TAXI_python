import pandas as pd

class User:

    def __init__(self, name, login, mail, password):
        self.name = name
        self.login = login
        self.mail = mail
        self.__password = password

    def __str__(self):
        return f"Пользователь {self.login} с электронной почтой {self.mail}."


def CheckLoginAndMail(user) -> bool:
    if user.login in DataBase["login"].to_list():
        print("Этот логин уже занят.")
        return False
    elif user.mail in DataBase["mail"].to_list():
        print("Аккаунт с такой электронной почтой уже существует.")
        return False
    return True


def Initializing() -> User:
    print("Введите ФИО")
    name = input()
    print("Введите логин")
    login = input()
    print("Введите электронную почту")
    mail = input()
    print("Введите пароль")
    password = input()
    return User(name, login, mail, password)


user = Initializing()

DataBase = pd.read_csv("data.csv")
while not CheckLoginAndMail(user):
    print("Введите данные заново!")
    del user
    user = Initializing()
else:
    print("Регистрация завершена!")
    DataBase.loc[len(DataBase.index)] = [user.name, user.login, user.mail, user._User__password]

DataBase.to_csv("data.csv", index=False)
