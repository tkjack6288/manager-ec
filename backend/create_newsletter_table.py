import os
from database import engine
from models.newsletter import NewsletterSubscriber

def run():
    print("Creating newsletter_subscribers table...")
    NewsletterSubscriber.__table__.create(bind=engine, checkfirst=True)
    print("Done!")

if __name__ == "__main__":
    run()
