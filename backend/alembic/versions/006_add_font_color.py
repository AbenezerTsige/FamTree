"""Add font_color column for label text color

Revision ID: 006_font_color
Revises: 005_users
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '006_font_color'
down_revision = '005_users'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('persons', sa.Column('font_color', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('persons', 'font_color')
