from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
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
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)  # Optional, can be empty
    birth_date = Column(Date, nullable=False)
    gender = Column(String, nullable=False)  # Using String instead of Enum for simplicity
    parent_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    color = Column(String, nullable=True)  # Custom color for visualization (hex color code)
    font_size = Column(String, nullable=True)  # e.g. "12", "14" (px)
    font_family = Column(String, nullable=True)  # e.g. "Arial", "Georgia", "serif"

    # Self-referential relationship
    parent = relationship("Person", remote_side=[id], backref="children")
