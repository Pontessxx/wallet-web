import { useEffect, useState } from 'react';
import { useExchange } from '@/contexts/ExchangeContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import TableShell from '@/components/TableShell';
import TableEmptyState from '@/components/TableEmptyState';
import Money from '@/components/Money';
import { carteiraService } from '@/services/carteiraService';
import BankLogo from '@/components/BankLogo';
import '@/styles/HistoryPages.scss';

const formatDate = (value: string | null) => {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleDateString('pt-BR');
};

const OperacaoBolsa = () => {
  const { operations, isLoading, error, fetchHistory } = useExchange();
  const { periodQuery } = useDateFilter();
  const [walletNameById, setWalletNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    void fetchHistory();
  }, [periodQuery]);

  useEffect(() => {
    let isMounted = true;

    const loadWallets = async () => {
      try {
        const summary = await carteiraService.getSummary();
        if (!isMounted) return;

        const walletMap = summary.carteiras.reduce<Record<string, string>>((acc, wallet) => {
          acc[wallet.id] = wallet.nome;
          return acc;
        }, {});

        setWalletNameById(walletMap);
      } catch {
        if (isMounted) {
          setWalletNameById({});
        }
      }
    };

    void loadWallets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onRefresh = () => {
      void fetchHistory();
    };

    window.addEventListener('wallet:exchange-updated', onRefresh);
    return () => {
      window.removeEventListener('wallet:exchange-updated', onRefresh);
    };
  }, [fetchHistory]);

  const resolveWalletName = (walletId: string) => walletNameById[walletId] ?? walletId;

  return (
    <section className="history-page">
      <header className="history-page__header">
        <h1 className="history-page__title">Operacoes de Bolsa</h1>
      </header>

      {error && <p className="history-page__error">{error}</p>}

      <TableShell>
        <table className="history-page__table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Carteira</th>
              <th>Lado</th>
              <th>Ativo</th>
              <th>Quantidade</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((operation) => (
              <tr key={operation.id}>
                <td>{formatDate(operation.dataLancamento)}</td>
                <td className="history-page__wallet">
                  <BankLogo nome={resolveWalletName(operation.carteiraId)} size={20} />
                  <span>{resolveWalletName(operation.carteiraId)}</span>
                </td>
                <td>{operation.lado}</td>
                <td>{operation.codigoAtivo}</td>
                <td>{operation.quantidade}</td>
                <td>
                  <Money value={operation.valorTotal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <TableEmptyState
          hasItems={operations.length > 0}
          isLoading={isLoading}
          loadingText="Carregando operacoes..."
          emptyText="Nenhuma operacao encontrada para o periodo selecionado."
          className="history-page__empty"
        />
      </TableShell>
    </section>
  );
};

export default OperacaoBolsa;
