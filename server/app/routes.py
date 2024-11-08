from flask import Flask, request, jsonify, Blueprint
from .crud_functions import RoustesDB
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from datetime import timedelta # Creates a token and will disappear after 300 minutes.
#  from bson import ObjectId

users = Blueprint("users", __name__)

crud = RoustesDB()  # from crud_functions file

# Get all users - http://localhost:5000/users
@users.route("/", methods=["GET"])
def get_all_users():
    try:
        data = crud.get_all_users()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching all users: {str(e)}")
        return jsonify({"error": "An error occurred fetching users"}), 500

# Get user by id - http://localhost:5000/users/<id>
@users.route("/<string:id>", methods=["GET"])
def get_user(id):
    try:
        data = crud.get_user(id)
        if not data:
            return jsonify({"error": "User not found"}), 404
        return jsonify(data), 200
    except Exception as e: # If an error occurs- caught exception can be assigned to a variable named E
        print(f"Error fetching user by id: {str(e)}")
        return jsonify({"error": "An error occurred fetching the user"}), 500

# Login user - http://localhost:5000/users/login - POST
@users.route("/login", methods=["POST"])
def login_user():
    try:
        user_data = request.json
        email = user_data.get("email")
        password = user_data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = crud.get_user_by_email(email)
        if not user or user["password"] != password: # Checks if the user is found and if the password matches.
            return jsonify({"error": "Invalid email or password"}), 401

        token = generate_token(user) # create a token for the user
        return jsonify({"message": "Login successful", "user": user, "token": token}), 200
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({"error": "An error occurred during login"}), 500

def generate_token(user): # create a token for the user
    token = create_access_token(identity=user["_id"], expires_delta=timedelta(minutes=300)) 
    return token

# Register user - http://localhost:5000/users/register - POST
@users.route("/register", methods=["POST"])
def register_user():
    try:
        user_data = request.json
        email = user_data.get("email")
        password = user_data.get("password")
        first_name = user_data.get("first_name")
        last_name = user_data.get("last_name")

        if not all([email, password, first_name, last_name]):
            return jsonify({"error": "Missing required fields"}), 400

        existing_user = crud.get_user_by_email(email)
        if existing_user:
            crud.delete_user_by_email(email)

        new_user = {
            "email": email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
        }
        result = crud.create_user(new_user)

        # Send welcome email
        try:
            crud.send_welcome_email(email)
        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")

        return jsonify({"message": result}), 201
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Add favorite article - PUT
@users.route("/favorites/<string:id>", methods=["PUT"])
@jwt_required()  # ודא שהמשתמש מאומת
def add_favorites(id):
    current_user = get_jwt_identity()  # מזהה המשתמש הנוכחי מה-JWT
    favorites_data = request.json.get("article")  # אחזר את נתוני המאמר מגוף הבקשה

    if not favorites_data:
        return jsonify({"message": "Article data is missing"}), 400

    # קבל את המידע על המשתמש
    user = crud.get_user(current_user)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # בדיקה אם הכתבה כבר במועדפים
    if any(favorite.get("id") == favorites_data.get("id") for favorite in user.get("favorites", [])):
        return jsonify({"message": "Article already in favorites"}), 200

    # שימוש ב-id של המשתמש הנוכחי לעדכון המועדפים
    status = crud.add_favorites(current_user, favorites_data)

    if status:
        return jsonify({"message": "Favorites updated successfully"}), 201
    else:
        return jsonify({"message": "Failed to update favorites"}), 500

# Get favorite articles - GET
# Get user's favorite articles - http://localhost:5000/users/66ded95abd75e751b7b77096/favorites
@users.route("/<string:id>/favorites", methods=["GET"])
def get_user_favorites(id):
    try:
        data = crud.get_user(id)  # קבל את המידע על המשתמש
        if not data:
            return jsonify({"error": "User not found"}), 404
        return jsonify(data), 200  # מחזיר את המידע כולל favorites
    except Exception as e: # משמש כדי לתפוס שגיאות  # 
        # אם תהיה שגיאה בעת גישה למסד הנתונים או אם ה- userId לא קיים.
        print(f"Error fetching user favorites: {str(e)}") # משתנה שמקבל את אובייקט השגיאה, כך שניתן לגשת אליו מאוחר יותר בקוד. הוא משמש כדי לאחסן מידע על השגיאה שקרתה.
        return jsonify({"error": "An error occurred fetching the user favorites"}), 500

# בדיקת אם כתבה כבר במועדפים של המשתמש
@users.route("/<string:id>/favorites/<string:article_id>", methods=["GET"])
def is_article_in_favorites(id, article_id):
    try:
        user = crud.get_user(id)  # קבל את המידע על המשתמש
        if not user:
            return jsonify({"error": "User not found"}), 404

        # בדיקה אם הכתבה כבר נמצאת במועדפים
        print(f"Checking if article with ID {article_id} is in favorites")
        if any(favorite.get("id") == article_id for favorite in user.get("favorites", [])):
            return jsonify({"isFavorite": True}), 200  # אם כן, תחזיר true
        else:
            return jsonify({"isFavorite": False}), 200  # אם לא, תחזיר false
    except Exception as e:
        print(f"Error checking if article is favorite: {str(e)}")
        return jsonify({"error": "An error occurred checking the article"}), 500

@users.route("/<string:user_id>/favorites/<string:article_id>", methods=['DELETE'])
def delete_user_favorite(user_id, article_id):
    success = crud.delete_favorite_article(user_id, article_id)  # קריאה לפונקציה למחיקת כתבה מהמועדפים
    if success:
        return jsonify({"message": "כתבה נמחקה מהמועדפים"}), 200
    else:
        return jsonify({"error": "לא הצלחנו למחוק את הכתבה מהמועדפים"}), 400

@users.route("/<string:id>/favorites/order", methods=["PUT"])
def update_favorites_order(id):
    try:
        print(f"Updating favorites order for user ID: {id}")
        user = crud.get_user(id)  # קבל את המידע על המשתמש
        if not user:
            print("User not found")
            return jsonify({"error": "User not found"}), 404

        new_order = request.json.get("favorites", [])
        print(f"New favorites order received: {new_order}")
        
        result = crud.update_favorites_order(id, new_order)
        if result:
            print("Favorites order updated successfully")
            return jsonify({"message": "Favorites order updated successfully"}), 200
        else:
            print("Failed to update favorites order")
            return jsonify({"error": "Failed to update favorites order"}), 500
    except Exception as e:
        print(f"Error updating favorites order: {str(e)}")
        return jsonify({"error": "An error occurred updating the favorites order"}), 500








