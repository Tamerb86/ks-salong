/**
 * ESC/POS Thermal Printer Utility
 * 
 * This library provides direct ESC/POS command generation for 80mm thermal printers.
 * Works with USB and Bluetooth thermal printers using the Web Serial API.
 * 
 * Supported features:
 * - Text alignment (left, center, right)
 * - Font sizes (normal, double width, double height, double both)
 * - Text styles (bold, underline)
 * - Line feeds and paper cut
 * - Barcode printing (optional)
 */

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';

export class ESCPOSPrinter {
  private encoder = new TextEncoder();
  private commands: Uint8Array[] = [];

  /**
   * Initialize printer (reset to default state)
   */
  init(): this {
    this.addCommand(`${ESC}@`);
    return this;
  }

  /**
   * Set text alignment
   * @param align 'left' | 'center' | 'right'
   */
  align(align: 'left' | 'center' | 'right'): this {
    const alignCode = align === 'left' ? 0 : align === 'center' ? 1 : 2;
    this.addCommand(`${ESC}a${String.fromCharCode(alignCode)}`);
    return this;
  }

  /**
   * Set font size
   * @param width 1-8 (1 = normal, 2 = double width)
   * @param height 1-8 (1 = normal, 2 = double height)
   */
  size(width: number = 1, height: number = 1): this {
    const size = ((width - 1) << 4) | (height - 1);
    this.addCommand(`${GS}!${String.fromCharCode(size)}`);
    return this;
  }

  /**
   * Enable/disable bold text
   */
  bold(enable: boolean = true): this {
    this.addCommand(`${ESC}E${String.fromCharCode(enable ? 1 : 0)}`);
    return this;
  }

  /**
   * Enable/disable underline
   */
  underline(enable: boolean = true): this {
    this.addCommand(`${ESC}-${String.fromCharCode(enable ? 1 : 0)}`);
    return this;
  }

  /**
   * Print text
   */
  text(content: string): this {
    this.addCommand(content);
    return this;
  }

  /**
   * Print text with line feed
   */
  println(content: string = ''): this {
    this.addCommand(content + '\n');
    return this;
  }

  /**
   * Add line feed (empty line)
   */
  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.addCommand('\n');
    }
    return this;
  }

  /**
   * Print horizontal line (dashed)
   */
  line(char: string = '-', length: number = 32): this {
    this.addCommand(char.repeat(length) + '\n');
    return this;
  }

  /**
   * Print two-column text (left-aligned and right-aligned)
   */
  columns(left: string, right: string, width: number = 32): this {
    const leftLen = this.getStringWidth(left);
    const rightLen = this.getStringWidth(right);
    const spaces = width - leftLen - rightLen;
    this.addCommand(left + ' '.repeat(Math.max(0, spaces)) + right + '\n');
    return this;
  }

  /**
   * Cut paper (full or partial)
   */
  cut(partial: boolean = false): this {
    this.addCommand(`${GS}V${String.fromCharCode(partial ? 1 : 0)}`);
    return this;
  }

  /**
   * Open cash drawer (if connected)
   */
  openDrawer(): this {
    this.addCommand(`${ESC}p${String.fromCharCode(0)}${String.fromCharCode(25)}${String.fromCharCode(250)}`);
    return this;
  }

  /**
   * Get byte array for printing
   */
  getBytes(): Uint8Array {
    const totalLength = this.commands.reduce((sum, cmd) => sum + cmd.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const cmd of this.commands) {
      result.set(cmd, offset);
      offset += cmd.length;
    }
    return result;
  }

  /**
   * Clear all commands
   */
  clear(): this {
    this.commands = [];
    return this;
  }

  /**
   * Add raw command
   */
  private addCommand(cmd: string): void {
    this.commands.push(this.encoder.encode(cmd));
  }

  /**
   * Calculate string width (approximate for monospace font)
   */
  private getStringWidth(str: string): number {
    // Simple width calculation - can be improved for multi-byte characters
    return str.length;
  }
}

/**
 * Print receipt using Web Serial API
 * @param data ESC/POS byte array
 */
export async function printToThermalPrinter(data: Uint8Array): Promise<void> {
  if (!('serial' in navigator)) {
    throw new Error('Web Serial API ikke støttet i denne nettleseren. Bruk Chrome, Edge eller Opera.');
  }

  try {
    // Request serial port access
    const port = await (navigator as any).serial.requestPort();
    
    // Open the port
    await port.open({ baudRate: 9600 });

    // Get writer
    const writer = port.writable.getWriter();

    // Write data
    await writer.write(data);

    // Release writer and close port
    writer.releaseLock();
    await port.close();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Feil ved utskrift: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if Web Serial API is supported
 */
export function isThermalPrinterSupported(): boolean {
  return 'serial' in navigator;
}

/**
 * Example: Format receipt for K.S Salong
 */
export function formatReceipt(receipt: {
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonEmail: string;
  mvaNumber: string;
  orderNumber: string;
  date: string;
  time: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  mva: number;
  total: number;
  paymentMethod: string;
  customMessage?: string;
}): Uint8Array {
  const printer = new ESCPOSPrinter();

  printer
    .init()
    .align('center')
    .size(2, 2)
    .bold(true)
    .println(receipt.salonName)
    .bold(false)
    .size(1, 1)
    .println(receipt.salonAddress)
    .println(receipt.salonPhone)
    .println(receipt.salonEmail)
    .println(`MVA: ${receipt.mvaNumber}`)
    .feed(1)
    .line('=', 32)
    .align('left')
    .println(`Ordre: ${receipt.orderNumber}`)
    .println(`Dato: ${receipt.date}`)
    .println(`Tid: ${receipt.time}`)
    .line('-', 32)
    .feed(1);

  // Print items
  receipt.items.forEach(item => {
    printer.columns(
      `${item.quantity}x ${item.name}`,
      `${item.price.toFixed(2)} kr`,
      32
    );
  });

  printer
    .feed(1)
    .line('-', 32)
    .columns('Delsum:', `${receipt.subtotal.toFixed(2)} kr`, 32)
    .columns('MVA (25%):', `${receipt.mva.toFixed(2)} kr`, 32)
    .line('=', 32)
    .bold(true)
    .size(1, 2)
    .columns('TOTALT:', `${receipt.total.toFixed(2)} kr`, 32)
    .bold(false)
    .size(1, 1)
    .line('=', 32)
    .feed(1)
    .columns('Betalingsmåte:', receipt.paymentMethod, 32)
    .feed(2);

  if (receipt.customMessage) {
    printer
      .align('center')
      .println(receipt.customMessage)
      .feed(1);
  }

  printer
    .align('center')
    .println('Takk for besøket!')
    .println('Velkommen tilbake!')
    .feed(3)
    .cut();

  return printer.getBytes();
}
