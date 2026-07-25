import requests
import os
import random

RESEND_API_KEY = os.environ.get('RESEND_API_KEY')

def generate_otp():
    return str(random.randint(100000, 999999))

def _send_email(to, subject, body):
    response = requests.post(
        'https://api.resend.com/emails',
        headers={'Authorization': f'Bearer {RESEND_API_KEY}'},
        json={
            'from': 'ToLet Finder <onboarding@resend.dev>',
            'to': [to],
            'subject': subject,
            'text': body
        }
    )
    if response.status_code >= 400:
        raise Exception(f'Failed to send email: {response.text}')

def send_otp_email(to, otp_code):
    _send_email(to, 'Your ToLet Finder verification code',
                f'Your verification code is: {otp_code}\nThis code expires in 10 minutes.')

def send_approval_email(to, property_title):
    _send_email(to, 'Your listing was approved!',
                f'Your property "{property_title}" is now live on ToLet Finder.')

def send_rejection_email(to, property_title, reason):
    _send_email(to, 'Your listing needs changes',
                f'Your property "{property_title}" was not approved.\nReason: {reason}\nPlease edit and resubmit.')