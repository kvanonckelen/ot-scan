import net from 'net';

export async function probeS7(ip: string, timeout = 1500, safe = false): Promise<{ detected: boolean; vendor?: string; details?: any }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const cleanupAndResolve = (result: { detected: boolean; vendor?: string; details?: any }) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      if (safe) {
        cleanupAndResolve({ detected: true, vendor: 'Siemens S7 (Safe Scan)' });
        return;
      }

      const cotpConnectionRequest = Buffer.from([
        0x03, 0x00, 0x00, 0x16,
        0x11, 0xe0, 0x00, 0x00, 0x00, 0x01, 0x00,
        0xc1, 0x02, 0x01, 0x00,
        0xc2, 0x02, 0x02, 0x02,
        0xc0, 0x01, 0x0a
      ]);

      socket.write(cotpConnectionRequest);
    });

    socket.on('data', (data) => {
      const isS7 = data.length >= 7 && data[0] === 0x03 && (data[5] & 0xf0) === 0xd0;
      cleanupAndResolve({
        detected: isS7,
        vendor: isS7 ? 'Siemens' : undefined,
        details: isS7 ? { protocol: 'S7comm (ISO-on-TCP)' } : undefined
      });
    });

    socket.on('timeout', () => cleanupAndResolve({ detected: false }));
    socket.on('error', () => cleanupAndResolve({ detected: false }));

    socket.connect(102, ip);
  });
}