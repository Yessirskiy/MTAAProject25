from passlib.context import CryptContext

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashPassword(password: str) -> str:
    return password_context.hash(password)


def verifyPassword(password: str, hashed_password: str) -> bool:
    return password_context.verify(password, hashed_password)
