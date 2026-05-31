import { useState, useMemo } from 'react';
import type { CalculatorInputs } from './types';
import { calculateAll } from './utils/calculations';
import { InputForm } from './components/InputForm';
import { MarketplaceCard } from './components/MarketplaceCard';
import { ComparisonTable } from './components/ComparisonTable';
import { TaxInfoPanel } from './components/TaxInfoPanel';
import './index.css';

const DEFAULT_INPUTS: CalculatorInputs = {
  supplierPrice: 50,
  ipi: 0,
  icmsEntrada: 12,
  productWeight: 500,
  salesTaxRate: 0,
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

function SellerinLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="#4F46E5" />
        <path
          d="M11 14.5C11 13.1 12.1 12 13.5 12H18C20.2 12 22 13.8 22 16C22 17.1 21.6 18.1 20.9 18.8C22.1 19.5 23 20.8 23 22.3C23 24.7 21.0 26.5 18.5 26.5H13C12.4 26.5 12 26.1 12 25.5V13C12 13 11 14.5 11 14.5ZM14 17.5H17.5C18.6 17.5 19.5 16.6 19.5 15.5C19.5 14.4 18.6 13.5 17.5 13.5H14V17.5ZM14 25H18C19.4 25 20.5 23.9 20.5 22.5C20.5 21.1 19.4 20 18 20H14V25Z"
          fill="white"
        />
      </svg>
      <div>
        <h1 className="font-black text-slate-900 text-lg leading-tight m-0">Sellerin</h1>
        <p className="text-xs text-slate-500 leading-tight m-0">Calculadora de Marketplaces</p>
      </div>
    </div>
  );
}

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [activeTab, setActiveTab] = useState<Tab>('cards');

  const results = useMemo(() => calculateAll(inputs), [inputs]);

  const hasInputs = inputs.supplierPrice > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <SellerinLogo />
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
            Calcule o preco ideal ou verifique sua margem em Mercado Livre, Shopee, Amazon e TikTok Shop simultaneamente.
          </p>
        </div>

        {/* Form */}
        <InputForm inputs={inputs} onChange={setInputs} />

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {([
            { id: 'cards' as Tab, label: 'Cards', count: results.length },
            { id: 'table' as Tab, label: 'Tabela' },
            { id: 'taxes' as Tab, label: 'Taxas' },
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

        {/* Results */}
        {!hasInputs && (
          <div className="text-center py-16 text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm1 18h-2v-2h2v2zm0-4h-2V10h2v8z" fill="#94A3B8"/>
              </svg>
            </div>
            <p className="font-semibold text-slate-600 m-0">Informe o preco do fornecedor para calcular</p>
            <p className="text-sm mt-1 m-0">Preencha os campos acima e veja os resultados em tempo real</p>
          </div>
        )}

        {hasInputs && activeTab === 'cards' && (
          <div>
            {results.length > 0 && (
              <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Margem maior que 15%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> 8-15%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Menor que 8%
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
          <p className="m-0">Atencao: Os valores das taxas sao estimativas baseadas em dados publicos (2025/2026). Verifique sempre as taxas atualizadas em cada plataforma.</p>
          <p className="mt-1 m-0">Mercado Livre · Shopee · Amazon Brasil · TikTok Shop</p>
        </div>
      </main>
    </div>
  );
}
