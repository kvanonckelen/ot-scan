import net from 'net';

export async function probeOPCUA(ip: string, timeout = 1500, safe = false): Promise<{ detected: boolean; details?: any }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const cleanupAndResolve = (result: { detected: boolean; details?: any }) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      if (safe) {
        cleanupAndResolve({ detected: true, details: { mode: 'Safe Scan' } });
        return;
      }

      const opcuaHello = Buffer.from([
        0x48, 0x45, 0x4c, 0x46,
        0x20, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x10, 0x00, 0x00,
        0x00, 0x10, 0x00, 0x00,
        0x00, 0x00, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x00
      ]);

      socket.write(opcuaHello);
    });

    socket.on('data', (data) => {
      const header = data.toString('utf8', 0, 3);
      const isOPCUA = header === 'ACK' || header === 'ERR' || header === 'HEL';
      cleanupAndResolve({ 
        detected: isOPCUA, 
        details: isOPCUA ? { responseType: header } : undefined 
      });
    });

    socket.on('timeout', () => cleanupAndResolve({ detected: false }));
    socket.on('error', () => cleanupAndResolve({ detected: false }));

    socket.connect(4840, ip);
  });
}