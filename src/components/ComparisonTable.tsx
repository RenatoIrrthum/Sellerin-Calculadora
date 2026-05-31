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
        <h2 className="text-base font-bold text-slate-800 m-0">Comparativo â€” todos os marketplaces</h2>
        <p className="text-xs text-slate-500 mt-0.5 m-0">
          {calcMode === 'suggested_price' ? 'Ordenado pelo menor preÃ§o sugerido' : 'Ordenado pela maior margem'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-6">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Marketplace</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {calcMode === 'suggested_price' ? 'PreÃ§o sugerido' : 'PreÃ§o'}
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
                          âœ“ Melhor
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
                      ? <span className="text-emerald-600 font-medium text-xs">ML paga âœ“</span>
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

