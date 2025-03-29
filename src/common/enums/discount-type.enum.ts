export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',       // Descuento porcentual (ej. 20%)
    FIXED_AMOUNT = 'FIXED_AMOUNT',   // Descuento por monto fijo (ej. $5 off)
    BUY_X_GET_Y = 'BUY_X_GET_Y',     // Promoción tipo 2x1, 3x2, etc.
    BUNDLE = 'BUNDLE',               // Descuento por paquete de productos
    SEASONAL = 'SEASONAL'            // Descuento temporal/estacional
  }