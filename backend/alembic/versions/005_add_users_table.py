"""Add users table for auth

Revision ID: 005_users
Revises: 004_font
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '005_users'
down_revision = '004_font'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
    )
    op.create_index('ix_users_username', 'users', ['username'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_users_username', table_name='users')
    op.drop_table('users')
