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
              <span className="text-white text-lg">ðŸ›’</span>
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
            Calcule o preÃ§o ideal ou verifique sua margem em Mercado Livre, Shopee, Amazon e TikTok Shop â€” simultaneamente.
          </p>
        </div>

        {/* Form */}
        <InputForm inputs={inputs} onChange={setInputs} />

        {/* Tabs */}
        {hasInputs && (
          <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
            {([
              { id: 'cards' as Tab, label: 'ðŸ“¦ Cards', count: results.length },
              { id: 'table' as Tab, label: 'ðŸ“Š Tabela' },
              { id: 'taxes' as Tab, label: 'â„¹ï¸ Taxas' },
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
            <div className="text-5xl mb-3">ðŸ’°</div>
            <p className="font-semibold text-slate-600 m-0">Informe o custo do produto para calcular</p>
            <p className="text-sm mt-1 m-0">Preencha os campos acima e veja os resultados em tempo real</p>
          </div>
        )}

        {hasInputs && activeTab === 'cards' && (
          <div>
            {results.length > 0 && (
              <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Margem â‰¥ 15%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> 8â€“15%
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
          <p className="m-0">âš ï¸ Os valores das taxas sÃ£o estimativas baseadas em dados pÃºblicos (2025/2026). Verifique sempre as taxas atualizadas em cada plataforma.</p>
          <p className="mt-1 m-0">Mercado Livre Â· Shopee Â· Amazon Brasil Â· TikTok Shop</p>
        </div>
      </main>
    </div>
  );
}

