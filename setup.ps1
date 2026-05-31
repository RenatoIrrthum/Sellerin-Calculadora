# Sellerin - Script de setup
Write-Host "Criando arquivos do projeto Sellerin..." -ForegroundColor Cyan

# Criar diretorios
New-Item -ItemType Directory -Force -Path "src/types" | Out-Null
New-Item -ItemType Directory -Force -Path "src/data" | Out-Null
New-Item -ItemType Directory -Force -Path "src/utils" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components" | Out-Null

# package.json
@'
{
  "name": "sellerin-calculadora",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@tailwindcss/vite": "^4.3.0",
    "@types/node": "^24.12.3",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "tailwindcss": "^4.3.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.59.2",
    "vite": "^8.0.12"
  }
}

'@ | Set-Content -Path 'package.json' -Encoding UTF8

# vite.config.ts
@'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})

'@ | Set-Content -Path 'vite.config.ts' -Encoding UTF8

# tsconfig.json
@'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

'@ | Set-Content -Path 'tsconfig.json' -Encoding UTF8

# tsconfig.app.json
@'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

'@ | Set-Content -Path 'tsconfig.app.json' -Encoding UTF8

# index.html
@'
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Calculadora de precificação para os principais marketplaces brasileiros: Mercado Livre, Shopee, Amazon, Magalu e mais." />
    <title>Sellerin — Calculadora de Marketplaces</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

'@ | Set-Content -Path 'index.html' -Encoding UTF8

# src/index.css
@'
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  background-color: #f1f5f9;
  color: #1e293b;
}

#root {
  min-height: 100vh;
}

'@ | Set-Content -Path 'src/index.css' -Encoding UTF8

# src/main.tsx
@'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

'@ | Set-Content -Path 'src/main.tsx' -Encoding UTF8

# src/types/index.ts
@'
export interface Category {
  id: string;
  name: string;
}

export interface MLCategoryFees {
  classicoRate: number;
  premiumRate: number;
}

export interface ShopeeFeeTier {
  minPrice: number;
  maxPrice: number;
  commissionRate: number;
  fixedFee: number;
  label: string;
}

export interface AmazonCategoryFees {
  rate: number;
  splitThreshold?: number;
  rateAboveThreshold?: number;
}

export type MLReputation = 'verde' | 'amarela' | 'sem_reputacao';
export type MLPlan = 'gratis' | 'classico' | 'premium';
export type AmazonPlan = 'individual' | 'profissional';
export type TikTokPayment = 'pix' | 'cartao';
export type CalcMode = 'suggested_price' | 'check_margin';

export interface CalculatorInputs {
  productCost: number;
  shippingCostFull: number;
  desiredMargin: number;
  category: string;
  calcMode: CalcMode;
  manualPrice: number;
  mlPlan: MLPlan;
  mlReputation: MLReputation;
  amazonPlan: AmazonPlan;
  tiktokPayment: TikTokPayment;
  tiktokSFP: boolean;
}

export interface CostBreakdown {
  label: string;
  value: number;
  type: 'revenue' | 'cost' | 'profit';
}

export interface MarketplaceResult {
  marketplaceId: string;
  marketplaceName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  logoText: string;
  suggestedPrice: number;
  netProfit: number;
  netMargin: number;
  totalFees: number;
  effectiveFeeRate: number;
  shippingPaidBySeller: number;
  shippingNote: string;
  breakdown: CostBreakdown[];
  tierNote?: string;
  plan?: string;
}

'@ | Set-Content -Path 'src/types/index.ts' -Encoding UTF8

# src/data/categories.ts
@'
import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'eletronicos', name: 'Eletrônicos, Áudio e Vídeo' },
  { id: 'celulares', name: 'Celulares e Smartphones' },
  { id: 'cameras', name: 'Câmeras e Acessórios' },
  { id: 'informatica', name: 'Informática' },
  { id: 'eletrodomesticos', name: 'Eletrodomésticos' },
  { id: 'casa_moveis', name: 'Casa, Móveis e Decoração' },
  { id: 'moda_roupas', name: 'Moda e Roupas' },
  { id: 'calcados', name: 'Calçados e Acessórios de Moda' },
  { id: 'beleza', name: 'Beleza e Cuidado Pessoal' },
  { id: 'saude', name: 'Saúde e Cuidados Pessoais' },
  { id: 'esportes', name: 'Esportes e Fitness' },
  { id: 'brinquedos', name: 'Brinquedos e Hobbies' },
  { id: 'ferramentas', name: 'Ferramentas e Construção' },
  { id: 'alimentos', name: 'Alimentos e Bebidas' },
  { id: 'automotivo', name: 'Automotivo (acessórios)' },
  { id: 'geral', name: 'Outros / Geral' },
];

// ML commission rates by category (Clássico plan; Premium = Clássico + 5pp)
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

'@ | Set-Content -Path 'src/data/categories.ts' -Encoding UTF8

# src/data/marketplaces.ts
@'
// Legacy file — no longer used. Kept to avoid import errors during migration.
export {};

'@ | Set-Content -Path 'src/data/marketplaces.ts' -Encoding UTF8

# src/utils/calculations.ts
@'
import type {
  CalculatorInputs,
  MarketplaceResult,
  CostBreakdown,
  MLPlan,
  MLReputation,
} from '../types';
import { ML_CATEGORY_RATES, AMAZON_CATEGORY_RATES } from '../data/categories';

// ─── Mercado Livre ────────────────────────────────────────────────────────────

const ML_FIXED_FEE_TIERS = [
  { maxPrice: 12.5, fee: (p: number) => p * 0.5 },
  { maxPrice: 29.0, fee: () => 6.25 },
  { maxPrice: 50.0, fee: () => 6.5 },
  { maxPrice: 79.0, fee: () => 6.75 },
  { maxPrice: Infinity, fee: () => 0 },
];

function mlFixedFee(price: number): number {
  const tier = ML_FIXED_FEE_TIERS.find(t => price < t.maxPrice);
  return tier ? tier.fee(price) : 0;
}

function mlShippingCost(price: number, fullShipping: number, reputation: MLReputation): number {
  if (price < 19) return fullShipping;
  if (price < 79) return 0; // ML paga 100%
  const discount = reputation === 'verde' ? 0.7 : reputation === 'amarela' ? 0.6 : 0;
  return fullShipping * (1 - discount);
}

function mlShippingNote(price: number, reputation: MLReputation): string {
  if (price < 19) return 'Vendedor paga frete (produto < R$19)';
  if (price < 79) return 'ML paga o frete (R$19–R$78,99)';
  const pct = reputation === 'verde' ? 30 : reputation === 'amarela' ? 40 : 100;
  const label = reputation === 'verde' ? 'Verde/MercadoLíder' : reputation === 'amarela' ? 'Amarela' : 'Sem reputação';
  return `Vendedor paga ${pct}% do frete (rep. ${label})`;
}

function mlCommissionRate(category: string, plan: MLPlan): number {
  if (plan === 'gratis') return 0;
  const base = ML_CATEGORY_RATES[category] ?? 14;
  return plan === 'premium' ? base + 5 : base;
}

function solveMLPrice(inputs: CalculatorInputs): { price: number; fixedFee: number; shipping: number } {
  const { productCost, shippingCostFull, desiredMargin, category, mlPlan, mlReputation } = inputs;
  const rate = mlCommissionRate(category, mlPlan) / 100;
  const marginRate = desiredMargin / 100;

  if (mlPlan === 'gratis') {
    const price = productCost / (1 - marginRate);
    return { price, fixedFee: 0, shipping: shippingCostFull };
  }

  // Iterative solver: start without fixed fee, adjust based on resulting price tier
  let price = 0;
  let fixedFee = 0;
  let shipping = 0;
  let prevPrice = -1;

  for (let i = 0; i < 10 && Math.abs(price - prevPrice) > 0.01; i++) {
    prevPrice = price;
    // Use last computed price to estimate shipping and fixed fee
    const estPrice = price || 100; // start with estimate
    shipping = mlShippingCost(estPrice, shippingCostFull, mlReputation);
    fixedFee = mlFixedFee(estPrice);
    const denom = 1 - rate - marginRate;
    if (denom <= 0) { price = 0; break; }
    price = (productCost + shipping + fixedFee) / denom;
  }

  // Final pass: use computed price to get accurate shipping and fixed fee
  shipping = mlShippingCost(price, shippingCostFull, mlReputation);
  fixedFee = mlFixedFee(price);
  const denom = 1 - rate - marginRate;
  if (denom > 0) {
    price = (productCost + shipping + fixedFee) / denom;
  }

  return { price, fixedFee, shipping };
}

export function calculateML(inputs: CalculatorInputs): MarketplaceResult {
  const { productCost, shippingCostFull, calcMode, manualPrice, mlPlan, mlReputation, category } = inputs;
  const rate = mlCommissionRate(category, mlPlan);

  let price: number;
  let fixedFee: number;
  let shipping: number;

  if (calcMode === 'suggested_price') {
    const solved = solveMLPrice(inputs);
    price = solved.price;
    fixedFee = solved.fixedFee;
    shipping = solved.shipping;
  } else {
    price = manualPrice;
    shipping = mlShippingCost(price, shippingCostFull, mlReputation);
    fixedFee = mlFixedFee(price);
  }

  const commission = price * rate / 100;
  const totalFees = commission + fixedFee;
  const netProfit = price - productCost - shipping - commission - fixedFee;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const planNames: Record<string, string> = { gratis: 'Grátis', classico: 'Clássico', premium: 'Premium' };
  const tierNote = price >= 79 ? 'Sem custo fixo (≥ R$79)' : `Custo fixo: R$${fixedFee.toFixed(2)} (produto < R$79)`;

  const breakdown: CostBreakdown[] = [
    { label: 'Preço de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: `Frete (${mlShippingNote(price, mlReputation)})`, value: -shipping, type: 'cost' },
    { label: `Comissão (${rate}%)`, value: -commission, type: 'cost' },
    ...(fixedFee > 0 ? [{ label: `Custo fixo por unidade`, value: -fixedFee, type: 'cost' as const }] : []),
    { label: 'Lucro líquido', value: netProfit, type: 'profit' },
  ];

  return {
    marketplaceId: 'mercadolivre',
    marketplaceName: 'Mercado Livre',
    color: '#FFE600',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    logoText: 'ML',
    suggestedPrice: price,
    netProfit,
    netMargin,
    totalFees,
    effectiveFeeRate,
    shippingPaidBySeller: shipping,
    shippingNote: mlShippingNote(price, mlReputation),
    breakdown,
    tierNote,
    plan: planNames[mlPlan],
  };
}

// ─── Shopee ───────────────────────────────────────────────────────────────────

interface ShopeeTier {
  minPrice: number;
  maxPrice: number;
  commissionRate: number;
  fixedFee: number;
  label: string;
}

const SHOPEE_TIERS: ShopeeTier[] = [
  { minPrice: 0, maxPrice: 8, commissionRate: 50, fixedFee: 0, label: '< R$8 (50%)' },
  { minPrice: 8, maxPrice: 80, commissionRate: 20, fixedFee: 4, label: 'R$8–R$79,99 (20% + R$4)' },
  { minPrice: 80, maxPrice: 100, commissionRate: 14, fixedFee: 16, label: 'R$80–R$99,99 (14% + R$16)' },
  { minPrice: 100, maxPrice: 200, commissionRate: 14, fixedFee: 20, label: 'R$100–R$199,99 (14% + R$20)' },
  { minPrice: 200, maxPrice: Infinity, commissionRate: 14, fixedFee: 26, label: '≥ R$200 (14% + R$26)' },
];

const SHOPEE_TRANSACTION_FEE = 0.02; // 2%

function shopeeTier(price: number): ShopeeTier {
  return SHOPEE_TIERS.find(t => price >= t.minPrice && price < t.maxPrice) ?? SHOPEE_TIERS[SHOPEE_TIERS.length - 1];
}

export function calculateShopee(inputs: CalculatorInputs): MarketplaceResult {
  const { productCost, shippingCostFull, calcMode, manualPrice, desiredMargin } = inputs;

  let price: number;
  let tier: ShopeeTier;

  if (calcMode === 'suggested_price') {
    const marginRate = desiredMargin / 100;
    // Iterative solver
    price = 0;
    let prevPrice = -1;
    tier = SHOPEE_TIERS[SHOPEE_TIERS.length - 1]; // start with highest tier

    for (let i = 0; i < 10 && Math.abs(price - prevPrice) > 0.01; i++) {
      prevPrice = price;
      const t = price > 0 ? shopeeTier(price) : tier;
      tier = t;
      const totalRate = t.commissionRate / 100 + SHOPEE_TRANSACTION_FEE;
      const denom = 1 - totalRate - marginRate;
      if (denom <= 0) { price = 0; break; }
      price = (productCost + shippingCostFull + t.fixedFee) / denom;
    }
    tier = shopeeTier(price);
  } else {
    price = manualPrice;
    tier = shopeeTier(price);
  }

  const commission = price * tier.commissionRate / 100;
  const transactionFee = price * SHOPEE_TRANSACTION_FEE;
  const fixedFee = tier.fixedFee;
  const totalFees = commission + transactionFee + fixedFee;
  const netProfit = price - productCost - shippingCostFull - commission - transactionFee - fixedFee;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const breakdown: CostBreakdown[] = [
    { label: 'Preço de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: 'Frete/envio', value: -shippingCostFull, type: 'cost' },
    { label: `Comissão (${tier.commissionRate}%)`, value: -commission, type: 'cost' },
    { label: 'Taxa de transação (2%)', value: -transactionFee, type: 'cost' },
    ...(fixedFee > 0 ? [{ label: `Taxa fixa por item`, value: -fixedFee, type: 'cost' as const }] : []),
    { label: 'Lucro líquido', value: netProfit, type: 'profit' },
  ];

  return {
    marketplaceId: 'shopee',
    marketplaceName: 'Shopee',
    color: '#EE4D2D',
    bgColor: '#FFF5F5',
    borderColor: '#FCA5A5',
    logoText: 'SH',
    suggestedPrice: price,
    netProfit,
    netMargin,
    totalFees,
    effectiveFeeRate,
    shippingPaidBySeller: shippingCostFull,
    shippingNote: 'Vendedor responsável pelo envio',
    breakdown,
    tierNote: `Faixa Shopee: ${tier.label}`,
  };
}

// ─── Amazon ───────────────────────────────────────────────────────────────────

export function calculateAmazon(inputs: CalculatorInputs): MarketplaceResult {
  const { productCost, shippingCostFull, calcMode, manualPrice, desiredMargin, category, amazonPlan } = inputs;
  const catFees = AMAZON_CATEGORY_RATES[category] ?? { rate: 12 };
  const perItemFee = amazonPlan === 'individual' ? 2 : 0;

  let price: number;
  let rate: number;

  const computeRate = (p: number) => {
    if (catFees.splitAt && catFees.rateAbove && p > catFees.splitAt) {
      // Blended rate for split-threshold categories (e.g., accessories electronics)
      const portionBelow = Math.min(p, catFees.splitAt);
      const portionAbove = p - catFees.splitAt;
      return ((portionBelow * catFees.rate / 100) + (portionAbove * catFees.rateAbove / 100)) / p * 100;
    }
    return catFees.rate;
  };

  if (calcMode === 'suggested_price') {
    const marginRate = desiredMargin / 100;
    // Iterative for split-threshold (simple otherwise)
    price = 0;
    let prevPrice = -1;
    for (let i = 0; i < 5 && Math.abs(price - prevPrice) > 0.01; i++) {
      prevPrice = price;
      rate = computeRate(price || 100);
      const denom = 1 - rate / 100 - marginRate;
      if (denom <= 0) { price = 0; break; }
      price = (productCost + shippingCostFull + perItemFee) / denom;
    }
    rate = computeRate(price);
  } else {
    price = manualPrice;
    rate = computeRate(price);
  }

  const commission = price * rate / 100;
  const minFee = Math.max(commission, 1); // R$1 minimum commission
  const actualCommission = minFee;
  const totalFees = actualCommission + perItemFee;
  const netProfit = price - productCost - shippingCostFull - actualCommission - perItemFee;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const planLabel = amazonPlan === 'individual' ? 'Individual' : 'Profissional';

  const breakdown: CostBreakdown[] = [
    { label: 'Preço de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: 'Frete/envio', value: -shippingCostFull, type: 'cost' },
    { label: `Taxa de referência (${rate.toFixed(1)}%)`, value: -actualCommission, type: 'cost' },
    ...(perItemFee > 0 ? [{ label: 'Taxa por item (Plano Individual)', value: -perItemFee, type: 'cost' as const }] : []),
    { label: 'Lucro líquido', value: netProfit, type: 'profit' },
  ];

  return {
    marketplaceId: 'amazon',
    marketplaceName: 'Amazon',
    color: '#FF9900',
    bgColor: '#FFF9F0',
    borderColor: '#FCD34D',
    logoText: 'AMZ',
    suggestedPrice: price,
    netProfit,
    netMargin,
    totalFees,
    effectiveFeeRate,
    shippingPaidBySeller: shippingCostFull,
    shippingNote: 'Vendedor responsável pelo envio',
    breakdown,
    plan: `Plano ${planLabel}`,
  };
}

// ─── TikTok Shop ──────────────────────────────────────────────────────────────

const TIKTOK_COMMISSION = 0.06; // 6%
const TIKTOK_FIXED_FEE_THRESHOLD = 79;
const TIKTOK_FIXED_FEE = 4; // R$4 for items < R$79 (from Feb 2026)
const TIKTOK_SFP_RATE = 0.06; // 6% shipping program (optional)

function tiktokPaymentFee(price: number, method: 'pix' | 'cartao'): number {
  if (method === 'pix') return price * 0.0199;
  return price * 0.0299 + 0.40;
}

export function calculateTikTok(inputs: CalculatorInputs): MarketplaceResult {
  const { productCost, shippingCostFull, calcMode, manualPrice, desiredMargin, tiktokPayment, tiktokSFP } = inputs;

  const sfpRate = tiktokSFP ? TIKTOK_SFP_RATE : 0;
  const paymentLabel = tiktokPayment === 'pix' ? '1,99%' : '2,99% + R$0,40';

  let price: number;
  let fixedFee: number;

  if (calcMode === 'suggested_price') {
    const marginRate = desiredMargin / 100;
    price = 0;
    let prevPrice = -1;

    for (let i = 0; i < 10 && Math.abs(price - prevPrice) > 0.01; i++) {
      prevPrice = price;
      const estPrice = price || 100;
      const ff = estPrice < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE : 0;
      const payRate = tiktokPayment === 'pix' ? 0.0199 : 0.0299;
      const payFixed = tiktokPayment === 'cartao' ? 0.40 : 0;
      const totalRate = TIKTOK_COMMISSION + sfpRate + payRate;
      const denom = 1 - totalRate - marginRate;
      if (denom <= 0) { price = 0; break; }
      price = (productCost + shippingCostFull + ff + payFixed) / denom;
    }
    fixedFee = price < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE : 0;
  } else {
    price = manualPrice;
    fixedFee = price < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE : 0;
  }

  const commission = price * TIKTOK_COMMISSION;
  const sfpFee = price * sfpRate;
  const paymentFee = tiktokPaymentFee(price, tiktokPayment);
  const shippingCost = tiktokSFP ? 0 : shippingCostFull;
  const totalFees = commission + sfpFee + paymentFee + fixedFee;
  const netProfit = price - productCost - shippingCost - commission - sfpFee - paymentFee - fixedFee;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const tierNote = price < 79
    ? `Taxa fixa R$4 (produto < R$79) + pagamento ${paymentLabel}`
    : `Sem taxa fixa + pagamento ${paymentLabel}`;

  const breakdown: CostBreakdown[] = [
    { label: 'Preço de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: tiktokSFP ? 'Frete (SFP incluso)' : 'Frete/envio', value: -(tiktokSFP ? 0 : shippingCostFull), type: 'cost' },
    { label: 'Comissão da plataforma (6%)', value: -commission, type: 'cost' },
    ...(sfpFee > 0 ? [{ label: 'Programa de Frete (SFP 6%)', value: -sfpFee, type: 'cost' as const }] : []),
    { label: `Taxa de pagamento (${paymentLabel})`, value: -paymentFee, type: 'cost' },
    ...(fixedFee > 0 ? [{ label: `Taxa fixa por item (< R$79)`, value: -fixedFee, type: 'cost' as const }] : []),
    { label: 'Lucro líquido', value: netProfit, type: 'profit' },
  ];

  return {
    marketplaceId: 'tiktokshop',
    marketplaceName: 'TikTok Shop',
    color: '#010101',
    bgColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    logoText: 'TT',
    suggestedPrice: price,
    netProfit,
    netMargin,
    totalFees,
    effectiveFeeRate,
    shippingPaidBySeller: tiktokSFP ? 0 : shippingCostFull,
    shippingNote: tiktokSFP ? 'Frete via programa SFP (6%)' : 'Vendedor responsável pelo envio',
    breakdown,
    tierNote,
  };
}

// ─── Run all ──────────────────────────────────────────────────────────────────

export function calculateAll(inputs: CalculatorInputs): MarketplaceResult[] {
  return [
    calculateML(inputs),
    calculateShopee(inputs),
    calculateAmazon(inputs),
    calculateTikTok(inputs),
  ].sort((a, b) => {
    if (inputs.calcMode === 'suggested_price') return a.suggestedPrice - b.suggestedPrice;
    return b.netMargin - a.netMargin;
  });
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

'@ | Set-Content -Path 'src/utils/calculations.ts' -Encoding UTF8

# src/App.tsx
@'
import { useState, useMemo } from 'react';
import type { CalculatorInputs } from './types';
import { calculateAll } from './utils/calculations';
import { InputForm } from './components/InputForm';
import { MarketplaceCard } from './components/MarketplaceCard';
import { ComparisonTable } from './components/ComparisonTable';
import { TaxInfoPanel } from './components/TaxInfoPanel';
import './index.css';

const DEFAULT_INPUTS: CalculatorInputs = {
  productCost: 50,
  shippingCostFull: 15,
  desiredMargin: 20,
  category: 'eletronicos',
  calcMode: 'suggested_price',
  manualPrice: 0,
  mlPlan: 'classico',
  mlReputation: 'verde',
  amazonPlan: 'profissional',
  tiktokPayment: 'pix',
  tiktokSFP: false,
};

type Tab = 'cards' | 'table' | 'taxes';

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [activeTab, setActiveTab] = useState<Tab>('cards');

  const results = useMemo(() => calculateAll(inputs), [inputs]);

  const hasInputs = inputs.productCost > 0 || inputs.shippingCostFull > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-lg">🛒</span>
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-lg leading-tight m-0">Sellerin</h1>
              <p className="text-xs text-slate-500 leading-tight m-0">Calculadora de Marketplaces</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            4 marketplaces
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 m-0">
            Precifique em todos os marketplaces
          </h2>
          <p className="text-slate-500 text-sm m-0">
            Calcule o preço ideal ou verifique sua margem em Mercado Livre, Shopee, Amazon e TikTok Shop — simultaneamente.
          </p>
        </div>

        {/* Form */}
        <InputForm inputs={inputs} onChange={setInputs} />

        {/* Tabs */}
        {hasInputs && (
          <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
            {([
              { id: 'cards' as Tab, label: '📦 Cards', count: results.length },
              { id: 'table' as Tab, label: '📊 Tabela' },
              { id: 'taxes' as Tab, label: 'ℹ️ Taxas' },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {!hasInputs && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-3">💰</div>
            <p className="font-semibold text-slate-600 m-0">Informe o custo do produto para calcular</p>
            <p className="text-sm mt-1 m-0">Preencha os campos acima e veja os resultados em tempo real</p>
          </div>
        )}

        {hasInputs && activeTab === 'cards' && (
          <div>
            {results.length > 0 && (
              <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Margem ≥ 15%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> 8–15%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> &lt; 8%
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.map((result, index) => (
                <MarketplaceCard
                  key={result.marketplaceId}
                  result={result}
                  rank={index + 1}
                  calcMode={inputs.calcMode}
                />
              ))}
            </div>
          </div>
        )}

        {hasInputs && activeTab === 'table' && (
          <ComparisonTable results={results} calcMode={inputs.calcMode} />
        )}

        {activeTab === 'taxes' && (
          <TaxInfoPanel selectedCategory={inputs.category} />
        )}

        {/* Footer note */}
        <div className="text-center text-xs text-slate-400 pb-6">
          <p className="m-0">⚠️ Os valores das taxas são estimativas baseadas em dados públicos (2025/2026). Verifique sempre as taxas atualizadas em cada plataforma.</p>
          <p className="mt-1 m-0">Mercado Livre · Shopee · Amazon Brasil · TikTok Shop</p>
        </div>
      </main>
    </div>
  );
}

'@ | Set-Content -Path 'src/App.tsx' -Encoding UTF8

# src/components/InputForm.tsx
@'
import type { CalculatorInputs, MLPlan, MLReputation, AmazonPlan, TikTokPayment } from '../types';
import { CATEGORIES } from '../data/categories';

interface Props {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, prefix, suffix, placeholder }: {
  value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">{prefix}</span>}
      <input
        type="number" min="0" step="0.01"
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder ?? '0,00'}
        className={`w-full py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white ${prefix ? 'pl-9' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{suffix}</span>}
    </div>
  );
}

function ToggleGroup<T extends string>({ options, value, onChange, size = 'md' }: {
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border transition-all text-left ${size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'} ${
            value === opt.value
              ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {opt.label}
          {opt.sub && <span className={`block text-xs ${value === opt.value ? 'text-indigo-200' : 'text-slate-400'}`}>{opt.sub}</span>}
        </button>
      ))}
    </div>
  );
}

export function InputForm({ inputs, onChange }: Props) {
  const set = <K extends keyof CalculatorInputs>(key: K, val: CalculatorInputs[K]) =>
    onChange({ ...inputs, [key]: val });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
        <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
        <h2 className="text-base font-bold text-slate-800 m-0">Dados do Produto</h2>
      </div>

      {/* Calc Mode */}
      <Field label="Modo de cálculo">
        <ToggleGroup
          value={inputs.calcMode}
          onChange={v => set('calcMode', v)}
          options={[
            { value: 'suggested_price', label: '💡 Calcular preço ideal' },
            { value: 'check_margin', label: '📊 Verificar margem' },
          ]}
        />
      </Field>

      {/* Main inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Custo do produto">
          <NumberInput value={inputs.productCost} onChange={v => set('productCost', v)} prefix="R$" />
        </Field>
        <Field label="Custo do frete">
          <NumberInput value={inputs.shippingCostFull} onChange={v => set('shippingCostFull', v)} prefix="R$" />
        </Field>
        {inputs.calcMode === 'suggested_price' ? (
          <Field label="Margem desejada">
            <NumberInput value={inputs.desiredMargin} onChange={v => set('desiredMargin', v)} suffix="%" placeholder="20" />
          </Field>
        ) : (
          <Field label="Preço de venda">
            <NumberInput value={inputs.manualPrice} onChange={v => set('manualPrice', v)} prefix="R$" />
          </Field>
        )}
        <Field label="Categoria">
          <select
            value={inputs.category}
            onChange={e => set('category', e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      {/* ML Settings */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-3">
        <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide">⚡ Mercado Livre</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Plano de anúncio">
            <ToggleGroup<MLPlan>
              value={inputs.mlPlan}
              onChange={v => set('mlPlan', v)}
              size="sm"
              options={[
                { value: 'gratis', label: 'Grátis', sub: '0%' },
                { value: 'classico', label: 'Clássico', sub: '11-14%' },
                { value: 'premium', label: 'Premium', sub: '16-19%' },
              ]}
            />
          </Field>
          <Field label="Reputação (afeta custo frete > R$79)">
            <ToggleGroup<MLReputation>
              value={inputs.mlReputation}
              onChange={v => set('mlReputation', v)}
              size="sm"
              options={[
                { value: 'verde', label: '🟢 Verde / MercadoLíder', sub: '70% desc. frete' },
                { value: 'amarela', label: '🟡 Amarela', sub: '60% desc.' },
                { value: 'sem_reputacao', label: '⚪ Sem reputação', sub: 'paga integral' },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* Amazon Settings */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
        <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">📦 Amazon</p>
        <Field label="Plano do vendedor">
          <ToggleGroup<AmazonPlan>
            value={inputs.amazonPlan}
            onChange={v => set('amazonPlan', v)}
            size="sm"
            options={[
              { value: 'individual', label: 'Individual', sub: '+R$2/item' },
              { value: 'profissional', label: 'Profissional', sub: 'R$19/mês' },
            ]}
          />
        </Field>
      </div>

      {/* TikTok Settings */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">🎵 TikTok Shop</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Método de pagamento">
            <ToggleGroup<TikTokPayment>
              value={inputs.tiktokPayment}
              onChange={v => set('tiktokPayment', v)}
              size="sm"
              options={[
                { value: 'pix', label: 'Pix', sub: '1,99%' },
                { value: 'cartao', label: 'Cartão', sub: '2,99% + R$0,40' },
              ]}
            />
          </Field>
          <Field label="Programa de frete (SFP)">
            <ToggleGroup
              value={inputs.tiktokSFP ? 'sim' : 'nao'}
              onChange={v => set('tiktokSFP', v === 'sim')}
              size="sm"
              options={[
                { value: 'nao', label: 'Não usar', sub: 'frete próprio' },
                { value: 'sim', label: 'Usar SFP', sub: '+6% plataforma' },
              ]}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

'@ | Set-Content -Path 'src/components/InputForm.tsx' -Encoding UTF8

# src/components/MarketplaceCard.tsx
@'
import { useState } from 'react';
import type { MarketplaceResult } from '../types';
import type { CalcMode } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface Props {
  result: MarketplaceResult;
  rank: number;
  calcMode: CalcMode;
}

const LOGO_COLORS: Record<string, string> = {
  mercadolivre: '#D97706',
  shopee: '#EE4D2D',
  amazon: '#FF9900',
  tiktokshop: '#010101',
};

export function MarketplaceCard({ result, rank, calcMode }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isGood = result.netMargin >= 15;
  const isOk = result.netMargin >= 8 && result.netMargin < 15;
  const isBad = result.netMargin < 8;

  const marginColor = isGood ? 'text-emerald-600' : isOk ? 'text-amber-600' : 'text-red-500';
  const marginBg = isGood
    ? 'bg-emerald-50 border-emerald-200'
    : isOk
    ? 'bg-amber-50 border-amber-200'
    : 'bg-red-50 border-red-200';

  const logoColor = LOGO_COLORS[result.marketplaceId] ?? '#374151';

  return (
    <div
      className="bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200"
      style={{ borderColor: result.borderColor }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: result.bgColor }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: logoColor }}
          >
            {result.logoText}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight m-0">{result.marketplaceName}</p>
            {result.plan && <p className="text-xs text-slate-500 m-0">{result.plan}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {rank === 1 && calcMode === 'suggested_price' && (
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              ✓ Menor preço
            </span>
          )}
          {rank === 1 && calcMode === 'check_margin' && (
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              ✓ Maior margem
            </span>
          )}
        </div>
      </div>

      {/* Main values */}
      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5 m-0">
              {calcMode === 'suggested_price' ? 'Preço sugerido' : 'Preço informado'}
            </p>
            <p className="text-xl font-black text-slate-800 m-0 leading-tight">
              {formatCurrency(result.suggestedPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5 m-0">Lucro líquido</p>
            <p className={`text-xl font-black m-0 leading-tight ${result.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {formatCurrency(result.netProfit)}
            </p>
          </div>
        </div>

        {/* Margin */}
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 border ${marginBg}`}>
          <span className="text-xs font-semibold text-slate-600">Margem líquida</span>
          <span className={`text-sm font-black ${marginColor}`}>
            {formatPercent(result.netMargin)}
            {isBad && ' ⚠️'}
            {isGood && ' ✓'}
          </span>
        </div>

        {/* Fee summary */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Total de taxas ({formatPercent(result.effectiveFeeRate, 1)})</span>
            <span className="font-semibold text-red-500">-{formatCurrency(result.totalFees)}</span>
          </div>
          {result.shippingPaidBySeller > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 truncate pr-2">{result.shippingNote}</span>
              <span className="font-semibold text-red-500 flex-shrink-0">-{formatCurrency(result.shippingPaidBySeller)}</span>
            </div>
          )}
          {result.shippingPaidBySeller === 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 truncate pr-2">{result.shippingNote}</span>
              <span className="font-semibold text-emerald-600 flex-shrink-0">R$ 0,00</span>
            </div>
          )}
        </div>

        {/* Tier note */}
        {result.tierNote && (
          <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-2.5 py-1.5 leading-relaxed">
            ℹ️ {result.tierNote}
          </div>
        )}
      </div>

      {/* Expandable breakdown */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1 transition-colors"
        >
          {expanded ? '▲ Ocultar detalhamento' : '▼ Ver detalhamento completo'}
        </button>
        {expanded && (
          <div className="px-4 pb-4 space-y-1.5 border-t border-slate-100 pt-3">
            {result.breakdown.map((item, i) => (
              <div
                key={i}
                className={`flex justify-between text-xs rounded-md px-2 py-1.5 ${
                  item.type === 'profit'
                    ? item.value >= 0 ? 'bg-emerald-50 font-bold' : 'bg-red-50 font-bold'
                    : item.type === 'revenue'
                    ? 'bg-blue-50 font-semibold'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className={
                  item.type === 'profit' ? (item.value >= 0 ? 'text-emerald-700' : 'text-red-600')
                  : item.type === 'revenue' ? 'text-blue-700'
                  : 'text-slate-600'
                }>
                  {item.label}
                </span>
                <span className={
                  item.type === 'profit' ? (item.value >= 0 ? 'text-emerald-700' : 'text-red-600')
                  : item.type === 'revenue' ? 'text-blue-700'
                  : 'text-red-500'
                }>
                  {item.value >= 0 ? formatCurrency(item.value) : `-${formatCurrency(Math.abs(item.value))}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'@ | Set-Content -Path 'src/components/MarketplaceCard.tsx' -Encoding UTF8

# src/components/ComparisonTable.tsx
@'
import type { MarketplaceResult } from '../types';
import type { CalcMode } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface Props {
  results: MarketplaceResult[];
  calcMode: CalcMode;
}

const LOGO_COLORS: Record<string, string> = {
  mercadolivre: '#D97706',
  shopee: '#EE4D2D',
  amazon: '#FF9900',
  tiktokshop: '#010101',
};

export function ComparisonTable({ results, calcMode }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800 m-0">Comparativo — todos os marketplaces</h2>
        <p className="text-xs text-slate-500 mt-0.5 m-0">
          {calcMode === 'suggested_price' ? 'Ordenado pelo menor preço sugerido' : 'Ordenado pela maior margem'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-6">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Marketplace</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {calcMode === 'suggested_price' ? 'Preço sugerido' : 'Preço'}
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total taxas</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Frete vendedor</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lucro</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Margem</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const isGood = r.netMargin >= 15;
              const isOk = r.netMargin >= 8 && r.netMargin < 15;
              const logoColor = LOGO_COLORS[r.marketplaceId] ?? '#374151';
              return (
                <tr
                  key={r.marketplaceId}
                  className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="px-4 py-3 text-slate-400 font-medium text-center">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ backgroundColor: logoColor }}
                      >
                        {r.logoText.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm m-0">{r.marketplaceName}</p>
                        {r.plan && <p className="text-xs text-slate-400 m-0">{r.plan}</p>}
                      </div>
                      {i === 0 && (
                        <span className="ml-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          ✓ Melhor
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    {formatCurrency(r.suggestedPrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-red-500 font-medium">{formatCurrency(r.totalFees)}</span>
                    <span className="text-slate-400 text-xs ml-1">({formatPercent(r.effectiveFeeRate, 1)})</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.shippingPaidBySeller === 0
                      ? <span className="text-emerald-600 font-medium text-xs">ML paga ✓</span>
                      : <span className="text-red-500 font-medium">{formatCurrency(r.shippingPaidBySeller)}</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span className={r.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {formatCurrency(r.netProfit)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      isGood ? 'bg-emerald-100 text-emerald-700'
                      : isOk ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-600'
                    }`}>
                      {formatPercent(r.netMargin)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'@ | Set-Content -Path 'src/components/ComparisonTable.tsx' -Encoding UTF8

# src/components/TaxInfoPanel.tsx
@'
import { CATEGORIES, ML_CATEGORY_RATES, AMAZON_CATEGORY_RATES } from '../data/categories';

interface Props {
  selectedCategory: string;
}

export function TaxInfoPanel({ selectedCategory }: Props) {
  const category = CATEGORIES.find(c => c.id === selectedCategory);
  const mlRate = ML_CATEGORY_RATES[selectedCategory] ?? 14;
  const amazonRate = AMAZON_CATEGORY_RATES[selectedCategory]?.rate ?? 12;

  return (
    <div className="space-y-4">
      {/* Category-specific rates */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 m-0">Taxas por marketplace</h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            Categoria: <strong>{category?.name || 'Geral'}</strong>
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Mercado Livre */}
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white bg-amber-600">ML</div>
              <p className="font-bold text-slate-800 text-sm m-0">Mercado Livre</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Grátis</span><span className="font-bold text-slate-800">0%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Clássico</span><span className="font-bold text-slate-800">{mlRate}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Premium</span><span className="font-bold text-slate-800">{mlRate + 5}%</span></div>
              <div className="border-t border-yellow-200 pt-1 mt-1">
                <p className="text-slate-400 leading-relaxed">Taxa fixa (Clássico/Premium):<br/>≤R$12,50 → 50% · R$12,50–29 → R$6,25<br/>R$29–50 → R$6,50 · R$50–79 → R$6,75<br/>≥R$79 → sem taxa fixa</p>
              </div>
            </div>
          </div>

          {/* Shopee */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white bg-red-500">SH</div>
              <p className="font-bold text-slate-800 text-sm m-0">Shopee</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">&lt; R$8</span><span className="font-bold text-slate-800">50%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">R$8–R$80</span><span className="font-bold text-slate-800">20% + R$4</span></div>
              <div className="flex justify-between"><span className="text-slate-500">R$80–R$100</span><span className="font-bold text-slate-800">14% + R$16</span></div>
              <div className="flex justify-between"><span className="text-slate-500">R$100–R$200</span><span className="font-bold text-slate-800">14% + R$20</span></div>
              <div className="flex justify-between"><span className="text-slate-500">≥ R$200</span><span className="font-bold text-slate-800">14% + R$26</span></div>
              <div className="border-t border-orange-200 pt-1 mt-1">
                <p className="text-slate-400">+ 2% taxa de transação em todas as faixas. Frete PFG incluso na taxa de 20% (R$8–R$80).</p>
              </div>
            </div>
          </div>

          {/* Amazon */}
          <div className="rounded-xl border border-orange-300 bg-orange-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white bg-orange-500">AMZ</div>
              <p className="font-bold text-slate-800 text-sm m-0">Amazon</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Taxa referência</span><span className="font-bold text-slate-800">{amazonRate}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mínimo por item</span><span className="font-bold text-slate-800">R$ 1,00</span></div>
              <div className="border-t border-orange-200 pt-1 mt-1">
                <p className="text-slate-400">Individual: +R$2,00/item<br/>Profissional: R$19,00/mês<br/>Vendedor responsável pelo frete.</p>
              </div>
            </div>
          </div>

          {/* TikTok Shop */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white bg-slate-800">TT</div>
              <p className="font-bold text-slate-800 text-sm m-0">TikTok Shop</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Comissão</span><span className="font-bold text-slate-800">6%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Taxa fixa (&lt;R$79)</span><span className="font-bold text-slate-800">R$ 4,00</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pix</span><span className="font-bold text-slate-800">1,99%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Cartão</span><span className="font-bold text-slate-800">2,99% + R$0,40</span></div>
              <div className="border-t border-slate-200 pt-1 mt-1">
                <p className="text-slate-400">SFP (frete plataforma): +6% opcional.<br/>Lançamento Brasil: mai/2025.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ML Freight rules */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 m-0">Frete Mercado Livre (Mercado Envios)</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
              <p className="font-bold text-red-700 mb-1 m-0">Preço &lt; R$19</p>
              <p className="text-slate-600 m-0">Vendedor paga 100% do custo do frete</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5">
              <p className="font-bold text-emerald-700 mb-1 m-0">R$19 a R$78,99</p>
              <p className="text-slate-600 m-0">ML paga o frete — vendedor não arca com nada</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
              <p className="font-bold text-amber-700 mb-1 m-0">Preço ≥ R$79 (por reputação)</p>
              <p className="text-slate-600 m-0">🟢 Verde/ML Líder: 70% desconto<br/>🟡 Amarela: 60% desconto<br/>⚪ Sem reputação: paga integral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'@ | Set-Content -Path 'src/components/TaxInfoPanel.tsx' -Encoding UTF8

Write-Host "" 
Write-Host "Arquivos criados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  npm install"
Write-Host "  npm run build"
Write-Host "  git add -A"
Write-Host "  git commit -m feat: calculadora-4-marketplaces"
Write-Host "  git push -u origin claude/epic-hawking-D8tca"