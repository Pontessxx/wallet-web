// Header.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import '@/styles/Header.scss';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } finally {
            logout();
            navigate('/login');
        }
    }

    const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??';

    return (
        <header className="app-header">
            <div className="app-header__brand">
                <span className="app-header__logo">⬡</span>
                <span className="app-header__title">Wallet</span>
            </div>

            <div className="app-header__user">
                <span className="app-header__username">{user?.username}</span>
                <span className="app-header__avatar">{initials}</span>

                <button
                    className="app-header__logout"
                    onClick={handleLogout}
                    type="button"
                >
                    Sair
                </button>
            </div>
        </header>
    )
}

export default Header