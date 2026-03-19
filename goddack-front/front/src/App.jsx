import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminRoute     from './components/ProtectedRoute/AdminRoute';
import CompareBar     from './components/CompareBar/CompareBar';
import Home           from './pages/Home/Home';
import PerfilPlayer   from './pages/PerfilPlayer/PerfilPlayer';
import Dashboard      from './pages/Dashboard/Dashboard';
import Reports        from './pages/Reports/Reports';
import ReportForm     from './pages/Reports/ReportForm';
import ReportDetail   from './pages/Reports/ReportDetail';
import NewPlayer      from './pages/NewPlayer/NewPlayer';
import EditPlayer     from './pages/EditPlayer/EditPlayer';
import AdminPage      from './pages/Admin/AdminPage';
import Comparar       from './pages/Comparar/Comparar';
import Login          from './pages/Login/Login';
import Register       from './pages/Register/Register';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <CompareProvider>
                <BrowserRouter>
                    <div className="App">
                        <Routes>
                            {/* Rutas públicas */}
                            <Route path="/login"    element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Rutas protegidas */}
                            <Route path="/" element={
                                <ProtectedRoute><Home /></ProtectedRoute>
                            } />
                            <Route path="/dashboard" element={
                                <ProtectedRoute><Dashboard /></ProtectedRoute>
                            } />
                            <Route path="/reports" element={
                                <ProtectedRoute><Reports /></ProtectedRoute>
                            } />
                            <Route path="/reports/nuevo" element={
                                <ProtectedRoute><ReportForm /></ProtectedRoute>
                            } />
                            <Route path="/reports/editar/:id" element={
                                <ProtectedRoute><ReportForm /></ProtectedRoute>
                            } />
                            <Route path="/reports/:id" element={
                                <ProtectedRoute><ReportDetail /></ProtectedRoute>
                            } />
                            <Route path="/comparar" element={
                                <ProtectedRoute><Comparar /></ProtectedRoute>
                            } />
                            <Route path="/player/:id" element={
                                <ProtectedRoute><PerfilPlayer /></ProtectedRoute>
                            } />
                            <Route path="/jugadores/nuevo"      element={<NewPlayer />} />
                            <Route path="/jugadores/editar/:id" element={<EditPlayer />} />

                            {/* Ruta solo admin */}
                            <Route path="/admin" element={
                                <AdminRoute><AdminPage /></AdminRoute>
                            } />

                            {/* Cualquier ruta desconocida → home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>

                        <CompareBar />
                    </div>
                </BrowserRouter>
            </CompareProvider>
        </AuthProvider>
    );
}

export default App;