import net from 'net';

function createMockServer(port, name) {
  const server = net.createServer((socket) => {
    console.log(`🔌 [${name}] Inkomende verbinding van ${socket.remoteAddress}`);
    
    socket.on('data', (data) => {
      console.log(`📩 [${name}] Payload ontvangen (${data.length} bytes): ${data.toString('hex')}`);
    });
  });

  server.listen(port, () => {
    console.log(`🟢 Mock ${name} Server actief op poort ${port}`);
  }).on('error', (err) => {
    console.log(`⚠️  Poort ${port} (${name}) fout:`, err.message);
  });
}

console.log('🚀 OT Mock Servers starten...\n');

// Open de 4 OT poorten
createMockServer(502, 'Modbus TCP');
createMockServer(1883, 'MQTT Broker');
createMockServer(102, 'Siemens S7');
createMockServer(4840, 'OPC UA');