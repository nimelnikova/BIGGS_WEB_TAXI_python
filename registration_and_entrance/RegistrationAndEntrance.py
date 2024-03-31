from flask import Flask, request, render_template, Response
import json
import pandas as pd
from models import User
from http import HTTPStatus

app = Flask(__name__)

@app.get("/")
def index():
    return Response(render_template("../start_window/index.html"), status=200)

@app.post("/registration")
def registration():

    DataBase = pd.read_csv("/home/admin/Second-Semester/flask_test/data.csv")
    data = request.get_json()
    user = User(len(DataBase), data["logname"], data["login"], data["logemail"], data["logpass"])

    if user.login in DataBase["login"].to_list():
        return Response("Этот логин уже занят.", HTTPStatus.BAD_REQUEST)
    elif user.logemail in DataBase["logemail"].to_list():
        return Response("Аккаунт с такой электронной почтой уже существует.", HTTPStatus.BAD_REQUEST)

    body = {
        "user_id": len(DataBase),
        "logname": user.logname,
        "login": user.login,
        "logemail": user.logemail,
        "logpass": user.get_logpass()
    }

    DataBase.loc[len(DataBase.index)] = [[user.user_id], [user.logname], [user.login], [user.logemail], [user._User__password]]
    DataBase.to_csv("/home/admin/Second-Semester/flask_test/data.csv", index=False)

    return Response(json.dumps(body), HTTPStatus.OK, mimetype="application/json")

@app.post("/entrance")
def entrance():

    DataBase = pd.read_csv("/home/admin/Second-Semester/flask_test/data.csv")
    data = request.get_json()    

    cur_login_or_email = data["logemail"]
    cur_logpass = data["logpass"]
    if cur_login_or_email in DataBase["login"].to_list() or cur_login_or_email in DataBase["email"].to_list():
        if DataBase.loc[DataBase["login"] == cur_login_or_email]["logpass"].to_list()[0] == cur_logpass or \
           DataBase.loc[DataBase["email"] == cur_login_or_email]["logpass"].to_list()[0] == cur_logpass:
            return Response(json.dumps(DataBase.loc[DataBase["email"] == cur_login_or_email or DataBase["login"] == cur_login_or_email].to_dict("list")), HTTPStatus.OK)

    return Response("Неверный адрес электронной почты или логин.", HTTPStatus.BAD_REQUEST)

if __name__ == "__main__":
    app.run(port=8001, debug=True)

