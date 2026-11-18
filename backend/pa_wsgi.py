"""PythonAnywhere WSGI entrypoint.

Sets production environment defaults, then hands off to the normal
Django WSGI application. Kept separate from config/wsgi.py so local
development is unaffected.
"""
import os
import pathlib
import secrets


def _secret_key() -> str:
    if os.environ.get("SECRET_KEY"):
        return os.environ["SECRET_KEY"]
    # Persist a generated key so JWT sessions survive restarts and
    # the value never has to live in the public repository.
    path = pathlib.Path.home() / ".natour_secret"
    try:
        if path.exists():
            return path.read_text().strip()
        value = secrets.token_urlsafe(48)
        path.write_text(value)
        return value
    except OSError:
        return secrets.token_urlsafe(48)


os.environ.setdefault("DEBUG", "False")
os.environ["SECRET_KEY"] = _secret_key()
os.environ.setdefault("ALLOWED_HOSTS", "wearevenom.pythonanywhere.com")
os.environ.setdefault("CORS_ALLOW_ALL_ORIGINS", "True")

from config.wsgi import application  # noqa: E402