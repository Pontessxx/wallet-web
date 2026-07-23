import { useVisibility } from '@/contexts/VisibilityContext';
import { formatCurrency, type CurrencyCode } from '@/utils/currency';

interface MoneyProps {
  value: number;
  className?: string;
  currency?: CurrencyCode;
}

const Money = ({ value, className, currency = 'BRL' }: MoneyProps) => {
  const { showValues } = useVisibility();

  return (
    <span className={className}>
      {showValues ? formatCurrency(value, currency) : '••••••'}
    </span>
  );
};

export default Money;
