"""Make last_name nullable

Revision ID: 003_make_last_name_nullable
Revises: 002_add_color
Create Date: 2024-01-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_make_last_name_nullable'
down_revision = '002_add_color'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('persons', 'last_name',
                    existing_type=sa.String(),
                    nullable=True)


def downgrade() -> None:
    op.alter_column('persons', 'last_name',
                    existing_type=sa.String(),
                    nullable=False)
