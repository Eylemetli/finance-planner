from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['auth_db']
users = db['users']
budgets = db['budgets']

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already exists'}), 400
    
    # Hash password
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Create new user
    user = {
        'username': data['username'],
        'email': data['email'],
        'password': hashed_password.decode('utf-8')
    }
    
    users.insert_one(user)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Find user by email
    user = users.find_one({'email': data['email']})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check password
    if bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({
            'message': 'Login successful',
            'user': {
                'username': user['username'],
                'email': user['email']
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid password'}), 401

@app.route('/budget', methods=['POST'])
def set_budget():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'email' not in data or 'initial_budget' not in data:
        return jsonify({'error': 'Email and initial_budget are required'}), 400
    
    # Check if user exists
    user = users.find_one({'email': data['email']})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if budget already exists for the user
    existing_budget = budgets.find_one({'email': data['email']})
    
    if existing_budget:
        # Update existing budget
        budgets.update_one(
            {'email': data['email']},
            {'$set': {'initial_budget': data['initial_budget']}}
        )
        return jsonify({'message': 'Budget updated successfully'}), 200
    else:
        # Create new budget
        budget = {
            'email': data['email'],
            'initial_budget': data['initial_budget']
        }
        budgets.insert_one(budget)
        return jsonify({'message': 'Budget created successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True) 