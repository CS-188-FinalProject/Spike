import os
from dotenv import find_dotenv, load_dotenv
from flask import Flask, render_template

from src.spike import auth, db
from src.spike._constants import SECRET_ENV_FILE

def index():
    return render_template("index.html")

def create_app():
    load_dotenv(find_dotenv(SECRET_ENV_FILE))
    app = Flask(__name__)
    db.setup_for_app(app)
    auth.setup_auth(app)
    setup_routes(app)
    return app

def setup_routes(app):
    app.route("/")(index)

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)