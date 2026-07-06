import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Preencha todos os campos.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await authService.login({ username, password });
            login(response.user, response.accessToken);
            navigate('/home');
        } catch (err) {
            setError('Usuário ou senha inválidos.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p>{error}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}

export default Login