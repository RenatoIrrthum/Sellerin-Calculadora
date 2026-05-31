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
            Categoria: <strong>{category?.name ?? 'Geral'}</strong>
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Mercado Livre */}
          <div className="rounded-xl border-2 border-amber-300 bg-yellow-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-amber-400 text-black">
                ML
              </div>
              <p className="font-bold text-slate-800 text-sm m-0">Mercado Livre</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gratis</span>
                <span className="font-bold text-slate-800">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Classico</span>
                <span className="font-bold text-slate-800">{mlRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Premium</span>
                <span className="font-bold text-slate-800">{mlRate + 5}%</span>
              </div>
              <div className="border-t border-amber-200 pt-1.5 mt-1">
                <p className="text-slate-400 leading-relaxed m-0">
                  Taxa fixa (Classico/Premium):<br />
                  Menor que R$12,50 -&gt; 50% · R$12,50 a 29 -&gt; R$6,25<br />
                  R$29 a 50 -&gt; R$6,50 · R$50 a 79 -&gt; R$6,75<br />
                  Maior que R$79 -&gt; sem taxa fixa
                </p>
              </div>
            </div>
          </div>

          {/* Shopee */}
          <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-red-500 text-white">
                SH
              </div>
              <p className="font-bold text-slate-800 text-sm m-0">Shopee</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Menor que R$8</span>
                <span className="font-bold text-slate-800">50%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">R$8 a R$80</span>
                <span className="font-bold text-slate-800">20% + R$4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">R$80 a R$100</span>
                <span className="font-bold text-slate-800">14% + R$16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">R$100 a R$200</span>
                <span className="font-bold text-slate-800">14% + R$20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maior que R$200</span>
                <span className="font-bold text-slate-800">14% + R$26</span>
              </div>
              <div className="border-t border-orange-200 pt-1.5 mt-1">
                <p className="text-slate-400 m-0">
                  + 2% taxa de transacao em todas as faixas. Frete PFG incluso na taxa de 20% (R$8 a R$80).
                </p>
              </div>
            </div>
          </div>

          {/* Amazon */}
          <div className="rounded-xl border-2 border-orange-400 bg-orange-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-orange-500 text-white">
                AMZ
              </div>
              <p className="font-bold text-slate-800 text-sm m-0">Amazon</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Taxa referencia</span>
                <span className="font-bold text-slate-800">{amazonRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Minimo por item</span>
                <span className="font-bold text-slate-800">R$ 1,00</span>
              </div>
              <div className="border-t border-orange-200 pt-1.5 mt-1">
                <p className="text-slate-400 m-0">
                  Individual: +R$2,00/item<br />
                  Profissional: R$19,00/mes<br />
                  Vendedor responsavel pelo frete.
                </p>
              </div>
            </div>
          </div>

          {/* TikTok Shop */}
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-slate-900 text-white">
                TT
              </div>
              <p className="font-bold text-slate-800 text-sm m-0">TikTok Shop</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Comissao</span>
                <span className="font-bold text-slate-800">6%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Taxa fixa (menor que R$79)</span>
                <span className="font-bold text-slate-800">R$ 4,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pix</span>
                <span className="font-bold text-slate-800">1,99%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cartao</span>
                <span className="font-bold text-slate-800">2,99% + R$0,40</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 mt-1">
                <p className="text-slate-400 m-0">
                  SFP (frete plataforma): +6% opcional.<br />
                  Lancamento Brasil: mai/2025.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ML Freight rules */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 m-0">
            Frete Mercado Livre (Mercado Envios)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            Regras de quem paga o frete por faixa de preco do produto
          </p>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
              <p className="font-bold text-red-700 mb-1 m-0">Preco menor que R$19</p>
              <p className="text-slate-600 m-0">
                Vendedor paga 100% do custo do frete
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5">
              <p className="font-bold text-emerald-700 mb-1 m-0">R$19 a R$78,99</p>
              <p className="text-slate-600 m-0">
                ML paga o frete — vendedor nao arca com nada
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
              <p className="font-bold text-amber-700 mb-1 m-0">
                Preco maior ou igual a R$79 (por reputacao)
              </p>
              <p className="text-slate-600 m-0 space-y-0.5">
                <span className="block">Verde / ML Lider: 70% desconto no frete</span>
                <span className="block">Amarela: 60% desconto</span>
                <span className="block">Sem reputacao: paga integral</span>
              </p>
            </div>
          </div>

          {/* Freight weight table */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Tabela de frete por peso (valores base)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 text-xs">
              {[
                { label: 'Ate 300g', value: 'R$ 8,90' },
                { label: '301 a 700g', value: 'R$ 12,50' },
                { label: '701 a 1000g', value: 'R$ 14,90' },
                { label: '1001 a 2000g', value: 'R$ 18,90' },
                { label: '2001 a 5000g', value: 'R$ 25,90' },
                { label: '5001 a 10000g', value: 'R$ 38,90' },
                { label: '10001 a 20000g', value: 'R$ 60,00' },
                { label: '20001 a 30000g', value: 'R$ 85,00' },
                { label: 'Acima de 30000g', value: 'R$ 120,00' },
              ].map(row => (
                <div
                  key={row.label}
                  className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-md px-2.5 py-1.5"
                >
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-bold text-slate-700 ml-2">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
