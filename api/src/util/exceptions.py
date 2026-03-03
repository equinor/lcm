class CustomException(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class AuthenticationException(CustomException):
    def __init__(self, message):
        super().__init__(message=message)


class ValidationExpection(CustomException):
    def __init__(self, message):
        super().__init__(message=message)
