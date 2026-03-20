import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="main-header">
            <div className="header-container">
                {/* Logo */}
                <div className="logo" onClick={() => { navigate('/'); closeMenu(); }} style={{ cursor: 'pointer' }}>
                    <span className="logo-brand">GODDACK</span>
                    <span className="logo-sub">ANALÍTICA</span>
                </div>

                {/* Hamburguesa (Solo móvil) */}
                <button className={`hamburger ${menuOpen ? 'is-active' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Nav adaptable */}
                <nav className={`header-nav ${menuOpen ? 'nav-open' : ''}`}>
                    <Link to="/" onClick={closeMenu}>Inicio</Link>
                    <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                    <Link to="/reports" onClick={closeMenu}>Informes</Link>
                    {isAdmin() && <Link to="/admin" onClick={closeMenu}>Panel Admin</Link>}
                    
                    <button className="btn-new-player" onClick={() => { navigate('/jugadores/nuevo'); closeMenu(); }}>
                        + Nuevo jugador
                    </button>
                    
                    {/* Logout dentro del nav en móvil para facilitar acceso */}
                    <button className="btn-logout mobile-only" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </nav>

                {/* Usuario (Desktop) */}
                <div className="header-user desktop-only">
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