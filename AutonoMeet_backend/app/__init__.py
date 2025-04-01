from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
import os
from app.config import Config
from flask_jwt_extended import JWTManager


db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    API_PREFIX = '/api/v0'
    
    app.config.from_object(Config)

    app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY') 
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 
    jwt = JWTManager(app)

    
    db.init_app(app)
    
    with app.app_context():
        from app.models.user import User
        db.create_all()
    
    api = Api(app, title="AutonoMeetApi", version="1.0", description="Documentation of AutonoMeet API with Flask-RESTx")

    from app.routes import auth_routes
    api.add_namespace(auth_routes.api, path=f"{API_PREFIX}/auth") 

    return app