import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import '@/styles/Header.scss';
import { ArrowRightLeft, ChevronLeft, ChevronRight, Eye, EyeOff, Minus, Plus, TrendingUp } from 'lucide-react';
import { useVisibility } from '@/contexts/VisibilityContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useDropdownMenu } from '@/hooks/useDropdownMenu';
import Modal from '@/components/Modal';
import CurrencyInput from '@/components/CurrencyInput';
import { carteiraService } from '@/services/carteiraService';
import { categoriaService } from '@/services/categoriaService';
import { transferService } from '@/services/transferService';
import { transactionService } from '@/services/transactionService';
import { exchangeService } from '@/services/exchangeService';

const MONTH_FULL_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const toDateInputValue = (date = new Date()) => {
    const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

// O backend espera um DateTime UTC (timestamp with time zone); o input type="date"
// só fornece "AAAA-MM-DD", que precisa virar um ISO string completo antes do envio.
const toUtcDateTime = (dateOnlyValue: string) => new Date(`${dateOnlyValue}T00:00:00.000Z`).toISOString();

type HeaderAction = 'Receita' | 'Despesa' | 'Transferencia' | 'OperacaoBolsa';

const HEADER_ACTIONS: Array<{ key: HeaderAction; label: string; icon: typeof Plus; className: string }> = [
    { key: 'Receita', label: 'Receita', icon: Plus, className: 'app-header__actions-item--success' },
    { key: 'Despesa', label: 'Despesa', icon: Minus, className: 'app-header__actions-item--danger' },
    { key: 'Transferencia', label: 'Transferencia', icon: ArrowRightLeft, className: 'app-header__actions-item--neutral' },
    { key: 'OperacaoBolsa', label: 'Operacao Bolsa', icon: TrendingUp, className: 'app-header__actions-item--success' },
];

const HEADER_ACTIONS_MENU_ID = 'header-actions';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { showValues, toggleValues } = useVisibility();
    const {
        mode,
        startDate,
        endDate,
        monthDate,
        yearDate,
        setMode,
        setRange,
        setMonthDate,
        setYearDate,
    } = useDateFilter();
    const [activeAction, setActiveAction] = useState<HeaderAction | null>(null);
    const [walletOptions, setWalletOptions] = useState<Array<{ id: string; nome: string }>>([]);
    const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; nome: string }>>([]);
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

    const {
        openId: openActionsMenuId,
        position: actionsMenuPosition,
        menuRef: actionsMenuRef,
        registerTriggerRef: registerActionsTriggerRef,
        toggle: toggleActionsMenu,
        close: closeActionsMenu,
    } = useDropdownMenu(200);

    const [carteiraId, setCarteiraId] = useState('');
    const [carteiraDestinoId, setCarteiraDestinoId] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [valor, setValor] = useState(0);
    const [encargos, setEncargos] = useState(0);
    const [dataLancamento, setDataLancamento] = useState(toDateInputValue());
    const [observacoes, setObservacoes] = useState('');

    const [lado, setLado] = useState<'Compra' | 'Venda'>('Compra');
    const [codigoAtivo, setCodigoAtivo] = useState('');
    const [quantidade, setQuantidade] = useState(0);
    const [precoUnitario, setPrecoUnitario] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } finally {
            logout();
            navigate('/login');
        }
    }

    const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??';

    // --- Navegação de mês (pílula "< Mês >") ---
    const today = new Date();
    const isCurrentMonth =
        monthDate.getFullYear() === today.getFullYear() &&
        monthDate.getMonth() === today.getMonth();

    const goToMonth = (year: number, month: number) => {
        setMonthDate(new Date(year, month, 1));
        setShowMonthYearPicker(false);
    };

    const handlePrevMonth = () => {
        goToMonth(monthDate.getFullYear(), monthDate.getMonth() - 1);
    };

    const handleNextMonth = () => {
        goToMonth(monthDate.getFullYear(), monthDate.getMonth() + 1);
    };

    const handleMonthLabelClick = () => {
        if (isCurrentMonth) {
            // já estou no mês atual -> abre o seletor de mês/ano
            setShowMonthYearPicker((prev) => !prev);
        } else {
            // estou em outro mês -> volta direto para o mês atual
            goToMonth(today.getFullYear(), today.getMonth());
        }
    };

    useEffect(() => {
        if (!activeAction) return;

        let isMounted = true;

        const loadWallets = async () => {
            try {
                const summary = await carteiraService.getSummary();
                if (!isMounted) return;

                const sourceWallets = activeAction === 'OperacaoBolsa'
                    ? summary.carteiras.filter((wallet) => wallet.categoria === 'Investimento')
                    : summary.carteiras;

                const wallets = sourceWallets.map((wallet) => ({ id: wallet.id, nome: wallet.nome }));
                setWalletOptions(wallets);
                setCarteiraId(wallets[0]?.id || '');
                setCarteiraDestinoId(wallets[1]?.id || wallets[0]?.id || '');
            } catch {
                if (isMounted) {
                    setWalletOptions([]);
                }
            }
        };

        const loadCategories = async () => {
            if (activeAction === 'Transferencia' || activeAction === 'OperacaoBolsa') {
                setCategoryOptions([]);
                return;
            }

            try {
                const categories = await categoriaService.list();
                if (!isMounted) return;
                const mapped = categories
                    .filter((categoria) => categoria.tipo === activeAction)
                    .map((categoria) => ({ id: categoria.id, nome: categoria.nome }));
                setCategoryOptions(mapped);
                setCategoriaId(mapped[0]?.id || '');
            } catch {
                if (isMounted) {
                    setCategoryOptions([]);
                }
            }
        };

        void loadWallets();
        void loadCategories();

        return () => {
            isMounted = false;
        };
    }, [activeAction]);

    const resetForm = () => {
        setCarteiraId(walletOptions[0]?.id ?? '');
        setCarteiraDestinoId(walletOptions[1]?.id ?? walletOptions[0]?.id ?? '');
        setCategoriaId(categoryOptions[0]?.id ?? '');
        setValor(0);
        setEncargos(0);
        setDataLancamento(toDateInputValue());
        setObservacoes('');
        setLado('Compra');
        setCodigoAtivo('');
        setQuantidade(0);
        setPrecoUnitario(0);
        setFormError(null);
    };

    const handleOpenActionModal = (action: HeaderAction) => {
        setActiveAction(action);
        resetForm();
    };

    const handleCloseModal = () => {
        setActiveAction(null);
        setFormError(null);
    };

    const dispatchRefreshEvent = (eventName: 'wallet:transactions-updated' | 'wallet:exchange-updated') => {
        window.dispatchEvent(new Event(eventName));
    };

    const handleSubmit = async () => {
        if (!activeAction) return;

        setFormError(null);

        if (!carteiraId) {
            setFormError('Selecione a carteira.');
            return;
        }

        if (activeAction === 'OperacaoBolsa') {
            if (!codigoAtivo.trim()) {
                setFormError('Informe o codigo do ativo.');
                return;
            }

            if (quantidade <= 0 || precoUnitario <= 0) {
                setFormError('Quantidade e preco unitario devem ser maiores que zero.');
                return;
            }
        } else {
            if (valor <= 0) {
                setFormError('Informe um valor maior que zero.');
                return;
            }
        }

        if (activeAction === 'Transferencia') {
            if (!carteiraDestinoId) {
                setFormError('Selecione a carteira de destino.');
                return;
            }

            if (carteiraDestinoId === carteiraId) {
                setFormError('A carteira de destino deve ser diferente da origem.');
                return;
            }
        }

        if ((activeAction === 'Receita' || activeAction === 'Despesa') && !categoriaId) {
            setFormError('Selecione a categoria.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (activeAction === 'OperacaoBolsa') {
                await exchangeService.create({
                    carteiraId,
                    lado,
                    codigoAtivo: codigoAtivo.trim().toUpperCase(),
                    quantidade,
                    precoUnitario,
                    encargos,
                    efetivada: true,
                    dataLancamento: toUtcDateTime(dataLancamento),
                    observacoes: observacoes.trim() || null,
                });
                dispatchRefreshEvent('wallet:exchange-updated');
            } else if (activeAction === 'Transferencia') {
                await transactionService.createTransfer({
                    carteiraId,
                    carteiraDestinoId,
                    valor,
                    encargos,
                    efetivada: true,
                    dataLancamento: toUtcDateTime(dataLancamento),
                    observacoes: observacoes.trim() || null,
                });
                dispatchRefreshEvent('wallet:transactions-updated');
            } else {
                await transferService.create({
                    carteiraId,
                    tipo: activeAction,
                    categoriaId,
                    valor,
                    encargos,
                    efetivada: true,
                    dataLancamento: toUtcDateTime(dataLancamento),
                    observacoes: observacoes.trim() || null,
                });
                dispatchRefreshEvent('wallet:transactions-updated');
            }

            handleCloseModal();
        } catch {
            setFormError('Não foi possível concluir a operação. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <header className="app-header">
            <div className="app-header__filters">
                <select
                    className="app-header__period-type"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as typeof mode)}
                    aria-label="Tipo de período"
                >
                    <option value="monthly">Mensal</option>
                    <option value="range">Intervalo</option>
                    <option value="yearly">Anual</option>
                </select>

                {mode === 'range' && (
                    <DatePicker
                        selected={startDate}
                        onChange={(dates: [Date | null, Date | null]) => {
                            const [start, end] = dates;
                            setRange(start, end);
                        }}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        dateFormat="dd/MM/yyyy"
                        className="app-header__datepicker"
                        placeholderText="Selecionar período"
                    />
                )}

                {mode === 'monthly' && (
                    <div className="app-header__month-nav">
                        <button
                            type="button"
                            className="app-header__month-nav-btn"
                            onClick={handlePrevMonth}
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <DatePicker
                            selected={monthDate}
                            onChange={(date: Date | null) => {
                                if (date) {
                                    goToMonth(date.getFullYear(), date.getMonth());
                                } else {
                                    setShowMonthYearPicker(false);
                                }
                            }}
                            showMonthYearPicker
                            open={showMonthYearPicker}
                            onInputClick={handleMonthLabelClick}
                            onClickOutside={() => setShowMonthYearPicker(false)}
                            customInput={
                                <button
                                    type="button"
                                    className="app-header__month-label"
                                >
                                    {MONTH_FULL_NAMES[monthDate.getMonth()]}
                                </button>
                            }
                        />

                        <button
                            type="button"
                            className="app-header__month-nav-btn"
                            onClick={handleNextMonth}
                            aria-label="Próximo mês"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {mode === 'yearly' && (
                    <DatePicker
                        selected={yearDate}
                        onChange={(date: Date | null) => {
                            if (date) setYearDate(date);
                        }}
                        dateFormat="yyyy"
                        showYearPicker
                        className="app-header__datepicker"
                    />
                )}
            </div>

            <div className="app-header__user">

                <div className="app-header__actions">
                    <button
                        type="button"
                        ref={registerActionsTriggerRef(HEADER_ACTIONS_MENU_ID)}
                        className="app-header__actions-trigger"
                        aria-haspopup="menu"
                        aria-expanded={openActionsMenuId === HEADER_ACTIONS_MENU_ID}
                        aria-label="Nova movimentação"
                        onClick={() => toggleActionsMenu(HEADER_ACTIONS_MENU_ID)}
                    >
                        <Plus size={18} />
                    </button>

                    {openActionsMenuId === HEADER_ACTIONS_MENU_ID && actionsMenuPosition && createPortal(
                        <div
                            ref={actionsMenuRef}
                            className="app-header__actions-menu"
                            role="menu"
                            style={{ top: actionsMenuPosition.top, left: actionsMenuPosition.left }}
                        >
                            {HEADER_ACTIONS.map(({ key, label, icon: Icon, className }) => (
                                <button
                                    key={key}
                                    type="button"
                                    role="menuitem"
                                    className={`app-header__actions-item ${className}`}
                                    onClick={() => {
                                        closeActionsMenu();
                                        handleOpenActionModal(key);
                                    }}
                                >
                                    <Icon size={16} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>,
                        document.body
                    )}
                </div>

                <button
                    className="app-header__visibility"
                    onClick={toggleValues}
                    type="button"
                >
                    {showValues ? <Eye size={26} /> : <EyeOff size={26} />}
                </button>

                <span className="app-header__username">
                    {user?.username}
                </span>

                <span className="app-header__avatar">
                    {initials}
                </span>

                <button
                    className="app-header__logout"
                    onClick={handleLogout}
                    type="button"
                >
                    Sair
                </button>

            </div>

            <Modal
                isOpen={!!activeAction}
                onClose={handleCloseModal}
                title={activeAction ? (activeAction === 'OperacaoBolsa' ? 'Nova Operacao de Bolsa' : `Nova ${activeAction}`) : ''}
            >
                <div className="app-header__form">
                    <label>
                        Carteira {activeAction === 'Transferencia' ? 'de origem' : ''}
                        <select value={carteiraId} onChange={(event) => setCarteiraId(event.target.value)}>
                            <option value="">Selecione</option>
                            {walletOptions.map((wallet) => (
                                <option key={wallet.id} value={wallet.id}>{wallet.nome}</option>
                            ))}
                        </select>
                    </label>

                    {activeAction === 'OperacaoBolsa' && walletOptions.length === 0 && (
                        <p className="app-header__form-error">Nenhuma carteira de investimento disponível.</p>
                    )}

                    {activeAction === 'Transferencia' && (
                        <label>
                            Carteira de destino
                            <select value={carteiraDestinoId} onChange={(event) => setCarteiraDestinoId(event.target.value)}>
                                <option value="">Selecione</option>
                                {walletOptions
                                    .filter((wallet) => wallet.id !== carteiraId)
                                    .map((wallet) => (
                                        <option key={wallet.id} value={wallet.id}>{wallet.nome}</option>
                                    ))}
                            </select>
                        </label>
                    )}

                    {(activeAction === 'Receita' || activeAction === 'Despesa') && (
                        <label>
                            Categoria
                            <select value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)}>
                                <option value="">Selecione</option>
                                {categoryOptions.map((category) => (
                                    <option key={category.id} value={category.id}>{category.nome}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    {activeAction === 'OperacaoBolsa' ? (
                        <>
                            <label>
                                Lado
                                <select value={lado} onChange={(event) => setLado(event.target.value as 'Compra' | 'Venda')}>
                                    <option value="Compra">Compra</option>
                                    <option value="Venda">Venda</option>
                                </select>
                            </label>

                            <label>
                                Codigo do ativo
                                <input
                                    type="text"
                                    value={codigoAtivo}
                                    onChange={(event) => setCodigoAtivo(event.target.value)}
                                    placeholder="Ex.: PETR4"
                                />
                            </label>

                            <label>
                                Quantidade
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={quantidade}
                                    onChange={(event) => setQuantidade(Number(event.target.value))}
                                />
                            </label>

                            <label>
                                Preco unitario
                                <CurrencyInput value={precoUnitario} onChange={setPrecoUnitario} />
                            </label>
                        </>
                    ) : (
                        <>
                            <label>
                                Valor
                                <CurrencyInput value={valor} onChange={setValor} />
                            </label>

                            <label>
                                Encargos
                                <CurrencyInput value={encargos} onChange={setEncargos} />
                            </label>
                        </>
                    )}

                    <label>
                        Data de lancamento
                        <input
                            type="date"
                            value={dataLancamento}
                            onChange={(event) => setDataLancamento(event.target.value)}
                        />
                    </label>

                    <label>
                        Observacoes
                        <textarea
                            value={observacoes}
                            onChange={(event) => setObservacoes(event.target.value)}
                            rows={3}
                        />
                    </label>

                    {formError && <p className="app-header__form-error">{formError}</p>}

                    <button
                        type="button"
                        className="app-header__submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting || (activeAction === 'OperacaoBolsa' && walletOptions.length === 0)}
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </Modal>
        </header>
    )
}

export default Header