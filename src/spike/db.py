import os
import mssql_python
from flask import Flask, g
from ._constants import CONNECTION_STRING_VARIABLE, SESSION_LIFETIME_SECONDS

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
        """Return True if a user with this username is already in the database."""
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM Users WHERE username = ?", (username,))
            return cursor.fetchone() is not None

    def add_user(self, username: str, hashed_password: str, display_name: str) -> bool:
        """Add a new user. Return False if the username is already taken."""
        with self.connection.cursor() as cursor:
            try:
                cursor.execute(
                    "INSERT INTO Users (username, password, display_name, last_login_time) VALUES (?, ?, ?, GETDATE())",
                    (username, hashed_password, display_name),
                )
            except mssql_python.IntegrityError:
                self.connection.rollback()
                return False
        self.connection.commit()
        return True

    def get_login_info(self, username: str):
        """ Returns login information from parameter 'username' """
        with self.connection.cursor() as cursor:
            cursor.execute("""SELECT userid, password, display_name, last_login_time FROM Users WHERE username = ?""", (username,),)
            return cursor.fetchone()
        return None

    def update_last_login(self, username: str):
        """ Updates last login time from parameter 'username' """
        if self.username_exists(username):
            with self.connection.cursor() as cursor:
                cursor.execute("UPDATE Users SET last_login_time = GETDATE() WHERE username = ?", (username,),)
                self.connection.commit()
                return True
        else:
            return False

    def create_session(self, user_id: int) -> str:
            """Add a session for this user to the Sessions table and return its ID.

            The database generates the ID (the NEWID() default on the sessionid
            column), and OUTPUT INSERTED.sessionid hands it back to us.
            """
            with self.connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO Sessions (userid, expiry)
                    OUTPUT INSERTED.sessionid
                    VALUES (?, DATEADD(SECOND, ?, GETDATE()))

                    """,
                    (user_id, SESSION_LIFETIME_SECONDS),
                )
                # mssql-python gives us UNIQUEIDENTIFIER values as Python uuid.UUID
                # objects, so we convert to a string before it goes in a cookie.
                session_id = str(cursor.fetchone()[0])
            self.connection.commit()
            return session_id

    def delete_session(self, session_id: str) -> None:
        """Remove a session from the Sessions table."""
        with self.connection.cursor() as cursor:
            cursor.execute("DELETE FROM Sessions WHERE sessionid = ?", (session_id,))
        self.connection.commit()

    def deletes_all_sessions(self, user_id: str) -> None:
        """Remove all session from the sessions table."""
        with self.connection.cursor() as cursor:
            cursor.execute("DELETE FROM Sessions WHERE userid = ?"), (user_id,),
        self.connection.commit()

    def get_session_user(self, session_id: str):
        """Return the logged-in user's info for a session, or None if the session doesn't exist."""
        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT Users.userid, Users.username, Users.display_name, Users.last_login,
                       Sessions.sessionid, Sessions.expiry
                FROM Sessions
                JOIN Users ON Users.userid = Sessions.userid
                WHERE Sessions.sessionid = ? AND Sessions.expiry > GETDATE()

                """,
                (session_id,),
            )
            return cursor.fetchone()

def get_db() -> Database:
    if "db" not in g:
        g.db = Database(mssql_python.connect(get_connection_string()))
    return g.db

def close_db(exception: BaseException | None = None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()

def setup_for_app(app: Flask) -> None:
    """Hook the database into the app. Call this from create_app()."""
    app.teardown_appcontext(close_db)