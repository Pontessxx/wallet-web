import '@/styles/Header.scss';

const Header = () => {
    return (
        <header className="header">
            <div className="header__container">

                <div className="header__logo">
                    <h1>MyWallet</h1>
                </div>

                <div className="header__actions">

                    <button className="header__profile">
                        USER
                    </button>
                </div>

            </div>
        </header>
    );
};

export default Header;