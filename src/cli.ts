#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import fs from 'fs';
import { scanNetwork } from './scanner.js';
import { ScanOptions } from './types.js';

const program = new Command();

program
  .name('ot-scan')
  .description('Lichtgewicht Open Source OT Asset Discovery CLI Tool')
  .version('0.1.0')
  .requiredOption('-t, --target <target>', 'Doel IP-adres of subnet (bijv. 192.168.1.10 of 192.168.1.0/24)')
  .option('-o, --output <format>', 'Output formaat: table, json, of csv', 'table')
  .option('-f, --file <filename>', 'Sla de output optioneel op in een bestand')
  .option('--timeout <ms>', 'Timeout per poort scan in milliseconden', '1000')
  .option('--delay <ms>', 'Vertraging tussen IP scans in milliseconden (OT-safe)', '50')
  .option('--safe', 'Safe mode: alleen veilige TCP-port checks zonder binaire probes', false)
  .action(async (options: ScanOptions & { file?: string }) => {
    console.log(chalk.bold.cyan('\n🔍 OT-Scan v0.1.0 - Asset Discovery\n'));
    console.log(`${chalk.gray('Target:')}    ${options.target}`);
    console.log(`${chalk.gray('Timeout:')}   ${options.timeout}ms`);
    console.log(`${chalk.gray('Delay:')}     ${options.delay ?? 50}ms`);
    console.log(`${chalk.gray('Safe Mode:')} ${options.safe ? chalk.green('AAN (Alleen TCP checks)') : chalk.yellow('UIT (Actieve Probes)')}\n`);

    console.log(chalk.yellow('Scanning netwerk...'));

    try {
      // Geef alle opties in de juiste volgorde door aan scanNetwork:
      // (target, timeout, delay, safe, onProgress)
      const results = await scanNetwork(
        options.target,
        Number(options.timeout),
        Number(options.delay ?? 50),
        Boolean(options.safe),
        (ip) => {
          process.stdout.write(chalk.gray(`\rScannen: ${ip} `));
        }
      );

      process.stdout.write('\r' + ' '.repeat(30) + '\r'); // Clear laadregel

      console.log(chalk.bold.green(`✓ Scan voltooid! ${results.length} OT-device(s) gevonden.\n`));

      if (results.length === 0) {
        console.log(chalk.dim('Geen OT apparaten gevonden op de opgegeven protocollen.'));
        return;
      }

      // Format output
      if (options.output === 'json') {
        const jsonStr = JSON.stringify(results, null, 2);
        if (options.file) fs.writeFileSync(options.file, jsonStr);
        else console.log(jsonStr);
      } else if (options.output === 'csv') {
        const csvRows = [
          'IP,Protocols,Vendor,Model,DiscoveredAt',
          ...results.map(r => `"${r.ip}","${r.protocols.join(';')}","${r.vendor}","${r.model}","${r.discoveredAt}"`)
        ];
        const csvStr = csvRows.join('\n');
        if (options.file) fs.writeFileSync(options.file, csvStr);
        else console.log(csvStr);
      } else {
        // Standaard Terminal Tabel
        const table = new Table({
          head: [chalk.white('IP Adres'), chalk.white('Gedetecteerde Protocollen'), chalk.white('Vendor'), chalk.white('Model')],
          colWidths: [18, 30, 20, 20]
        });

        results.forEach(r => {
          table.push([r.ip, r.protocols.join(', '), r.vendor || 'Onbekend', r.model || 'Onbekend']);
        });

        console.log(table.toString());
      }

      if (options.file && options.output === 'table') {
        console.log(chalk.yellow(`\nOpmerking: Formaat 'table' kan niet naar een bestand geschreven worden. Gebruik --output json of csv.`));
      } else if (options.file) {
        console.log(chalk.green(`\nResultaten succesvol opgeslagen in ${options.file}`));
      }

    } catch (err: any) {
      console.error(chalk.red(`\nFout tijdens scannen: ${err.message}`));
    }
  });

program.parse(process.argv);