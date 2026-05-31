import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'eletronicos', name: 'EletrÃ´nicos, Ãudio e VÃ­deo' },
  { id: 'celulares', name: 'Celulares e Smartphones' },
  { id: 'cameras', name: 'CÃ¢meras e AcessÃ³rios' },
  { id: 'informatica', name: 'InformÃ¡tica' },
  { id: 'eletrodomesticos', name: 'EletrodomÃ©sticos' },
  { id: 'casa_moveis', name: 'Casa, MÃ³veis e DecoraÃ§Ã£o' },
  { id: 'moda_roupas', name: 'Moda e Roupas' },
  { id: 'calcados', name: 'CalÃ§ados e AcessÃ³rios de Moda' },
  { id: 'beleza', name: 'Beleza e Cuidado Pessoal' },
  { id: 'saude', name: 'SaÃºde e Cuidados Pessoais' },
  { id: 'esportes', name: 'Esportes e Fitness' },
  { id: 'brinquedos', name: 'Brinquedos e Hobbies' },
  { id: 'ferramentas', name: 'Ferramentas e ConstruÃ§Ã£o' },
  { id: 'alimentos', name: 'Alimentos e Bebidas' },
  { id: 'automotivo', name: 'Automotivo (acessÃ³rios)' },
  { id: 'geral', name: 'Outros / Geral' },
];

// ML commission rates by category (ClÃ¡ssico plan; Premium = ClÃ¡ssico + 5pp)
export const ML_CATEGORY_RATES: Record<string, number> = {
  eletronicos: 13,
  celulares: 13,
  cameras: 13,
  informatica: 12,
  eletrodomesticos: 13,
  casa_moveis: 14,
  moda_roupas: 14,
  calcados: 14,
  beleza: 14,
  saude: 12,
  esportes: 14,
  brinquedos: 14,
  ferramentas: 12,
  alimentos: 12,
  automotivo: 11,
  geral: 14,
};

// Amazon referral fees by category
export const AMAZON_CATEGORY_RATES: Record<string, { rate: number; splitAt?: number; rateAbove?: number }> = {
  eletronicos: { rate: 8 },
  celulares: { rate: 8 },
  cameras: { rate: 8 },
  informatica: { rate: 8 },
  eletrodomesticos: { rate: 10 },
  casa_moveis: { rate: 12 },
  moda_roupas: { rate: 12 },
  calcados: { rate: 12 },
  beleza: { rate: 13 },
  saude: { rate: 13 },
  esportes: { rate: 12 },
  brinquedos: { rate: 12 },
  ferramentas: { rate: 12 },
  alimentos: { rate: 10 },
  automotivo: { rate: 12 },
  geral: { rate: 12 },
};

