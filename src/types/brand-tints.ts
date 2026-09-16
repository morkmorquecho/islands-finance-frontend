export type IslandAccount = {
  id: string;
  name: string;
  brandTint: string; // ahora es el color real que manda el backend (hex o var css)
  isSystem: boolean;
};