import smtplib
from email.mime.text import MIMEText
import os

SMTP_USER = os.environ.get('GMAIL_USER')
SMTP_PASS = os.environ.get('GMAIL_APP_PASSWORD')

def _send_email(to, subject, body):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

def send_approval_email(to, property_title):
    _send_email(to, 'Your listing was approved!',
                f'Your property "{property_title}" is now live on ToLet Finder.')

def send_rejection_email(to, property_title, reason):
    _send_email(to, 'Your listing needs changes',
                f'Your property "{property_title}" was not approved.\nReason: {reason}\nPlease edit and resubmit.')

import random

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(to, otp_code):
    _send_email(to, 'Your ToLet Finder verification code',
                f'Your verification code is: {otp_code}\nThis code expires in 10 minutes.')