from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from app.config import Config
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    API_PREFIX = '/api/v0'
    
    # Load configuration
    app.config.from_object(Config)
    
    # Verify configuration was loaded
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        raise RuntimeError("Database URI not configured")

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 
    jwt = JWTManager(app)
    
    # Initialize database
    db.init_app(app)
    
    with app.app_context():
        from app.models.user import User
        db.create_all()
    
    api = Api(app, title="AutonoMeetApi", version="1.0", 
              description="Documentation of AutonoMeet API with Flask-RESTx")

    from app.routes import auth_routes
    api.add_namespace(auth_routes.api, path=f"{API_PREFIX}/auth") 

    return app