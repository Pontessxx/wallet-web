import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addMonths, differenceInCalendarMonths } from 'date-fns';
import { useGoal } from '@/contexts/GoalContext';
import { useCarteira } from '@/contexts/CarteiraContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useDropdownMenu } from '@/hooks/useDropdownMenu';
import GoalCard from '@/components/GoalCard';
import GoalActionsMenu from '@/components/GoalActionsMenu';
import TableEmptyState from '@/components/TableEmptyState';
import Modal from '@/components/Modal';
import CurrencyInput from '@/components/CurrencyInput';
import { DEFAULT_GOAL_ICON, GOAL_ICON_OPTIONS, getGoalIcon } from '@/utils/goalVisuals';
import { currencyForOrigem, formatCurrency } from '@/utils/currency';
import type { Goal, GoalAporte } from '@/types/goal';
import '@/styles/HistoryPages.scss';
import '@/styles/Objetivo.scss';
import '@/styles/GoalForm.scss';

const Objetivo = () => {
  const {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    removeGoal,
    createGoalAporte,
    fetchGoalAportes,
    removeGoalAporte,
  } = useGoal();
  const { periodQuery } = useDateFilter();
  const { carteiras, fetchSummary } = useCarteira();

  const { openId, position, menuRef, registerTriggerRef, toggle, close } = useDropdownMenu();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [iconKeyInput, setIconKeyInput] = useState(DEFAULT_GOAL_ICON);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconFilter, setIconFilter] = useState('');
  const [valorTotal, setValorTotal] = useState(0);
  const [dataAlvo, setDataAlvo] = useState<Date>(() => addMonths(new Date(), 1));
  const [carteiraId, setCarteiraId] = useState('');

  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositValor, setDepositValor] = useState(0);
  const [depositData, setDepositData] = useState<Date>(new Date());
  const [depositObservacao, setDepositObservacao] = useState('');
  const [depositRecorrente, setDepositRecorrente] = useState(false);
  const [depositHistory, setDepositHistory] = useState<GoalAporte[]>([]);
  const [isDepositHistoryLoading, setIsDepositHistoryLoading] = useState(false);
  const [removingAporteId, setRemovingAporteId] = useState<string | null>(null);

  useEffect(() => {
    void fetchGoals();
    void fetchSummary();
  }, [periodQuery]);

  useEffect(() => {
    const onRefresh = () => {
      void fetchGoals();
    };

    window.addEventListener('wallet:transactions-updated', onRefresh);
    return () => {
      window.removeEventListener('wallet:transactions-updated', onRefresh);
    };
  }, [fetchGoals]);

  const resolveGoalCurrency = (goalCarteiraId: string | null) =>
    currencyForOrigem(carteiras.find((c) => c.id === goalCarteiraId)?.origem);

  const formCurrency = resolveGoalCurrency(carteiraId || null);
  const depositCurrency = resolveGoalCurrency(depositGoal?.carteiraId ?? null);

  const selectedIconKey = iconKeyInput;
  const SelectedIcon = getGoalIcon(selectedIconKey);
  const selectedIconOption = GOAL_ICON_OPTIONS.find((option) => option.value === selectedIconKey);
  const normalizedIconFilter = iconFilter.trim().toLowerCase();
  const filteredIconOptions = useMemo(
    () =>
      GOAL_ICON_OPTIONS.filter((option) => {
        if (!normalizedIconFilter) return true;

        return (
          option.label.toLowerCase().includes(normalizedIconFilter) ||
          option.value.toLowerCase().includes(normalizedIconFilter)
        );
      }),
    [normalizedIconFilter]
  );

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setIconKeyInput(DEFAULT_GOAL_ICON);
    setIsIconPickerOpen(false);
    setIconFilter('');
    setValorTotal(0);
    setDataAlvo(addMonths(new Date(), 1));
    setCarteiraId('');
  };

  const handleClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    setEditingId(goal.id);
    setNome(goal.nome);
    setIconKeyInput(goal.iconKey);
    setValorTotal(goal.valorTotal);
    setDataAlvo(addMonths(new Date(goal.criadaEm), goal.meses));
    setCarteiraId(goal.carteiraId ?? '');
    close();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!nome.trim() || valorTotal <= 0) return;

    const meses = Math.max(1, differenceInCalendarMonths(dataAlvo, new Date()));

    try {
      if (editingId) {
        await updateGoal(editingId, {
          nome,
          valorTotal,
          meses,
          carteiraId: carteiraId || null,
          iconKey: selectedIconKey,
        });
      } else {
        await createGoal(
          { nome, valorTotal, meses, iconKey: selectedIconKey },
          { carteiraId: carteiraId || undefined }
        );
      }
      handleClose();
    } catch {
      // erro já tratado no context via `error`
    }
  };

  const handleRemove = async (id: string) => {
    close();
    try {
      await removeGoal(id);
    } catch {
      // erro já tratado no context via `error`
    }
  };

  const handleOpenDeposit = async (goal: Goal) => {
    setDepositGoal(goal);
    setDepositValor(0);
    setDepositData(new Date());
    setDepositObservacao('');
    setDepositRecorrente(false);
    setDepositHistory([]);
    setIsDepositHistoryLoading(true);

    try {
      const history = await fetchGoalAportes(goal.id);
      setDepositHistory(history);
    } catch {
      // erro já tratado no context via `error`
    } finally {
      setIsDepositHistoryLoading(false);
    }
  };

  const handleCloseDeposit = () => {
    setDepositGoal(null);
  };

  const handleSubmitDeposit = async () => {
    if (!depositGoal || depositValor <= 0) return;

    try {
      await createGoalAporte(depositGoal.id, {
        valor: depositValor,
        data: depositData.toISOString(),
        observacao: depositObservacao.trim() || undefined,
        recorrente: depositRecorrente,
      });
      handleCloseDeposit();
    } catch {
      // erro já tratado no context via `error`
    }
  };

  const handleRemoveAporte = async (aporteId: string) => {
    setRemovingAporteId(aporteId);

    try {
      const updated = await removeGoalAporte(aporteId);
      setDepositHistory((prev) => prev.filter((aporte) => aporte.id !== aporteId));
      setDepositGoal(updated);
    } catch {
      // erro já tratado no context via `error`
    } finally {
      setRemovingAporteId(null);
    }
  };

  return (
    <section className="history-page">
      <header className="history-page__header">
        <h1 className="history-page__title">Objetivos</h1>
        <button type="button" className="history-page__add-btn" onClick={handleOpenCreate}>
          Adicionar Objetivo
        </button>
      </header>

      {error && <p className="history-page__error" role="alert">{error}</p>}

      <ul className="goal-grid">
        {goals.map((goal) => (
          <li key={goal.id}>
            <GoalCard
              goal={goal}
              registerMenuBtnRef={registerTriggerRef}
              onToggleMenu={toggle}
              onDeposit={handleOpenDeposit}
              currency={resolveGoalCurrency(goal.carteiraId)}
            />
          </li>
        ))}
      </ul>

      <TableEmptyState
        hasItems={goals.length > 0}
        isLoading={isLoading}
        loadingText="Carregando objetivos..."
        emptyText="Nenhum objetivo encontrado para o periodo selecionado."
        className="history-page__empty"
      />

      <GoalActionsMenu
        isOpen={!!openId}
        position={position}
        menuRef={menuRef}
        onEdit={() => openId && handleOpenEdit(openId)}
        onRemove={() => openId && handleRemove(openId)}
      />

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editingId ? 'Editar Objetivo' : 'Adicionar Objetivo'}>
        <div className="goal-form">
          <div className="goal-form__field">
            <label className="goal-form__label" htmlFor="nome">Nome</label>
            <input
              id="nome"
              className="goal-form__input"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Viagem"
            />
          </div>

          <div className="goal-form__field">
            <label className="goal-form__label" htmlFor="iconKey">Ícone</label>
            <button
              id="iconKey"
              type="button"
              className="goal-form__icon-trigger"
              onClick={() => setIsIconPickerOpen((prev) => !prev)}
              aria-expanded={isIconPickerOpen}
              aria-controls="goal-icon-picker"
            >
              <SelectedIcon size={16} />
              <span>{selectedIconOption?.label ?? 'Ícone selecionado'}</span>
            </button>

            {isIconPickerOpen && (
              <div className="goal-form__icon-dropdown" id="goal-icon-picker">
                <input
                  className="goal-form__input"
                  type="text"
                  value={iconFilter}
                  onChange={(e) => setIconFilter(e.target.value)}
                  placeholder="Buscar ícone"
                  aria-label="Buscar ícone"
                />

                <ul className="goal-form__icon-grid" role="listbox" aria-label="Selecionar ícone">
                  {filteredIconOptions.map((option) => {
                    const IconOption = getGoalIcon(option.value);
                    const isSelected = option.value === selectedIconKey;

                    return (
                      <li key={option.value} role="presentation">
                        <button
                          type="button"
                          className={`goal-form__icon-option ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setIconKeyInput(option.value);
                            setIsIconPickerOpen(false);
                          }}
                          title={option.label}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <IconOption size={18} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="goal-form__field">
            <label className="goal-form__label" htmlFor="carteiraId">Carteira vinculada</label>
            <select
              id="carteiraId"
              className="goal-form__select"
              value={carteiraId}
              onChange={(e) => setCarteiraId(e.target.value)}
            >
              <option value="">Nenhuma (aporte manual)</option>
              {carteiras.map((carteira) => (
                <option key={carteira.id} value={carteira.id}>
                  {carteira.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="goal-form__field">
            <label className="goal-form__label" htmlFor="valorTotal">Valor da meta</label>
            <CurrencyInput
              id="valorTotal"
              value={valorTotal}
              onChange={setValorTotal}
              currency={formCurrency}
              required
            />
          </div>

          <div className="goal-form__field">
            <label className="goal-form__label" htmlFor="dataAlvo">Espero alcançar em</label>
            <DatePicker
              id="dataAlvo"
              selected={dataAlvo}
              onChange={(date: Date | null) => date && setDataAlvo(date)}
              dateFormat="dd/MM/yyyy"
              minDate={addMonths(new Date(), 1)}
              className="goal-form__input"
            />
          </div>

          {error && <p className="goal-form__error" role="alert">{error}</p>}

          <button
            type="button"
            className="goal-form__submit"
            onClick={handleSubmit}
            disabled={isLoading || !nome.trim() || valorTotal <= 0}
          >
            {isLoading ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!depositGoal}
        onClose={handleCloseDeposit}
        title={`Depositar em ${depositGoal?.nome ?? ''}`}
      >
        <div className="goal-deposit">
          <div className="goal-form">
            {depositGoal?.carteiraId && (
              <p className="goal-form__hint">
                Atrelado a {depositGoal.carteiraNome ?? 'carteira'} · receitas dessa carteira vinculadas a este objetivo também entram aqui.
              </p>
            )}

            <div className="goal-form__field">
              <label className="goal-form__label" htmlFor="depositValor">Valor</label>
              <CurrencyInput
                id="depositValor"
                value={depositValor}
                onChange={setDepositValor}
                currency={depositCurrency}
                required
              />
            </div>

            <div className="goal-form__field">
              <label className="goal-form__label" htmlFor="depositData">Data</label>
              <DatePicker
                id="depositData"
                selected={depositData}
                onChange={(date: Date | null) => date && setDepositData(date)}
                dateFormat="dd/MM/yyyy"
                className="goal-form__input"
              />
            </div>

            <div className="goal-form__field">
              <label className="goal-form__label" htmlFor="depositObservacao">Observações</label>
              <input
                id="depositObservacao"
                className="goal-form__input"
                type="text"
                value={depositObservacao}
                onChange={(e) => setDepositObservacao(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <label className="goal-form__checkbox">
              <input
                type="checkbox"
                checked={depositRecorrente}
                onChange={(e) => setDepositRecorrente(e.target.checked)}
              />
              Mensal
            </label>

            {error && <p className="goal-form__error" role="alert">{error}</p>}

            <button
              type="button"
              className="goal-form__submit"
              onClick={handleSubmitDeposit}
              disabled={isLoading || depositValor <= 0}
            >
              {isLoading ? 'Salvando...' : 'Depositar'}
            </button>
          </div>

          <section className="goal-form__history" aria-labelledby="goal-history-heading">
            <h3 className="goal-form__label" id="goal-history-heading">Histórico</h3>
            {isDepositHistoryLoading && <p className="goal-form__history-empty">Carregando...</p>}
            {!isDepositHistoryLoading && depositHistory.length === 0 && (
              <p className="goal-form__history-empty">Nenhum depósito registrado.</p>
            )}
            {!isDepositHistoryLoading && depositHistory.length > 0 && (
              <ul className="goal-form__history-list">
                {depositHistory.map((aporte) => (
                  <li key={aporte.id}>
                    <time dateTime={aporte.data}>{new Date(aporte.data).toLocaleDateString('pt-BR')}</time>
                    <span>
                      {formatCurrency(aporte.valor, depositCurrency)}
                    </span>
                    {aporte.transacaoId ? (
                      <span className="goal-form__history-note">Receita vinculada</span>
                    ) : (
                      aporte.observacao && <span className="goal-form__history-note">{aporte.observacao}</span>
                    )}
                    <button
                      type="button"
                      className="goal-form__history-remove"
                      onClick={() => handleRemoveAporte(aporte.id)}
                      disabled={removingAporteId === aporte.id || !!aporte.transacaoId}
                      aria-label={aporte.transacaoId ? 'Remova a transação de origem para excluir' : 'Remover depósito'}
                      title={aporte.transacaoId ? 'Remova a transação de origem para excluir' : 'Remover depósito'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Modal>
    </section>
  );
};

export default Objetivo;
