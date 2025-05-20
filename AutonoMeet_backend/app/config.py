import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("No DATABASE_URL set for Flask application")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for Flask application")
    
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
    if not STRIPE_PUBLISHABLE_KEY:
        raise ValueError("No STRIPE_PUBLISHABLE_KEY set for Flask application")
    
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
    if not STRIPE_SECRET_KEY:
        raise ValueError("No STRIPE_SECRET_KEY set for Flask application")
    
    PROPAGATE_EXCEPTIONS = True