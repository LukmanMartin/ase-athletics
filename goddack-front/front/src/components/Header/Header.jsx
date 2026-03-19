import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="main-header">
            <div className="header-container">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span className="logo-brand">GODDACK</span>
                    <span className="logo-sub">ANALÍTICA</span>
                </div>

                <nav className="header-nav">
                    <a href="/">Inicio</a>
                    <a href="/dashboard">Dashboard</a>
                    <a href="/reports">Informes</a>
                    {isAdmin() && <a href="/admin">Panel Admin</a>}
                    <button className="btn-new-player" onClick={() => navigate('/jugadores/nuevo')}>
                        + Nuevo jugador
                    </button>
                </nav>

                <div className="header-user">
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className={`user-role user-role--${user?.role}`}>
                            {user?.role === 'admin' ? 'Admin' : 'Scout'}
                        </span>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;