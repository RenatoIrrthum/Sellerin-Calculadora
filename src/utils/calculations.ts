import type {
  CalculatorInputs,
  MarketplaceResult,
  CostBreakdown,
  MLPlan,
  MLReputation,
} from '../types';
import { ML_CATEGORY_RATES, AMAZON_CATEGORY_RATES } from '../data/categories';

// ─── Acquisition Cost ─────────────────────────────────────────────────────────

export function calcAcquisitionCost(
  supplierPrice: number,
  ipi: number,
  icmsEntrada: number,
): number {
  return supplierPrice * (1 + ipi / 100) - supplierPrice * (icmsEntrada / 100);
}

// ─── ML Freight ───────────────────────────────────────────────────────────────

const ML_FREIGHT_TABLE: { maxWeight: number; cost: number }[] = [
  { maxWeight: 300, cost: 8.9 },
  { maxWeight: 700, cost: 12.5 },
  { maxWeight: 1000, cost: 14.9 },
  { maxWeight: 2000, cost: 18.9 },
  { maxWeight: 5000, cost: 25.9 },
  { maxWeight: 10000, cost: 38.9 },
  { maxWeight: 20000, cost: 60.0 },
  { maxWeight: 30000, cost: 85.0 },
  { maxWeight: Infinity, cost: 120.0 },
];

export function getMLFreightCost(weightGrams: number): number {
  const tier = ML_FREIGHT_TABLE.find(t => weightGrams <= t.maxWeight);
  return tier ? tier.cost : 120.0;
}

// ─── ML helpers ───────────────────────────────────────────────────────────────

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

function mlShippingCost(
  price: number,
  freightFull: number,
  reputation: MLReputation,
): number {
  if (price < 19) return freightFull;
  if (price < 79) return 0;
  const discount =
    reputation === 'verde' ? 0.7 : reputation === 'amarela' ? 0.6 : 0;
  return freightFull * (1 - discount);
}

function mlShippingNote(price: number, reputation: MLReputation): string {
  if (price < 19) return 'Vendedor paga frete (produto < R$19)';
  if (price < 79) return 'ML paga o frete (R$19 a R$78,99)';
  const pct =
    reputation === 'verde' ? 30 : reputation === 'amarela' ? 40 : 100;
  const label =
    reputation === 'verde'
      ? 'Verde/MercadoLider'
      : reputation === 'amarela'
      ? 'Amarela'
      : 'Sem reputacao';
  return `Vendedor paga ${pct}% do frete (rep. ${label})`;
}

function mlCommissionRate(category: string, plan: MLPlan): number {
  if (plan === 'gratis') return 0;
  const base = ML_CATEGORY_RATES[category] ?? 14;
  return plan === 'premium' ? base + 5 : base;
}

function solveMLPrice(
  acquisitionCost: number,
  freightFull: number,
  salesTaxRate: number,
  inputs: CalculatorInputs,
): { price: number; fixedFee: number; shipping: number } {
  const { desiredMargin, category, mlPlan, mlReputation } = inputs;
  const rate = mlCommissionRate(category, mlPlan) / 100;
  const marginRate = desiredMargin / 100;
  const salesTax = salesTaxRate / 100;

  if (mlPlan === 'gratis') {
    const denom = 1 - marginRate - salesTax;
    const price = denom > 0 ? acquisitionCost / denom : 0;
    return { price, fixedFee: 0, shipping: freightFull };
  }

  let price = 0;
  let fixedFee = 0;
  let shipping = 0;
  let prevPrice = -1;

  for (let i = 0; i < 20 && Math.abs(price - prevPrice) > 0.001; i++) {
    prevPrice = price;
    const estPrice = price || 100;
    shipping = mlShippingCost(estPrice, freightFull, mlReputation);
    fixedFee = mlFixedFee(estPrice);
    const denom = 1 - rate - marginRate - salesTax;
    if (denom <= 0) {
      price = 0;
      break;
    }
    price = (acquisitionCost + shipping + fixedFee) / denom;
  }

  shipping = mlShippingCost(price, freightFull, mlReputation);
  fixedFee = mlFixedFee(price);
  const denom = 1 - rate - marginRate - salesTax;
  if (denom > 0) {
    price = (acquisitionCost + shipping + fixedFee) / denom;
  }

  return { price, fixedFee, shipping };
}

export function calculateML(inputs: CalculatorInputs): MarketplaceResult {
  const {
    supplierPrice,
    ipi,
    icmsEntrada,
    productWeight,
    salesTaxRate,
    calcMode,
    manualPrice,
    mlPlan,
    mlReputation,
    category,
  } = inputs;

  const acquisitionCost = calcAcquisitionCost(supplierPrice, ipi, icmsEntrada);
  const freightFull = getMLFreightCost(productWeight);
  const rate = mlCommissionRate(category, mlPlan);

  let price: number;
  let fixedFee: number;
  let shipping: number;

  if (calcMode === 'suggested_price') {
    const solved = solveMLPrice(acquisitionCost, freightFull, salesTaxRate, inputs);
    price = solved.price;
    fixedFee = solved.fixedFee;
    shipping = solved.shipping;
  } else {
    price = manualPrice;
    shipping = mlShippingCost(price, freightFull, mlReputation);
    fixedFee = mlFixedFee(price);
  }

  const commission = (price * rate) / 100;
  const salesTaxAmount = (price * salesTaxRate) / 100;
  const totalFees = commission + fixedFee + salesTaxAmount;
  const netProfit = price - acquisitionCost - shipping - commission - fixedFee - salesTaxAmount;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const planNames: Record<string, string> = {
    gratis: 'Gratis',
    classico: 'Classico',
    premium: 'Premium',
  };
  const tierNote =
    price >= 79
      ? 'Sem custo fixo (>= R$79)'
      : `Custo fixo: R$${fixedFee.toFixed(2)} (produto < R$79)`;

  const breakdown: CostBreakdown[] = [
    { label: 'Preco de venda', value: price, type: 'revenue' },
    { label: 'Custo de aquisicao', value: -acquisitionCost, type: 'cost' },
    {
      label: `Frete (${mlShippingNote(price, mlReputation)})`,
      value: -shipping,
      type: 'cost',
    },
    { label: `Comissao (${rate}%)`, value: -commission, type: 'cost' },
    ...(fixedFee > 0
      ? [
          {
            label: 'Custo fixo por unidade',
            value: -fixedFee,
            type: 'cost' as const,
          },
        ]
      : []),
    ...(salesTaxAmount > 0
      ? [
          {
            label: `Impostos venda (${salesTaxRate}%)`,
            value: -salesTaxAmount,
            type: 'cost' as const,
          },
        ]
      : []),
    { label: 'Lucro liquido', value: netProfit, type: 'profit' },
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
  { minPrice: 8, maxPrice: 80, commissionRate: 20, fixedFee: 4, label: 'R$8 a R$79,99 (20% + R$4)' },
  { minPrice: 80, maxPrice: 100, commissionRate: 14, fixedFee: 16, label: 'R$80 a R$99,99 (14% + R$16)' },
  { minPrice: 100, maxPrice: 200, commissionRate: 14, fixedFee: 20, label: 'R$100 a R$199,99 (14% + R$20)' },
  { minPrice: 200, maxPrice: Infinity, commissionRate: 14, fixedFee: 26, label: '>= R$200 (14% + R$26)' },
];

const SHOPEE_TRANSACTION_FEE = 0.02;

function shopeeTier(price: number): ShopeeTier {
  return (
    SHOPEE_TIERS.find(t => price >= t.minPrice && price < t.maxPrice) ??
    SHOPEE_TIERS[SHOPEE_TIERS.length - 1]
  );
}

export function calculateShopee(inputs: CalculatorInputs): MarketplaceResult {
  const {
    supplierPrice,
    ipi,
    icmsEntrada,
    productWeight,
    salesTaxRate,
    calcMode,
    manualPrice,
    desiredMargin,
  } = inputs;

  const acquisitionCost = calcAcquisitionCost(supplierPrice, ipi, icmsEntrada);
  const freightFull = getMLFreightCost(productWeight);
  const salesTax = salesTaxRate / 100;

  let price: number;
  let tier: ShopeeTier;

  if (calcMode === 'suggested_price') {
    const marginRate = desiredMargin / 100;
    price = 0;
    let prevPrice = -1;
    tier = SHOPEE_TIERS[SHOPEE_TIERS.length - 1];

    for (let i = 0; i < 20 && Math.abs(price - prevPrice) > 0.001; i++) {
      prevPrice = price;
      const t = price > 0 ? shopeeTier(price) : tier;
      tier = t;
      const totalRate = t.commissionRate / 100 + SHOPEE_TRANSACTION_FEE + salesTax;
      const denom = 1 - totalRate - marginRate;
      if (denom <= 0) {
        price = 0;
        break;
      }
      price = (acquisitionCost + freightFull + t.fixedFee) / denom;
    }
    tier = shopeeTier(price);
  } else {
    price = manualPrice;
    tier = shopeeTier(price);
  }

  const commission = (price * tier.commissionRate) / 100;
  const transactionFee = price * SHOPEE_TRANSACTION_FEE;
  const fixedFee = tier.fixedFee;
  const salesTaxAmount = price * salesTax;
  const totalFees = commission + transactionFee + fixedFee + salesTaxAmount;
  const netProfit =
    price - acquisitionCost - freightFull - commission - transactionFee - fixedFee - salesTaxAmount;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const breakdown: CostBreakdown[] = [
    { label: 'Preco de venda', value: price, type: 'revenue' },
    { label: 'Custo de aquisicao', value: -acquisitionCost, type: 'cost' },
    { label: 'Frete/envio', value: -freightFull, type: 'cost' },
    { label: `Comissao (${tier.commissionRate}%)`, value: -commission, type: 'cost' },
    { label: 'Taxa de transacao (2%)', value: -transactionFee, type: 'cost' },
    ...(fixedFee > 0
      ? [{ label: 'Taxa fixa por item', value: -fixedFee, type: 'cost' as const }]
      : []),
    ...(salesTaxAmount > 0
      ? [
          {
            label: `Impostos venda (${salesTaxRate}%)`,
            value: -salesTaxAmount,
            type: 'cost' as const,
          },
        ]
      : []),
    { label: 'Lucro liquido', value: netProfit, type: 'profit' },
  ];

  return {
    marketplaceId: 'shopee',
    marketplaceName: 'Shopee',
    color: '#FF6633',
    bgColor: '#FFF5F5',
    borderColor: '#FCA5A5',
    logoText: 'SH',
    suggestedPrice: price,
    netProfit,
    netMargin,
    totalFees,
    effectiveFeeRate,
    shippingPaidBySeller: freightFull,
    shippingNote: 'Vendedor responsavel pelo envio',
    breakdown,
    tierNote: `Faixa Shopee: ${tier.label}`,
  };
}

// ─── Amazon ───────────────────────────────────────────────────────────────────

export function calculateAmazon(inputs: CalculatorInputs): MarketplaceResult {
  const {
    supplierPrice,
    ipi,
    icmsEntrada,
    productWeight,
    salesTaxRate,
    calcMode,
    manualPrice,
    desiredMargin,
    category,
    amazonPlan,
  } = inputs;

  const acquisitionCost = calcAcquisitionCost(supplierPrice, ipi, icmsEntrada);
  const freightFull = getMLFreightCost(productWeight);
  const catFees = AMAZON_CATEGORY_RATES[category] ?? { rate: 12 };
  const perItemFee = amazonPlan === 'individual' ? 2 : 0;
  const salesTax = salesTaxRate / 100;

  const computeRate = (p: number) => {
    if (catFees.splitAt && catFees.rateAbove && p > catFees.splitAt) {
      const portionBelow = Math.min(p, catFees.splitAt);
      const portionAbove = p - catFees.splitAt;
      return (
        ((portionBelow * catFees.rate) / 100 +
          (portionAbove * catFees.rateAbove) / 100) /
        p *
        100
      );
    }
    return catFees.rate;
  };

  let price: number;
  let rate: number;

  if (calcMode === 'suggested_price') {
    const marginRate = desiredMargin / 100;
    price = 0;
    let prevPrice = -1;
    rate = catFees.rate;
    for (let i = 0; i < 10 && Math.abs(price - prevPrice) > 0.001; i++) {
      prevPrice = price;
      rate = computeRate(price || 100);
      const denom = 1 - rate / 100 - marginRate - salesTax;
      if (denom <= 0) {
        price = 0;
        break;
      }
      price = (acquisitionCost + freightFull + perItemFee) / denom;
    }
    rate = computeRate(price);
  } else {
    price = manualPrice;
    rate = computeRate(price);
  }

  const commission = (price * rate) / 100;
  const actualCommission = Math.max(commission, 1);
  const salesTaxAmount = price * salesTax;
  const totalFees = actualCommission + perItemFee + salesTaxAmount;
  const netProfit =
    price - acquisitionCost - freightFull - actualCommission - perItemFee - salesTaxAmount;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const planLabel = amazonPlan === 'individual' ? 'Individual' : 'Profissional';

  const breakdown: CostBreakdown[] = [
    { label: 'Preco de venda', value: price, type: 'revenue' },
    { label: 'Custo de aquisicao', value: -acquisitionCost, type: 'cost' },
    { label: 'Frete/envio', value: -freightFull, type: 'cost' },
    {
      label: `Taxa de referencia (${rate.toFixed(1)}%)`,
      value: -actualCommission,
      type: 'cost',
    },
    ...(perItemFee > 0
      ? [
          {
            label: 'Taxa por item (Plano Individual)',
            value: -perItemFee,
            type: 'cost' as const,
          },
        ]
      : []),
    ...(salesTaxAmount > 0
      ? [
          {
            label: `Impostos venda (${salesTaxRate}%)`,
            value: -salesTaxAmount,
            type: 'cost' as const,
          },
        ]
      : []),
    { label: 'Lucro liquido', value: netProfit, type: 'profit' },
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
    shippingPaidBySeller: freightFull,
    shippingNote: 'Vendedor responsavel pelo envio',
    breakdown,
    plan: `Plano ${planLabel}`,
  };
}

// ─── TikTok Shop ──────────────────────────────────────────────────────────────

const TIKTOK_COMMISSION = 0.06;
const TIKTOK_FIXED_FEE_THRESHOLD = 79;
const TIKTOK_FIXED_FEE = 4;
const TIKTOK_SFP_RATE = 0.06;

function tiktokPaymentFee(price: number, method: 'pix' | 'cartao'): number {
  if (method === 'pix') return price * 0.0199;
  return price * 0.0299 + 0.4;
}

export function calculateTikTok(inputs: CalculatorInputs): MarketplaceResult {
  const {
    supplierPrice,
    ipi,
    icmsEntrada,
    productWeight,
    salesTaxRate,
    calcMode,
    manualPrice,
    desiredMargin,
    tiktokPayment,
    tiktokSFP,
  } = inputs;

  const acquisitionCost = calcAcquisitionCost(supplierPrice, ipi, icmsEntrada);
  const freightFull = getMLFreightCost(productWeight);
  const sfpRate = tiktokSFP ? TIKTOK_SFP_RATE : 0;
  const paymentLabel = tiktokPayment === 'pix' ? '1,99%' : '2,99% + R$0,40';
  const salesTax = salesTaxRate / 100;

  let price: number;
  let fixedFee: number;

  if (calcMode === 'suggested_price') {
    const marginRate = desiredMargin / 100;
    price = 0;
    let prevPrice = -1;

    for (let i = 0; i < 20 && Math.abs(price - prevPrice) > 0.001; i++) {
      prevPrice = price;
      const estPrice = price || 100;
      const ff =
        estPrice < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE : 0;
      const payRate = tiktokPayment === 'pix' ? 0.0199 : 0.0299;
      const payFixed = tiktokPayment === 'cartao' ? 0.4 : 0;
      const shippingCost = tiktokSFP ? 0 : freightFull;
      const totalRate = TIKTOK_COMMISSION + sfpRate + payRate + salesTax;
      const denom = 1 - totalRate - marginRate;
      if (denom <= 0) {
        price = 0;
        break;
      }
      price = (acquisitionCost + shippingCost + ff + payFixed) / denom;
    }
    fixedFee = price < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE : 0;
  } else {
    price = manualPrice;
    fixedFee =
      price < TIKTOK_FIXED_FEE_THRESHOLD ? TIKTOK_FIXED_FEE : 0;
  }

  const commission = price * TIKTOK_COMMISSION;
  const sfpFee = price * sfpRate;
  const paymentFee = tiktokPaymentFee(price, tiktokPayment);
  const salesTaxAmount = price * salesTax;
  const shippingCost = tiktokSFP ? 0 : freightFull;
  const totalFees = commission + sfpFee + paymentFee + fixedFee + salesTaxAmount;
  const netProfit =
    price -
    acquisitionCost -
    shippingCost -
    commission -
    sfpFee -
    paymentFee -
    fixedFee -
    salesTaxAmount;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const effectiveFeeRate = price > 0 ? (totalFees / price) * 100 : 0;

  const tierNote =
    price < 79
      ? `Taxa fixa R$4 (produto < R$79) + pagamento ${paymentLabel}`
      : `Sem taxa fixa + pagamento ${paymentLabel}`;

  const breakdown: CostBreakdown[] = [
    { label: 'Preco de venda', value: price, type: 'revenue' },
    { label: 'Custo de aquisicao', value: -acquisitionCost, type: 'cost' },
    {
      label: tiktokSFP ? 'Frete (SFP incluso)' : 'Frete/envio',
      value: -shippingCost,
      type: 'cost',
    },
    { label: 'Comissao da plataforma (6%)', value: -commission, type: 'cost' },
    ...(sfpFee > 0
      ? [
          {
            label: 'Programa de Frete (SFP 6%)',
            value: -sfpFee,
            type: 'cost' as const,
          },
        ]
      : []),
    {
      label: `Taxa de pagamento (${paymentLabel})`,
      value: -paymentFee,
      type: 'cost',
    },
    ...(fixedFee > 0
      ? [
          {
            label: 'Taxa fixa por item (< R$79)',
            value: -fixedFee,
            type: 'cost' as const,
          },
        ]
      : []),
    ...(salesTaxAmount > 0
      ? [
          {
            label: `Impostos venda (${salesTaxRate}%)`,
            value: -salesTaxAmount,
            type: 'cost' as const,
          },
        ]
      : []),
    { label: 'Lucro liquido', value: netProfit, type: 'profit' },
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
    shippingPaidBySeller: shippingCost,
    shippingNote: tiktokSFP
      ? 'Frete via programa SFP (6%)'
      : 'Vendedor responsavel pelo envio',
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
    if (inputs.calcMode === 'suggested_price')
      return a.suggestedPrice - b.suggestedPrice;
    return b.netMargin - a.netMargin;
  });
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
