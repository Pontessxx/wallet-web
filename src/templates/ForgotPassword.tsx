import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { showWarning } from '@/utils/toastHelpers';
import '@/styles/Auth.scss';

type Step = 'request' | 'reset';

const ForgotPassword = () => {
    const [step, setStep] = useState<Step>('request');
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const isSubmittingRef = useRef(false);

    const navigate = useNavigate();

    const isRequestStepFilled = username.trim() !== '';
    const isResetStepFilled =
        code.trim() !== '' && newPassword.trim() !== '' && confirmPassword.trim() !== '';

    const isActive =
        (step === 'request' ? isRequestStepFilled : isResetStepFilled) && !isLoading;

    const handleRequestCode = async () => {
        if (isLoading || isSubmittingRef.current) return;

        if (!username.trim()) {
            showWarning('Informe o usuário.');
            return;
        }

        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            await toast.promise(
                authService.requestResetCode({ username }),
                {
                    loading: 'Gerando código...',
                    success: (data) => `Código gerado: ${data.resetCode}`,
                    error: 'Não foi possível gerar o código.',
                },
                { id: 'reset-code-toast', success: { duration: 8000 } }
            );

            setStep('reset');
        } catch (err) {
            // erro já exibido pelo toast.promise
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleChangePassword = async () => {
        if (isLoading || isSubmittingRef.current) return;

        if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            showWarning('Preencha todos os campos.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showWarning('As senhas não coincidem.');
            return;
        }

        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            await toast.promise(
                authService.changePassword({ username, resetCode: code, newPassword }),
                {
                    loading: 'Atualizando senha...',
                    success: 'Senha atualizada com sucesso!',
                    error: 'Código inválido ou expirado.',
                },
                { id: 'change-password-toast' }
            );

            navigate('/login');
        } catch (err) {
            // erro já exibido pelo toast.promise
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleSubmit = () => {
        if (step === 'request') {
            handleRequestCode();
        } else {
            handleChangePassword();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-card__header">
                    <h1 className="auth-card__title">Esqueci minha senha</h1>
                    <p className="auth-card__subtitle">
                        {step === 'request'
                            ? 'Informe seu usuário para gerar um código de redefinição'
                            : 'Informe o código recebido e sua nova senha'}
                    </p>
                </header>

                <div className="auth-form">
                    {step === 'request' ? (
                        <div className="input-group">
                            <label htmlFor="username">Usuário</label>
                            <input
                                id="username"
                                className="input-field"
                                type="text"
                                autoComplete="username"
                                placeholder="Usuário"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="input-group">
                                <label htmlFor="code">Código de redefinição</label>
                                <input
                                    id="code"
                                    className="input-field"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Código recebido"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="newPassword">Nova senha</label>
                                <input
                                    id="newPassword"
                                    className="input-field"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Nova senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmPassword">Confirmar nova senha</label>
                                <input
                                    id="confirmPassword"
                                    className="input-field"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Confirmar nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    <span
                        className={`auth-submit ${isActive ? 'auth-submit--active' : ''}`}
                        role="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={isActive ? handleSubmit : undefined}
                        onKeyDown={(e) => e.key === 'Enter' && isActive && handleSubmit()}
                    >
                        {isLoading
                            ? step === 'request'
                                ? 'Gerando código...'
                                : 'Atualizando...'
                            : step === 'request'
                            ? 'Gerar código'
                            : 'Redefinir senha'}
                    </span>
                </div>

                <div className="auth-card__footer">
                    <p>
                        Lembrou a senha?{' '}
                        <span
                            className="auth-card__redirect-link"
                            role="button"
                            tabIndex={0}
                            onClick={handleLoginRedirect}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoginRedirect()}
                        >
                            Entrar
                        </span>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default ForgotPassword;