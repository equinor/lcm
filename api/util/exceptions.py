class CustomException(Exception):
    def __init__(self, message: str):
        super()
        self.message = message


class AuthenticationException(CustomException):
    def __init__(self, message):
        super().__init__(message=message)
