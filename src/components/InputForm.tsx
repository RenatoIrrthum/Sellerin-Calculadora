import type { CalculatorInputs, MLPlan, MLReputation, AmazonPlan, TikTokPayment } from '../types';
import { CATEGORIES } from '../data/categories';
import { calcAcquisitionCost, getMLFreightCost, formatCurrency } from '../utils/calculations';

interface Props {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  min,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  step?: number;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        min={min ?? 0}
        step={step ?? 0.01}
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder ?? '0,00'}
        className={`w-full py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white ${prefix ? 'pl-9' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
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
          className={`rounded-lg border transition-all text-left ${
            size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
          } ${
            value === opt.value
              ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {opt.label}
          {opt.sub && (
            <span
              className={`block text-xs ${
                value === opt.value ? 'text-indigo-200' : 'text-slate-400'
              }`}
            >
              {opt.sub}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({
  number,
  title,
  badgeBg,
  badgeText,
}: {
  number: string;
  title: string;
  badgeBg?: string;
  badgeText?: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-2 mb-1">
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0"
        style={{
          backgroundColor: badgeBg ?? '#EEF2FF',
          color: badgeText ?? '#4F46E5',
        }}
      >
        {number}
      </span>
      <h3 className="text-sm font-bold text-slate-800 m-0">{title}</h3>
    </div>
  );
}

export function InputForm({ inputs, onChange }: Props) {
  const set = <K extends keyof CalculatorInputs>(key: K, val: CalculatorInputs[K]) =>
    onChange({ ...inputs, [key]: val });

  const acquisitionCost = calcAcquisitionCost(
    inputs.supplierPrice,
    inputs.ipi,
    inputs.icmsEntrada,
  );

  const mlFreightFull = getMLFreightCost(inputs.productWeight);

  return (
    <div className="space-y-4">
      {/* ── Section 1: Custo do Produto ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 border-l-4" style={{ borderLeftColor: '#4F46E5' }}>
        <SectionHeader number="1" title="Custo do Produto" />
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Preco do Fornecedor (R$)">
              <NumberInput
                value={inputs.supplierPrice}
                onChange={v => set('supplierPrice', v)}
                prefix="R$"
                placeholder="50,00"
              />
            </Field>
            <Field label="IPI (%)">
              <NumberInput
                value={inputs.ipi}
                onChange={v => set('ipi', v)}
                suffix="%"
                placeholder="0"
                step={0.5}
              />
            </Field>
            <Field label="ICMS Entrada (%)">
              <NumberInput
                value={inputs.icmsEntrada}
                onChange={v => set('icmsEntrada', v)}
                suffix="%"
                placeholder="12"
                step={0.5}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <Field label="Peso do Produto (g)">
              <NumberInput
                value={inputs.productWeight}
                onChange={v => set('productWeight', v)}
                suffix="g"
                placeholder="500"
                step={1}
              />
            </Field>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Custo de Aquisicao Calculado
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                <span className="text-xl font-black text-indigo-700">
                  {formatCurrency(acquisitionCost)}
                </span>
                <span className="text-xs text-indigo-400 leading-tight">
                  = Fornecedor x (1 + IPI%) - credito ICMS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Configuracoes de Venda ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <SectionHeader number="2" title="Configuracoes de Venda" />
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Categoria">
              <select
                value={inputs.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Margem Desejada (%)">
              <NumberInput
                value={inputs.desiredMargin}
                onChange={v => set('desiredMargin', v)}
                suffix="%"
                placeholder="20"
                step={0.5}
              />
            </Field>
            <Field label="Aliquota Impostos Venda (%)">
              <NumberInput
                value={inputs.salesTaxRate}
                onChange={v => set('salesTaxRate', v)}
                suffix="%"
                placeholder="0"
                step={0.5}
              />
            </Field>
          </div>
          <Field label="Modo de Calculo">
            <ToggleGroup
              value={inputs.calcMode}
              onChange={v => set('calcMode', v)}
              options={[
                { value: 'suggested_price', label: 'Calcular Preco Ideal' },
                { value: 'check_margin', label: 'Verificar Margem' },
              ]}
            />
          </Field>
          {inputs.calcMode === 'check_margin' && (
            <div className="max-w-xs">
              <Field label="Preco de Venda Manual (R$)">
                <NumberInput
                  value={inputs.manualPrice}
                  onChange={v => set('manualPrice', v)}
                  prefix="R$"
                  placeholder="0,00"
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 3: Mercado Livre ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-3 pb-2 mb-2">
          <div className="px-2.5 py-1 rounded-lg text-xs font-black border-2 bg-yellow-50 border-amber-400 text-amber-800">
            ML
          </div>
          <h3 className="text-sm font-bold text-slate-800 m-0">Mercado Livre</h3>
          <span className="ml-auto text-xs text-slate-500 font-medium">
            Frete estimado: <span className="font-bold text-slate-700">{formatCurrency(mlFreightFull)}</span>
            <span className="text-slate-400"> ({inputs.productWeight}g)</span>
          </span>
        </div>
        <div className="space-y-3">
          <Field label="Plano de Anuncio">
            <ToggleGroup<MLPlan>
              value={inputs.mlPlan}
              onChange={v => set('mlPlan', v)}
              size="sm"
              options={[
                { value: 'gratis', label: 'Gratis', sub: '0%' },
                { value: 'classico', label: 'Classico', sub: '11-14%' },
                { value: 'premium', label: 'Premium', sub: '16-19%' },
              ]}
            />
          </Field>
          <Field label="Reputacao (desconto no frete para preco acima de R$79)">
            <ToggleGroup<MLReputation>
              value={inputs.mlReputation}
              onChange={v => set('mlReputation', v)}
              size="sm"
              options={[
                { value: 'verde', label: 'Verde / ML Lider', sub: '70% desc. frete' },
                { value: 'amarela', label: 'Amarela', sub: '60% desc.' },
                { value: 'sem_reputacao', label: 'Sem reputacao', sub: 'paga integral' },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* ── Section 4: Amazon ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-3 pb-2 mb-2">
          <div className="px-2.5 py-1 rounded-lg text-xs font-black border-2 bg-orange-50 border-orange-400 text-orange-800">
            AMZ
          </div>
          <h3 className="text-sm font-bold text-slate-800 m-0">Amazon</h3>
        </div>
        <Field label="Plano do Vendedor">
          <ToggleGroup<AmazonPlan>
            value={inputs.amazonPlan}
            onChange={v => set('amazonPlan', v)}
            size="sm"
            options={[
              { value: 'individual', label: 'Individual', sub: '+R$2/item' },
              { value: 'profissional', label: 'Profissional', sub: 'R$19/mes' },
            ]}
          />
        </Field>
      </div>

      {/* ── Section 5: TikTok Shop ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-3 pb-2 mb-2">
          <div className="px-2.5 py-1 rounded-lg text-xs font-black border-2 bg-slate-900 border-slate-700 text-white">
            TT
          </div>
          <h3 className="text-sm font-bold text-slate-800 m-0">TikTok Shop</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Metodo de Pagamento">
            <ToggleGroup<TikTokPayment>
              value={inputs.tiktokPayment}
              onChange={v => set('tiktokPayment', v)}
              size="sm"
              options={[
                { value: 'pix', label: 'Pix', sub: '1,99%' },
                { value: 'cartao', label: 'Cartao', sub: '2,99% + R$0,40' },
              ]}
            />
          </Field>
          <Field label="Programa de Frete (SFP)">
            <ToggleGroup
              value={inputs.tiktokSFP ? 'sim' : 'nao'}
              onChange={v => set('tiktokSFP', v === 'sim')}
              size="sm"
              options={[
                { value: 'nao', label: 'Nao usar', sub: 'frete proprio' },
                { value: 'sim', label: 'Usar SFP', sub: '+6% plataforma' },
              ]}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
