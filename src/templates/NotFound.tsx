import { Link } from 'react-router-dom';
import '@/styles/NotFound.scss';

const NotFound = () => {
    return (
        <div className="not-found">
            <span className="not-found__code">404</span>
            <h1 className="not-found__title">Página não encontrada</h1>
            <p className="not-found__text">
                O endereço que você tentou acessar não existe ou foi movido.
            </p>
            <Link to="/dashboard" className="not-found__link">
                Voltar para o Dashboard
            </Link>
        </div>
    );
};

export default NotFound;