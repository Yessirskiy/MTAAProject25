"""Report user_id is not nullable

Revision ID: f5eff36ec60a
Revises: 4a28e6cc5925
Create Date: 2025-03-31 15:43:05.280525

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f5eff36ec60a"
down_revision: Union[str, None] = "4a28e6cc5925"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
# old_enum = ENUM(
#     "pending", "in_progress", "fixed", name="reportstatus", create_type=False
# ) did not work out :( I have edited first migration so that correct report status is retrieved from the very beginning


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("reports", "user_id", existing_type=sa.INTEGER(), nullable=False)
    # op.alter_column("reports", "status", type_=new_enum, existing_type=old_enum)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("reports", "user_id", existing_type=sa.INTEGER(), nullable=True)
    # op.alter_column("reports", "status", type_=old_enum, existing_type=new_enum)
    # ### end Alembic commands ###
