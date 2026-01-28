"""Add color column

Revision ID: 002_add_color
Revises: 001_initial
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_color'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('persons', sa.Column('color', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('persons', 'color')
