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
      <Field label="Modo de cÃ¡lculo">
        <ToggleGroup
          value={inputs.calcMode}
          onChange={v => set('calcMode', v)}
          options={[
            { value: 'suggested_price', label: 'ðŸ’¡ Calcular preÃ§o ideal' },
            { value: 'check_margin', label: 'ðŸ“Š Verificar margem' },
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
          <Field label="PreÃ§o de venda">
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
        <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide">âš¡ Mercado Livre</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Plano de anÃºncio">
            <ToggleGroup<MLPlan>
              value={inputs.mlPlan}
              onChange={v => set('mlPlan', v)}
              size="sm"
              options={[
                { value: 'gratis', label: 'GrÃ¡tis', sub: '0%' },
                { value: 'classico', label: 'ClÃ¡ssico', sub: '11-14%' },
                { value: 'premium', label: 'Premium', sub: '16-19%' },
              ]}
            />
          </Field>
          <Field label="ReputaÃ§Ã£o (afeta custo frete > R$79)">
            <ToggleGroup<MLReputation>
              value={inputs.mlReputation}
              onChange={v => set('mlReputation', v)}
              size="sm"
              options={[
                { value: 'verde', label: 'ðŸŸ¢ Verde / MercadoLÃ­der', sub: '70% desc. frete' },
                { value: 'amarela', label: 'ðŸŸ¡ Amarela', sub: '60% desc.' },
                { value: 'sem_reputacao', label: 'âšª Sem reputaÃ§Ã£o', sub: 'paga integral' },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* Amazon Settings */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
        <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">ðŸ“¦ Amazon</p>
        <Field label="Plano do vendedor">
          <ToggleGroup<AmazonPlan>
            value={inputs.amazonPlan}
            onChange={v => set('amazonPlan', v)}
            size="sm"
            options={[
              { value: 'individual', label: 'Individual', sub: '+R$2/item' },
              { value: 'profissional', label: 'Profissional', sub: 'R$19/mÃªs' },
            ]}
          />
        </Field>
      </div>

      {/* TikTok Settings */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">ðŸŽµ TikTok Shop</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="MÃ©todo de pagamento">
            <ToggleGroup<TikTokPayment>
              value={inputs.tiktokPayment}
              onChange={v => set('tiktokPayment', v)}
              size="sm"
              options={[
                { value: 'pix', label: 'Pix', sub: '1,99%' },
                { value: 'cartao', label: 'CartÃ£o', sub: '2,99% + R$0,40' },
              ]}
            />
          </Field>
          <Field label="Programa de frete (SFP)">
            <ToggleGroup
              value={inputs.tiktokSFP ? 'sim' : 'nao'}
              onChange={v => set('tiktokSFP', v === 'sim')}
              size="sm"
              options={[
                { value: 'nao', label: 'NÃ£o usar', sub: 'frete prÃ³prio' },
                { value: 'sim', label: 'Usar SFP', sub: '+6% plataforma' },
              ]}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

