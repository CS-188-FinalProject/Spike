import re

# ---------------------------------------------------------------------------
# Secrets and configuration
# ---------------------------------------------------------------------------

ENV_FILE = ".env"
CONNECTION_STRING_VARIABLE = "AZURE_SQL_CONNECTIONSTRING"

# ---------------------------------------------------------------------------
# Account rules
# ---------------------------------------------------------------------------

MAX_USERNAME_LENGTH = 20
MIN_PASSWORD_LENGTH = 8
USERNAME_PATTERN = re.compile(rf"[A-Za-z0-9]{{1,{MAX_USERNAME_LENGTH}}}")
PASSWORD_PATTERN = re.compile(rf"[\x21-\x7E]{{{MIN_PASSWORD_LENGTH},}}")
BAD_LOGIN_MESSAGE = "Incorrect username or password"