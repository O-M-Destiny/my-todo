from decouple import config

SECRET_KEY: str = config("SECRET_KEY")
ALGORITHM : str = config("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", cast=int)
"""DATABASE_URL: str = config("DATABASE_URL")"""
DEBUG: bool = config("DEBUG", cast=bool)

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR}/todo.db"




""""


{
  "username": "lang smith",
  "email": "langsmith@gmail.com",
  "hashed_password": "langsmith123"
}


{
  "username": "Paul walker",
  "email": "Paulwalker@gmail.com",
  "hashed_password": "Xuwn32"
}

{
  "username": "John Doe",
  "email": "JohnDoe@gmail.com",
  "hashed_password": "string"
}


"""