from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from .models import UserRole, OrderStatus, AssignmentStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    
    class Config:
        from_attributes = True

class UserAddressBase(BaseModel):
    label: str
    building_name: str
    floor: Optional[str] = None
    apartment_no: Optional[str] = None
    landmark: Optional[str] = None
    location_geo: Optional[dict] = None

class UserAddressCreate(UserAddressBase):
    pass

class UserAddressResponse(UserAddressBase):
    id: str
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Meal Schemas
class MealBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    is_veg: bool = True
    image_url: Optional[str] = None
    is_available: bool = True
    embedding_vector: Optional[List[float]] = None

class MealCreate(MealBase):
    pass

class MealResponse(MealBase):
    id: str

    class Config:
        from_attributes = True

# Logistics & Route Schemas
class RouteBase(BaseModel):
    name: str
    code: str

class RouteResponse(RouteBase):
    id: str
    class Config:
        from_attributes = True

class LogisticsTrackingResponse(BaseModel):
    hub_id: str
    status: str
    scanned_at: datetime
    
    class Config:
        from_attributes = True

class DeliveryAssignmentResponse(BaseModel):
    agent_id: str
    status: AssignmentStatus
    assigned_at: datetime
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    meal_id: str
    quantity: int

class OrderItemResponse(OrderItemBase):
    price_at_time: float
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    delivery_address: str

class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_price: float
    tax: float
    status: OrderStatus
    dabba_code: Optional[str] = None
    address: Optional[UserAddressResponse] = None
    created_at: datetime
    items: List[OrderItemResponse]
    tracking: List[LogisticsTrackingResponse] = []
    assignments: List[DeliveryAssignmentResponse] = []

    class Config:
        from_attributes = True

class StatusHistoryResponse(BaseModel):
    old_status: Optional[OrderStatus]
    new_status: OrderStatus
    changed_at: datetime
    
    class Config:
        from_attributes = True
