import net from 'net';

export async function probeModbus(ip: string, timeout = 1500, safe = false): Promise<{ detected: boolean; vendor?: string; model?: string; details?: any }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const cleanupAndResolve = (result: { detected: boolean; vendor?: string; model?: string; details?: any }) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      if (safe) {
        cleanupAndResolve({ detected: true, vendor: 'Modbus Device (Safe Scan)' });
        return;
      }

      // Modbus TCP FC43: Read Device Identification frame
      const fc43Frame = Buffer.from([
        0x00, 0x01, 0x00, 0x00, 0x00, 0x05, 0x01, 0x2b, 0x0e, 0x01, 0x00
      ]);

      socket.write(fc43Frame);
    });

    socket.on('data', (data) => {
      let vendor: string | undefined;
      let model: string | undefined;

      try {
        if (data.length > 10 && data[7] === 0x2b) {
          const strData = data.toString('utf8', 10);
          vendor = strData.substring(0, 20).trim();
        }
      } catch (e) {}

      cleanupAndResolve({ detected: true, vendor, model, details: { rawHeader: data.subarray(0, 7).toString('hex') } });
    });

    socket.on('timeout', () => cleanupAndResolve({ detected: false }));
    socket.on('error', () => cleanupAndResolve({ detected: false }));

    socket.connect(502, ip);
  });
}