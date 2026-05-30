import os
from database import engine, Base
from models.channel import Channel

def create_table():
    print("Creating channels table...")
    Base.metadata.create_all(bind=engine)
    print("channels table created successfully.")

if __name__ == "__main__":
    create_table()
