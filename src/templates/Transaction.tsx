import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Pencil, MoreVertical } from 'lucide-react';
import { useTransfer } from '@/contexts/TransferContext';
import { useTransaction } from '@/contexts/TransactionContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useCategoria } from '@/contexts/CategoriaContext';
import { useDropdownMenu } from '@/hooks/useDropdownMenu';
import TableShell from '@/components/TableShell';
import TableEmptyState from '@/components/TableEmptyState';
import Money from '@/components/Money';
import Modal from '@/components/Modal';
import CurrencyInput from '@/components/CurrencyInput';
import TransactionActionsMenu from '@/components/TransactionActionsMenu';
import { carteiraService } from '@/services/carteiraService';
import { goalService } from '@/services/goalService';
import BankLogo from '@/components/BankLogo';
import type { TransferTransaction } from '@/types/transfer';
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

const toDateInputValue = (date = new Date()) => {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

// O backend espera um DateTime UTC (timestamp with time zone); o input type="date"
// só fornece "AAAA-MM-DD", que precisa virar um ISO string completo antes do envio.
const toUtcDateTime = (dateOnlyValue: string) => new Date(`${dateOnlyValue}T00:00:00.000Z`).toISOString();

const dispatchTransactionsUpdated = () => {
  window.dispatchEvent(new Event('wallet:transactions-updated'));
};

const Transaction = () => {
  const { entries, isLoading, error, fetchHistory, updateEntry, removeEntry } = useTransfer();
  const { updateTransfer, removeTransfer } = useTransaction();
  const { periodQuery } = useDateFilter();
  const { categorias } = useCategoria();
  const [walletOptions, setWalletOptions] = useState<Array<{ id: string; nome: string }>>([]);
  const [walletNameById, setWalletNameById] = useState<Record<string, string>>({});
  const [goalOptions, setGoalOptions] = useState<Array<{ id: string; nome: string }>>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('Despesa');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { openId, position, menuRef, registerTriggerRef, toggle, close } = useDropdownMenu();

  const [editingEntry, setEditingEntry] = useState<TransferTransaction | null>(null);
  const [editCarteiraId, setEditCarteiraId] = useState('');
  const [editCarteiraDestinoId, setEditCarteiraDestinoId] = useState('');
  const [editCategoriaId, setEditCategoriaId] = useState('');
  const [editObjetivoId, setEditObjetivoId] = useState('');
  const [editValor, setEditValor] = useState(0);
  const [editEncargos, setEditEncargos] = useState(0);
  const [editDataLancamento, setEditDataLancamento] = useState(toDateInputValue());
  const [editObservacoes, setEditObservacoes] = useState('');
  const [editEfetivada, setEditEfetivada] = useState(true);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

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
        setWalletOptions(summary.carteiras.map((wallet) => ({ id: wallet.id, nome: wallet.nome })));
      } catch {
        if (isMounted) {
          setWalletNameById({});
          setWalletOptions([]);
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

  useEffect(() => {
    let isMounted = true;

    const loadGoals = async () => {
      if (!editingEntry || editingEntry.tipo !== 'Receita') {
        setGoalOptions([]);
        return;
      }

      try {
        const goals = await goalService.list();
        if (!isMounted) return;
        setGoalOptions(goals.map((goal) => ({ id: goal.id, nome: goal.nome })));
      } catch {
        if (isMounted) {
          setGoalOptions([]);
        }
      }
    };

    void loadGoals();

    return () => {
      isMounted = false;
    };
  }, [editingEntry]);

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

  const editCategoryOptions = useMemo(() => {
    if (!editingEntry || editingEntry.tipo === 'Transferencia') return [];
    return categorias.filter((categoria) => categoria.tipo === editingEntry.tipo);
  }, [categorias, editingEntry]);

  const handleToggleEfetivada = async (entry: TransferTransaction) => {
    setTogglingId(entry.id);

    try {
      const nextEfetivada = !entry.efetivada;

      if (entry.tipo === 'Transferencia') {
        await updateTransfer(entry.id, {
          carteiraId: entry.carteiraId,
          carteiraDestinoId: entry.carteiraDestinoId ?? '',
          valor: entry.valor,
          encargos: entry.encargos,
          efetivada: nextEfetivada,
          dataLancamento: entry.dataLancamento,
          dataVencimento: entry.dataVencimento,
          observacoes: entry.observacoes,
        });
      } else {
        await updateEntry(entry.id, {
          carteiraId: entry.carteiraId,
          tipo: entry.tipo,
          categoriaId: entry.categoriaId ?? '',
          valor: entry.valor,
          encargos: entry.encargos,
          efetivada: nextEfetivada,
          dataLancamento: entry.dataLancamento,
          dataVencimento: entry.dataVencimento,
          observacoes: entry.observacoes,
          objetivoId: entry.objetivoId,
        });
      }

      dispatchTransactionsUpdated();
    } catch {
      // erro já tratado no context via `error`
    } finally {
      setTogglingId(null);
    }
  };

  const resetEditForm = () => {
    setEditingEntry(null);
    setEditCarteiraId('');
    setEditCarteiraDestinoId('');
    setEditCategoriaId('');
    setEditObjetivoId('');
    setEditValor(0);
    setEditEncargos(0);
    setEditDataLancamento(toDateInputValue());
    setEditObservacoes('');
    setEditEfetivada(true);
    setEditFormError(null);
  };

  const handleOpenEdit = (entry: TransferTransaction) => {
    close();
    setEditingEntry(entry);
    setEditCarteiraId(entry.carteiraId);
    setEditCarteiraDestinoId(entry.carteiraDestinoId ?? '');
    setEditCategoriaId(entry.categoriaId ?? '');
    setEditObjetivoId(entry.objetivoId ?? '');
    setEditValor(entry.valor);
    setEditEncargos(entry.encargos);
    setEditDataLancamento(toDateInputValue(new Date(entry.dataLancamento)));
    setEditObservacoes(entry.observacoes ?? '');
    setEditEfetivada(entry.efetivada);
    setEditFormError(null);
  };

  const handleCloseEdit = () => {
    resetEditForm();
  };

  const handleSubmitEdit = async () => {
    if (!editingEntry) return;

    setEditFormError(null);

    if (!editCarteiraId) {
      setEditFormError('Selecione a carteira.');
      return;
    }

    if (editValor <= 0) {
      setEditFormError('Informe um valor maior que zero.');
      return;
    }

    if (editingEntry.tipo === 'Transferencia') {
      if (!editCarteiraDestinoId) {
        setEditFormError('Selecione a carteira de destino.');
        return;
      }

      if (editCarteiraDestinoId === editCarteiraId) {
        setEditFormError('A carteira de destino deve ser diferente da origem.');
        return;
      }
    } else if (!editCategoriaId) {
      setEditFormError('Selecione a categoria.');
      return;
    }

    setIsSubmittingEdit(true);

    try {
      if (editingEntry.tipo === 'Transferencia') {
        await updateTransfer(editingEntry.id, {
          carteiraId: editCarteiraId,
          carteiraDestinoId: editCarteiraDestinoId,
          valor: editValor,
          encargos: editEncargos,
          efetivada: editEfetivada,
          dataLancamento: toUtcDateTime(editDataLancamento),
          observacoes: editObservacoes.trim() || null,
        });
      } else {
        await updateEntry(editingEntry.id, {
          carteiraId: editCarteiraId,
          tipo: editingEntry.tipo,
          categoriaId: editCategoriaId,
          valor: editValor,
          encargos: editEncargos,
          efetivada: editEfetivada,
          dataLancamento: toUtcDateTime(editDataLancamento),
          observacoes: editObservacoes.trim() || null,
          objetivoId: editingEntry.tipo === 'Receita' && editObjetivoId ? editObjetivoId : null,
        });
      }

      dispatchTransactionsUpdated();
      handleCloseEdit();
    } catch {
      setEditFormError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleRemove = async (entry: TransferTransaction) => {
    close();

    try {
      if (entry.tipo === 'Transferencia') {
        await removeTransfer(entry.id);
      } else {
        await removeEntry(entry.id);
      }

      dispatchTransactionsUpdated();
    } catch {
      // erro já tratado no context via `error`
    }
  };

  const openMenuEntry = filteredEntries.find((entry) => entry.id === openId) ?? null;

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
                    <button
                      type="button"
                      className={`history-page__status${
                        entry.efetivada
                          ? ' history-page__status--done'
                          : ' history-page__status--pending'
                      }`}
                      onClick={() => handleToggleEfetivada(entry)}
                      disabled={togglingId === entry.id}
                      aria-label={entry.efetivada ? 'Marcar como pendente' : 'Marcar como efetivada'}
                      title={entry.efetivada ? 'Efetivada · clique para marcar como pendente' : 'Pendente · clique para efetivar'}
                    >
                      {entry.efetivada ? <Check size={14} /> : <Clock size={14} />}
                    </button>
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
                      onClick={() => handleOpenEdit(entry)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      ref={registerTriggerRef(entry.id)}
                      className="history-page__action-btn"
                      aria-label="Mais ações"
                      onClick={() => toggle(entry.id)}
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

      <TransactionActionsMenu
        isOpen={!!openId}
        position={position}
        menuRef={menuRef}
        onRemove={() => openMenuEntry && handleRemove(openMenuEntry)}
      />

      <Modal
        isOpen={!!editingEntry}
        onClose={handleCloseEdit}
        title={editingEntry ? `Editar ${editingEntry.tipo}` : ''}
      >
        <div className="app-header__form">
          <label>
            Carteira {editingEntry?.tipo === 'Transferencia' ? 'de origem' : ''}
            <select value={editCarteiraId} onChange={(event) => setEditCarteiraId(event.target.value)}>
              <option value="">Selecione</option>
              {walletOptions.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>{wallet.nome}</option>
              ))}
            </select>
          </label>

          {editingEntry?.tipo === 'Transferencia' && (
            <label>
              Carteira de destino
              <select value={editCarteiraDestinoId} onChange={(event) => setEditCarteiraDestinoId(event.target.value)}>
                <option value="">Selecione</option>
                {walletOptions
                  .filter((wallet) => wallet.id !== editCarteiraId)
                  .map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>{wallet.nome}</option>
                  ))}
              </select>
            </label>
          )}

          {editingEntry && editingEntry.tipo !== 'Transferencia' && (
            <label>
              Categoria
              <select value={editCategoriaId} onChange={(event) => setEditCategoriaId(event.target.value)}>
                <option value="">Selecione</option>
                {editCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>{category.nome}</option>
                ))}
              </select>
            </label>
          )}

          {editingEntry?.tipo === 'Receita' && (
            <label>
              Objetivo (opcional)
              <select value={editObjetivoId} onChange={(event) => setEditObjetivoId(event.target.value)}>
                <option value="">Nenhum</option>
                {goalOptions.map((goal) => (
                  <option key={goal.id} value={goal.id}>{goal.nome}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            Valor
            <CurrencyInput value={editValor} onChange={setEditValor} />
          </label>

          <label>
            Encargos
            <CurrencyInput value={editEncargos} onChange={setEditEncargos} />
          </label>

          <label>
            Data de lançamento
            <input
              type="date"
              value={editDataLancamento}
              onChange={(event) => setEditDataLancamento(event.target.value)}
            />
          </label>

          <label>
            Observações
            <textarea
              value={editObservacoes}
              onChange={(event) => setEditObservacoes(event.target.value)}
              rows={3}
            />
          </label>

          <label className="app-header__checkbox">
            <input
              type="checkbox"
              checked={editEfetivada}
              onChange={(event) => setEditEfetivada(event.target.checked)}
            />
            {' '}Efetivada
          </label>

          {editFormError && <p className="app-header__form-error">{editFormError}</p>}

          <button
            type="button"
            className="app-header__submit"
            onClick={handleSubmitEdit}
            disabled={isSubmittingEdit}
          >
            {isSubmittingEdit ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Modal>
    </section>
  );
};

export default Transaction;
