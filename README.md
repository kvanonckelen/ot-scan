# 🔍 ot-scan

> Lightweight, OT-Safe Network Asset Discovery CLI for Industrial Control Systems (ICS).

`ot-scan` is an open-source Command Line Interface (CLI) tool designed to scan IP ranges and discover Operational Technology (OT) assets running industrial protocols such as **Modbus TCP**, **OPC UA**, **MQTT**, and **Siemens S7comm**.

It provides both active protocol identification and an **OT-Safe mode** designed to minimize network disruption on legacy controllers and sensitive industrial infrastructure.

---

## ⚡ Features

- 🔌 **OT Protocol Detection:**
  - **Modbus TCP** (Port 502) - FC43 Read Device Identification
  - **OPC UA** (Port 4840) - Hello/ACK Framing & Discovery
  - **MQTT** (Port 1883) - Connect/CONNACK Broker Detection
  - **Siemens S7comm** (Port 102) - ISO-on-TCP (COTP Connection Request)
- 🛡️ **OT-Safe Scan Mode (`--safe`):** Performs TCP handshake checks only, avoiding binary payloads that could disrupt sensitive legacy PLC network stacks.
- ⏱️ **Rate Limiting (`--delay`):** Configurable delay between host scans to prevent oversubscribing industrial network bandwidth.
- 📊 **Flexible Export Formats:** Output findings directly to Terminal Tables, clean JSON, or CSV files.

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/kvanonckelen/ot-scan.git
cd ot-scan
npm install
npm run build
```

Link the executable globally (optional):

```bash
npm link
```

📖 Usage Examples

1. Basic Scan on a Subnet
   Scan a /24 subnet using default active probes:

```bash
npx ot-scan -t 192.168.1.0/24
```

2. OT-Safe Production Scan (Recommended for Live Plants)
   Use --safe mode with a 100ms delay between hosts to ensure zero binary packet injection on sensitive PLCs:

```bash
npx ot-scan -t 10.10.20.0/24 --safe --delay 100
```

3. Export Results to JSON or CSV

```bash
# Export to JSON file
npx ot-scan -t 192.168.1.0/24 -o json -f assets.json
```

```bash
# Export to CSV file
npx ot-scan -t 192.168.1.0/24 -o csv -f assets.csv
```

🛡️ OT Safety Guidelines
Staging / FAT Testing First: Always test active scanning in a non-production staging or Factory Acceptance Testing (FAT) environment if available.

Use Safe Mode in Production: On live industrial control networks, always supply the --safe flag.

Notify Plant Personnel: Ensure SCADA/HMI operators are aware prior to running active network scans.

🤝 Contributing
Contributions are welcome! If you'd like to add support for additional protocols (such as EtherNet/IP CIP, BACnet, or PROFINET):

---

Fork the Repository.

Create a new parser under src/parsers/your-protocol.ts.

Integrate the probe in src/scanner.ts.

Submit a Pull Request.

---

📄 License
MIT License - free for commercial and non-commercial open-source use.

---

## 2. GitHub Repository Opzetten

Volg deze stappen in je terminal om het project op GitHub te zetten:

### Stap A: Een `.gitignore` aanmaken

Zorg dat je geen `node_modules` of tijdelijke bestanden commit. Maak een `.gitignore` bestand aan met:

```text
node_modules/
dist/
*.log
test-servers.js
assets.json
assets.csv
```
