"""Add is_admin to users and owner_id to persons for multi-user

Revision ID: 008_multi_user
Revises: 007_label_offset
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '008_multi_user'
down_revision = '007_label_offset'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('persons', sa.Column('owner_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_persons_owner_id', 'persons', 'users', ['owner_id'], ['id'])
    op.create_index('ix_persons_owner_id', 'persons', ['owner_id'], unique=False)

    conn = op.get_bind()
    # Assign existing persons to the first user so legacy data is not orphaned
    conn.execute(sa.text("""
        UPDATE persons SET owner_id = (SELECT id FROM users ORDER BY id LIMIT 1)
        WHERE owner_id IS NULL
    """))
    # Mark user named 'admin' as admin so they can create accounts
    conn.execute(sa.text("UPDATE users SET is_admin = true WHERE username = 'admin'"))


def downgrade() -> None:
    op.drop_index('ix_persons_owner_id', table_name='persons')
    op.drop_constraint('fk_persons_owner_id', 'persons', type_='foreignkey')
    op.drop_column('persons', 'owner_id')
    op.drop_column('users', 'is_admin')
