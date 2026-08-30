from typing import Any

LAYER_NAMES = {
    1: "Physical",
    2: "Data Link",
    3: "Network",
    4: "Transport",
    5: "Session",
    6: "Presentation",
    7: "Application",
}
DATA_UNITS = {1: "Bits", 2: "Frame", 3: "Packet", 4: "Segment", 5: "Data", 6: "Data", 7: "Data"}
FUNCTIONS = {
    1: ["Physical transmission of signals", "Bit encoding and timing"],
    2: ["Frame formatting", "MAC addressing", "Error detection"],
    3: ["Logical addressing", "Routing and packet forwarding", "TTL management"],
    4: ["Port-based communication", "Reliable or unreliable delivery", "Flow control"],
    5: ["Session establishment and termination", "Dialog control", "Synchronization"],
    6: ["Encryption and decryption", "Compression", "Character/data-format translation"],
    7: ["User-facing application services", "Resource sharing", "Network service access"],
}


def layer_info(number: int) -> dict[str, Any]:
    if number not in LAYER_NAMES:
        raise ValueError("layer must be between 1 and 7")
    protocols = {
        1: ["Ethernet", "Wi-Fi (802.11)", "Fiber Optic"],
        2: ["Ethernet", "Wi-Fi (802.11)", "PPP"],
        3: ["IP (IPv4/IPv6)", "ICMP", "ARP"],
        4: ["TCP", "UDP", "SCTP"],
        5: ["NetBIOS", "RPC"],
        6: ["TLS/SSL", "JPEG/MPEG", "ASCII/UTF-8"],
        7: ["HTTP/HTTPS", "SMTP/IMAP/POP3", "DNS", "FTP"],
    }[number]
    hardware = {
        1: ["NIC", "Cables", "Repeaters", "Hubs"],
        2: ["NIC", "Switches", "Bridges"],
        3: ["Routers", "Layer 3 Switches", "Firewalls"],
    }.get(number, [])
    return {
        "number": number,
        "name": LAYER_NAMES[number],
        "dataUnit": DATA_UNITS[number],
        "description": f"Educational overview of the {LAYER_NAMES[number]} layer.",
        "protocols": [{"name": p} for p in protocols],
        "hardware": hardware,
        "functions": FUNCTIONS[number],
    }


def encapsulate(payload: str) -> dict[str, Any]:
    layers = []
    nested: Any = payload
    for number in range(7, 0, -1):
        headers = {
            "layer": LAYER_NAMES[number],
            "protocol": layer_info(number)["protocols"][0]["name"],
        }
        entry = {
            "layerNumber": number,
            "layerName": LAYER_NAMES[number],
            "dataUnit": DATA_UNITS[number],
            "headers": headers,
            "payload": nested,
            "headerSize": 0 if number == 1 else 24,
            "description": f"Illustrative {LAYER_NAMES[number]} layer data",
        }
        if number == 2:
            entry["trailer"] = {"crc": "simulated"}
        layers.append(entry)
        nested = entry
    return {
        "encapsulated": True,
        "direction": "encapsulation",
        "layers": layers,
        "totalSize": len(payload),
        "summary": {
            "originalDataSize": len(payload),
            "totalOverhead": sum(item["headerSize"] for item in layers),
        },
    }


def decapsulate(data: dict[str, Any]) -> dict[str, Any]:
    layers = data.get("layers", [])
    recovered = layers[-1].get("payload") if layers else ""
    while isinstance(recovered, dict):
        recovered = recovered.get("payload", "")
    return {
        "encapsulated": False,
        "direction": "decapsulation",
        "layers": [{**layer, "removed": True} for layer in reversed(layers)],
        "recoveredData": recovered,
        "summary": {"successful": True, "recoveredDataSize": len(str(recovered))},
    }


def simulate(payload: str) -> dict[str, Any]:
    enc = encapsulate(payload)
    return {
        "scenario": "Full OSI Communication",
        "sender": {"ip": "192.168.0.50", "mac": "AA:BB:CC:DD:EE:01", "port": 52341},
        "receiver": {"ip": "192.168.0.1", "mac": "FF:FF:FF:FF:FF:FF", "port": 443},
        "encapsulation": enc,
        "transmission": {"totalSize": enc["totalSize"], "speed": "1 Gbps", "transmissionTime": 0},
        "decapsulation": decapsulate(enc),
    }
