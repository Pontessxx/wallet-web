import { useState } from 'react'

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (!username.trim() || !password.trim()) {
            alert('Preencha todos os campos.');
            return;
        }
        try {
            
        } catch (error) {
            alert('Erro ao fazer login.');
        }
    }

    return (
        <div>Login</div>
    )
}

export default Login