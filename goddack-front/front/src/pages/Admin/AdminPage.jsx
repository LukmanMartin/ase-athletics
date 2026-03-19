import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/api';
import Header from '../../components/Header/Header';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import './AdminPage.css';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const REC_LABELS  = { Sign: 'Fichar', Monitor: 'Seguir', Pass: 'Descartar' };
const REC_COLORS  = {
    Sign:    { bg: '#dcfce7', color: '#166534' },
    Monitor: { bg: '#fef9c3', color: '#92400e' },
    Pass:    { bg: '#fee2e2', color: '#991b1b' },
};
const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const tooltipStyle = {
    contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' },
    labelStyle:   { color: '#0f172a', fontWeight: 600 }
};

const AdminPage = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [tab, setTab] = useState('reports');

    // Reports tab
    const [reports,   setReports]   = useState([]);
    const [users,     setUsers]     = useState([]);
    const [search,    setSearch]    = useState('');
    const [filterRec, setFilterRec] = useState('');
    const [confirm,   setConfirm]   = useState(null); // { type: 'report'|'user', id, name }
    const [loadingR,  setLoadingR]  = useState(true);

    // Stats tab
    const [stats,    setStats]    = useState(null);
    const [loadingS, setLoadingS] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin()) navigate('/');
    }, []);

    // Load reports + users
    useEffect(() => {
        const load = async () => {
            try {
                setLoadingR(true);
                const [rRes, uRes] = await Promise.all([
                    API.get('/reports'),
                    API.get('/users'),
                ]);
                setReports(rRes.data);
                setUsers(uRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingR(false);
            }
        };
        load();
    }, []);

    // Load stats when tab changes
    useEffect(() => {
        if (tab !== 'stats' || stats) return;
        const load = async () => {
            try {
                setLoadingS(true);
                const res = await API.get('/users/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingS(false);
            }
        };
        load();
    }, [tab]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleDeleteReport = async (id) => {
        try {
            await API.delete(`/reports/${id}`);
            setReports(prev => prev.filter(r => r._id !== id));
            setConfirm(null);
        } catch { console.error('Error al borrar informe'); }
    };

    const handleDeleteUser = async (id) => {
        try {
            await API.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            setConfirm(null);
        } catch { console.error('Error al borrar usuario'); }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.put(`/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch { console.error('Error al cambiar rol'); }
    };

    const handleConfirm = () => {
        if (!confirm) return;
        if (confirm.type === 'report') handleDeleteReport(confirm.id);
        if (confirm.type === 'user')   handleDeleteUser(confirm.id);
    };

    // ── Filtered reports ──────────────────────────────────────────────────────
    const filtered = reports.filter(r => {
        const matchS = r.playerName?.toLowerCase().includes(search.toLowerCase()) ||
                       r.scoutName?.toLowerCase().includes(search.toLowerCase());
        const matchR = !filterRec || r.recommendation === filterRec;
        return matchS && matchR;
    });

    // ── Stats data prep ───────────────────────────────────────────────────────
    const monthData = stats?.reportsByMonth?.map(m => ({
        name:  `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
        count: m.count
    })) || [];

    const recData = stats?.reportsByRec
        ?.filter(r => r._id && ['Sign','Monitor','Pass'].includes(r._id))
        .map(r => ({
            name:  REC_LABELS[r._id],
            count: r.count
        })) || [];

    return (
        <div className="admin-page">
            <Header />
            <div className="admin-container">

                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1>Panel de administración</h1>
                        <p>{reports.length} informes · {users.length} usuarios</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button className={`admin-tab ${tab==='reports'?'admin-tab--active':''}`} onClick={()=>setTab('reports')}>
                        📋 Informes
                    </button>
                    <button className={`admin-tab ${tab==='users'?'admin-tab--active':''}`} onClick={()=>setTab('users')}>
                        👥 Usuarios
                    </button>
                    <button className={`admin-tab ${tab==='stats'?'admin-tab--active':''}`} onClick={()=>setTab('stats')}>
                        📊 Estadísticas
                    </button>
                </div>

                {/* ── TAB: INFORMES ── */}
                {tab === 'reports' && (
                    <div>
                        <div className="admin-filters">
                            <input
                                className="admin-search"
                                placeholder="Buscar por jugador o scout..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <div className="admin-rec-filter">
                                {['','Sign','Monitor','Pass'].map(rec => (
                                    <button key={rec}
                                        className={`rec-pill ${filterRec===rec?'rec-pill--active':''}`}
                                        onClick={() => setFilterRec(rec)}
                                        style={filterRec===rec&&rec ? { background: REC_COLORS[rec].bg, color: REC_COLORS[rec].color, borderColor:'transparent' } : {}}
                                    >
                                        {rec ? (REC_LABELS[rec]||rec) : 'Todos'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingR ? (
                            <div className="admin-loading"><div className="admin-spinner"/><p>Cargando...</p></div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Jugador</th>
                                            <th>Scout</th>
                                            <th>Fecha</th>
                                            <th>Rival</th>
                                            <th>Rating</th>
                                            <th>Recomendación</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(r => {
                                            const recS = REC_COLORS[r.recommendation] || { bg:'#f1f5f9', color:'#475569' };
                                            return (
                                                <tr key={r._id}>
                                                    <td className="admin-table__name">{r.playerName}</td>
                                                    <td>{r.scoutName || '—'}</td>
                                                    <td>{r.date || '—'}</td>
                                                    <td>{r.matchDetails?.opponent || '—'}</td>
                                                    <td><strong>{r.overallRating ?? '—'}</strong>/10</td>
                                                    <td>
                                                        <span className="admin-rec-badge" style={{ background: recS.bg, color: recS.color }}>
                                                            {REC_LABELS[r.recommendation] || r.recommendation || '—'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="admin-actions">
                                                            <button className="admin-btn admin-btn--view"
                                                                onClick={() => navigate(`/reports/${r._id}`)}>
                                                                Ver
                                                            </button>
                                                            <button className="admin-btn admin-btn--edit"
                                                                onClick={() => navigate(`/reports/editar/${r._id}`)}>
                                                                Editar
                                                            </button>
                                                            <button className="admin-btn admin-btn--delete"
                                                                onClick={() => setConfirm({ type:'report', id: r._id, name: `informe de ${r.playerName}` })}>
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {filtered.length === 0 && (
                                    <p className="admin-empty">No hay informes con esos filtros.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: USUARIOS ── */}
                {tab === 'users' && (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Informes</th>
                                    <th>Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td className="admin-table__name">{u.name}</td>
                                        <td className="admin-table__email">{u.email}</td>
                                        <td>
                                            <select
                                                className={`admin-role-select admin-role-select--${u.role}`}
                                                value={u.role}
                                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                            >
                                                <option value="scout">Scout</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>{u.reportCount ?? 0}</td>
                                        <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}</td>
                                        <td>
                                            <button className="admin-btn admin-btn--delete"
                                                onClick={() => setConfirm({ type:'user', id: u._id, name: u.name })}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── TAB: ESTADÍSTICAS ── */}
                {tab === 'stats' && (
                    loadingS ? (
                        <div className="admin-loading"><div className="admin-spinner"/><p>Cargando estadísticas...</p></div>
                    ) : stats && (
                        <div className="admin-stats">

                            {/* KPIs */}
                            <div className="admin-kpis">
                                <div className="admin-kpi">
                                    <span className="admin-kpi__val">{stats.totalUsers}</span>
                                    <span className="admin-kpi__label">Scouts registrados</span>
                                </div>
                                <div className="admin-kpi">
                                    <span className="admin-kpi__val">{stats.totalReports}</span>
                                    <span className="admin-kpi__label">Informes totales</span>
                                </div>
                                <div className="admin-kpi">
                                    <span className="admin-kpi__val">
                                        {stats.totalUsers > 0 ? (stats.totalReports / stats.totalUsers).toFixed(1) : '—'}
                                    </span>
                                    <span className="admin-kpi__label">Informes por scout</span>
                                </div>
                                <div className="admin-kpi">
                                    <span className="admin-kpi__val">{stats.mostScouted?.[0]?._id || '—'}</span>
                                    <span className="admin-kpi__label">Jugador más analizado</span>
                                </div>
                            </div>

                            <div className="admin-charts">
                                {/* Informes por mes */}
                                {monthData.length > 0 && (
                                    <div className="admin-chart-card admin-chart-card--wide">
                                        <h3>Informes por mes (últimos 6 meses)</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={monthData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                <Tooltip {...tooltipStyle} />
                                                <Bar dataKey="count" name="Informes" fill="#0ea5e9" radius={[4,4,0,0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Informes por scout */}
                                {stats.reportsByScout?.length > 0 && (
                                    <div className="admin-chart-card">
                                        <h3>Top scouts por informes</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={stats.reportsByScout} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                <YAxis type="category" dataKey="_id" width={100} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                <Tooltip {...tooltipStyle} />
                                                <Bar dataKey="count" name="Informes" fill="#10b981" radius={[0,4,4,0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Recomendaciones */}
                                {recData.length > 0 && (
                                    <div className="admin-chart-card">
                                        <h3>Distribución de recomendaciones</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={recData} dataKey="count" nameKey="name"
                                                    cx="50%" cy="45%" outerRadius={65}
                                                    label={false}>
                                                    {recData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip {...tooltipStyle} formatter={(v, n) => [v + ' informes', n]} />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Jugadores más scouted */}
                                {stats.mostScouted?.length > 0 && (
                                    <div className="admin-chart-card">
                                        <h3>Jugadores más analizados</h3>
                                        <div className="admin-most-scouted">
                                            {stats.mostScouted.map((p, i) => (
                                                <div key={i} className="admin-scouted-row">
                                                    <span className="admin-scouted-rank">#{i+1}</span>
                                                    <span className="admin-scouted-name">{p._id}</span>
                                                    <span className="admin-scouted-count">{p.count} informes</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}

            </div>

            {confirm && (
                <ConfirmModal
                    message={`¿Eliminar ${confirm.name}? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    );
};

export default AdminPage;