import jwt
from datetime import datetime, timedelta
from flask import current_app, request, jsonify
from functools import wraps
from jwt import ExpiredSignatureError, InvalidTokenError
from app.models.user import User

def generate_access_token(user):
    expiration = datetime.utcnow() + timedelta(hours=2)
    payload = {
        "sub": str(user.id),
        "email": user.email if user.email else None,
        "is_freelancer": user.is_freelancer,
        "exp": expiration
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def jwt_required(f=None, *, optional=False):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                if optional:
                    return f(*args, **kwargs)
                return jsonify({"message": "Missing token"}), 401
            
            try:
                if token.startswith('Bearer '):
                    token = token.split(' ')[1]
                payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
                # Query the User model using the 'sub' (user ID)
                current_user = User.query.filter_by(id=payload['sub']).first()
                if not current_user:
                    return jsonify({"message": "User not found"}), 401
                kwargs['current_user'] = current_user
            except ExpiredSignatureError:
                return jsonify({"message": "Token has expired"}), 401
            except InvalidTokenError:
                return jsonify({"message": "Invalid token"}), 401
            
            return f(*args, **kwargs)
        return decorated_function
    
    if f is None:
        return decorator
    return decorator(f)

def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None
    
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        # Query the User model using the 'sub' (user ID)
        return User.query.filter_by(id=payload['sub']).first()
    except:
        return None