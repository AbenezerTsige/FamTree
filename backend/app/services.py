from sqlalchemy.orm import Session
from typing import Optional, List
from app import models, schemas
from datetime import datetime
import math

class FamilyTreeService:
    def __init__(self, db: Session, owner_id: Optional[int] = None):
        self.db = db
        self.owner_id = owner_id

    def _owner_filter(self):
        """Query filter for current owner's persons."""
        if self.owner_id is None:
            return models.Person.owner_id.is_(None)  # Legacy: no owner
        return models.Person.owner_id == self.owner_id

    def find_root(self) -> Optional[models.Person]:
        """Find the oldest person (root of the tree) for the current owner."""
        base = self.db.query(models.Person).filter(self._owner_filter())
        root = base.filter(models.Person.parent_id == None).first()
        if not root:
            root = base.order_by(models.Person.birth_date.asc()).first()
        return root

    def get_children(self, person_id: int) -> List[models.Person]:
        """Get all children of a person (same owner)."""
        return (
            self.db.query(models.Person)
            .filter(self._owner_filter(), models.Person.parent_id == person_id)
            .order_by(models.Person.birth_date.asc())
            .all()
        )

    def build_tree(self, person: Optional[models.Person] = None, generation: int = 0) -> Optional[schemas.PersonTree]:
        """Build the family tree structure with positioning data for fan chart."""
        if person is None:
            person = self.find_root()
            if not person:
                return None
        
        # Get children
        children = self.get_children(person.id)
        
        # Build tree node
        tree_node = schemas.PersonTree(
            id=person.id,
            first_name=person.first_name,
            last_name=person.last_name,
            birth_date=person.birth_date,
            gender=person.gender,
            parent_id=person.parent_id,
            color=person.color,
            font_size=getattr(person, 'font_size', None),
            font_family=getattr(person, 'font_family', None),
            font_color=getattr(person, 'font_color', None),
            label_offset_x=getattr(person, 'label_offset_x', None),
            label_offset_y=getattr(person, 'label_offset_y', None),
            generation=generation,
            children=[]
        )
        
        # Recursively build children
        for child in children:
            child_tree = self.build_tree(child, generation + 1)
            if child_tree:
                tree_node.children.append(child_tree)
        
        return tree_node

    def calculate_positions(self, tree: schemas.PersonTree, center_x: float = 0, center_y: float = 0) -> schemas.PersonTree:
        """Calculate radial positions for fan chart visualization"""
        # Constants for visualization
        BASE_RADIUS = 50  # Center node radius
        RADIUS_INCREMENT = 100  # Distance between generations
        BASE_ANGLE = 0  # Starting angle
        
        # Set center position for root
        if tree.generation == 0:
            tree.radius = 0
            tree.angle = 0
            tree.x = center_x
            tree.y = center_y
        else:
            # This will be calculated by parent's positioning logic
            pass
        
        if not tree.children:
            return tree
        
        # Calculate positions for children
        num_children = len(tree.children)
        if num_children == 0:
            return tree
        
        # Calculate angle span for children
        # Each child gets equal angular space
        total_angle_span = 2 * math.pi if num_children > 1 else 0
        angle_per_child = total_angle_span / num_children if num_children > 1 else 0
        
        # Calculate radius for this generation
        child_radius = BASE_RADIUS + (tree.generation + 1) * RADIUS_INCREMENT
        
        for i, child in enumerate(tree.children):
            # Calculate angle for this child
            if num_children == 1:
                child_angle = tree.angle  # Place directly above parent
            else:
                # Distribute children evenly in a fan
                start_angle = tree.angle - (total_angle_span / 2)
                child_angle = start_angle + (i + 0.5) * angle_per_child
            
            # Calculate position
            child.radius = child_radius
            child.angle = child_angle
            child.x = center_x + child_radius * math.cos(child_angle)
            child.y = center_y + child_radius * math.sin(child_angle)
            
            # Recursively calculate positions for grandchildren
            self.calculate_positions(child, center_x, center_y)
        
        return tree
