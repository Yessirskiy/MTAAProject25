"""Recreate missing migration

Revision ID: 56da4fac20a9
Revises: f5eff36ec60a
Create Date: 2025-04-06 18:41:37.349294

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '56da4fac20a9'
down_revision: Union[str, None] = 'f5eff36ec60a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
