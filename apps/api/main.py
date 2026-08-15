from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import init_db, close_db
from routers import dashboard, maps, auth_router

load_dotenv()

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Initializing database...")
    await init_db()
    print("Database initialized successfully")
    yield
    # Shutdown
    print("Closing database connections...")
    await close_db()
    print("Database connections closed")


app = FastAPI(
    title="Miyuani Enterprise API",
    version="2.0.0",
    description="Smart Agriculture Through Space Technology - Enterprise Platform API",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3003",
    # "*" removed to allow credentials
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(dashboard.router)
app.include_router(maps.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Miyuani Enterprise Platform API",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0"
    }

