from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from pydantic import EmailStr
from typing import List


from database import get_db
from models import User, Todo
from schema import UserCreate, UserOut, TodoCreate, TodoOut
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


todo_router = APIRouter()


pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password:str) -> str:
    return pwd.hash(password)



def verify_password(plain_password:str, hashed_password:str) ->bool:
    return pwd.verify(plain_password, hashed_password)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Create the token

def create_token(data:dict, expire_time: timedelta):
    to_encode = data.copy()
    expiry = datetime.utcnow() + expire_time
    to_encode.update({"exp":expiry})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Register
@todo_router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        reg_user = db.query(User).filter(User.email == user.email).first()
        if reg_user:
            raise HTTPException(status_code=409, detail=f"User already exists with the email {user.email}")
        new_user = User(
            username = user.username,
            email = user.email.strip(),
            hashed_password = hash_password(user.hashed_password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return JSONResponse(content={"Message": "User created"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except SQLAlchemyError as sql_error:
        raise HTTPException(status_code=500, detail= str(sql_error) )



# Login
from fastapi import status

@todo_router.post("/login", status_code=status.HTTP_200_OK)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    normalized_email = form.username.strip().lower()  
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    try:
        access_token = create_token(
            data={"sub": user.email},
            expire_time=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token generation error: {str(e)}")




async def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Unauthorized")
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(status_code=400, detail="User not Found")
        
        return user
    except JWTError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@todo_router.get("/username")
async def my_username(db: Session = Depends(get_db), current_user: User = Depends(current_user)):
    try:
        my_name = db.query(User).filter(User.username == current_user.username).first()
        if not my_name:
            return JSONResponse(status_code=404, content={"Message": "Username not found"})
        return my_name.username
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@todo_router.post("/Add_Todo", status_code=201)
async def add_todo(todo: TodoCreate, db: Session = Depends(get_db), current_user: User = Depends(current_user)
):
    try:
        # Check if the user already has a todo with the same title
        existing_todo = (
            db.query(Todo).filter(Todo.title == todo.title, Todo.owner_id == current_user.id).first()
        )
        if existing_todo:
            raise HTTPException(status_code=409, detail="Todo title already exists")

        new_todo = Todo(
            title=todo.title,
            description=todo.description,
            completed=todo.completed,
            owner_id=current_user.id
        )

        db.add(new_todo)
        db.commit()
        db.refresh(new_todo)

        return JSONResponse(status_code=201, content={"message": "Todo successfully added"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    

@todo_router.get("/get_todo", response_model=List[TodoOut])
async def get_todo(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(current_user)):
    todos = db.query(Todo).filter(Todo.owner_id == current_user.id).offset(skip).limit(limit).all()
    return todos  # ✅ Always return a list, even if empty


@todo_router.get("/is_completed_todo")
async def number_of_completed_todo(current_user : User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        no_of_completed = db.query(Todo).filter(Todo.owner_id == current_user.id).all()
        if not no_of_completed:
            return JSONResponse(status_code=200, content="Error")

        completed_count = len([completed_todo for completed_todo in no_of_completed if completed_todo.completed])
        uncompleted_count = len([completed_todo for completed_todo in no_of_completed if not completed_todo.completed])
        return {"Completed todo count": completed_count, "Uncompleted Count": uncompleted_count}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@todo_router.delete("/delete_todo/{todo_id}")    
async def delete_todo(todo_id: int, db: Session = Depends(get_db), current_user: User = Depends(current_user)):
    try:
        delete_info = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == current_user.id).first()

        if not delete_info:
            # Try to see if the todo exists at all
            todo_check = db.query(Todo).filter(Todo.id == todo_id).first()
            if todo_check:
                return JSONResponse(status_code=404, content={"message": "Todo not found"})

        db.delete(delete_info)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Todo deleted successfully"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@todo_router.put("/edit_todo/{todo_id}")
async def edit_todo(todo: TodoCreate,todo_id: int,db: Session = Depends(get_db),current_user: User = Depends(current_user)):
    try:
        # Get the todo for this user and ID
        edit_todo_info = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == current_user.id
        ).first()

        # If not found, return 404
        if not edit_todo_info:
            return JSONResponse(status_code=404, content={"message": "Todo not found"})

        # Update the fields
        edit_todo_info.title = todo.title
        edit_todo_info.description = todo.description
        edit_todo_info.completed = todo.completed

        db.commit()
        db.refresh(edit_todo_info)

        return JSONResponse(status_code=200, content={"message": "Todo edited successfully"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

