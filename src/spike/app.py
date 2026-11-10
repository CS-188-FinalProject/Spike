import os
from flask import Flask, render_template

def create_app():
    # Setting instance_path forces Flask to look inside the package folder for /templates
    app = Flask(__name__, instance_relative_config=True)

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/markets")
    def markets():
        return render_template("markets.html")

    @app.route("/portfolio")
    def portfolio():
        return render_template("portfolio.html")

    @app.route("/profile")
    def profile():
        return render_template("profile.html")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)