import { DiscoveredAsset } from './types.js';
import { probeModbus } from './parsers/modbus.js';
import { probeOPCUA } from './parsers/opcua.js';
import { probeMQTT } from './parsers/mqtt.js';
import { probeS7 } from './parsers/s7.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateIPRange(target: string): string[] {
  if (!target.includes('/')) return [target];

  const [baseIp, cidrStr] = target.split('/');
  const cidr = parseInt(cidrStr, 10);
  const ipParts = baseIp.split('.').map(Number);
  
  if (cidr !== 24) {
    throw new Error('Momenteel wordt alleen /24 CIDR ondersteund in de MVP.');
  }

  const ips: string[] = [];
  for (let i = 1; i < 255; i++) {
    ips.push(`${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${i}`);
  }
  return ips;
}

export async function scanNetwork(
  target: string, 
  timeout = 1500, 
  delay = 50, 
  safe = false, 
  onProgress?: (ip: string) => void
): Promise<DiscoveredAsset[]> {
  const ips = generateIPRange(target);
  const results: DiscoveredAsset[] = [];

  for (const ip of ips) {
    if (onProgress) onProgress(ip);

    // Run probes in parallel per IP, met respect voor safe mode
    const [modbus, opcua, mqtt, s7] = await Promise.all([
      probeModbus(ip, timeout, safe),
      probeOPCUA(ip, timeout, safe),
      probeMQTT(ip, timeout, safe),
      probeS7(ip, timeout, safe)
    ]);

    const detectedProtocols: string[] = [];
    let vendor: string | undefined = modbus.vendor || s7.vendor;
    let model: string | undefined = modbus.model;
    const details: Record<string, any> = {};

    if (modbus.detected) {
      detectedProtocols.push('Modbus TCP (502)');
      if (modbus.details) details.modbus = modbus.details;
    }
    if (opcua.detected) {
      detectedProtocols.push('OPC UA (4840)');
      if (opcua.details) details.opcua = opcua.details;
    }
    if (mqtt.detected) {
      detectedProtocols.push('MQTT (1883)');
    }
    if (s7.detected) {
      detectedProtocols.push('Siemens S7 (102)');
      if (s7.details) details.s7 = s7.details;
    }

    if (detectedProtocols.length > 0) {
      results.push({
        ip,
        protocols: detectedProtocols,
        vendor: vendor || 'Unknown OT Vendor',
        model: model || 'Generic Asset',
        details,
        discoveredAt: new Date().toISOString()
      });
    }

    // Rate-limiting delay tussen IP-scans (OT-Safe)
    if (delay > 0) {
      await sleep(delay);
    }
  }

  return results;
}