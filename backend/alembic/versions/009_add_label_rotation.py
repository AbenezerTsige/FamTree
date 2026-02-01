"""Add label_rotation column (degrees per person)

Revision ID: 009_label_rotation
Revises: 008_multi_user
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '009_label_rotation'
down_revision = '008_multi_user'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('persons', sa.Column('label_rotation', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('persons', 'label_rotation')
