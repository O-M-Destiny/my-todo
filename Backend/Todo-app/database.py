from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine

from config import DATABASE_URL

Base = declarative_base()

engine = create_engine(DATABASE_URL)

sessionLocal = sessionmaker(bind=engine, autoflush=False)

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

