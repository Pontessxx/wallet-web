import { useEffect, useState } from 'react';
import {
  AlignLeft,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Hash,
  Landmark,
  Layers,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useExchange } from '@/contexts/ExchangeContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import TableShell from '@/components/TableShell';
import TableEmptyState from '@/components/TableEmptyState';
import Money from '@/components/Money';
import Modal from '@/components/Modal';
import CurrencyInput from '@/components/CurrencyInput';
import { carteiraService } from '@/services/carteiraService';
import BankLogo from '@/components/BankLogo';
import type { ExchangeSide, ExchangeTransaction } from '@/types/exchange';
import type { WalletOrigin } from '@/types/carteira';
import { currencyForOrigem, formatCurrency } from '@/utils/currency';
import '@/styles/HistoryPages.scss';

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

const dispatchExchangeUpdated = () => {
  window.dispatchEvent(new Event('wallet:exchange-updated'));
};

const OperacaoBolsa = () => {
  const { operations, isLoading, error, fetchHistory, updateOperation } = useExchange();
  const { periodQuery } = useDateFilter();
  const [walletNameById, setWalletNameById] = useState<Record<string, string>>({});
  const [walletOrigemById, setWalletOrigemById] = useState<Record<string, WalletOrigin>>({});
  const [walletOptions, setWalletOptions] = useState<Array<{ id: string; nome: string; origem: WalletOrigin }>>([]);

  const [editingOperation, setEditingOperation] = useState<ExchangeTransaction | null>(null);
  const [editCarteiraId, setEditCarteiraId] = useState('');
  const [editLado, setEditLado] = useState<ExchangeSide>('Compra');
  const [editCodigoAtivo, setEditCodigoAtivo] = useState('');
  const [editQuantidade, setEditQuantidade] = useState(0);
  const [editPrecoUnitario, setEditPrecoUnitario] = useState(0);
  const [editIofPercent, setEditIofPercent] = useState(0);
  const [editEncargos, setEditEncargos] = useState(0);
  const [editDataLancamento, setEditDataLancamento] = useState(toDateInputValue());
  const [editDataVencimento, setEditDataVencimento] = useState(toDateInputValue());
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

        const origemMap = summary.carteiras.reduce<Record<string, WalletOrigin>>((acc, wallet) => {
          acc[wallet.id] = wallet.origem;
          return acc;
        }, {});

        setWalletNameById(walletMap);
        setWalletOrigemById(origemMap);
        setWalletOptions(
          summary.carteiras
            .filter((wallet) => wallet.categoria === 'Investimento')
            .map((wallet) => ({ id: wallet.id, nome: wallet.nome, origem: wallet.origem }))
        );
      } catch {
        if (isMounted) {
          setWalletNameById({});
          setWalletOrigemById({});
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

    window.addEventListener('wallet:exchange-updated', onRefresh);
    return () => {
      window.removeEventListener('wallet:exchange-updated', onRefresh);
    };
  }, [fetchHistory]);

  const resolveWalletName = (walletId: string) => walletNameById[walletId] ?? walletId;
  const resolveWalletCurrency = (walletId: string) => currencyForOrigem(walletOrigemById[walletId]);

  const isEditExteriorBolsa = !!editCarteiraId && resolveWalletCurrency(editCarteiraId) === 'USD';
  // No Exterior, "editPrecoUnitario" representa o Preço total pago (independente da quantidade fracionada);
  // no Nacional continua sendo o preço por ação, multiplicado pela quantidade inteira.
  const editValorBolsa = isEditExteriorBolsa ? editPrecoUnitario : editQuantidade * editPrecoUnitario + editEncargos;

  const resetEditForm = () => {
    setEditingOperation(null);
    setEditCarteiraId('');
    setEditLado('Compra');
    setEditCodigoAtivo('');
    setEditQuantidade(0);
    setEditPrecoUnitario(0);
    setEditIofPercent(0);
    setEditEncargos(0);
    setEditDataLancamento(toDateInputValue());
    setEditDataVencimento(toDateInputValue());
    setEditObservacoes('');
    setEditEfetivada(true);
    setEditFormError(null);
  };

  const handleOpenEdit = (operation: ExchangeTransaction) => {
    const isExterior = resolveWalletCurrency(operation.carteiraId) === 'USD';
    setEditingOperation(operation);
    setEditCarteiraId(operation.carteiraId);
    setEditLado(operation.lado);
    setEditCodigoAtivo(operation.codigoAtivo);
    setEditQuantidade(operation.quantidade);
    // "valor" já é quantidade * precoUnitario (o total pago); no Exterior é isso que exibimos como "Preço".
    setEditPrecoUnitario(isExterior ? operation.valor : operation.precoUnitario);
    setEditIofPercent(0); // não é persistido no backend, é apenas informativo durante o preenchimento
    setEditEncargos(operation.encargos);
    setEditDataLancamento(toDateInputValue(new Date(operation.dataLancamento)));
    setEditDataVencimento(
      operation.dataVencimento ? toDateInputValue(new Date(operation.dataVencimento)) : toDateInputValue()
    );
    setEditObservacoes(operation.observacoes ?? '');
    setEditEfetivada(operation.efetivada);
    setEditFormError(null);
  };

  const handleCloseEdit = () => {
    resetEditForm();
  };

  const handleSubmitEdit = async () => {
    if (!editingOperation) return;

    setEditFormError(null);

    if (!editCarteiraId) {
      setEditFormError('Selecione a carteira.');
      return;
    }

    if (!editCodigoAtivo.trim()) {
      setEditFormError('Informe o código do ativo.');
      return;
    }

    if (editQuantidade <= 0 || editPrecoUnitario <= 0) {
      setEditFormError(
        isEditExteriorBolsa
          ? 'Quantidade e preço devem ser maiores que zero.'
          : 'Quantidade e preço unitário devem ser maiores que zero.'
      );
      return;
    }

    setIsSubmittingEdit(true);

    try {
      await updateOperation(editingOperation.id, {
        carteiraId: editCarteiraId,
        lado: editLado,
        codigoAtivo: editCodigoAtivo.trim().toUpperCase(),
        quantidade: editQuantidade,
        // No Exterior "editPrecoUnitario" no formulário é o Preço total pago; convertido aqui
        // para o preço por ação esperado pelo backend, que recalcula valor = quantidade * precoUnitario.
        precoUnitario: isEditExteriorBolsa
          ? (editQuantidade > 0 ? editPrecoUnitario / editQuantidade : 0)
          : editPrecoUnitario,
        encargos: isEditExteriorBolsa ? 0 : editEncargos,
        efetivada: editEfetivada,
        dataLancamento: toUtcDateTime(editDataLancamento),
        dataVencimento: toUtcDateTime(editDataVencimento),
        observacoes: editObservacoes.trim() || null,
      });

      dispatchExchangeUpdated();
      handleCloseEdit();
    } catch {
      setEditFormError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <section className="history-page">
      <header className="history-page__header">
        <h1 className="history-page__title">Operacoes de Bolsa</h1>
      </header>

      {error && <p className="history-page__error">{error}</p>}

      <TableShell>
        <table className="history-page__table history-page__table--clickable-rows">
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
              <tr key={operation.id} onClick={() => handleOpenEdit(operation)}>
                <td>{formatDate(operation.dataLancamento)}</td>
                 <td className="history-page__wallet">
                  <div>
                    <BankLogo nome={resolveWalletName(operation.carteiraId)} size={24} />
                    <span>{resolveWalletName(operation.carteiraId)}</span>
                  </div>
                </td>
                <td>
                  <span
                    className="history-page__category-badge"
                    style={{
                      ['--badge-color' as string]:
                        operation.lado === 'Compra' ? 'var(--color-success)' : 'var(--color-error)',
                    }}
                  >
                    {operation.lado} <span aria-hidden="true">›</span>
                  </span>
                </td>
                <td>{operation.codigoAtivo}</td>
                <td>{operation.quantidade}</td>
                <td>
                  <Money value={operation.valorTotal} currency={resolveWalletCurrency(operation.carteiraId)} />
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

      <Modal
        isOpen={!!editingOperation}
        onClose={handleCloseEdit}
        size="lg"
        title="Editar Operação de Bolsa"
        headerActions={
          <button
            type="button"
            className="tx-form__save tx-form__save--success"
            onClick={handleSubmitEdit}
            disabled={isSubmittingEdit}
          >
            {isSubmittingEdit ? 'Salvando...' : 'Salvar'}
          </button>
        }
      >
        <div className="tx-form">
          {editFormError && <p className="tx-form__error">{editFormError}</p>}

          <div className="tx-form__columns">
            <div className="tx-form__col">
              <div className="tx-form__row tx-form__row--primary">
                <AlignLeft size={18} className="tx-form__row-icon" />
                <input
                  type="text"
                  placeholder="Descrição"
                  value={editObservacoes}
                  onChange={(event) => setEditObservacoes(event.target.value)}
                />
              </div>

              <div className="tx-form__section">
                <span className="tx-form__section-label">Lado</span>
                <div className="tx-form__pill">
                  <span
                    className={`tx-form__pill-icon tx-form__pill-icon--${editLado === 'Compra' ? 'success' : 'danger'}`}
                  >
                    {editLado === 'Compra' ? (
                      <TrendingUp size={16} color="#fff" />
                    ) : (
                      <TrendingDown size={16} color="#fff" />
                    )}
                  </span>
                  <select value={editLado} onChange={(event) => setEditLado(event.target.value as ExchangeSide)}>
                    <option value="Compra">Compra</option>
                    <option value="Venda">Venda</option>
                  </select>
                </div>
              </div>

              <div className="tx-form__row">
                <Hash size={18} className="tx-form__row-icon" />
                <input
                  type="text"
                  placeholder="Código do ativo (ex.: PETR4)"
                  value={editCodigoAtivo}
                  onChange={(event) => setEditCodigoAtivo(event.target.value)}
                />
              </div>

              <div className="tx-form__row">
                <Layers size={18} className="tx-form__row-icon" />
                <input
                  type="number"
                  min={isEditExteriorBolsa ? 0 : 1}
                  step={isEditExteriorBolsa ? '0.000001' : '1'}
                  placeholder="Quantidade"
                  value={editQuantidade || ''}
                  onChange={(event) => {
                    const raw = Number(event.target.value);
                    setEditQuantidade(isEditExteriorBolsa ? raw : Math.round(raw));
                  }}
                />
              </div>

              <div className="tx-form__row tx-form__row--between">
                <span className="tx-form__row-label">
                  <CalendarClock size={18} className="tx-form__row-icon" />
                  Data de Vencimento
                </span>
                <input
                  type="date"
                  value={editDataVencimento}
                  onChange={(event) => setEditDataVencimento(event.target.value)}
                />
              </div>

              <div className="tx-form__row tx-form__row--between">
                <span className="tx-form__row-label">
                  <CheckCircle2 size={18} className="tx-form__row-icon" />
                  Efetivada
                </span>
                <label className="tx-toggle tx-toggle--success">
                  <input
                    type="checkbox"
                    checked={editEfetivada}
                    onChange={(event) => setEditEfetivada(event.target.checked)}
                  />
                  <span className="tx-toggle__track">
                    <span className="tx-toggle__thumb" />
                  </span>
                </label>
              </div>

              <div className="tx-form__section">
                <span className="tx-form__section-label">Conta</span>
                <div className="tx-form__pill">
                  <BankLogo nome={walletOptions.find((wallet) => wallet.id === editCarteiraId)?.nome ?? '?'} size={28} />
                  <select value={editCarteiraId} onChange={(event) => setEditCarteiraId(event.target.value)}>
                    <option value="">Selecione</option>
                    {walletOptions.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>{wallet.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {walletOptions.length === 0 && (
                <p className="tx-form__error">Nenhuma carteira de investimento disponível.</p>
              )}
            </div>

            <div className="tx-form__col">
              <div className="tx-form__row tx-form__row--between">
                <span className="tx-form__row-label">
                  <CalendarClock size={18} className="tx-form__row-icon" />
                  Data de Lançamento
                </span>
                <input
                  type="date"
                  value={editDataLancamento}
                  onChange={(event) => setEditDataLancamento(event.target.value)}
                />
              </div>

              <div className="tx-form__row tx-form__row--between">
                <span className="tx-form__row-label">
                  <CircleDollarSign size={18} className="tx-form__row-icon" />
                  {isEditExteriorBolsa ? 'Preço' : 'Preço unitário'}
                </span>
                <CurrencyInput className="tx-form__inline-currency" value={editPrecoUnitario} onChange={setEditPrecoUnitario} currency={editCarteiraId ? resolveWalletCurrency(editCarteiraId) : 'BRL'} />
              </div>

              {isEditExteriorBolsa ? (
                <>
                  <div className="tx-form__row tx-form__row--between">
                    <span className="tx-form__row-label">
                      <Landmark size={18} className="tx-form__row-icon" />
                      IOF (%)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Ex: 1.10"
                      value={editIofPercent || ''}
                      onChange={(event) => setEditIofPercent(Number(event.target.value))}
                    />
                  </div>
                  <p className="tx-form__hint">
                    IOF apenas informativo, não entra no cálculo do valor total.
                  </p>
                </>
              ) : (
                <div className="tx-form__row tx-form__row--between">
                  <span className="tx-form__row-label">
                    <Landmark size={18} className="tx-form__row-icon" />
                    Encargos
                  </span>
                  <CurrencyInput className="tx-form__inline-currency" value={editEncargos} onChange={setEditEncargos} currency={editCarteiraId ? resolveWalletCurrency(editCarteiraId) : 'BRL'} />
                </div>
              )}

              <div className="tx-form__row tx-form__row--between">
                <span className="tx-form__row-label">
                  <CircleDollarSign size={18} className="tx-form__row-icon" />
                  Valor total
                </span>
                <span className="tx-form__total-value">
                  {formatCurrency(
                    editValorBolsa,
                    editCarteiraId ? resolveWalletCurrency(editCarteiraId) : 'BRL'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default OperacaoBolsa;
