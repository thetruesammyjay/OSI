from fastapi import APIRouter, HTTPException

from app.schemas.pdu import DecapsulateIn, PayloadIn, PDUResponse
from app.services.pdu import decapsulate, encapsulate, layer_info, simulate

router = APIRouter(prefix="/pdu", tags=["pdu"])


@router.post("/encapsulate", response_model=PDUResponse)
def encapsulate_route(payload: PayloadIn) -> PDUResponse:
    return PDUResponse(
        message="PDU encapsulation completed successfully", data=encapsulate(payload.payload)
    )


@router.post("/decapsulate", response_model=PDUResponse)
def decapsulate_route(payload: DecapsulateIn) -> PDUResponse:
    if not payload.encapsulatedData.get("layers"):
        raise HTTPException(400, "Invalid encapsulated data structure")
    return PDUResponse(
        message="PDU decapsulation completed successfully",
        data=decapsulate(payload.encapsulatedData),
    )


@router.post("/simulate", response_model=PDUResponse)
def simulate_route(payload: PayloadIn) -> PDUResponse:
    return PDUResponse(
        message="Full OSI communication simulation completed", data=simulate(payload.payload)
    )


@router.get("/layers")
def layers() -> dict[str, object]:
    return {
        "success": True,
        "message": "All OSI layers retrieved successfully",
        "data": [layer_info(i) for i in range(1, 8)],
    }


@router.get("/layers/{number}")
def layer(number: int) -> dict[str, object]:
    if number < 1 or number > 7:
        raise HTTPException(400, "Invalid layer number. Must be between 1 and 7.")
    return {"success": True, "data": layer_info(number)}
