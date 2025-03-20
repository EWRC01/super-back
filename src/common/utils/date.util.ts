// src/common/utils/date.util.ts

export class DateUtils {
    static formatForInvoice(date: Date, timeZone = 'America/El_Salvador'): string {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timeZone
      };
  
      return new Intl.DateTimeFormat('es-SV', options)
        .format(date)
        .replace(/(\d{2})\/(\d{2})\/(\d{4}),/, '$3/$1/$2') // Formato YYYY/MM/DD
        .replace(',', '');
    }
  }