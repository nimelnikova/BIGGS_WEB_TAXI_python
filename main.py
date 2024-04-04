from flask import render_template, Response
from http import HTTPStatus
import connexion

app = connexion.App(__name__, specification_dir='./')
app.add_api("swagger.yml")

@app.route("/")
def index():
    return Response(render_template("/index.html"), HTTPStatus.OK) # главное окно с формой

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

