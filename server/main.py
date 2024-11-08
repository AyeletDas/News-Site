from flask import Flask  # for creating the web application
from flask_cors import CORS  # enable resource sharing
from app.routes import users  # Import users blueprint from routes
from rss.routes_rss import rss  # Import rss blueprint for handling RSS routes
import os  # for environment variable handling
from dotenv import load_dotenv  # for loading .env file
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
)  # for handling authentication

# Load environment variables from the .env file
load_dotenv()

# Create a Flask app instance
app = Flask(__name__)

# CORS configuration - Allows specific origins and headers for cross-origin requests
CORS(app)

# JWT configuration - secret key
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)  # set JWT manager with the app

# Register blueprints for routing
app.register_blueprint(users, url_prefix="/users")  # Users route
app.register_blueprint(rss, url_prefix="/articles")  # Articles route

# Set the port for the application, defaulting to 5000 if not specified in Render environment
port = int(os.getenv("PORT", 8000))

# Run the Flask application with the appropriate settings
if __name__ == "__main__":
    app.run(host='0.0.0.0',
        port=port
    )  # host "0.0.0.0" to make it accessible from outside


""" from flask import Flask, send_from_directory  # for creating the web application
from flask_cors import CORS  # enable resource sharing
from app.routes import users  # Import users blueprint from routes
from rss.routes_rss import rss  # Import rss blueprint for handling RSS routes
import os  # for environment variable handling
from dotenv import load_dotenv  # for loading .env file
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
)  # for handling authentication

# Load environment variables from the .env file
load_dotenv()

# Create a Flask app instance
app = Flask(__name__, static_folder='build', static_url_path='')

@app.route('/')
def serve():
    return send_from_directory(os.path.join(app.root_path, 'build'), 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(os.path.join(app.root_path, 'build'), path)

# CORS configuration - Allows specific origins and headers for cross-origin requests
CORS(app)

# JWT configuration - secret key
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)  # set JWT manager with the app

# Register blueprints for routing
app.register_blueprint(users, url_prefix="/users")  # Users route
app.register_blueprint(rss, url_prefix="/articles")  # Articles route
"""
# The app will be run by Gunicorn on Render, so no need to call app.run()

# $ py -m venv venv
# $ py -m pip install feedparser flask gunicorn flask-cors flask-bcrypt flask-jwt-extended mongoengine requests beautifulsoup4 flask-pymongo sendgrid python-dotenv
# $ py -m pip install -r requirements.txt
# $ py -m pip make install run send_email
# $ py app.py
# py -m pip install flask gunicorn

# התקנת קובץ טקסט:
# /server/venv/Scripts --> $ source activate - שורה חשובה
# # $ py -m pip install -r requirements.txt
# py -m pip install waitress
#
# pip install waitress
# waitress-serve --port=8000 app:app
# npm run build - ריאקט
# pip freeze > requirements.txt


# gunicorn app:app

# http://localhost:5000/user

# השלבים לעלות לגיט האב:
# טרמינל- ayele@Ayelet MINGW64 ~/Desktop/פייתון חדש/client/vite-project
# $ git init
# $ git add .
# $ git commit -m "Initial commit"
# github ---> Create a new repository --> <> Code copy link https://github.com/AyeletDas/Ayelet-s-news-website.git
# $ git remote add origin https://github.com/AyeletDas/Ayelet-news-website.git
# $ git push -u origin master

# github: Settings --> pages -->master --> save
#   base: "/Ayelet-s-news-websitet/", // at vite.config.js שמים את השם מהגיט האב

""" 
העתק הדבק ככה לטרמינל: ayele@Ayelet MINGW64 ~/Desktop/
זה כולל את כל התקייה, גם שרת וגם לקו
.........................................
git init
git branch -m master main
git add .
git commit -m "Initial commit server and client"
git remote add origin https://github.com/AyeletDas/donetow.git
git fetch origin
git push -u origin main
git branch -u origin/main main
git remote set-head origin -a

"""
