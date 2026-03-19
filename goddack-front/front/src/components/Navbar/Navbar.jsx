import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">GODDACK <span>ANALÍTICA</span></a>
      </div>
      <div className="navbar-links">
        <a href="/">Jugadores</a>
        <a href="/login" className="login-btn">Acceso Scout</a>
      </div>
    </nav>
  );
};

export default Navbar;