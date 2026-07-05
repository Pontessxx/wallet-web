import { useState } from "react";


const Signup = () => {

    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignup = () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            alert('Preencha todos os campos.');
            return;
        }
        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        try {

        } catch (error) {
            alert('Erro ao fazer signup.');
        }
    }

  return (
    <div>Signup</div>
  )
}

export default Signup