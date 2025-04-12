from flask_restx import Namespace, Resource, fields
from flask import request
from ..utils.jwt_utils import generate_access_token
from app.services.auth_service import AuthService


api = Namespace('auth', description='Authentication Operations')


register_model = api.model('Register', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User Password')
    
    })

login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User Password')
})

@api.route('/register')
class Register(Resource):
    @api.expect(register_model)  
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        is_freelancer = data.get('is_freelancer')

        user, error, status_code = AuthService.register_user(email, password, is_freelancer)
        if error:
            return {"message": error}, status_code

        access_token = generate_access_token(user)

        return {
            "message": "User registered sucesfully",
            "user_id": user.id,
            "is_freelancer": user.is_freelancer,
            "email": user.email,
            "access_token": access_token
        }, 201
    
    @api.route('/login')
    class Login(Resource):
        @api.expect(login_model)
        def post(self):
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')

            user, error, status_code = AuthService.login_user(email, password)
            if error:
                return {"message": error}, status_code

            access_token = generate_access_token(user)

            return {
                "message": "Login successful",
                "user_id": user.id,
                "email": user.email,
                "access_token": access_token
            }, 200
    
    @api.route('/google')
    class GoogleAuth(Resource):
        @api.expect(api.model('GoogleAuth', {
            'token': fields.String(required=True, description='Token de Google')
        }))
        def post(self):
            data = request.get_json()
            token = data.get('token')

            user, error, status_code = AuthService.google_auth(token)
            if error:
                return {"message": error}, status_code

            access_token = generate_access_token(user)

            return {
                "message": "Autenticación con Google exitosa",
                "user_id": user.id,
                "email": user.email,
                "access_token": access_token
            }, 200
        

github_auth_model = api.model('GitHubAuth', {
    'code': fields.String(required=True, description='Código de GitHub')
})

@api.route('/github')
class GitHubAuth(Resource):
    @api.expect(github_auth_model)
    def post(self):
        data = request.get_json()
        code = data.get('code')

        user, error, status_code = AuthService.github_auth(code)
        if error:
            return {"message": error}, status_code

        access_token = generate_access_token(user)

        return {
            "message": "Autenticación con GitHub exitosa",
            "user_id": user.id,
            "email": user.email,
            "access_token": access_token
        }, 200
        