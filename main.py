import connexion
from flask import render_template, Response
from http import HTTPStatus
import pathlib
import sqlite3
import sqlite_query


app = connexion.App(__name__, specification_dir="./")
app.add_api("swagger.yml")
app.debug = True

PATH = pathlib.Path(__name__).parent.resolve() / "dataUsers.db"

@app.route("/")
def index():
    return render_template("index.html")  # главное окно с формой


conn = sqlite3.connect(PATH) # создаем базу данных, если ее еще нет
cur = conn.cursor()
cur.execute(sqlite_query.create_table)


if __name__ == "__main__":
    app.run(port=8000)