"""Business ORM Model (C2 Entity 2.4)."""

from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import BigInteger, Boolean, Enum, ForeignKey, Integer, SmallInteger, String, Text
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.business_category import BusinessCategory
    from app.models.assessment import Assessment
    from app.models.recommendation import BusinessRecommendation
    from app.models.roadmap import Roadmap
    from app.models.progress_log import ProgressLog


class Business(Base, TimestampMixin):
    """Business profile registered by an MSME owner or consultant."""

    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("business_categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    business_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    registration_number: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    business_size: Mapped[str] = mapped_column(
        Enum("micro", "small", "medium", name="business_size_enum"),
        nullable=False,
    )
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    city_town: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    years_in_operation: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)
    employee_count: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)
    
    # Extended MSME Operational & Contact Fields
    owner_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    business_type: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    sub_category: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    year_established: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    area_locality: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    business_address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    primary_language_code: Mapped[Optional[str]] = mapped_column(String(10), default="en", nullable=True)
    additional_language: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    business_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    target_customers: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    monthly_revenue: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    digitalization_goal: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __init__(self, **kwargs):
        # Support legacy / shorthand initialization parameters
        if "owner_id" in kwargs and "owner_user_id" not in kwargs:
            kwargs["owner_user_id"] = kwargs.pop("owner_id")
        if "name" in kwargs and "business_name" not in kwargs:
            kwargs["business_name"] = kwargs.pop("name")
        if "enterprise_size" in kwargs and "business_size" not in kwargs:
            val = kwargs.pop("enterprise_size")
            kwargs["business_size"] = val.lower() if isinstance(val, str) else "micro"
        if "city" in kwargs:
            city_val = kwargs.pop("city")
            if "city_town" not in kwargs:
                kwargs["city_town"] = city_val
            if "district" not in kwargs:
                kwargs["district"] = city_val
        if "category_id" not in kwargs:
            kwargs["category_id"] = 1
        if "primary_language" in kwargs and "primary_language_code" not in kwargs:
            kwargs["primary_language_code"] = kwargs.pop("primary_language")
        if "description" in kwargs and "description_text" not in kwargs:
            kwargs["description_text"] = kwargs.pop("description")
        # Strip legacy fields not in table schema
        kwargs.pop("sector", None)
        super().__init__(**kwargs)

    # Backward compatibility hybrid properties for Phase 1 code & queries
    @hybrid_property
    def owner_id(self) -> int:
        return self.owner_user_id

    @owner_id.setter
    def owner_id(self, value: int) -> None:
        self.owner_user_id = value

    @owner_id.expression
    def owner_id(cls):
        return cls.owner_user_id

    @hybrid_property
    def name(self) -> str:
        return self.business_name

    @name.setter
    def name(self, value: str) -> None:
        self.business_name = value

    @name.expression
    def name(cls):
        return cls.business_name

    @hybrid_property
    def enterprise_size(self) -> str:
        return self.business_size.capitalize() if self.business_size else "Micro"

    @enterprise_size.setter
    def enterprise_size(self, value: str) -> None:
        self.business_size = value.lower() if value else "micro"

    @hybrid_property
    def city(self) -> str:
        return self.city_town or self.district

    @city.setter
    def city(self, value: str) -> None:
        self.city_town = value
        if not self.district:
            self.district = value

    @hybrid_property
    def sector(self) -> str:
        cat = self.__dict__.get("category")
        if cat is not None and hasattr(cat, "name_en"):
            return cat.name_en
        return "General"

    @sector.setter
    def sector(self, value: str) -> None:
        pass

    @hybrid_property
    def primary_language(self) -> str:
        return self.primary_language_code or "en"

    @primary_language.setter
    def primary_language(self, value: str) -> None:
        self.primary_language_code = value

    @hybrid_property
    def description(self) -> Optional[str]:
        return self.description_text

    @description.setter
    def description(self, value: Optional[str]) -> None:
        self.description_text = value

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="businesses")
    category: Mapped["BusinessCategory"] = relationship("BusinessCategory", back_populates="businesses")
    assessments: Mapped[List["Assessment"]] = relationship(
        "Assessment", back_populates="business", cascade="all, delete-orphan"
    )
    business_recommendations: Mapped[List["BusinessRecommendation"]] = relationship(
        "BusinessRecommendation", back_populates="business"
    )
    roadmaps: Mapped[List["Roadmap"]] = relationship(
        "Roadmap", back_populates="business", cascade="all, delete-orphan"
    )
    progress_logs: Mapped[List["ProgressLog"]] = relationship("ProgressLog", back_populates="business")
