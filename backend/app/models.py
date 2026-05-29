import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Integer, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    ADMIN = "admin"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class AssignmentStatus(str, enum.Enum):
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    
    orders = relationship("Order", back_populates="user")
    addresses = relationship("UserAddress", back_populates="user")
    assignments = relationship("DeliveryAssignment", back_populates="agent")

class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    label = Column(String) # e.g. "Work", "Home"
    building_name = Column(String, nullable=False)
    floor = Column(String)
    apartment_no = Column(String)
    landmark = Column(String)
    location_geo = Column(JSON) # {lat, lng} for map integration

    user = relationship("User", back_populates="addresses")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    category = Column(String)
    is_veg = Column(Boolean, default=True)
    image_url = Column(String)
    is_available = Column(Boolean, default=True)
    # Store embeddings as JSON (compatible with SQLite/PG) or Binary
    embedding_vector = Column(JSON, nullable=True) 

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    total_price = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    delivery_address = Column(String, nullable=False) # Fallback / Snapshot
    address_id = Column(String, ForeignKey("user_addresses.id"), nullable=True)
    # The generated "Digital Dabba Code" for visual tracking
    dabba_code = Column(String, index=True) 
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    tracking = relationship("LogisticsTracking", back_populates="order")
    assignments = relationship("DeliveryAssignment", back_populates="order")
    status_history = relationship("OrderStatusHistory", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    meal_id = Column(String, ForeignKey("meals.id"))
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Float, nullable=False) # Snapshot for analytics

    order = relationship("Order", back_populates="items")
    meal = relationship("Meal")

class Route(Base):
    """A series of Hubs defining a delivery path (e.g. Harbour Line)"""
    __tablename__ = "routes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False) # e.g. "H-1"
    target_delivery_time = Column(String, default="13:00") # Baseline for on-time metrics

    hubs = relationship("Hub", back_populates="route")

class Hub(Base):
    __tablename__ = "hubs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    route_id = Column(String, ForeignKey("routes.id"), nullable=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    hub_type = Column(String) # COLLECTION, SORTING, DELIVERY
    location_geo = Column(JSON) # {lat, lng}

    route = relationship("Route", back_populates="hubs")

class DeliveryAssignment(Base):
    """Tracks agent assignments and reassignments"""
    __tablename__ = "delivery_assignments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    agent_id = Column(String, ForeignKey("users.id"))
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.ASSIGNED)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    order = relationship("Order", back_populates="assignments")
    agent = relationship("User", back_populates="assignments")

class LogisticsTracking(Base):
    """Full audit history of hub-and-spoke movement"""
    __tablename__ = "logistics_tracking"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    hub_id = Column(String, ForeignKey("hubs.id"))
    status = Column(String) # IN, OUT
    scanned_at = Column(DateTime, default=datetime.utcnow)
    agent_id = Column(String, ForeignKey("users.id"))

    order = relationship("Order", back_populates="tracking")
    hub = relationship("Hub")

class OrderStatusHistory(Base):
    """Event ledger for analytics dashboards"""
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    old_status = Column(Enum(OrderStatus), nullable=True)
    new_status = Column(Enum(OrderStatus))
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by = Column(String, ForeignKey("users.id"))

    order = relationship("Order", back_populates="status_history")
