from sqlalchemy import create_engine
from .config import settings
from sqlalchemy.orm import sessionmaker


engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
if engine:
    print("Database connection established successfully.")
else:
    print("Failed to establish database connection.")

if SessionLocal:
    print("SessionLocal created successfully.")
else:
    print("Failed to create SessionLocal.")

    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  


