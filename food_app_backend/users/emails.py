from django.core.mail import EmailMultiAlternatives

def send_html_otp_email(user_email, otp_code):
    subject = "Your Royal Crave Verification Code"
    from_email = "Royal Crave <noreply@royalcrave.com>"
    to = [user_email]

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; }}
        .email-container {{ max-width: 480px; margin: 40px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EAEAEA; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
        .email-header {{ background: #1A1A1A; padding: 30px; text-align: center; }}
        .email-header h1 {{ color: #C5A059; margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 1px; }}
        .email-body {{ padding: 35px 30px; color: #1A1A1A; text-align: center; }}
        .email-body h2 {{ font-size: 20px; color: #1A1A1A; margin-top: 0; }}
        .email-body p {{ font-size: 15px; color: #666666; line-height: 1.6; margin-bottom: 25px; }}
        .otp-box {{ background: #F9F6F0; border: 1px dashed #C5A059; border-radius: 12px; padding: 15px; font-size: 32px; font-weight: bold; color: #1A1A1A; letter-spacing: 6px; margin: 20px 0; display: inline-block; }}
        .email-footer {{ background: #FAFAFA; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #EAEAEA; }}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>ROYAL CRAVE</h1>
        </div>
        <div class="email-body">
          <h2>Verify Your Account</h2>
          <p>Welcome to Royal Crave. Please use the secure verification code below to complete your registration process.</p>
          <div class="otp-box">{otp_code}</div>
          <p style="font-size: 13px; color: #999999; margin-top: 20px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        <div class="email-footer">
          &copy; 2026 Royal Crave Dining Experience. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"Your Royal Crave verification code is: {otp_code}"
    
    msg = EmailMultiAlternatives(subject, text_content, from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def send_html_welcome_email(user_email, first_name):
    subject = "Welcome to Royal Crave!"
    from_email = "Royal Crave <noreply@royalcrave.com>"
    to = [user_email]

    name_display = first_name if first_name else "Valued Guest"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; }}
        .email-container {{ max-width: 480px; margin: 40px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EAEAEA; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
        .email-header {{ background: #1A1A1A; padding: 30px; text-align: center; }}
        .email-header h1 {{ color: #C5A059; margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 1px; }}
        .email-body {{ padding: 35px 30px; color: #1A1A1A; text-align: left; }}
        .email-body h2 {{ font-size: 22px; color: #1A1A1A; margin-top: 0; font-family: Georgia, serif; }}
        .email-body p {{ font-size: 15px; color: #666666; line-height: 1.6; margin-bottom: 20px; }}
        .welcome-card {{ background: #1A1A1A; color: #FFFFFF; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; border: 1px solid rgba(197, 160, 89, 0.3); }}
        .welcome-card h3 {{ color: #C5A059; margin: 0 0 5px 0; font-size: 18px; }}
        .welcome-card p {{ color: #EFEBE0; margin: 0; font-size: 13px; }}
        .cta-button {{ display: block; background: #1A1A1A; color: #C5A059; text-align: center; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; }}
        .email-footer {{ background: #FAFAFA; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #EAEAEA; }}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>ROYAL CRAVE</h1>
        </div>
        <div class="email-body">
          <h2>Welcome to the Family, {name_display}!</h2>
          <p>Your account has been successfully created. We are thrilled to welcome you to a premier dining experience tailored for true connoisseurs.</p>
          
          <div class="welcome-card">
            <h3>🎉 Royal Rewards Unlocked</h3>
            <p>You have been credited with starting tier access. Earn points with every royal order you place!</p>
          </div>

          <p>Explore our exclusive menu featuring fresh, hand-crafted preparations delivered straight to your door.</p>

          <a href="http://localhost:5173" class="cta-button">Explore the Menu</a>
        </div>
        <div class="email-footer">
          &copy; 2026 Royal Crave Dining Experience. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"Welcome to Royal Crave, {name_display}! Your account has been successfully created."
    
    msg = EmailMultiAlternatives(subject, text_content, from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()