import os
import stripe
from flask import Flask, request, jsonify
from flask_cors import CORS  # Connects Frontend to Backend
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

app = Flask(__name__)
CORS(app) 

# --- SMART URL SWITCH ---
# If RENDER is in the environment, use GitHub. Otherwise, use localhost.
IS_RENDER = os.environ.get('RENDER')
BASE_URL = "https://jakev.github.io/chitchatchai/" if IS_RENDER else "http://localhost:5000"

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
            # Now these will automatically point to localhost when you're working at home!
            success_url=f'{BASE_URL}/?session=success',
            cancel_url=f'{BASE_URL}/',
        )

        return jsonify({'url': checkout_session.url})

    except Exception as e:
        return jsonify(error=str(e)), 403

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)