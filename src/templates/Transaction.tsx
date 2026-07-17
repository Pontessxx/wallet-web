import { useEffect, useState } from 'react';
import { useTransfer } from '@/contexts/TransferContext';
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

const Transaction = () => {
  const { entries, isLoading, error, fetchHistory } = useTransfer();
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

    window.addEventListener('wallet:transactions-updated', onRefresh);
    return () => {
      window.removeEventListener('wallet:transactions-updated', onRefresh);
    };
  }, [fetchHistory]);

  const resolveWalletName = (walletId: string) => walletNameById[walletId] ?? walletId;

  const getWalletDisplay = (entry: (typeof entries)[number]) => {
    const origin = resolveWalletName(entry.carteiraId);

    if (entry.tipo === 'Transferencia' && entry.carteiraDestinoId) {
      const destination = resolveWalletName(entry.carteiraDestinoId);
      return `${origin} -> ${destination}`;
    }

    return origin;
  };

  return (
    <section className="history-page">
      <header className="history-page__header">
        <h1 className="history-page__title">Transacoes</h1>
      </header>

      {error && <p className="history-page__error">{error}</p>}

      <TableShell>
        <table className="history-page__table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Carteira</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{formatDate(entry.dataLancamento)}</td>
                <td className="history-page__wallet">
                  <BankLogo nome={resolveWalletName(entry.carteiraId)} size={20} />
                  <span>{getWalletDisplay(entry)}</span>
                </td>
                <td>{entry.tipo}</td>
                <td>{entry.categoriaNome ?? '-'}</td>
                <td>
                  <Money value={entry.valorTotal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <TableEmptyState
          hasItems={entries.length > 0}
          isLoading={isLoading}
          loadingText="Carregando transacoes..."
          emptyText="Nenhuma transacao encontrada para o periodo selecionado."
          className="history-page__empty"
        />
      </TableShell>
    </section>
  );
};

export default Transaction;
