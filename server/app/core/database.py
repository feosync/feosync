from sqlalchemy import create_engine
from .config import settings
from sqlalchemy.orm import sessionmaker
from app.core.logger import  get_logger

logger = get_logger()    

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  


