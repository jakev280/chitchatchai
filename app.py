import os
import stripe
from flask import Flask, request, jsonify
from flask_cors import CORS  # Connects Frontend to Backend
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

app = Flask(__name__)
CORS(app) # Allows your GitHub site to talk to this Render server

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        amount_gbp = data.get('amount', 10)

        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                'price_data': {
                    'currency': 'gbp',
                    'unit_amount': int(amount_gbp * 100),
                    'product_data': {
                        'name': 'ChitChatChai Donation',
                        'description': 'Supporting refugee and migrant women in Manchester',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            submit_type='donate',
            # Replace with your actual GitHub Pages URL
            success_url='https://jakev.github.io/chitchatchai/?session=success',
            cancel_url='https://jakev.github.io/chitchatchai/',
        )

        return jsonify({'url': checkout_session.url})

    except Exception as e:
        return jsonify(error=str(e)), 403

if __name__ == '__main__':
    # Render uses the PORT env variable
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)