from models import User
from database import get_db


try:
    add_user = User(username="peter", email="peter@example.com", hashed_password="password")
    db = next(get_db())
    db.add(add_user)
    db.commit()
    db.refresh(add_user)
    print(add_user)
except Exception as e:
    print("Error", e)
