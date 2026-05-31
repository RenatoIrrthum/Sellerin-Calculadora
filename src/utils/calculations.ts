import type {
  CalculatorInputs,
  MarketplaceResult,
  CostBreakdown,
  MLPlan,
  MLReputation,
} from '../types';
import { ML_CATEGORY_RATES, AMAZON_CATEGORY_RATES } from '../data/categories';

// â”€â”€â”€ Mercado Livre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  if (price < 79) return 'ML paga o frete (R$19â€“R$78,99)';
  const pct = reputation === 'verde' ? 30 : reputation === 'amarela' ? 40 : 100;
  const label = reputation === 'verde' ? 'Verde/MercadoLÃ­der' : reputation === 'amarela' ? 'Amarela' : 'Sem reputaÃ§Ã£o';
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

  const planNames: Record<string, string> = { gratis: 'GrÃ¡tis', classico: 'ClÃ¡ssico', premium: 'Premium' };
  const tierNote = price >= 79 ? 'Sem custo fixo (â‰¥ R$79)' : `Custo fixo: R$${fixedFee.toFixed(2)} (produto < R$79)`;

  const breakdown: CostBreakdown[] = [
    { label: 'PreÃ§o de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: `Frete (${mlShippingNote(price, mlReputation)})`, value: -shipping, type: 'cost' },
    { label: `ComissÃ£o (${rate}%)`, value: -commission, type: 'cost' },
    ...(fixedFee > 0 ? [{ label: `Custo fixo por unidade`, value: -fixedFee, type: 'cost' as const }] : []),
    { label: 'Lucro lÃ­quido', value: netProfit, type: 'profit' },
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

// â”€â”€â”€ Shopee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ShopeeTier {
  minPrice: number;
  maxPrice: number;
  commissionRate: number;
  fixedFee: number;
  label: string;
}

const SHOPEE_TIERS: ShopeeTier[] = [
  { minPrice: 0, maxPrice: 8, commissionRate: 50, fixedFee: 0, label: '< R$8 (50%)' },
  { minPrice: 8, maxPrice: 80, commissionRate: 20, fixedFee: 4, label: 'R$8â€“R$79,99 (20% + R$4)' },
  { minPrice: 80, maxPrice: 100, commissionRate: 14, fixedFee: 16, label: 'R$80â€“R$99,99 (14% + R$16)' },
  { minPrice: 100, maxPrice: 200, commissionRate: 14, fixedFee: 20, label: 'R$100â€“R$199,99 (14% + R$20)' },
  { minPrice: 200, maxPrice: Infinity, commissionRate: 14, fixedFee: 26, label: 'â‰¥ R$200 (14% + R$26)' },
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
    { label: 'PreÃ§o de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: 'Frete/envio', value: -shippingCostFull, type: 'cost' },
    { label: `ComissÃ£o (${tier.commissionRate}%)`, value: -commission, type: 'cost' },
    { label: 'Taxa de transaÃ§Ã£o (2%)', value: -transactionFee, type: 'cost' },
    ...(fixedFee > 0 ? [{ label: `Taxa fixa por item`, value: -fixedFee, type: 'cost' as const }] : []),
    { label: 'Lucro lÃ­quido', value: netProfit, type: 'profit' },
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
    shippingNote: 'Vendedor responsÃ¡vel pelo envio',
    breakdown,
    tierNote: `Faixa Shopee: ${tier.label}`,
  };
}

// â”€â”€â”€ Amazon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    { label: 'PreÃ§o de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: 'Frete/envio', value: -shippingCostFull, type: 'cost' },
    { label: `Taxa de referÃªncia (${rate.toFixed(1)}%)`, value: -actualCommission, type: 'cost' },
    ...(perItemFee > 0 ? [{ label: 'Taxa por item (Plano Individual)', value: -perItemFee, type: 'cost' as const }] : []),
    { label: 'Lucro lÃ­quido', value: netProfit, type: 'profit' },
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
    shippingNote: 'Vendedor responsÃ¡vel pelo envio',
    breakdown,
    plan: `Plano ${planLabel}`,
  };
}

// â”€â”€â”€ TikTok Shop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    { label: 'PreÃ§o de venda', value: price, type: 'revenue' },
    { label: 'Custo do produto', value: -productCost, type: 'cost' },
    { label: tiktokSFP ? 'Frete (SFP incluso)' : 'Frete/envio', value: -(tiktokSFP ? 0 : shippingCostFull), type: 'cost' },
    { label: 'ComissÃ£o da plataforma (6%)', value: -commission, type: 'cost' },
    ...(sfpFee > 0 ? [{ label: 'Programa de Frete (SFP 6%)', value: -sfpFee, type: 'cost' as const }] : []),
    { label: `Taxa de pagamento (${paymentLabel})`, value: -paymentFee, type: 'cost' },
    ...(fixedFee > 0 ? [{ label: `Taxa fixa por item (< R$79)`, value: -fixedFee, type: 'cost' as const }] : []),
    { label: 'Lucro lÃ­quido', value: netProfit, type: 'profit' },
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
    shippingNote: tiktokSFP ? 'Frete via programa SFP (6%)' : 'Vendedor responsÃ¡vel pelo envio',
    breakdown,
    tierNote,
  };
}

// â”€â”€â”€ Run all â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Formatters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

