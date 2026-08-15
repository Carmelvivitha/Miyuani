from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"
    API_USER = "api_user"


class PestSeverity(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class SatelliteStatus(str, enum.Enum):
    ACTIVE = "Active"
    COMPLETED = "Completed"
    SCHEDULED = "Scheduled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user")


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    settings = Column(JSON, default={})

    # Relationships
    users = relationship("User", back_populates="organization")
    satellite_passes = relationship("SatellitePass", back_populates="organization")
    pest_alerts = relationship("PestAlert", back_populates="organization")
    edge_nodes = relationship("EdgeNode", back_populates="organization")


class SatellitePass(Base):
    __tablename__ = "satellite_passes"

    id = Column(Integer, primary_key=True, index=True)
    satellite_name = Column(String(255), nullable=False)
    pass_time = Column(DateTime, nullable=False)
    coverage_area = Column(JSON, nullable=False)  # GeoJSON polygon
    status = Column(SQLEnum(SatelliteStatus), default=SatelliteStatus.SCHEDULED, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="satellite_passes")


class PestAlert(Base):
    __tablename__ = "pest_alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(SQLEnum(PestSeverity), default=PestSeverity.MEDIUM, nullable=False)
    pest_type = Column(String(255), nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    affected_area_ha = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="pest_alerts")


class EdgeNode(Base):
    __tablename__ = "edge_nodes"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(String(50), default="Online", nullable=False)
    power_consumption_w = Column(Float, nullable=False)
    lora_range_km = Column(Float, nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    last_ping = Column(DateTime, default=datetime.utcnow, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="edge_nodes")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # login, create, update, delete, etc.
    resource_type = Column(String(100), nullable=True)  # user, alert, satellite, etc.
    resource_id = Column(Integer, nullable=True)
    changes = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    key_hash = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permissions = Column(JSON, default=[])  # List of allowed endpoints/actions
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="api_keys")


class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    cnn_lstm_precision = Column(Float, nullable=False)
    cnn_lstm_f1 = Column(Float, nullable=False)
    stari_rmse = Column(Float, nullable=False)
    last_training = Column(DateTime, default=datetime.utcnow, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
