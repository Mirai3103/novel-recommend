# JWT
SECRET_KEY = "your-secret-key-change-this-in-production-use-env-variable"
REFRESH_SECRET_KEY = "your-refresh-secret-key-change-this-in-production-use-env-variable"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # 15 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 days

ACCESS_TOKEN_COOKIE_NAME = "access_token"
ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 15  # 15 minutes in seconds
ACCESS_TOKEN_COOKIE_SECURE = False  # Set to True in production with HTTPS
ACCESS_TOKEN_COOKIE_HTTPONLY = True
ACCESS_TOKEN_COOKIE_SAMESITE = "lax"  # "strict" or "lax" or "none"


# Cookie settings
REFRESH_TOKEN_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days in seconds
REFRESH_TOKEN_COOKIE_SECURE = False  # Set to True in production with HTTPS
REFRESH_TOKEN_COOKIE_HTTPONLY = True
REFRESH_TOKEN_COOKIE_SAMESITE = "lax"  # "strict" or "lax" or "none"
REFRESH_TOKEN_COOKIE_PATH = "/"

