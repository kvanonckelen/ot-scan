export interface DiscoveredAsset {
  ip: string;
  protocols: string[];
  vendor?: string;
  model?: string;
  details: Record<string, any>;
  discoveredAt: string;
}

export interface ScanOptions {
  target: string;
  output: 'table' | 'json' | 'csv';
  timeout: number;
  delay?: number;
  safe?: boolean;
}