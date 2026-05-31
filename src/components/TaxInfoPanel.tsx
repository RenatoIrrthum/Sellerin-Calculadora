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
              <div className="flex justify-between"><span className="text-slate-500">GrÃ¡tis</span><span className="font-bold text-slate-800">0%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">ClÃ¡ssico</span><span className="font-bold text-slate-800">{mlRate}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Premium</span><span className="font-bold text-slate-800">{mlRate + 5}%</span></div>
              <div className="border-t border-yellow-200 pt-1 mt-1">
                <p className="text-slate-400 leading-relaxed">Taxa fixa (ClÃ¡ssico/Premium):<br/>â‰¤R$12,50 â†’ 50% Â· R$12,50â€“29 â†’ R$6,25<br/>R$29â€“50 â†’ R$6,50 Â· R$50â€“79 â†’ R$6,75<br/>â‰¥R$79 â†’ sem taxa fixa</p>
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
              <div className="flex justify-between"><span className="text-slate-500">R$8â€“R$80</span><span className="font-bold text-slate-800">20% + R$4</span></div>
              <div className="flex justify-between"><span className="text-slate-500">R$80â€“R$100</span><span className="font-bold text-slate-800">14% + R$16</span></div>
              <div className="flex justify-between"><span className="text-slate-500">R$100â€“R$200</span><span className="font-bold text-slate-800">14% + R$20</span></div>
              <div className="flex justify-between"><span className="text-slate-500">â‰¥ R$200</span><span className="font-bold text-slate-800">14% + R$26</span></div>
              <div className="border-t border-orange-200 pt-1 mt-1">
                <p className="text-slate-400">+ 2% taxa de transaÃ§Ã£o em todas as faixas. Frete PFG incluso na taxa de 20% (R$8â€“R$80).</p>
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
              <div className="flex justify-between"><span className="text-slate-500">Taxa referÃªncia</span><span className="font-bold text-slate-800">{amazonRate}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">MÃ­nimo por item</span><span className="font-bold text-slate-800">R$ 1,00</span></div>
              <div className="border-t border-orange-200 pt-1 mt-1">
                <p className="text-slate-400">Individual: +R$2,00/item<br/>Profissional: R$19,00/mÃªs<br/>Vendedor responsÃ¡vel pelo frete.</p>
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
              <div className="flex justify-between"><span className="text-slate-500">ComissÃ£o</span><span className="font-bold text-slate-800">6%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Taxa fixa (&lt;R$79)</span><span className="font-bold text-slate-800">R$ 4,00</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pix</span><span className="font-bold text-slate-800">1,99%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">CartÃ£o</span><span className="font-bold text-slate-800">2,99% + R$0,40</span></div>
              <div className="border-t border-slate-200 pt-1 mt-1">
                <p className="text-slate-400">SFP (frete plataforma): +6% opcional.<br/>LanÃ§amento Brasil: mai/2025.</p>
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
              <p className="font-bold text-red-700 mb-1 m-0">PreÃ§o &lt; R$19</p>
              <p className="text-slate-600 m-0">Vendedor paga 100% do custo do frete</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5">
              <p className="font-bold text-emerald-700 mb-1 m-0">R$19 a R$78,99</p>
              <p className="text-slate-600 m-0">ML paga o frete â€” vendedor nÃ£o arca com nada</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
              <p className="font-bold text-amber-700 mb-1 m-0">PreÃ§o â‰¥ R$79 (por reputaÃ§Ã£o)</p>
              <p className="text-slate-600 m-0">ðŸŸ¢ Verde/ML LÃ­der: 70% desconto<br/>ðŸŸ¡ Amarela: 60% desconto<br/>âšª Sem reputaÃ§Ã£o: paga integral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

