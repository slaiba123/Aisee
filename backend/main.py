# # backend/main.py
# import os
# from contextlib import asynccontextmanager
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv

# load_dotenv()

# from database import init_db
# from auth import router as auth_router
# from ocr  import router as ocr_router

# FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     init_db()
#     yield

# app = FastAPI(title="AiSee API", version="1.0.0", lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[FRONTEND_URL],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth_router, prefix="/auth", tags=["Auth"])
# app.include_router(ocr_router,  prefix="/ocr",  tags=["OCR"])

# @app.get("/health")
# def health():
#     return {"status": "ok"}


# backend/main.py
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import init_db
from auth import router as auth_router
from ocr  import router as ocr_router

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="AiSee API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(ocr_router,  prefix="/ocr",  tags=["OCR"])

@app.get("/health")
def health():
    return {"status": "ok"}
