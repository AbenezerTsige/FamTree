"""Add label_radius_offset column (px: inward/outward on arc)

Revision ID: 010_label_radius_offset
Revises: 009_label_rotation
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '010_label_radius_offset'
down_revision = '009_label_rotation'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('persons', sa.Column('label_radius_offset', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('persons', 'label_radius_offset')
