import os
import mssql_python
from flask import Flask, g
from ._constants import CONNECTION_STRING_VARIABLE

def get_connection_string() -> str:
    connection_string = os.environ.get(CONNECTION_STRING_VARIABLE)
    if not connection_string:
        raise RuntimeError(
            f"{CONNECTION_STRING_VARIABLE} is not set. Locally, check that your .secret.env "
            "file is in the project root (next to pyproject.toml). On Azure, check the web "
            "app's environment variables."
        )
    if "driver=" in connection_string.lower():
        raise RuntimeError(
            f"Delete the 'Driver={{ODBC Driver 18 for SQL Server}};' part of "
            f"{CONNECTION_STRING_VARIABLE}. mssql-python includes its own driver."
        )
    
    return os.environ[CONNECTION_STRING_VARIABLE]

class Database:

    def __init__(self, connection: mssql_python.Connection):
        self.connection = connection

    def close(self) -> None:
        self.connection.close()

    def username_exists(self, username: str) -> bool:
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM Users WHERE username = ?", (username,))
            return cursor.fetchone() is not None

    def add_user(self, username: str, hashed_password: str, display_name: str) -> bool:
        with self.connection.cursor() as cursor:
            try:
                cursor.execute(
                    "INSERT INTO Users (username, password, display_name) VALUES (?, ?, ?)",
                    (username, hashed_password, display_name),
                )
            except mssql_python.IntegrityError:
                self.connection.rollback()
                return False
        self.connection.commit()
        return True

    def get_login_info(self, username: str):
        with self.connection.cursor() as cursor:
            cursor.execute("""SELECT userid, password, display_name FROM Users WHERE username = ?""", (username,),)
            return cursor.fetchone()
        return None

    #TODO
    def update_last_login(self, username: str):
        if self.username_exists(username):
            with self.connection.cursor() as cursor:
                cursor.execute("UPDATE Users SET last_login_time = GETDATE() WHERE username = ?", (username,),)
                self.connection.commit()
                return True
        else:
            return False

def get_db() -> Database:
    if "db" not in g:
        g.db = Database(mssql_python.connect(get_connection_string()))
    return g.db

def close_db(exception: BaseException | None = None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()

def setup_for_app(app: Flask) -> None:
    app.teardown_appcontext(close_db)
