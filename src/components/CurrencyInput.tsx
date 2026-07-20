import type { InputHTMLAttributes } from 'react';
import '@/styles/CurrencyInput.scss';

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
>;

interface CurrencyInputProps extends NativeInputProps {
  value: number;
  onChange: (value: number) => void;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseCurrencyDigits = (rawValue: string) => {
  const digitsOnly = rawValue.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  return Number.parseInt(digitsOnly, 10) / 100;
};

const CurrencyInput = ({ id, className, value, onChange, ...rest }: CurrencyInputProps) => {
  return (
    <div className={`currency-input ${className ?? ''}`}>
      <span className="currency-input__prefix" aria-hidden="true">R$</span>
      <input
        {...rest}
        id={id}
        className="currency-input__field"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={formatCurrency(value)}
        onChange={(e) => onChange(parseCurrencyDigits(e.target.value))}
      />
    </div>
  );
};

export default CurrencyInput;
