from pydantic import BaseModel, Field, EmailStr
from typing import Optional,  List

class UserIn(BaseModel):
    username: str = Field(example="John Doe")
    email: EmailStr = Field(example="JohnDoe@gmail.com")
class UserCreate(UserIn):
    hashed_password: str

class UserOut(UserCreate):
    id: int

    class Config:
        orm_mode = True


# Todo Schema

class TodoIn(BaseModel):
    title: str = Field(example="Wash the car")
    description: Optional[str] = None

class TodoCreate(TodoIn):
    completed: bool

class TodoOut(TodoCreate):
    id: int
    
    class Config:
        orm_mode = True
