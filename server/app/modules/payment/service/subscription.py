from .init_stripe import InitStripe
class SubscriptionService:
    def __init__(self):
        self.stripe_client = InitStripe()
        self.stripe = self.stripe_client.exececute()
        
    def create_product(self, name, description):
        product = self.stripe.Product.create(
            name=name,
            description=description
        )
        return product
    
    def create_price(self, product_id, unit_amount, currency, recurring_interval):
        return self.stripe.Price.create(
            product=product_id,
            unit_amount=unit_amount,
            currency=currency,
            recurring={"interval": recurring_interval}
        )
    def setup_intent(self, customer_id):
        return self.stripe.SetupIntent.create(
            customer=customer_id,
            payment_method_types=["card"]
        )

    def create_customer(self, email, name=None):
        customer = self.stripe.Customer.create(
            email=email,
            name=name
        )
        return customer
    def attach_payment_method(self, payment_method_id, customer_id):
        return self.stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id
        )
    
    def create_subscription(self, customer_id, price_id, payment_method_id):
        self.attach_payment_method(payment_method_id, customer_id)
        self.stripe.Customer.modify(
            customer_id,
            invoice_settings={
                "default_payment_method": payment_method_id
            }
        )
        subscription = self.stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            default_payment_method=payment_method_id,
            trial_period_days=7  # Période d'essai de 7 jours
        )
        return subscription
    