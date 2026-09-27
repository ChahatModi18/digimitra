"""User ORM Model (C2 Entity 2.2)."""

from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import BigInteger, Boolean, Enum, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.audit_log import AuditLog
    from app.models.progress_log import ProgressLog
    from app.models.rule import Rule
    from app.models.research import ResearchEvaluationRecord


class User(Base, TimestampMixin):
    """User account entity for authentication and RBAC."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(15), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum("business_owner", "consultant", "admin", "researcher", name="user_role_enum"),
        default="business_owner",
        nullable=False,
    )
    preferred_language: Mapped[str] = mapped_column(
        Enum("en", "hi", name="user_preferred_language_enum"),
        default="en",
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __init__(self, **kwargs):
        if "hashed_password" in kwargs and "password_hash" not in kwargs:
            kwargs["password_hash"] = kwargs.pop("hashed_password")
        if "phone_number" in kwargs and "phone" not in kwargs:
            kwargs["phone"] = kwargs.pop("phone_number")
        kwargs.pop("is_verified", None)
        super().__init__(**kwargs)

    # Aliases for backward compatibility with Phase 1
    @hybrid_property
    def hashed_password(self) -> str:
        return self.password_hash

    @hashed_password.setter
    def hashed_password(self, value: str) -> None:
        self.password_hash = value

    @hashed_password.expression
    def hashed_password(cls):
        return cls.password_hash

    @hybrid_property
    def phone_number(self) -> Optional[str]:
        return self.phone

    @phone_number.setter
    def phone_number(self, value: Optional[str]) -> None:
        self.phone = value

    @phone_number.expression
    def phone_number(cls):
        return cls.phone

    @hybrid_property
    def is_verified(self) -> bool:
        return True

    @is_verified.setter
    def is_verified(self, value: bool) -> None:
        pass

    # Relationships
    businesses: Mapped[List["Business"]] = relationship(
        "Business", back_populates="owner", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="actor")
    progress_logs: Mapped[List["ProgressLog"]] = relationship("ProgressLog", back_populates="logged_by_user")
    rules_created: Mapped[List["Rule"]] = relationship("Rule", back_populates="creator")
    research_corrections: Mapped[List["ResearchEvaluationRecord"]] = relationship(
        "ResearchEvaluationRecord", back_populates="corrector"
    )
