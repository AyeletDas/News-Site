# Process:  db --> crud_functions --> routes --> app

from pymongo import MongoClient # Imports the class-MongoClient from module-pymongo. which allows us to connect to Data Base with Python

class DBMongo: # create class
    def __init__(self): # started the class - new object
        server = MongoClient(port=27017) #localhost
        db = server["newsPythonDB"] # If this database does not exist, it will create it automatically 
        self.user_collection = db["user"] # collection for CRUD operations
