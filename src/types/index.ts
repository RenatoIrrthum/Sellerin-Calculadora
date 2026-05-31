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

