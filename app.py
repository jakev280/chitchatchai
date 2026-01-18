import os
import stripe
from flask import Flask, request, jsonify, redirect
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

app = Flask(__name__)

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        # For an NGO, we often want the user to pick an amount.
        # Let's assume the frontend sends {'amount': 25}
        data = request.get_json()
        amount_gbp = data.get('amount', 10) # Default to £10

        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price_data': {
                        'currency': 'gbp',
                        'unit_amount': int(amount_gbp * 100), # Stripe uses pence
                        'product_data': {
                            'name': 'Donation to ChitChatChai',
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            # Replace these with your real URLs once you deploy
            success_url='http://localhost:5000/success',
            cancel_url='http://localhost:5000/cancel',
            submit_type='donate', 
        )

        return jsonify({'url': checkout_session.url})

    except Exception as e:
        return jsonify(error=str(e)), 403

if __name__ == '__main__':
    app.run(port=5000, debug=True)
