from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.content import FAQ, DragDropQuestion, QuizQuestion
from app.models.user import User

FAQS = [
    (
        "What is the OSI model?",
        "A seven-layer conceptual model for network communication.",
        "general",
    ),
    (
        "What is encapsulation?",
        "Adding layer-specific information as data moves from Layer 7 to Layer 1.",
        "technical",
    ),
    (
        "What is de-encapsulation?",
        "Removing that information as data moves from Layer 1 back to Layer 7.",
        "technical",
    ),
]
QUESTIONS = [
    (
        "Which layer routes packets?",
        ["Physical", "Data Link", "Network", "Transport"],
        2,
        "The Network layer routes packets.",
    ),
    (
        "Which layer provides end-to-end delivery?",
        ["Session", "Transport", "Network", "Physical"],
        1,
        "Transport provides end-to-end delivery.",
    ),
    (
        "Which layer handles encryption and formatting?",
        ["Presentation", "Application", "Network", "Data Link"],
        0,
        "Presentation handles translation and encryption.",
    ),
    (
        "What is the PDU at the Data Link layer?",
        ["Packet", "Frame", "Segment", "Bits"],
        1,
        "Layer 2 uses frames.",
    ),
    (
        "What is the PDU at the Physical layer?",
        ["Data", "Frame", "Bits", "Packet"],
        2,
        "Layer 1 transmits bits.",
    ),
    (
        "Which layer uses port numbers?",
        ["Network", "Transport", "Session", "Application"],
        1,
        "Transport uses ports.",
    ),
    (
        "Which protocol is an Application-layer protocol?",
        ["HTTP", "IP", "TCP", "Ethernet"],
        0,
        "HTTP is an Application protocol.",
    ),
    (
        "Which protocol provides reliable ordered delivery?",
        ["UDP", "IP", "TCP", "ARP"],
        2,
        "TCP provides reliable ordered delivery.",
    ),
    (
        "Which device primarily forwards using IP addresses?",
        ["Switch", "Router", "Hub", "Repeater"],
        1,
        "Routers forward between networks.",
    ),
    (
        "Which device primarily forwards frames using MAC addresses?",
        ["Router", "Switch", "Firewall", "Modem"],
        1,
        "Switches forward Data Link frames.",
    ),
    (
        "What does encapsulation do?",
        ["Removes all headers", "Adds layer information", "Encrypts only", "Captures packets"],
        1,
        "Each layer adds its information while data moves down.",
    ),
    (
        "What is de-encapsulation?",
        ["Adding bits", "Removing headers upward", "Routing packets", "Formatting text"],
        1,
        "The receiver removes information layer by layer.",
    ),
    (
        "Which layer manages dialogs and sessions?",
        ["Session", "Presentation", "Transport", "Data Link"],
        0,
        "Layer 5 manages sessions.",
    ),
    (
        "Which layer translates character formats?",
        ["Application", "Presentation", "Session", "Physical"],
        1,
        "Presentation translates and formats data.",
    ),
    (
        "Which layer detects frame errors with CRC?",
        ["Network", "Transport", "Data Link", "Application"],
        2,
        "Data Link performs frame error detection.",
    ),
    (
        "Which protocol maps IP addresses to MAC addresses?",
        ["DNS", "ARP", "HTTP", "FTP"],
        1,
        "ARP performs address resolution.",
    ),
    (
        "Which layer provides user-facing network services?",
        ["Application", "Session", "Network", "Physical"],
        0,
        "Application is closest to user applications.",
    ),
    (
        "Which layer is responsible for logical addressing?",
        ["Data Link", "Network", "Transport", "Presentation"],
        1,
        "Network provides logical IP addressing.",
    ),
    (
        "Which is a Physical-layer medium?",
        ["HTTP", "TCP", "Fiber optic", "DNS"],
        2,
        "Fiber carries physical signals.",
    ),
    (
        "What does the Data Link layer add besides a header?",
        ["A trailer", "A route", "A port", "A session"],
        0,
        "Frames can include a trailer such as an FCS/CRC.",
    ),
]


def seed() -> None:
    settings = get_settings()
    with SessionLocal() as db:
        if settings.admin_password and not db.scalar(
            select(User).where(User.username == settings.admin_username)
        ):
            db.add(
                User(
                    username=settings.admin_username,
                    password_hash=hash_password(settings.admin_password),
                )
            )
        if not db.scalar(select(FAQ).limit(1)):
            db.add_all(
                [
                    FAQ(question=q, answer=a, category=c, order_index=i)
                    for i, (q, a, c) in enumerate(FAQS)
                ]
            )
        if not db.scalar(select(QuizQuestion).limit(1)):
            db.add_all(
                [
                    QuizQuestion(
                        question=q, options=o, correct_answer=ca, explanation=e, order_index=i
                    )
                    for i, (q, o, ca, e) in enumerate(QUESTIONS)
                ]
            )
        if not db.scalar(select(DragDropQuestion).limit(1)):
            db.add(
                DragDropQuestion(
                    title="Match protocol to layer",
                    description="Place each item in its layer.",
                    items=["HTTP", "TCP", "IP", "Ethernet"],
                    categories=["Application", "Transport", "Network", "Data Link"],
                    correct_mappings={
                        "HTTP": "Application",
                        "TCP": "Transport",
                        "IP": "Network",
                        "Ethernet": "Data Link",
                    },
                )
            )
        db.commit()


if __name__ == "__main__":
    seed()
