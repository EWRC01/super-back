export interface SaleInvoiceData {
    sale: {
      id: number;
      date: Date;
      user: string;
      cashregister: number;
      totalWithIVA: number;
      totalDiscounts?: number;
      totalIVA?: number;
      paid: number;
      customer?: {
        name: string;
      };
      products: Array<{
        quantity: number;
        price: number;
        discountAmount: number;
        product: {
          name: string;
        };
      }>;
    };
    config: {
      company: {
        name: string;
        branch: string;
        address: string;
        nit: string;
        nrc: string;
      };
      qrData: string;
      qrImage?: string;
    };
  }