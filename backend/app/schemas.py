from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class PersonBase(BaseModel):
    first_name: str
    last_name: Optional[str] = ""  # Optional, defaults to empty string
    birth_date: date
    gender: str
    parent_id: Optional[int] = None
    color: Optional[str] = None  # Hex color code (e.g., "#4a90e2")
    font_size: Optional[str] = None  # e.g. "12", "14" (px)
    font_family: Optional[str] = None  # e.g. "Arial", "Georgia"
    font_color: Optional[str] = None  # Text/label color (hex, e.g. "#ffffff")

class PersonCreate(PersonBase):
    pass

class PersonResponse(PersonBase):
    id: int

    class Config:
        from_attributes = True

class PersonTree(PersonResponse):
    children: List['PersonTree'] = []
    generation: int = 0
    angle: float = 0.0
    radius: float = 0.0
    x: float = 0.0
    y: float = 0.0

    class Config:
        from_attributes = True

PersonTree.model_rebuild()


# Auth schemas
class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
