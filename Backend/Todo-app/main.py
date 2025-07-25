from fastapi import FastAPI
from auth import todo_router
from database import Base, engine
from models import User, Todo 
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

import os
from dotenv import load_dotenv

load_dotenv()

frontend_url = os.getenv("frontend_url")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = [frontend_url, "http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

app.include_router(todo_router)

@app.get("/")
async def home():
    return {"Message": "Go to /docs for the api documentation"}
