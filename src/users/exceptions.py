class UserAlreadyExistsError(Exception):
    """Raised when trying to create a user that already exists"""
    pass


class InvalidCredentialsError(Exception):
    """Raised when login credentials are invalid"""
    pass


class UserNotFoundError(Exception):
    """Raised when user is not found"""
    pass

