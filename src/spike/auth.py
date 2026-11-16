from flask import Flask, request
from flask_bcrypt import generate_password_hash
from flask_restful import Api, Resource

from ._constants import (
    MAX_USERNAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    PASSWORD_PATTERN,
    USERNAME_PATTERN,
)
from .db import get_db

def get_json_body() -> dict:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}

def find_missing_field(data: dict, fields: tuple[str, ...]) -> str | None:
    for field in fields:
        if not isinstance(data.get(field), str):
            return field
    return None

def validate_username(username: str) -> tuple[bool, str]:
    if not USERNAME_PATTERN.fullmatch(username):
        return False, f"Username must be alphanumeric and at most {MAX_USERNAME_LENGTH} characters long"
    return True, ""

def validate_password(password: str) -> tuple[bool, str]:
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

def setup_auth(app: Flask) -> None:
    api = Api(app)
    api.add_resource(Register, "/register")