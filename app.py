from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv
import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['auth_db']
users = db['users']
budgets = db['budgets']
credit_cards = db['credit_cards']
bills = db['bills']
spending_logs = db['spending_logs']

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

@app.route('/credit-card', methods=['POST'])
def add_credit_card():
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['email', 'bank_name', 'card_limit', 'due_date_start', 'due_date_end', 'current_balance']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'All fields are required: email, bank_name, card_limit, due_date_start, due_date_end, current_balance'}), 400
    
    # Check if user exists
    user = users.find_one({'email': data['email']})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Create new credit card
    credit_card = {
        'email': data['email'],
        'bank_name': data['bank_name'],
        'card_limit': data['card_limit'],
        'due_date_start': data['due_date_start'],
        'due_date_end': data['due_date_end'],
        'current_balance': data['current_balance']
    }
    
    credit_cards.insert_one(credit_card)
    return jsonify({'message': 'Credit card added successfully'}), 201

@app.route('/credit-card', methods=['PUT'])
def update_credit_card():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'email' not in data or 'bank_name' not in data:
        return jsonify({'error': 'Email and bank_name are required'}), 400
    
    # Check if credit card exists
    existing_card = credit_cards.find_one({
        'email': data['email'],
        'bank_name': data['bank_name']
    })
    
    if not existing_card:
        return jsonify({'error': 'Credit card not found'}), 404
    
    # Update fields
    update_data = {}
    if 'card_limit' in data:
        update_data['card_limit'] = data['card_limit']
    if 'due_date_start' in data:
        update_data['due_date_start'] = data['due_date_start']
    if 'due_date_end' in data:
        update_data['due_date_end'] = data['due_date_end']
    if 'current_balance' in data:
        update_data['current_balance'] = data['current_balance']
    
    credit_cards.update_one(
        {'email': data['email'], 'bank_name': data['bank_name']},
        {'$set': update_data}
    )
    
    return jsonify({'message': 'Credit card updated successfully'}), 200

@app.route('/credit-card', methods=['DELETE'])
def delete_credit_card():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'email' not in data or 'bank_name' not in data:
        return jsonify({'error': 'Email and bank_name are required'}), 400
    
    # Delete credit card
    result = credit_cards.delete_one({
        'email': data['email'],
        'bank_name': data['bank_name']
    })
    
    if result.deleted_count == 0:
        return jsonify({'error': 'Credit card not found'}), 404
    
    return jsonify({'message': 'Credit card deleted successfully'}), 200

@app.route('/bill', methods=['POST'])
def add_bill():
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['email', 'bill_name', 'amount', 'category', 'start_date', 'end_date', 'is_paid']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'All fields are required: email, bill_name, amount, category, start_date, end_date, is_paid'}), 400
    
    # Check if user exists
    user = users.find_one({'email': data['email']})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Create new bill
    bill = {
        'email': data['email'],
        'bill_name': data['bill_name'],
        'amount': data['amount'],
        'category': data['category'],
        'start_date': data['start_date'],
        'end_date': data['end_date'],
        'is_paid': data['is_paid']
    }
    
    bills.insert_one(bill)
    return jsonify({'message': 'Bill added successfully'}), 201

@app.route('/bill', methods=['PUT'])
def update_bill():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'email' not in data or 'bill_name' not in data:
        return jsonify({'error': 'Email and bill_name are required'}), 400
    
    # Check if bill exists
    existing_bill = bills.find_one({
        'email': data['email'],
        'bill_name': data['bill_name']
    })
    
    if not existing_bill:
        return jsonify({'error': 'Bill not found'}), 404
    
    # Update fields
    update_data = {}
    if 'amount' in data:
        update_data['amount'] = data['amount']
    if 'category' in data:
        update_data['category'] = data['category']
    if 'start_date' in data:
        update_data['start_date'] = data['start_date']
    if 'end_date' in data:
        update_data['end_date'] = data['end_date']
    if 'is_paid' in data:
        update_data['is_paid'] = data['is_paid']
    
    bills.update_one(
        {'email': data['email'], 'bill_name': data['bill_name']},
        {'$set': update_data}
    )
    
    return jsonify({'message': 'Bill updated successfully'}), 200

@app.route('/bill', methods=['DELETE'])
def delete_bill():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'email' not in data or 'bill_name' not in data:
        return jsonify({'error': 'Email and bill_name are required'}), 400
    
    # Delete bill
    result = bills.delete_one({
        'email': data['email'],
        'bill_name': data['bill_name']
    })
    
    if result.deleted_count == 0:
        return jsonify({'error': 'Bill not found'}), 404
    
    return jsonify({'message': 'Bill deleted successfully'}), 200

@app.route('/spending-log', methods=['POST'])
def add_spending_log():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'category' not in data or 'amount' not in data:
        return jsonify({'error': 'Category and amount are required'}), 400
    
    # Get user email from session (you'll need to implement session management)
    user_email = request.headers.get('X-User-Email')  # Assuming email is passed in header
    
    if not user_email:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Create new spending log
    spending_log = {
        'email': user_email,
        'category': data['category'],
        'amount': float(data['amount']),
        'date': datetime.datetime.now()
    }
    
    spending_logs.insert_one(spending_log)
    return jsonify({'message': 'Spending log added successfully'}), 201

@app.route('/spending-summary', methods=['GET'])
def get_spending_summary():
    # Get user email from session
    user_email = request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Aggregate spending by category
    pipeline = [
        {'$match': {'email': user_email}},
        {'$group': {
            '_id': '$category',
            'total_amount': {'$sum': '$amount'}
        }},
        {'$sort': {'total_amount': -1}}
    ]
    
    result = list(spending_logs.aggregate(pipeline))
    
    # Format the response
    summary = [{'category': item['_id'], 'total_amount': item['total_amount']} for item in result]
    
    return jsonify({'spending_summary': summary}), 200

@app.route('/spending-log', methods=['DELETE'])
def delete_spending_log():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'category' not in data:
        return jsonify({'error': 'Category is required'}), 400
    
    # Get user email from session
    user_email = request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Delete all spending logs for the given category and user
    result = spending_logs.delete_many({
        'email': user_email,
        'category': data['category']
    })
    
    if result.deleted_count == 0:
        return jsonify({'error': 'No spending logs found for the given category'}), 404
    
    return jsonify({'message': f'Successfully deleted {result.deleted_count} spending logs'}), 200

if __name__ == '__main__':
    app.run(debug=True) 