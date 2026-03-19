import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) return null; // Espera a que cargue el usuario del localStorage
    if (!user)      return <Navigate to="/login" replace />;
    if (!isAdmin()) return <Navigate to="/"      replace />;

    return children;
};

export default AdminRoute;