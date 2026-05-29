from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, auth, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="ByteMeals API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
def login(form_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/meals", response_model=List[schemas.MealResponse])
def get_meals(db: Session = Depends(database.get_db)):
    return db.query(models.Meal).all()

@app.post("/meals", response_model=schemas.MealResponse)
def create_meal(meal: schemas.MealCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.check_admin_role)):
    db_meal = models.Meal(**meal.model_dump())
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Order Endpoints ---

@app.post("/orders", response_model=schemas.OrderResponse)
def place_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    total = 0.0
    order_items = []
    
    for item in order.items:
        meal = db.query(models.Meal).filter(models.Meal.id == item.meal_id).first()
        if not meal:
            raise HTTPException(status_code=404, detail=f"Meal {item.meal_id} not found")
        
        price_snapshot = meal.price
        total += price_snapshot * item.quantity
        
        order_items.append(models.OrderItem(
            meal_id=item.meal_id,
            quantity=item.quantity,
            price_at_time=price_snapshot
        ))
    
    tax = round(total * 0.05, 2)
    final_total = total + tax
    
    db_order = models.Order(
        user_id=current_user.id,
        total_price=final_total,
        tax=tax,
        delivery_address=order.delivery_address,
        items=order_items
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == models.UserRole.ADMIN:
        return db.query(models.Order).all()
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
