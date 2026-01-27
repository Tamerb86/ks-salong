import { describe, it, expect } from 'vitest';
import { ESCPOSPrinter, formatReceipt, isThermalPrinterSupported } from '../client/src/lib/escpos-printer';

describe('ESCPOSPrinter', () => {
  it('should initialize printer with ESC @ command', () => {
    const printer = new ESCPOSPrinter();
    printer.init();
    const bytes = printer.getBytes();
    
    // ESC @ = 0x1B 0x40
    expect(bytes[0]).toBe(0x1B);
    expect(bytes[1]).toBe(0x40);
  });

  it('should set text alignment', () => {
    const printer = new ESCPOSPrinter();
    printer.align('center');
    const bytes = printer.getBytes();
    
    // ESC a 1 (center) = 0x1B 0x61 0x01
    expect(bytes[0]).toBe(0x1B);
    expect(bytes[1]).toBe(0x61);
    expect(bytes[2]).toBe(0x01);
  });

  it('should print text with line feed', () => {
    const printer = new ESCPOSPrinter();
    printer.println('Test');
    const bytes = printer.getBytes();
    
    const text = new TextDecoder().decode(bytes);
    expect(text).toBe('Test\n');
  });

  it('should create two-column layout', () => {
    const printer = new ESCPOSPrinter();
    printer.columns('Left', 'Right', 20);
    const bytes = printer.getBytes();
    
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('Left');
    expect(text).toContain('Right');
    expect(text.length).toBeGreaterThanOrEqual(20);
  });

  it('should add line feeds', () => {
    const printer = new ESCPOSPrinter();
    printer.feed(3);
    const bytes = printer.getBytes();
    
    const text = new TextDecoder().decode(bytes);
    expect(text).toBe('\n\n\n');
  });

  it('should print horizontal line', () => {
    const printer = new ESCPOSPrinter();
    printer.line('-', 10);
    const bytes = printer.getBytes();
    
    const text = new TextDecoder().decode(bytes);
    expect(text).toBe('----------\n');
  });

  it('should enable bold text', () => {
    const printer = new ESCPOSPrinter();
    printer.bold(true);
    const bytes = printer.getBytes();
    
    // ESC E 1 = 0x1B 0x45 0x01
    expect(bytes[0]).toBe(0x1B);
    expect(bytes[1]).toBe(0x45);
    expect(bytes[2]).toBe(0x01);
  });

  it('should set font size', () => {
    const printer = new ESCPOSPrinter();
    printer.size(2, 2); // Double width and height
    const bytes = printer.getBytes();
    
    // GS ! = 0x1D 0x21
    expect(bytes[0]).toBe(0x1D);
    expect(bytes[1]).toBe(0x21);
  });

  it('should add paper cut command', () => {
    const printer = new ESCPOSPrinter();
    printer.cut();
    const bytes = printer.getBytes();
    
    // GS V 0 = 0x1D 0x56 0x00
    expect(bytes[0]).toBe(0x1D);
    expect(bytes[1]).toBe(0x56);
    expect(bytes[2]).toBe(0x00);
  });

  it('should clear commands', () => {
    const printer = new ESCPOSPrinter();
    printer.println('Test');
    printer.clear();
    const bytes = printer.getBytes();
    
    expect(bytes.length).toBe(0);
  });
});

describe('formatReceipt', () => {
  it('should format complete receipt with all sections', () => {
    const receipt = {
      salonName: 'K.S Salong',
      salonAddress: 'Test Gate 1, 0123 Oslo',
      salonPhone: '+47 123 45 678',
      salonEmail: 'post@ksalong.no',
      mvaNumber: 'NO123456789MVA',
      orderNumber: 'ORD-001',
      date: '27.01.2026',
      time: '14:30',
      items: [
        { name: 'Herreklipp', quantity: 1, price: 500 },
        { name: 'Skjeggstuss', quantity: 1, price: 200 },
      ],
      subtotal: 560,
      mva: 140,
      total: 700,
      paymentMethod: 'KORT',
      customMessage: 'Takk for besøket!',
    };

    const bytes = formatReceipt(receipt);
    const text = new TextDecoder().decode(bytes);

    // Check header
    expect(text).toContain('K.S Salong');
    expect(text).toContain('Test Gate 1, 0123 Oslo');
    expect(text).toContain('+47 123 45 678');
    expect(text).toContain('post@ksalong.no');
    expect(text).toContain('NO123456789MVA');

    // Check order info
    expect(text).toContain('ORD-001');
    expect(text).toContain('27.01.2026');
    expect(text).toContain('14:30');

    // Check items
    expect(text).toContain('Herreklipp');
    expect(text).toContain('Skjeggstuss');
    expect(text).toContain('500.00 kr');
    expect(text).toContain('200.00 kr');

    // Check totals
    expect(text).toContain('560.00 kr');
    expect(text).toContain('140.00 kr');
    expect(text).toContain('700.00 kr');

    // Check payment method
    expect(text).toContain('KORT');

    // Check custom message
    expect(text).toContain('Takk for besøket!');

    // Check footer
    expect(text).toContain('Velkommen tilbake!');
  });

  it('should handle receipt without custom message', () => {
    const receipt = {
      salonName: 'K.S Salong',
      salonAddress: '',
      salonPhone: '',
      salonEmail: '',
      mvaNumber: '',
      orderNumber: 'ORD-002',
      date: '27.01.2026',
      time: '15:00',
      items: [{ name: 'Test Service', quantity: 1, price: 100 }],
      subtotal: 80,
      mva: 20,
      total: 100,
      paymentMethod: 'KONTANT',
    };

    const bytes = formatReceipt(receipt);
    const text = new TextDecoder().decode(bytes);

    expect(text).toContain('K.S Salong');
    expect(text).toContain('ORD-002');
    expect(text).toContain('Test Service');
    expect(text).toContain('100.00 kr');
    expect(text).toContain('KONTANT');
    expect(text).toContain('Takk for besøket!');
  });

  it('should handle multiple items correctly', () => {
    const receipt = {
      salonName: 'K.S Salong',
      salonAddress: '',
      salonPhone: '',
      salonEmail: '',
      mvaNumber: '',
      orderNumber: 'ORD-003',
      date: '27.01.2026',
      time: '16:00',
      items: [
        { name: 'Item 1', quantity: 2, price: 100 },
        { name: 'Item 2', quantity: 1, price: 200 },
        { name: 'Item 3', quantity: 3, price: 50 },
      ],
      subtotal: 400,
      mva: 100,
      total: 500,
      paymentMethod: 'VIPPS',
    };

    const bytes = formatReceipt(receipt);
    const text = new TextDecoder().decode(bytes);

    expect(text).toContain('2x Item 1');
    expect(text).toContain('1x Item 2');
    expect(text).toContain('3x Item 3');
    expect(text).toContain('100.00 kr');
    expect(text).toContain('200.00 kr');
    expect(text).toContain('50.00 kr');
  });
});

describe('isThermalPrinterSupported', () => {
  it('should return false in Node.js environment (no navigator.serial)', () => {
    const supported = isThermalPrinterSupported();
    expect(supported).toBe(false);
  });
});
