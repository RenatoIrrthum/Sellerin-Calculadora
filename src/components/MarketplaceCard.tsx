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
              âœ“ Menor preÃ§o
            </span>
          )}
          {rank === 1 && calcMode === 'check_margin' && (
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              âœ“ Maior margem
            </span>
          )}
        </div>
      </div>

      {/* Main values */}
      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5 m-0">
              {calcMode === 'suggested_price' ? 'PreÃ§o sugerido' : 'PreÃ§o informado'}
            </p>
            <p className="text-xl font-black text-slate-800 m-0 leading-tight">
              {formatCurrency(result.suggestedPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5 m-0">Lucro lÃ­quido</p>
            <p className={`text-xl font-black m-0 leading-tight ${result.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {formatCurrency(result.netProfit)}
            </p>
          </div>
        </div>

        {/* Margin */}
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 border ${marginBg}`}>
          <span className="text-xs font-semibold text-slate-600">Margem lÃ­quida</span>
          <span className={`text-sm font-black ${marginColor}`}>
            {formatPercent(result.netMargin)}
            {isBad && ' âš ï¸'}
            {isGood && ' âœ“'}
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
            â„¹ï¸ {result.tierNote}
          </div>
        )}
      </div>

      {/* Expandable breakdown */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1 transition-colors"
        >
          {expanded ? 'â–² Ocultar detalhamento' : 'â–¼ Ver detalhamento completo'}
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

