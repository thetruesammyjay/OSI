export type LayerContent = { number: number; name: string; pdu: string; functions: string[]; protocols: string[]; hardware: string[]; description: string };

export const layerContent: LayerContent[] = [
  { number: 7, name: "Application", pdu: "Data", functions: ["User-facing network services", "Resource sharing", "Network service access"], protocols: ["HTTP / HTTPS", "DNS", "SMTP", "FTP"], hardware: ["Gateway", "Proxy"], description: "The layer closest to the learner: it provides network services to applications." },
  { number: 6, name: "Presentation", pdu: "Data", functions: ["Translation and formatting", "Encryption and decryption", "Compression"], protocols: ["TLS / SSL", "JPEG / MPEG", "ASCII / UTF-8"], hardware: ["Gateway", "Encryption appliance"], description: "Makes data understandable between systems by handling representation and protection." },
  { number: 5, name: "Session", pdu: "Data", functions: ["Session establishment", "Dialog control", "Synchronization"], protocols: ["RPC", "NetBIOS", "SIP"], hardware: ["Gateway", "Session border controller"], description: "Coordinates the conversations that applications hold across a network." },
  { number: 4, name: "Transport", pdu: "Segment", functions: ["End-to-end delivery", "Flow control", "Port addressing"], protocols: ["TCP", "UDP", "SCTP"], hardware: ["Load balancer", "Firewall"], description: "Breaks data into segments and manages delivery between application processes." },
  { number: 3, name: "Network", pdu: "Packet", functions: ["Logical addressing", "Routing and forwarding", "TTL management"], protocols: ["IP", "ICMP", "ARP"], hardware: ["Router", "Layer 3 switch", "Firewall"], description: "Chooses a path between networks using logical addresses." },
  { number: 2, name: "Data Link", pdu: "Frame", functions: ["Frame formatting", "MAC addressing", "Error detection"], protocols: ["Ethernet", "Wi-Fi", "PPP"], hardware: ["Switch", "Bridge", "Network interface"], description: "Packages packets for a local link with a header and an error-checking trailer." },
  { number: 1, name: "Physical", pdu: "Bits", functions: ["Signal transmission", "Bit encoding", "Timing and media"], protocols: ["Ethernet PHY", "802.11 PHY", "Bluetooth"], hardware: ["Cables", "Repeater", "Hub", "Antenna"], description: "Moves raw binary signals across a physical medium." },
];

export const fallbackQuestions = [
  ["Which layer routes packets?", ["Physical", "Data Link", "Network", "Transport"], 2, "The Network layer routes packets."],
  ["Which layer provides end-to-end delivery?", ["Session", "Transport", "Network", "Physical"], 1, "Transport provides end-to-end delivery."],
  ["Which layer handles encryption and formatting?", ["Presentation", "Network", "Data Link", "Physical"], 0, "Presentation handles translation and encryption."],
  ["What is the PDU at the Data Link layer?", ["Packet", "Frame", "Segment", "Bits"], 1, "Layer 2 uses frames."],
  ["Which device primarily forwards frames by MAC address?", ["Router", "Switch", "Repeater", "Modem"], 1, "A switch forwards local frames using MAC addresses."],
  ["What does the Data Link layer add besides a header?", ["A trailer", "A route", "A port", "A session"], 0, "Frames can include an FCS/CRC trailer."],
  ["Which layer uses ports to identify processes?", ["Network", "Transport", "Session", "Physical"], 1, "Transport protocols use port numbers."],
  ["What is the PDU at the Network layer?", ["Data", "Segment", "Packet", "Frame"], 2, "Layer 3 uses packets."],
  ["Which protocol resolves names to IP addresses?", ["DNS", "TCP", "Ethernet", "ARP"], 0, "DNS resolves human-readable names."],
  ["Which layer sends electrical or radio signals?", ["Physical", "Data Link", "Network", "Application"], 0, "The Physical layer carries bits as signals."],
];

export const fallbackDragDrop = [{ id: "fallback-drag", title: "Match each technology to its layer", description: "Place each item where it belongs.", items: ["HTTP", "TCP", "IP", "Ethernet"], categories: ["Application", "Transport", "Network", "Data Link"], correct_mappings: { HTTP: "Application", TCP: "Transport", IP: "Network", Ethernet: "Data Link" }, explanation: "Each technology is a familiar example of its layer.", order_index: 0 }];
