from database import SessionLocal
from models.product import Product

def main():
    with SessionLocal() as session:
        product = session.query(Product).filter(Product.name.like('%Puma%M號%')).first()
        if product:
            print(f"Product found! ID: {product.id}")
            for column in product.__table__.columns:
                print(f"{column.name}: {getattr(product, column.name)}")
        else:
            print("Product not found")

main()