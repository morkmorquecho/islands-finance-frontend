/**
 * Registro de tintes por institución.
 * Para sumar una cuenta, registra aquí su clave y usa esa clave en brandTint.
 * Los colores efectivos viven como custom properties en src/style.css.
 */
export const BRAND_TINTS = {
  nu: "nu",
  mercadoPago: "mercado-pago",
  revolut: "revolut",
  cetes: "cetes",
  default: "default",
} as const;

export type BrandTint = (typeof BRAND_TINTS)[keyof typeof BRAND_TINTS];

export type IslandAccount = {
  id: string;
  name: string;
  brandTint: BrandTint;
  isSystem: boolean;
};
