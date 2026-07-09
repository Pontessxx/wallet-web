import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { showWarning } from '@/utils/toastHelpers';
import '@/styles/Auth.scss';

const Signup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const isSubmittingRef = useRef(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const isFormFilled = username.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';
    const isActive = isFormFilled && !isLoading;

    const handleSignup = async () => {
        if (isLoading || isSubmittingRef.current) return;

        if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            showWarning('Preencha todos os campos.');
            return;
        }
        if (password !== confirmPassword) {
            showWarning('As senhas não coincidem.');
            return;
        }

        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            const response = await toast.promise(
                authService.signup({ username, password }),
                {
                    loading: 'Criando conta...',
                    success: 'Conta criada com sucesso!',
                    error: 'Erro ao criar conta.',
                },
                { id: 'signup-toast' }
            );

            login(response.user, response.accessToken);
            navigate('/home');
        } catch (err) {
            // erro já exibido pelo toast.promise
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSignup();
        }
    }

    const handleLoginRedirect = () => {
        navigate('/login');
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-card__header">
                    <h1 className="auth-card__title">Criar conta</h1>
                    <p className="auth-card__subtitle">Preencha os dados para se cadastrar</p>
                </header>

                <div className="auth-form">
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

                    <div className="input-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            className="input-field"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirmar senha</label>
                        <input
                            id="confirmPassword"
                            className="input-field"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirmar senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                    </div>

                    <span
                        className={`auth-submit ${isActive ? 'auth-submit--active' : ''}`}
                        role="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={isActive ? handleSignup : undefined}
                        onKeyDown={(e) => e.key === 'Enter' && isActive && handleSignup()}
                    >
                        {isLoading ? 'Criando conta...' : 'Cadastrar'}
                    </span>
                </div>

                <div className="auth-card__footer">
                    <p>
                        Já tem uma conta?{' '}
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
}

export default Signup