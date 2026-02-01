"""Add label_offset_x and label_offset_y columns

Revision ID: 007_label_offset
Revises: 006_font_color
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '007_label_offset'
down_revision = '006_font_color'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('persons', sa.Column('label_offset_x', sa.Float(), nullable=True))
    op.add_column('persons', sa.Column('label_offset_y', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('persons', 'label_offset_y')
    op.drop_column('persons', 'label_offset_x')
