"""Add font_size and font_family columns

Revision ID: 004_font
Revises: 003_make_last_name_nullable
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '004_font'
down_revision = '56f9dac12252'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('persons', sa.Column('font_size', sa.String(), nullable=True))
    op.add_column('persons', sa.Column('font_family', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('persons', 'font_family')
    op.drop_column('persons', 'font_size')
