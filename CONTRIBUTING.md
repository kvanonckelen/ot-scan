# Contributing to ot-scan 🔍

First off, thank you for considering contributing to `ot-scan`! It's open-source tools like this that help make Industrial Control Systems (ICS) and Operational Technology (OT) environments safer and more accessible.

---

## 🛠️ How to Add a New Protocol Parser

Adding support for a new industrial protocol (e.g., EtherNet/IP CIP, BACnet/IP, DNP3, or Profinet) is straightforward. Follow these steps:

### 1. Create a New Parser

Add a new TypeScript module under `src/parsers/yourprotocol.ts`.

Your probe function MUST accept a `safe` boolean parameter:

```typescript
import net from "net";

export async function probeYourProtocol(
  ip: string,
  timeout = 1500,
  safe = false,
): Promise<{ detected: boolean; vendor?: string; details?: any }> {
  return new Promise((resolve) => {
    // 1. In 'safe' mode: Perform TCP connect check ONLY, then close immediately.
    // 2. In active mode: Send the minimal read-only protocol handshake payload.
  });
}
```

### 2. Respect OT Safety Guidelines

🛡️ Safe Mode Mandatory: Every parser MUST handle safe === true by disconnecting immediately after a successful TCP handshake without sending binary payloads.

⏱️ Timeouts & Cleanups: Always destroy sockets on error, timeout, or completion to avoid leaving orphan TCP connections on sensitive PLCs.

### 3. Integrate in Scanner

Import and invoke your new parser inside src/scanner.ts:

```typescript
const [modbus, opcua, mqtt, s7, yourprotocol] = await Promise.all([
  probeModbus(ip, timeout, safe),
  probeOPCUA(ip, timeout, safe),
  probeMQTT(ip, timeout, safe),
  probeS7(ip, timeout, safe),
  probeYourProtocol(ip, timeout, safe),
]);
```

🚀 Pull Request Workflow
Fork the repository and create your feature branch from main:

```bash
git checkout -b feature/add-yourprotocol-parser
```

Implement your changes and test locally using mock servers or test devices.

Commit your changes with a clear commit message:

```bash
git commit -m "feat: add BACnet/IP protocol parser on port 47808"
```

Push to your fork and submit a Pull Request to main.

---

💡 Reporting Issues or Feature Requests
If you encounter bugs, false positives, or have ideas for new features, feel free to open an issue on GitHub with:

The ot-scan version and command flags used.

The target system/device type (if known).

Expected vs. actual output.
