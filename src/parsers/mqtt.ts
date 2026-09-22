import net from 'net';

export async function probeMQTT(ip: string, timeout = 1500, safe = false): Promise<{ detected: boolean }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const cleanupAndResolve = (result: { detected: boolean }) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      if (safe) {
        cleanupAndResolve({ detected: true });
        return;
      }

      const mqttConnect = Buffer.from([
        0x10, 0x13,
        0x00, 0x04, 0x4d, 0x51, 0x54, 0x54,
        0x04,
        0x02,
        0x00, 0x3c,
        0x00, 0x07, 0x6f, 0x74, 0x2d, 0x73, 0x63, 0x61, 0x6e
      ]);

      socket.write(mqttConnect);
    });

    socket.on('data', (data) => {
      const isMQTT = data.length >= 2 && data[0] === 0x20;
      cleanupAndResolve({ detected: isMQTT });
    });

    socket.on('timeout', () => cleanupAndResolve({ detected: false }));
    socket.on('error', () => cleanupAndResolve({ detected: false }));

    socket.connect(1883, ip);
  });
}