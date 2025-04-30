import jwt
from flask import Flask, jsonify
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_jwt_extended.exceptions import NoAuthorizationError, JWTExtendedException
from flask_cors import CORS
from app.config import Config
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    CORS(
        app,
        origins="http://localhost:5173",  
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  
        allow_headers=["Content-Type", "Authorization"],  
        supports_credentials=True  
    )

    API_PREFIX = '/api/v0'
    
    app.config.from_object(Config)
    
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        raise RuntimeError("Database URI not configured")

    app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 
    jwt = JWTManager(app)
    
    db.init_app(app)
    
    with app.app_context():
        from app.models.user import User
        from app.models.appointment import Appointment
        from app.models.category import Category
        from app.models.freelancer_profile import FreelancerProfile
        from app.models.review import Review 
        from app.models.service import Service
        db.create_all()
    
    api = Api(app, title="AutonoMeetApi", version="1.0", 
              description="Documentation of AutonoMeet API with Flask-RESTx")

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({"message": "Missing Authorization Header"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        print(f"Invalid token callback: {callback}")
        return jsonify({"message": "Invalid token"}), 422
    
    @app.errorhandler(NoAuthorizationError)
    def handle_no_authorization_error(e):
        return jsonify({"message": "Missing Authorization Header"}), 401

    # Import and register all route namespaces
    from app.routes import auth_routes
    from app.routes import serv_routes  
    
    api.add_namespace(auth_routes.api, path=f"{API_PREFIX}/auth")
    api.add_namespace(serv_routes.api, path=f"{API_PREFIX}/services") 

    return app