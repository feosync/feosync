from  app.core.config import settings
import stripe
class InitStripe:
    def __init__(self):
        stripe.api_key = settings.STRIPE_API_KEY
        self.stripe_key = stripe.api_key
        
    def exececute(self):
        return stripe