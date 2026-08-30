"""Initial OSI platform schema."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("users", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("username", sa.String(80), nullable=False, unique=True), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("faqs", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("question", sa.Text(), nullable=False), sa.Column("answer", sa.Text(), nullable=False), sa.Column("category", sa.String(100)), sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("quiz_questions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("question", sa.Text(), nullable=False), sa.Column("options", postgresql.JSONB(), nullable=False), sa.Column("correct_answer", sa.Integer(), nullable=False), sa.Column("explanation", sa.Text()), sa.Column("category", sa.String(100)), sa.Column("type", sa.String(40), nullable=False, server_default="multiple-choice"), sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.CheckConstraint("order_index >= 0"))
    op.create_table("drag_drop_questions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("title", sa.Text(), nullable=False), sa.Column("description", sa.Text()), sa.Column("items", postgresql.JSONB(), nullable=False), sa.Column("categories", postgresql.JSONB(), nullable=False), sa.Column("correct_mappings", postgresql.JSONB(), nullable=False), sa.Column("explanation", sa.Text()), sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("quiz_attempts", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")), sa.Column("score", sa.Integer(), nullable=False), sa.Column("total_questions", sa.Integer(), nullable=False), sa.Column("answers", postgresql.JSONB(), nullable=False), sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.CheckConstraint("score >= 0"), sa.CheckConstraint("total_questions > 0"), sa.CheckConstraint("score <= total_questions"))
    op.create_table("feedback", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("experience", sa.Text()), sa.Column("difficulties", sa.Text()), sa.Column("suggestions", sa.Text()), sa.Column("educational_value", sa.Text()), sa.Column("ratings", postgresql.JSONB()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_faqs_order", "faqs", ["order_index"])
    op.create_index("ix_quiz_questions_category_order", "quiz_questions", ["category", "order_index"])
    op.create_index("ix_drag_drop_order", "drag_drop_questions", ["order_index"])
    op.create_index("ix_attempts_completed_at", "quiz_attempts", ["completed_at"])


def downgrade() -> None:
    for name in ["feedback", "quiz_attempts", "drag_drop_questions", "quiz_questions", "faqs", "users"]:
        op.drop_table(name)
