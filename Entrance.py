import pandas as pd

def EntranceInit():
    print("Введите логин или электронную почту")
    login_or_mail = input()
    print("Введите пароль")
    password = input()
    return login_or_mail, password

def CheckLoginOrMail(DataBase, login_or_mail):
    if login_or_mail in DataBase["login"].to_list() or login_or_mail in DataBase["mail"].to_list():
        return True
    print("Аккаунта с таким логином или электронной почтой не существует!")
    return False


login_or_mail, password = EntranceInit()
DataBase = pd.read_csv("data.csv")
while not CheckLoginOrMail(DataBase, login_or_mail):
    print("Введите данные заново.")
    login_or_mail, password = EntranceInit()

if login_or_mail in DataBase["mail"].to_list():

    while not str(DataBase.loc[DataBase["mail"] == login_or_mail]["password"].to_list()[0]) == password:
        print("Неверный пароль. Введите данные заново!")
        login_or_mail, password = EntranceInit()
    else:
        print("Вход выполнен успешно!")

elif login_or_mail in DataBase["login"].to_list():

    while not str(DataBase.loc[DataBase["login"] == login_or_mail]["password"].to_list()[0]) == password:
        print("Неверный пароль. Введите данные заново!")
        login_or_mail, password = EntranceInit()
    else:
        print("Вход выполнен успешно!")
