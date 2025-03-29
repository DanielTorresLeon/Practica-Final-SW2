from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from app import db



class AuthService:
    @staticmethod
    def register_user(email, password):
        normalized_email = email.lower()
        if User.query.filter_by(email=normalized_email).first():
            return None, "User already exists", 409  

        password_hash = generate_password_hash(password)

        new_user = User(email=normalized_email, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()

        return new_user, None, 201  
    