# Process:  db --> crud_functions --> routes --> app
from bson import ObjectId  # _id in studio3T
from app.db import DBMongo  # db file
#import requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import os
# from time import sleep
# from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

class RoustesDB:
    def __init__(self):  # started the class - new object
        self.db = DBMongo().user_collection  # db file

    # List of all users- http://localhost:5000/users - Works in Postman
    def get_all_users(self):
        users = list(
            self.db.find({}) # Searches for all users in the collection (empty parameter {} - no conditions).
        ) 
        users_data = []  # Converted to a new data structure and return

        for user in users:  # loop
            new_user = {  # Create a new dictionary
                "email": user["email"],
                "password": user["password"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "_id": str(user["_id"]),  # ObjectId --> _id --> str
            }
            users_data.append(
                new_user
            )  # Adds the new_user dictionary to the users_data list [], which is an empty list

        return users_data

    # find user by unique (id) GET- http://localhost:5000/users/66ded95abd75e751b7b77096/favorites / http://localhost:5000/users/66ded95abd75e751b7b77096 - Works in Postman
    def get_user(self, id):
        user = self.db.find_one({"_id": ObjectId(id)})  # Convert the string to the ID
        if user:  # If found - returned in dictionary format
            user_data = {
                "email": user["email"],
                "password": user["password"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "favorites": user.get("favorites", []),  #עדכון 10.9.2024 (if does not exist, it will create it automatically)
            }
            return user_data
        return None  # If not found - None

    # find user by email - not working in Postman alone, Just with all the details
    def get_user_by_email(self, email):
        user = self.db.find_one({"email": email})
        if user:  # If found - returned in dictionary format
            user_data = {
                "email": user["email"],
                "password": user["password"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "_id": str(user["_id"]),
            }
            return user_data
        return None  # If not found - None
    
    ''' 
    # find user by password 
    def get_user_by_password(self, password):
        user = self.db.find_one({"password": password})
        if user:  # If found - returned in dictionary format
            user_data = {
                "email": user["email"],
                "password": user["password"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "_id": str(user["_id"]),
            }
            return user_data
        return None  # If not found - None
    '''
    # created a new user by inserting an object into the collection
    def create_user(self, obj):
        try:
            result = self.db.insert_one(obj)  # insert a new user document into the database collection
            print(f"User created with ID: {result.inserted_id}")  
            return "נרשמת בהצלחה! עכשיו ניתן להתחבר"
        except Exception as e: # If an error occurs- caught exception can be assigned to a variable named E
            print(f"Error creating user: {str(e)}")  
            raise # Raise = failed

    # Send welcome email to the new user
    def send_welcome_email(self, email):
        html_content = """
        <html>
            <head>
                <style>
                    body {
                        direction: rtl;
                        text-align: right;
                        font-family: Arial, sans-serif;
                    }
                </style>
            </head>
            <body>
                <h1>ברוכים הבאים!</h1>
                <p><strong>תודה שנרשמת לאתר החדשות של אילת!</strong></p>
                <p>אנו מקווים שתיהנה מהתוכן שלנו.</p>
            </body>
        </html>
        """

        message = Mail(
            from_email="ayeleet9@gmail.com",
            to_emails=email,
            subject="ברכות על הרשמתך ",
            html_content='<div dir="rtl" style="text-align: right;"><strong>תודה שנרשמת לאתר החדשות של אילת!</strong></div>',
        )

        try:
            sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
            response = sg.send(message)
            print(f"SendGrid API response status code: {response.status_code}")
        except Exception as e:
            print(f"SendGrid API error: {str(e)}")

    # Favorites Article #

    # Saving a favorite article, a function to update favorites
    def add_favorites(self, user_id, article):
        user = self.db.find_one({"_id": ObjectId(user_id)})
        if user:
            if "favorites" not in user:
                user["favorites"] = []
            # Checking if the article already exists in favorites by ID, title and summary
            if any(favorite.get("id") == article.get("id") or (favorite.get("title") == article.get("title") and favorite.get("summary") == article.get("summary")) for favorite in user["favorites"]):
                return False  # The article already exists, we will not add it again
            user["favorites"].append(article) # If the article does not exist, we will add it to favorites
            result = self.db.update_one( # Updating the database
                {"_id": ObjectId(user_id)},  # Finding the user by their unique ObjectId
                {"$set": {"favorites": user["favorites"]}} # Setting the 'favorites' field with the new data $set= Update an existing field in the document.
            )
            return result.modified_count > 0 # Return True if at least one document has been updated, greater than zero, otherwise False. modified_count= The number of documents updated following this call.
        else:
            return 

    def delete_favorite_article(self, user_id, article_id):
        try:
            result = self.db.update_one(
                {"_id": ObjectId(user_id)},  # User ID
                {"$pull": {"favorites": {"id": article_id}}} # An operation in Mongo that allows you to remove values ​​from an array per article's id
            )
            return result.modified_count > 0  # Return True if at least one document has been updated, greater than zero, otherwise False. modified_count= The number of documents updated following this call.
        except Exception as e: # If an error occurs- caught exception can be assigned to a variable named E
            print(f"Error deleting favorite article: {str(e)}")
            return False
        
    def update_favorites_order(self, user_id, new_order): # user_id: I want to update. new_order: a new list 
        user = self.db.find_one({"_id": ObjectId(user_id)})  # Find user by ID
        if user:
            # Updating the favorites in the new order
            user["favorites"] = [favorite for favorite in user["favorites"] if favorite["id"] in new_order] # Filtering- If the ID if exists
            user["favorites"].sort(key=lambda x: new_order.index(x["id"]))  # Returns the new location (lambda= anonymous function)

            result = self.db.update_one(
                {"_id": ObjectId(user_id)}, {"$set": {"favorites": user["favorites"]}}  # Update favorites in the database
            )
            return result.modified_count > 0  # If an error occurs- caught exception can be assigned to a variable named E
        return False  # Returns False if user not found





