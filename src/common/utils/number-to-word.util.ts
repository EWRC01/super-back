// src/common/utils/number-to-words.util.ts

export class NumberToWords {
    private static readonly UNITS = [
      'CERO', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 
      'OCHO', 'NUEVE', 'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 
      'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
    ];
  
    private static readonly TENS = [
      '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 
      'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
    ];
  
    private static readonly HUNDREDS = [
      '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 
      'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 
      'NOVECIENTOS'
    ];
  
    private static readonly THOUSANDS = [
      '', 'MIL', 'MILLÓN', 'MILLONES'
    ];
  
    public static convert(amount: number): string {
      if (isNaN(amount) || amount < 0 || amount >= 1000000000) {
        throw new Error('CANTIDAD FUERA DE RANGO (0 - 999,999,999.99)');
      }
  
      const integerPart = Math.floor(amount);
      const decimalPart = Math.round((amount - integerPart) * 100);
  
      const words = [
        this.convertInteger(integerPart),
        this.convertDecimal(decimalPart)
      ].filter(Boolean).join(' ');
  
      return `SON: ${words} DOLARES`;
    }
  
    private static convertInteger(n: number): string {
      if (n === 0) return 'CERO';
      
      let result = '';
      let counter = 0;
      
      while (n > 0) {
        const chunk = n % 1000;
        n = Math.floor(n / 1000);
        
        let chunkWords = this.convertChunk(chunk);
        
        if (chunk === 1 && counter === 1) chunkWords = 'UN';
        if (chunk > 0) result = `${chunkWords} ${this.THOUSANDS[counter]} ${result}`.trim();
        
        counter = counter === 1 ? 2 : counter + 1;
      }
  
      return result
        .replace(/\sUN MIL/g, ' MIL')
        .replace(/\s+/g, ' ')
        .trim();
    }
  
    private static convertChunk(n: number): string {
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      
      let result = [];
      
      if (hundred > 0) {
        if (n === 100) return 'CIEN';
        result.push(this.HUNDREDS[hundred]);
      }
      
      if (remainder > 0) {
        if (remainder < 20) {
          result.push(this.UNITS[remainder]);
        } else {
          const ten = Math.floor(remainder / 10);
          const unit = remainder % 10;
          
          let tenWord = this.TENS[ten];
          if (unit > 0) tenWord += ` Y ${this.UNITS[unit]}`;
          
          result.push(tenWord);
        }
      }
      
      return result.join(' ');
    }
  
    private static convertDecimal(n: number): string {
      if (n === 0) return '';
      return `CON ${n.toString().padStart(2, '0')}/100`;
    }
  
    // Manejo especial para millones
    private static handleMillions(n: number): string {
      if (n === 1) return 'UN MILLÓN';
      if (n > 1) return `${this.convertInteger(n)} MILLONES`;
      return '';
    }
  }