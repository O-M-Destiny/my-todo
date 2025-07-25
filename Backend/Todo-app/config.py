import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY= os.getenv("SECRET_KEY")
ALGORITHM= os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
DEBUG = os.getenv("DEBUG")
DATABASE_URL = os.getenv("DATABASE_URL")
