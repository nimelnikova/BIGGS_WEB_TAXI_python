from models import User
from hashlib import sha256
import json
import pandas as pd
from flask import request, Response
from http import HTTPStatus



def registration():

    DataBase = pd.read_csv("/home/admin/Second-Semester/ProjectTaxi/BIGGS_WEB_TAXI_python/dataUsers.csv") # считываем имеющуюся базу данных

    data = request.get_json() # получаем данные формы пост запросом

    hashed_login = sha256() # хэширование данных, используемых для аутентификации
    hashed_login.update(data["login"].encode()) 
    hashed_logemail = sha256()
    hashed_logemail.update(data["logemail"].encode())
    hashed_logpass = sha256()
    hashed_logpass.update(data["logpass"].encode())

    user = User(len(DataBase), data["logname"], hashed_login.hexdigest(), hashed_logemail.hexdigest(), hashed_logpass.hexdigest())

    if user.login in DataBase["login"].to_list(): # обработка ошибок, связанных с данными
        return Response("Этот логин уже занят.", HTTPStatus.BAD_REQUEST)
    elif user.logemail in DataBase["logemail"].to_list():
        return Response("Аккаунт с такой электронной почтой уже существует.", HTTPStatus.BAD_REQUEST)

    body = { # формирование тела для response
        "user_id": len(DataBase),
        "logname": user.logname,
        "login": user.login,
        "logemail": user.logemail,
        "logpass": user.get_logpass()
    }

    DataBase.loc[len(DataBase.index)] = [user.user_id, user.logname, user.login, user.logemail, user._User__logpass]
    DataBase.to_csv("/home/admin/Second-Semester/ProjectTaxi/BIGGS_WEB_TAXI_python/dataUsers.csv", index=False)

    return Response(json.dumps(body), HTTPStatus.OK, mimetype="application/json")

def entrance():

    DataBase = pd.read_csv("/home/admin/Second-Semester/ProjectTaxi/BIGGS_WEB_TAXI_python/dataUsers.csv")
    data = request.get_json()

    hashed_cur_log = sha256() # хэширование полученных данных для сравнения
    hashed_cur_log.update(data["logemail"].encode())
    hashed_cur_log = hashed_cur_log.hexdigest()

    hashed_cur_logpass = sha256()
    hashed_cur_logpass.update(data["logpass"].encode())
    hashed_cur_logpass = hashed_cur_logpass.hexdigest()

    # проверка полученных данных и формирование запроса
    if hashed_cur_log in DataBase["login"].to_list() or hashed_cur_log in DataBase["logemail"].to_list():
        if not DataBase.loc[DataBase["logemail"] == hashed_cur_log]["logpass"].to_list():
            body = {
                "user_id": DataBase.loc[DataBase["login"] == hashed_cur_log]["user_id"].to_list()[0],
                "logname": DataBase.loc[DataBase["login"] == hashed_cur_log]["logname"].to_list()[0],
                "login": DataBase.loc[DataBase["login"] == hashed_cur_log]["login"].to_list()[0],
                "logemail": DataBase.loc[DataBase["login"] == hashed_cur_log]["logemail"].to_list()[0],
                "logpass": DataBase.loc[DataBase["login"] == hashed_cur_log]["logpass"].to_list()[0]
            }
            return Response(json.dumps(body), HTTPStatus.OK, mimetype="application/json")
        body = {
                "user_id": DataBase.loc[DataBase["logemail"] == hashed_cur_log]["user_id"].to_list()[0],
                "logname": DataBase.loc[DataBase["logemail"] == hashed_cur_log]["logname"].to_list()[0],
                "login": DataBase.loc[DataBase["logemail"] == hashed_cur_log]["login"].to_list()[0],
                "logemail": DataBase.loc[DataBase["logemail"] == hashed_cur_log]["logemail"].to_list()[0],
                "logpass": DataBase.loc[DataBase["logemail"] == hashed_cur_log]["logpass"].to_list()[0]
            }
        return Response(json.dumps(body), HTTPStatus.OK, mimetype="application/json")

    return Response("Неверный адрес электронной почты или логин.", HTTPStatus.BAD_REQUEST)