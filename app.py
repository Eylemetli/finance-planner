from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv
from email_templates import create_payment_notification, create_bill_reminder, create_low_budget_alert
import datetime
from apscheduler.schedulers.background import BackgroundScheduler
import pandas as pd
import numpy as np
import traceback
import requests
from flask import jsonify



dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
dotenv_loaded = load_dotenv(dotenv_path)




app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-User-Email"]
    }
})

# Configure Flask-Mail with default values
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))  # Default port for Gmail
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', '')

# Initialize Flask-Mail only if email credentials are provided
if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
    mail = Mail(app)
else:
    print("Warning: Email configuration is incomplete. Email notifications will not work.")
    mail = None



# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['auth_db']
users = db['users']
budgets = db['budgets']
credit_cards = db['credit_cards']
bills = db['bills']
spending_logs = db['spending_logs']

# Zamanlayıcı oluştur
scheduler = BackgroundScheduler()
scheduler.start()

#bu satır silinecek
scheduler.print_jobs()  # Zamanlayıcıda bekleyen işleri listele




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
    
    # Create new bill with notification settings
    bill = {
        'email': data['email'],
        'bill_name': data['bill_name'],
        'amount': data['amount'],
        'category': data['category'],
        'start_date': data['start_date'],
        'end_date': data['end_date'],
        'is_paid': data['is_paid'],
        'is_notification_enabled': data.get('is_notification_enabled', True),  # Default to True
        'last_notification_date': None  # Track when the last notification was sent
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
    if 'is_notification_enabled' in data:
        update_data['is_notification_enabled'] = data['is_notification_enabled']
    
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

@app.route('/unpaid-bills', methods=['GET'])
def get_unpaid_bills():
    # Get user email from header
    user_email = request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Find unpaid bills for the user
    unpaid_bills = list(bills.find({
        'email': user_email,
        'is_paid': False
    }))
    
    # Remove MongoDB _id field from response
    for bill in unpaid_bills:
        bill.pop('_id', None)
    
    return jsonify({'unpaid_bills': unpaid_bills}), 200

@app.route('/unpaid-cards', methods=['GET'])
def get_unpaid_cards():
    # Get user email from header
    user_email = request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Find all credit cards for the user
    user_cards = list(credit_cards.find({'email': user_email}))
    
    # Remove MongoDB _id field from response
    for card in user_cards:
        card.pop('_id', None)
    
    return jsonify({'credit_cards': user_cards}), 200

def send_email_notification(message):
    try:
        mail.send(message)
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False

def check_and_send_bill_reminders():
    """Fatura ve kredi kartı ödemeleri için hatırlatma e-postaları gönderir"""
    current_date = datetime.datetime.now()
    
    # Faturaları kontrol et
    unpaid_bills = bills.find({
        'is_paid': False,
        'is_notification_enabled': True
    })
    
    for bill in unpaid_bills:
        due_date = datetime.datetime.strptime(bill['end_date'], '%Y-%m-%d')
        days_until_due = (due_date - current_date).days
        
        # Check if we should send a notification
        should_send_notification = False
        
        # If bill is overdue
        if days_until_due < 0:
            should_send_notification = True
        # If bill is due in 2 days
        elif days_until_due == 2:
            should_send_notification = True
        
        # Check if we've already sent a notification today
        if should_send_notification:
            last_notification = bill.get('last_notification_date')
            if last_notification:
                last_notification_date = datetime.datetime.strptime(last_notification, '%Y-%m-%d')
                if (current_date - last_notification_date).days < 1:
                    should_send_notification = False
        
        if should_send_notification:
            message = create_bill_reminder(
                bill['email'],
                bill['bill_name'],
                bill['amount'],
                bill['end_date']
            )
            if send_email_notification(message):
                # Update last notification date
                bills.update_one(
                    {'_id': bill['_id']},
                    {'$set': {'last_notification_date': current_date.strftime('%Y-%m-%d')}}
                )

def check_and_send_budget_alerts():
    """Düşük bütçe uyarılarını kontrol eder ve e-posta gönderir"""
    BUDGET_THRESHOLD = 200  # TL cinsinden eşik değeri
    
    budgets = db.budgets.find()
    for budget in budgets:
        if budget['initial_budget'] < BUDGET_THRESHOLD:
            message = create_low_budget_alert(
                budget['email'],
                budget['initial_budget'],
                BUDGET_THRESHOLD
            )
            send_email_notification(message)

# Zamanlayıcı görevlerini ekle
scheduler.add_job(check_and_send_bill_reminders, 'interval', hours=24)
scheduler.add_job(check_and_send_budget_alerts, 'interval', hours=24)

@app.route('/run-daily-checks', methods=['POST'])
def run_daily_checks():
    try:
        check_and_send_bill_reminders()
        check_and_send_budget_alerts()
        return jsonify({'message': 'Daily checks completed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/make-payment', methods=['POST'])
def make_payment():
    data = request.get_json()
    
    # Check required fields
    required_fields = ['email', 'odeme_turu', 'isim', 'odeme_tutari']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'All fields are required: email, odeme_turu, isim, odeme_tutari'}), 400
    
    # Get user email from header
    user_email = request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Check if user exists
    user = users.find_one({'email': user_email})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's budget
    user_budget = budgets.find_one({'email': user_email})
    if not user_budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    # Check if payment amount exceeds budget
    if float(data['odeme_tutari']) > user_budget['initial_budget']:
        return jsonify({'error': 'Payment amount exceeds available budget'}), 400
    
    # Process payment based on type
    if data['odeme_turu'] == 'bill':
        # Find and update bill
        bill = bills.find_one({
            'email': user_email,
            'bill_name': data['isim'],
            'is_paid': False
        })
        
        if not bill:
            return jsonify({'error': 'Unpaid bill not found'}), 404
        
        bills.update_one(
            {'email': user_email, 'bill_name': data['isim']},
            {'$set': {'is_paid': True}}
        )
        
    elif data['odeme_turu'] == 'card':
        # Find and update credit card
        card = credit_cards.find_one({
            'email': user_email,
            'bank_name': data['isim']
        })
        
        if not card:
            return jsonify({'error': 'Credit card not found'}), 404
        
        # Update card balance
        new_balance = card['current_balance'] - float(data['odeme_tutari'])
        credit_cards.update_one(
            {'email': user_email, 'bank_name': data['isim']},
            {'$set': {'current_balance': new_balance}}
        )
    
    else:
        return jsonify({'error': 'Invalid payment type'}), 400
    
    # Update budget
    new_budget = user_budget['initial_budget'] - float(data['odeme_tutari'])
    budgets.update_one(
        {'email': user_email},
        {'$set': {'initial_budget': new_budget}}
    )
    
    # Send payment notification email
    message = create_payment_notification(
        user_email,
        data['odeme_turu'],
        data['isim'],
        data['odeme_tutari'],
        new_budget
    )
    send_email_notification(message)
    
    return jsonify({
        'message': 'Payment successful',
        'remaining_budget': new_budget
    }), 200

@app.route('/test-mail', methods=['POST'])
def test_mail():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    # Create a test bill reminder
    message = create_bill_reminder(
        data['email'],
        "Test Fatura",
        100.00,
        datetime.datetime.now().strftime('%Y-%m-%d')
    )
    
    if send_email_notification(message):
        return jsonify({'message': 'Test email sent successfully'}), 200
    else:
        return jsonify({'error': 'Failed to send test email'}), 500

def get_monthly_balance_report(user_email, year=None):
    """Kullanıcının aylık gelir-gider dengesini hesaplar"""
    if year is None:
        year = datetime.datetime.now().year
    
    # Bütçe bilgisini al
    budget = budgets.find_one({'email': user_email})
    if not budget:
        return None
    
    monthly_data = []
    month_names = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    
    for month in range(1, 13):
        # Ayın başlangıç ve bitiş tarihleri
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year}-12-31"
        else:
            end_date = f"{year}-{(month+1):02d}-01"
        
        # Fatura ödemelerini hesapla
        bill_payments = bills.find({
            'email': user_email,
            'is_paid': True,
            'end_date': {'$gte': start_date, '$lt': end_date}
        })
        total_bill_payments = sum(float(bill['amount']) for bill in bill_payments)
        
        # Kredi kartı ödemelerini hesapla
        card_payments = credit_cards.find({
            'email': user_email,
            'due_date_end': {'$gte': start_date, '$lt': end_date}
        })
        total_card_payments = sum(float(card['current_balance']) for card in card_payments)
        
        # Toplam harcama
        total_spending = total_bill_payments + total_card_payments
        
        # Kalan miktar
        remaining = float(budget['initial_budget']) - total_spending
        
        monthly_data.append({
            'month': month_names[month-1],
            'income': float(budget['initial_budget']),
            'expense': total_spending
        })
    
    return monthly_data

def get_category_spending_report(user_email, year=None):
    """Kullanıcının kategori bazlı harcama oranlarını hesaplar"""
    if year is None:
        year = datetime.datetime.now().year
    
    # Bütçe bilgisini al
    budget = budgets.find_one({'email': user_email})
    if not budget:
        return None
    
    # Harcama kayıtlarını al
    spending_logs = list(db.spending_logs.find({
        'email': user_email,
        'date': {
            '$gte': datetime.datetime(year, 1, 1),
            '$lt': datetime.datetime(year + 1, 1, 1)
        }
    }))
    
    if not spending_logs:
        return None
    
    # Kategorilere göre toplam harcamaları hesapla
    category_totals = {}
    for log in spending_logs:
        category = log['category']
        amount = float(log['amount'])
        category_totals[category] = category_totals.get(category, 0) + amount
    
    # Toplam harcama
    total_spending = sum(category_totals.values())
    
    # Kategori verilerini oluştur
    category_data = []
    for category, amount in category_totals.items():
        category_data.append({
            'name': category,
            'value': amount
        })
    
    return category_data

@app.route('/generate_report', methods=['POST'])
def generate_report():
    data = request.get_json()
    
    # Check required fields
    if not data or 'report_type' not in data or 'email' not in data:
        return jsonify({'error': 'Report type and email are required'}), 400
    
    report_type = data['report_type']
    user_email = data['email']
    year = data.get('year', datetime.datetime.now().year)
    
    # Check if user exists
    user = users.find_one({'email': user_email})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        if report_type == 'monthly_balance':
            # Gelir-Gider Dengesi Raporu
            report_data = get_monthly_balance_report(user_email, year)
            if not report_data:
                return jsonify({'error': 'No data available for the specified period'}), 404
            
            return jsonify({
                'report_type': 'monthly_balance',
                'year': year,
                'monthly_data': report_data
            }), 200
            
        elif report_type == 'category_spending':
            # Kategori Bazlı Harcama Raporu
            report_data = get_category_spending_report(user_email, year)
            if not report_data:
                return jsonify({'error': 'No spending data available for the specified period'}), 404
            
            return jsonify({
                'report_type': 'category_spending',
                'year': year,
                'category_data': report_data
            }), 200
            
        else:
            return jsonify({'error': 'Invalid report type'}), 400
            
    except Exception as e:       
        return jsonify({'error': str(e)}), 500

@app.route('/home/messages', methods=['GET'])
def get_home_messages():
    # Get user email from header
    user_email = request.headers.get('X-User-Email')
    
    # Get user's budget
    user_budget = budgets.find_one({'email': user_email})
    if not user_budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    messages = []
    
    # Get current month's spending logs
    current_month = datetime.datetime.now().month
    current_year = datetime.datetime.now().year
    
    # Calculate total spending for current month
    monthly_spending = spending_logs.aggregate([
        {
            '$match': {
                'email': user_email,
                'date': {
                    '$gte': datetime.datetime(current_year, current_month, 1),
                    '$lt': datetime.datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime.datetime(current_year + 1, 1, 1)
                }
            }
        },
        {
            '$group': {
                '_id': None,
                'total_spending': {'$sum': '$amount'}
            }
        }
    ])
    
    monthly_spending_result = list(monthly_spending)
    total_spending = monthly_spending_result[0]['total_spending'] if monthly_spending_result else 0
    
    # 1. Check if 90% of budget is spent
    if total_spending >= (user_budget['initial_budget'] * 0.9):
        messages.append("💸 Kaynaklarınız tükenmek üzere, harcamalarınıza dikkat edin!")
    
    # 2. Check education spending
    education_spending = spending_logs.aggregate([
        {
            '$match': {
                'email': user_email,
                'category': 'Eğitim',
                'date': {
                    '$gte': datetime.datetime(current_year, current_month, 1),
                    '$lt': datetime.datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime.datetime(current_year + 1, 1, 1)
                }
            }
        },
        {
            '$group': {
                '_id': None,
                'total_education': {'$sum': '$amount'}
            }
        }
    ])
    
    education_result = list(education_spending)
    total_education = education_result[0]['total_education'] if education_result else 0
    
    # Get spending by category for comparison
    category_spending = spending_logs.aggregate([
        {
            '$match': {
                'email': user_email,
                'date': {
                    '$gte': datetime.datetime(current_year, current_month, 1),
                    '$lt': datetime.datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime.datetime(current_year + 1, 1, 1)
                }
            }
        },
        {
            '$group': {
                '_id': '$category',
                'total': {'$sum': '$amount'}
            }
        },
        {
            '$sort': {'total': -1}
        }
    ])
    
    category_spending_result = list(category_spending)
    
    # Check if education spending is highest
    if category_spending_result and category_spending_result[0]['_id'] == 'Eğitim':
        messages.append("🎓 Bu ay eğitim harcamalarınız diğer kategorilere göre daha yüksek.")
    
    # 3. Check if no spending this month
    if not monthly_spending_result:
        messages.append("🔍 Henüz bir harcama girişi yapmadınız. Harcamalarınızı kaydedin.")
    
    # 4. Check sports spending
    sports_spending = spending_logs.aggregate([
        {
            '$match': {
                'email': user_email,
                'category': 'Spor',
                'date': {
                    '$gte': datetime.datetime(current_year, current_month, 1),
                    '$lt': datetime.datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime.datetime(current_year + 1, 1, 1)
                }
            }
        },
        {
            '$group': {
                '_id': None,
                'total_sports': {'$sum': '$amount'}
            }
        }
    ])
    
    sports_result = list(sports_spending)
    total_sports = sports_result[0]['total_sports'] if sports_result else 0
    
    # Check if sports spending is more than 30% of budget
    if total_sports > (user_budget['initial_budget'] * 0.3):
        messages.append("🏋️ Bu ay spor harcamalarınız artmış görünüyor.")
    
    return jsonify({'messages': messages}), 200

@app.route('/upcoming-payments', methods=['GET'])
def get_upcoming_payments():
    try:
        email = request.headers.get('X-User-Email')
        if not email:
            return jsonify({'error': 'Kullanıcı bilgisi bulunamadı'}), 401

        # Şu anki tarih
        current_date = datetime.datetime.now()
        # 30 gün sonrası
        thirty_days_later = current_date + datetime.timedelta(days=30)

        # Kredi kartı ödemelerini al
        card_payments = []
        credit_cards = credit_cards.find({
            'email': email,
            'due_date_end': {
                '$gte': current_date.strftime('%Y-%m-%d'),
                '$lte': thirty_days_later.strftime('%Y-%m-%d')
            }
        })
        
        for card in credit_cards:
            card_payments.append({
                'name': f"{card['bank_name']} Kredi Kartı",
                'amount': card['current_balance'],
                'due_date': card['due_date_end']
            })

        # Fatura ödemelerini al
        bill_payments = []
        bills_list = bills.find({
            'email': email,
            'is_paid': False,
            'end_date': {
                '$gte': current_date.strftime('%Y-%m-%d'),
                '$lte': thirty_days_later.strftime('%Y-%m-%d')
            }
        })
        
        for bill in bills_list:
            bill_payments.append({
                'name': bill['bill_name'],
                'amount': bill['amount'],
                'due_date': bill['end_date']
            })

        # Tüm ödemeleri birleştir ve tarihe göre sırala
        all_payments = card_payments + bill_payments
        all_payments.sort(key=lambda x: x['due_date'])

        return jsonify({'payments': all_payments}), 200
    except Exception as e:
        print(f"Error in get_upcoming_payments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/recent-expenses', methods=['GET'])
def get_recent_expenses():
    try:
        email = request.headers.get('X-User-Email')
        if not email:
            return jsonify({'error': 'Kullanıcı bilgisi bulunamadı'}), 401

        # Son 10 harcamayı al
        expenses = list(spending_logs.find(
            {'email': email}
        ).sort('date', -1).limit(10))
        
        expense_list = []
        for expense in expenses:
            expense_list.append({
                'description': expense['category'],
                'amount': expense['amount'],
                'date': expense['date'].strftime('%Y-%m-%d')
            })

        return jsonify({'expenses': expense_list}), 200
    except Exception as e:
        print(f"Error in get_recent_expenses: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/budget', methods=['GET'])
def get_budget():
    # Get user email from header
    user_email = request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Find user's budget
    budget = budgets.find_one({'email': user_email})
    
    if not budget:
        return jsonify({
            'initial_budget': 0,
            'remaining_amount': 0
        }), 200
    
    # Calculate remaining amount
    total_spending = spending_logs.aggregate([
        {'$match': {'email': user_email}},
        {'$group': {
            '_id': None,
            'total': {'$sum': '$amount'}
        }}
    ])
    
    total_spending_result = list(total_spending)
    total_spent = total_spending_result[0]['total'] if total_spending_result else 0
    
    remaining_amount = float(budget['initial_budget']) - total_spent
    
    return jsonify({
        'initial_budget': float(budget['initial_budget']),
        'remaining_amount': remaining_amount
    }), 200

@app.route('/payments', methods=['GET'])
def get_payments():
    try:
        # Get user email from header
        user_email = request.headers.get('X-User-Email')
        
        if not user_email:
            return jsonify({'error': 'User not authenticated'}), 401
        
        # Get all payments from bills and credit cards
        total_payments = 0
        
        # Get paid bills
        paid_bills = bills.find({
            'email': user_email,
            'is_paid': True
        })
        
        for bill in paid_bills:
            total_payments += float(bill['amount'])
        
        # Get credit card payments
        card_payments = credit_cards.find({
            'email': user_email
        })
        
        for card in card_payments:
            total_payments += float(card['current_balance'])
        
        return jsonify({
            'total_payments': total_payments
        }), 200
        
    except Exception as e:
        print(f"Error in get_payments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route("/kur", methods=["GET"])
def get_selected_exchange_rates():
    try:
        response = requests.get("https://open.er-api.com/v6/latest/USD")
        data = response.json()
        selected = {k: v for k, v in data["rates"].items() if k in ["TRY", "EUR", "GBP"]}
        return jsonify({
            "base": data["base_code"],
            "date": data["time_last_update_utc"],
            "rates": selected
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)





