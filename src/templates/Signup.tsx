import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Preencha todos os campos.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await authService.signup({ username, password });
            login(response.user, response.accessToken);
            navigate('/home');
        } catch (err) {
            setError('Erro ao criar conta.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleSignup}>
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
                <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p>{error}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Cadastrar'}
                </button>
            </form>
        </div>
    );
}

export default Signup