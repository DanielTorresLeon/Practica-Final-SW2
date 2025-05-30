from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from app import db
import requests
from google.oauth2 import id_token
from google.auth.transport.requests import Request 
import os
from flask import current_app as app

class AuthService:
    @staticmethod
    def register_user(email, password, is_freelancer):
        normalized_email = email.lower()
        if User.query.filter_by(email=normalized_email).first():
            return None, "User already exists", 409  

        password_hash = generate_password_hash(password)

        new_user = User(email=normalized_email, password_hash=password_hash, is_freelancer=is_freelancer)
        db.session.add(new_user)
        db.session.commit()

        return new_user, None, 201  

    @staticmethod
    def login_user(email, password):
        normalized_email = email.lower()
        user = User.query.filter_by(email=normalized_email).first()

        if not user:
            return None, "User not found", 404  

        if not check_password_hash(user.password_hash, password):
            return None, "Invalid password", 401  

        return user, None, 200
    
    @staticmethod
    def google_auth(token, is_freelancer):
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                Request(), 
                os.getenv('GOOGLE_CLIENT_ID'),
                clock_skew_in_seconds=600
            )
            app.logger.debug(f"Google token verified: {idinfo}")

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                app.logger.error("Wrong issuer in Google token")
                return None, "Wrong issuer", 401

            email = idinfo['email']
            normalized_email = email.lower()
            app.logger.debug(f"Processing email: {normalized_email}")
            user = User.query.filter_by(email=normalized_email).first()

            if not user:
                app.logger.info(f"User not found, creating new user with email: {normalized_email}, is_freelancer: {is_freelancer}")
                user = User(email=normalized_email, password_hash=None, is_freelancer=is_freelancer)
                db.session.add(user)
                db.session.commit()
                app.logger.debug(f"New user created: {user}")
            else:
                app.logger.debug(f"Existing user found: {user}")

            return user, None, 200

        except ValueError as e:
            app.logger.error(f"Invalid Google token: {str(e)}")
            return None, f"Invalid Google token: {str(e)}", 401
        except Exception as e:
            app.logger.error(f"Unexpected error in google_auth: {str(e)}", exc_info=True)
            return None, "Internal server error during Google auth", 500
    
    @staticmethod
    def github_auth(code, is_freelancer):
        try:
            print(f"Starting GitHub auth with code: {code}, is_freelancer: {is_freelancer}")
            
            response = requests.post(
                'https://github.com/login/oauth/access_token',
                headers={'Accept': 'application/json'},
                data={
                    'client_id': os.getenv('GITHUB_CLIENT_ID'),
                    'client_secret': os.getenv('GITHUB_CLIENT_SECRET'),
                    'code': code
                }
            )
            
            print(f"Response status code: {response.status_code}")
            response_data = response.json()
            access_token = response_data.get('access_token')
            if not access_token:
                print("No access token received")
                return None, "Invalid GitHub code", 401

            print(f"Got access token: {access_token}")
            user_info = requests.get(
                'https://api.github.com/user',
                headers={'Authorization': f'token {access_token}'}
            ).json()

            github_id = user_info.get('id')
            email = user_info.get('email')
            print(f"Extracted github_id: {github_id}, email: {email}")

            if not github_id:
                print("No GitHub ID found in user_info")
                return None, "No GitHub ID provided", 400

            user = User.query.filter_by(github_id=github_id).first()
            print(f"Queried user: {user}")

            if not user:
                user = User(github_id=github_id, email=email, password_hash=None, is_freelancer=is_freelancer)
                db.session.add(user)
                db.session.commit()
                print(f"New user created with id: {user.id}")
            else:
                if email and not user.email:
                    user.email = email
                    db.session.commit()
                else:
                    print("User exists, no email update needed")

            print(f"Returning user: {user}")
            return user, None, 200

        except Exception as e:
            print(f"GitHub auth error: {str(e)}")
            return None, "Error during GitHub authentication", 500