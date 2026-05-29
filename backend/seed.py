import json
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

def seed_db():
    # Create tables if not exist
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Path to menu.json
    menu_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "data", "menu.json"))
    
    if not os.path.exists(menu_path):
        print(f"Menu file not found at {menu_path}")
        return

    with open(menu_path, "r") as f:
        data = json.load(f)
    
    # Combine today and tomorrow for demonstration
    all_items = data.get("today", []) + data.get("tomorrow", [])
    
    for item in all_items:
        # Check if exists
        exists = db.query(models.Meal).filter(models.Meal.name == item["name"]).first()
        if not exists:
            new_meal = models.Meal(
                name=item["name"],
                price=float(item["price"]),
                category="Main", # Default category
                is_veg=item["veg"],
                image_url=item.get("image", "")
            )
            db.add(new_meal)
    
    # Create default Route & Hub
    route_name = "Western Line"
    route = db.query(models.Route).filter(models.Route.name == route_name).first()
    if not route:
        route = models.Route(name=route_name, code="W-LOG")
        db.add(route)
        db.flush()
    
    hub_name = "Churchgate Terminal"
    hub = db.query(models.Hub).filter(models.Hub.name == hub_name).first()
    if not hub:
        hub = models.Hub(
            name=hub_name, 
            code="CHG-01", 
            hub_type="SORTING", 
            route_id=route.id
        )
        db.add(hub)

    # Create a default admin & customer
    from app.auth import get_password_hash
    
    users_to_seed = [
        {"email": "admin@bytemeals.com", "pass": "admin123", "name": "System Admin", "role": models.UserRole.ADMIN},
        {"email": "customer@bytemeals.com", "pass": "customer123", "name": "Test Customer", "role": models.UserRole.CUSTOMER},
        {"email": "agent@bytemeals.com", "pass": "agent123", "name": "Test Dabbawala", "role": models.UserRole.AGENT},
    ]

    for u in users_to_seed:
        exists = db.query(models.User).filter(models.User.email == u["email"]).first()
        if not exists:
            new_user = models.User(
                email=u["email"],
                hashed_password=get_password_hash(u["pass"]),
                full_name=u["name"],
                role=u["role"]
            )
            db.add(new_user)
            print(f"Created {u['role']}: {u['email']} / {u['pass']}")

    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
