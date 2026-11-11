from flask import Flask, render_template
from dotenv import find_dotenv, load_dotenv
from spike import auth, db
from spike._constants import ENV_FILE

# Page Renders
def index():
    return render_template("index.html")

def markets():
    return render_template("markets.html")

def portfolio():
    return render_template("portfolio.html")

def profile():
    return render_template("profile.html")

def create_app():
    load_dotenv(find_dotenv(ENV_FILE))
    app = Flask(__name__, instance_relative_config=True)
    db.setup_for_app(app)
    auth.setup_auth(app)
    setup_routes(app)
    return app

def setup_routes(app):
    app.route("/")(index)
    app.route("/markets")(markets)
    app.route("/portfolio")(portfolio)
    app.route("/profile")(profile)

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)