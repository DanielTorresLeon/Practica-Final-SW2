from flask import Flask
from flask_restx import Api

def create_app():
    app = Flask(__name__)
    api = Api(app, title="AutonoMeetApi", version="1.0", description="Documentation of AutonoMeet API with Flask-RESTx")

    from .routes.product_routes import ns as product_ns
    api.add_namespace(product_ns, path="/products")

    return app

