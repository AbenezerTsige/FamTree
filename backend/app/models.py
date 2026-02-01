from sqlalchemy import Column, Integer, String, Date, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # User who owns this family tree
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)  # Optional, can be empty
    birth_date = Column(Date, nullable=False)
    gender = Column(String, nullable=False)  # Using String instead of Enum for simplicity
    parent_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    color = Column(String, nullable=True)  # Custom color for visualization (hex color code)
    font_size = Column(String, nullable=True)  # e.g. "12", "14" (px)
    font_family = Column(String, nullable=True)  # e.g. "Arial", "Georgia", "serif"
    font_color = Column(String, nullable=True)  # Text/label color (hex, e.g. "#ffffff")
    label_offset_x = Column(Float, nullable=True)  # Label position offset in px: negative=left, positive=right
    label_offset_y = Column(Float, nullable=True)  # Label position offset in px: negative=up, positive=down

    # Self-referential relationship
    parent = relationship("Person", remote_side=[id], backref="children")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, nullable=False, default=False)  # Admin can create users and manage accounts
