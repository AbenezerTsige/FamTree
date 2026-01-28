from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class PersonBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    gender: str
    parent_id: Optional[int] = None
    color: Optional[str] = None  # Hex color code (e.g., "#4a90e2")

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
