import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import '@/styles/Header.scss';
import { ArrowRightLeft, Eye, EyeOff, Minus, Plus } from 'lucide-react';
import { useVisibility } from '@/contexts/VisibilityContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDateFilter } from '@/contexts/DateFilterContext';
import Modal from '@/components/Modal';
import { carteiraService } from '@/services/carteiraService';
import { categoriaService } from '@/services/categoriaService';
import { transferService } from '@/services/transferService';
import { transactionService } from '@/services/transactionService';
import { exchangeService } from '@/services/exchangeService';

const MONTH_OPTIONS = [
    { value: 0, label: 'Jan' },
    { value: 1, label: 'Fev' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Abr' },
    { value: 4, label: 'Mai' },
    { value: 5, label: 'Jun' },
    { value: 6, label: 'Jul' },
    { value: 7, label: 'Ago' },
    { value: 8, label: 'Set' },
    { value: 9, label: 'Out' },
    { value: 10, label: 'Nov' },
    { value: 11, label: 'Dez' },
];

const toDateInputValue = (date = new Date()) => {
    const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

type HeaderAction = 'Receita' | 'Despesa' | 'Transferencia' | 'OperacaoBolsa';

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
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 13 }, (_, index) => currentYear - 6 + index);

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
                const mapped = categories.map((categoria) => ({ id: categoria.id, nome: categoria.nome }));
                setCategoryOptions(mapped);
                setCategoriaId((prev) => prev || mapped[0]?.id || '');
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
                    dataLancamento,
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
                    dataLancamento,
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
                    dataLancamento,
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
                    <>
                        <select
                            className="app-header__period-value"
                            value={monthDate.getMonth()}
                            onChange={(event) => {
                                const nextMonth = Number(event.target.value);
                                setMonthDate(new Date(monthDate.getFullYear(), nextMonth, 1));
                            }}
                            aria-label="Mes do período"
                        >
                            {MONTH_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className="app-header__period-value app-header__period-value--year"
                            value={monthDate.getFullYear()}
                            onChange={(event) => {
                                const nextYear = Number(event.target.value);
                                setMonthDate(new Date(nextYear, monthDate.getMonth(), 1));
                            }}
                            aria-label="Ano do período"
                        >
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </>
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

            <div className="app-header__actions">
                <button type="button" className="app-header__action-btn app-header__action-btn--success" onClick={() => handleOpenActionModal('Receita')}>
                    <Plus size={15} /> Receita
                </button>
                <button type="button" className="app-header__action-btn app-header__action-btn--danger" onClick={() => handleOpenActionModal('Despesa')}>
                    <Minus size={15} /> Despesa
                </button>
                <button type="button" className="app-header__action-btn app-header__action-btn--neutral" onClick={() => handleOpenActionModal('Transferencia')}>
                    <ArrowRightLeft size={15} /> Transferencia
                </button>
                <button type="button" className="app-header__action-btn app-header__action-btn--success" onClick={() => handleOpenActionModal('OperacaoBolsa')}>
                    <Plus size={15} /> Operacao Bolsa
                </button>
            </div>

            <div className="app-header__user">

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
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={precoUnitario}
                                    onChange={(event) => setPrecoUnitario(Number(event.target.value))}
                                />
                            </label>
                        </>
                    ) : (
                        <>
                            <label>
                                Valor
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={valor}
                                    onChange={(event) => setValor(Number(event.target.value))}
                                />
                            </label>

                            <label>
                                Encargos
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={encargos}
                                    onChange={(event) => setEncargos(Number(event.target.value))}
                                />
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