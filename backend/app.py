# app.py
from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth import auth_bp
from routes.properties import properties_bp
from routes.owner import owner_bp
from routes.admin import admin_bp
from extensions import limiter

app = Flask(__name__)
limiter.init_app(app)
app.config.from_object(Config)
CORS(app, origins=["http://localhost:5173"])
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(properties_bp, url_prefix='/api/properties')
app.register_blueprint(owner_bp, url_prefix='/api/owner')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

if __name__ == '__main__':
    app.run(debug=True)