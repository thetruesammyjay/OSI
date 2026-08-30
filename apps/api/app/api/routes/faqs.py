from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import current_admin, require_csrf
from app.db.session import get_db
from app.models.content import FAQ
from app.models.user import User
from app.schemas.common import FAQCreate, FAQOut

router = APIRouter(prefix="/faq", tags=["faq"])


@router.get("", response_model=list[FAQOut])
def list_faqs(db: Session = Depends(get_db)) -> list[FAQ]:
    return list(db.scalars(select(FAQ).order_by(FAQ.order_index, FAQ.created_at)))


@router.post("", response_model=FAQOut, dependencies=[Depends(require_csrf)])
def create_faq(
    payload: FAQCreate, db: Session = Depends(get_db), _: User = Depends(current_admin)
) -> FAQ:
    item = FAQ(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=FAQOut, dependencies=[Depends(require_csrf)])
def update_faq(
    item_id: UUID,
    payload: FAQCreate,
    db: Session = Depends(get_db),
    _: User = Depends(current_admin),
) -> FAQ:
    item = db.get(FAQ, item_id)
    if not item:
        raise HTTPException(404, "FAQ not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", dependencies=[Depends(require_csrf)])
def delete_faq(
    item_id: UUID, db: Session = Depends(get_db), _: User = Depends(current_admin)
) -> dict[str, bool]:
    item = db.get(FAQ, item_id)
    if not item:
        raise HTTPException(404, "FAQ not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}
