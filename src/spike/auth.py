from flask import Flask, request, make_response
from flask_bcrypt import check_password_hash, generate_password_hash
from flask_restful import Api, Resource
from ._constants import (
    BAD_LOGIN_MESSAGE,
    MAX_USERNAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    PASSWORD_PATTERN,
    USERNAME_PATTERN,
    SESSION_COOKIE_NAME,
)
from .db import get_db

def get_json_body() -> dict:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}

def find_missing_field(data: dict, fields: tuple[str, ...]) -> str | None:
    """Return the first field that is missing (or isn't a string), or None if all are present."""
    for field in fields:
        if not isinstance(data.get(field), str):
            return field
    return None

def validate_username(username: str) -> tuple[bool, str]:
    """Check that a username is alphanumeric and at most MAX_USERNAME_LENGTH characters.

    @param username: The username to validate
    @return: A tuple containing a boolean indicating if the username is valid and \
        an invalidation message if it is not (otherwise the empty string)
    """
    if not USERNAME_PATTERN.fullmatch(username):
        return False, f"Username must be alphanumeric and at most {MAX_USERNAME_LENGTH} characters long"
    return True, ""

def validate_password(password: str) -> tuple[bool, str]:
    """Check that a password is at least MIN_PASSWORD_LENGTH characters with no whitespace.

    @param password: The password to validate
    @return: A tuple containing a boolean indicating if the password is valid and \
        an invalidation message if it is not (otherwise the empty string)
    """
    if not PASSWORD_PATTERN.fullmatch(password):
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters with no spaces"
    return True, ""

class Register(Resource):
    def post(self):
        data = get_json_body()

        missing_field = find_missing_field(data, ("username", "password", "displayName"))
        if missing_field is not None:
            return {"message": f"Missing required field: {missing_field}"}, 400

        username = data["username"]
        password = data["password"]
        display_name = data["displayName"].strip()

        is_valid, message = validate_username(username)
        if not is_valid:
            return {"message": message}, 400

        is_valid, message = validate_password(password)
        if not is_valid:
            return {"message": message}, 400

        if not display_name:
            return {"message": "Display name cannot be empty"}, 400

        db = get_db()
        if db.username_exists(username):
            return {"message": "Username already exists"}, 400

        hashed_password = generate_password_hash(password).decode("utf-8")

        if not db.add_user(username, hashed_password, display_name):
            return {"message": "Username already exists"}, 400

        return {"message": "User created successfully", "displayName": display_name}, 201

class Login(Resource):
    def post(self):
        data = get_json_body()

        missing_field = find_missing_field(data, ("username", "password"))
        if missing_field is not None:
            return {"message": f"Missing required field: {missing_field}"}, 400

        username = data["username"]
        password = data["password"]

        user = get_db().get_login_info(username)

        if not user or not check_password_hash(user.password, password):
            return {"message": BAD_LOGIN_MESSAGE}, 401

        get_db().update_last_login(username)

        message = f"Welcome back {user.display_name}. Last Login Time: {user.last_login_time}"

        session_id = get_db().create_session(user.userid)
        response = make_response({"message": message, "displayName": user.display_name}, 200)
        set_session_cookie(response, session_id)
        return response

class Logout(Resource):
    def post(self):
        session_id = verify_session_cookie(request.cookies.get(SESSION_COOKIE_NAME))
        if session_id is not None:
            get_db().delete_session(session_id)

        response = make_response({"message": "Logged out"}, 200)
        clear_session_cookie(response)
        return response

def setup_auth(app: Flask) -> None:
    api = Api(app)
    api.add_resource(Register, "/register")
    api.add_resource(Login, "/login")
    api.add_resource(Logout, "/logout")