import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { showWarning } from '@/utils/toastHelpers';
import '@/styles/Auth.scss';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const isSubmittingRef = useRef(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const isFormFilled = username.trim() !== '' && password.trim() !== '';
    const isActive = isFormFilled && !isLoading;

    const handleLogin = async () => {
        if (isLoading || isSubmittingRef.current) return;

        if (!username.trim() || !password.trim()) {
            showWarning('Preencha todos os campos.');
            return;
        }

        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            const response = await toast.promise(
                authService.login({ username, password }),
                {
                    loading: 'Entrando...',
                    success: 'Login realizado com sucesso!',
                    error: 'Usuário ou senha inválidos.',
                },
                { id: 'login-toast' }
            );

            login(
                    response.userId,
                    response.username,
                    response.accessToken,
                    response.expiresIn
                );
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
            handleLogin();
        }
    }

    const handleSignupRedirect = () => {
        navigate('/signup');
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-card__header">
                    <h1 className="auth-card__title">Bem-vindo</h1>
                    <p className="auth-card__subtitle">Entre com sua conta</p>
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
                            autoComplete="current-password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                    </div>

                    <span
                        className={`auth-submit ${isActive ? 'auth-submit--active' : ''}`}
                        role="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={isActive ? handleLogin : undefined}
                        onKeyDown={(e) => e.key === 'Enter' && isActive && handleLogin()}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </span>
                </div>

                <div className="auth-card__footer">
                    <p>
                        Não tem uma conta?{' '}
                        <span
                            className="auth-card__redirect-link"
                            role="button"
                            tabIndex={0}
                            onClick={handleSignupRedirect}
                            onKeyDown={(e) => e.key === 'Enter' && handleSignupRedirect()}
                        >
                            Cadastre-se
                        </span>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login