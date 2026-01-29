"""add_cascade_delete_to_parent_id

Revision ID: 56f9dac12252
Revises: 003_make_last_name_nullable
Create Date: 2026-01-28 16:54:44.889573

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '56f9dac12252'
down_revision = '003_make_last_name_nullable'
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
