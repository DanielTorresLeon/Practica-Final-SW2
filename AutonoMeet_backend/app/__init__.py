from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
import os


db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    API_PREFIX = '/api/v0'
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 10,
        'pool_recycle': 300,
        'pool_pre_ping': True
    }
    
    db.init_app(app)
    
    with app.app_context():
        from app.models.user import User
        db.create_all()
    
    api = Api(app, title="AutonoMeetApi", version="1.0", description="Documentation of AutonoMeet API with Flask-RESTx")

    from app.routes import auth_routes
    api.add_namespace(auth_routes.api, path=f"{API_PREFIX}/auth") 

    return app