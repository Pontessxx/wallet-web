import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Pencil, MoreVertical } from 'lucide-react';
import { useTransfer } from '@/contexts/TransferContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useCategoria } from '@/contexts/CategoriaContext';
import TableShell from '@/components/TableShell';
import TableEmptyState from '@/components/TableEmptyState';
import Money from '@/components/Money';
import { carteiraService } from '@/services/carteiraService';
import BankLogo from '@/components/BankLogo';
import '@/styles/HistoryPages.scss';

type TabKey = 'Despesa' | 'Receita' | 'Transferencia' | 'Extrato';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'Despesa', label: 'Despesas' },
  { key: 'Receita', label: 'Receitas' },
  { key: 'Transferencia', label: 'Transferências' },
  { key: 'Extrato', label: 'Extrato' },
];

const formatDate = (value: string | null) => {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleDateString('pt-BR');
};

const Transaction = () => {
  const { entries, isLoading, error, fetchHistory } = useTransfer();
  const { periodQuery } = useDateFilter();
  const { categorias } = useCategoria();
  const [walletNameById, setWalletNameById] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<TabKey>('Despesa');

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

  const categoriaById = useMemo(
    () =>
      categorias.reduce<Record<string, { nome: string; colorHex: string }>>((acc, categoria) => {
        acc[categoria.id] = { nome: categoria.nome, colorHex: categoria.colorHex };
        return acc;
      }, {}),
    [categorias],
  );

  const resolveWalletName = (walletId: string) => walletNameById[walletId] ?? walletId;

  const getWalletDisplay = (entry: (typeof entries)[number]) => {
    const origin = resolveWalletName(entry.carteiraId);

    if (entry.tipo === 'Transferencia' && entry.carteiraDestinoId) {
      const destination = resolveWalletName(entry.carteiraDestinoId);
      return `${origin} -> ${destination}`;
    }

    return origin;
  };

  const filteredEntries = useMemo(() => {
    if (activeTab === 'Extrato') return entries;
    return entries.filter((entry) => entry.tipo === activeTab);
  }, [entries, activeTab]);

  const handleEdit = (id: string) => {
    // TODO: abrir Modal de edição com os dados da transação (id)
    console.log('editar', id);
  };

  const handleMoreActions = (id: string) => {
    // TODO: abrir menu com opções extras (excluir, duplicar, etc.)
    console.log('mais ações', id);
  };

  return (
    <section className="history-page">
      <nav className="history-page__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`history-page__tab${
              activeTab === tab.key ? ' history-page__tab--active' : ''
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <p className="history-page__error">{error}</p>}

      <TableShell>
        <table className="history-page__table">
          <thead>
            <tr>
              <th>Situação</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th>Efetivação</th>
              <th className="history-page__col-valor">Valor</th>
              <th className="history-page__col-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => {
              const categoria = entry.categoriaId ? categoriaById[entry.categoriaId] : undefined;

              return (
                <tr key={entry.id}>
                  <td>
                    <span
                      className={`history-page__status${
                        entry.efetivada
                          ? ' history-page__status--done'
                          : ' history-page__status--pending'
                      }`}
                      title={entry.efetivada ? 'Efetivada' : 'Pendente'}
                    >
                      {entry.efetivada ? <Check size={14} /> : <Clock size={14} />}
                    </span>
                  </td>
                  <td className="history-page__description">
                    {entry.observacoes || entry.categoriaNome || '-'}
                  </td>
                  <td>
                    {categoria ? (
                      <span
                        className="history-page__category-badge"
                        style={{ ['--badge-color' as string]: categoria.colorHex }}
                      >
                        {categoria.nome} <span aria-hidden="true">›</span>
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="history-page__wallet">
                    <div>
                      <BankLogo nome={resolveWalletName(entry.carteiraId)} size={24} />
                      <span>{getWalletDisplay(entry)}</span>
                    </div>
                      
                  </td>
                  <td>{formatDate(entry.dataEfetivacao ?? entry.dataLancamento)}</td>
                  <td className="history-page__col-valor">
                    <Money value={entry.valorTotal} />
                  </td>
                  <td className="history-page__col-acoes">
                    <button
                      type="button"
                      className="history-page__action-btn"
                      aria-label="Editar"
                      onClick={() => handleEdit(entry.id)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="history-page__action-btn"
                      aria-label="Mais ações"
                      onClick={() => handleMoreActions(entry.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <TableEmptyState
          hasItems={filteredEntries.length > 0}
          isLoading={isLoading}
          loadingText="Carregando transações..."
          emptyText="Nenhuma transação encontrada para o período selecionado."
          className="history-page__empty"
        />
      </TableShell>
    </section>
  );
};

export default Transaction;