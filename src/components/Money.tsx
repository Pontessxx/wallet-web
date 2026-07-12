import { useVisibility } from '@/contexts/VisibilityContext';

interface MoneyProps {
  value: number;
  className?: string;
}

const Money = ({ value, className }: MoneyProps) => {
  const { showValues } = useVisibility();

  return (
    <span className={className}>
      {showValues
        ? value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '••••••'}
    </span>
  );
};

export default Money;