import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/api';
import Header from '../../components/Header/Header';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './Reports.css';

const RECOMMENDATION_COLORS = {
    'Sign':    { bg: '#dcfce7', color: '#166534' },
    'Monitor': { bg: '#fef9c3', color: '#92400e' },
    'Pass':    { bg: '#fee2e2', color: '#991b1b' },
};
const RECOMMENDATION_LABELS = {
    'Sign': 'Fichar', 'Monitor': 'Seguir', 'Pass': 'Descartar'
};

const Reports = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [searchParams] = useSearchParams();
    const [reports,   setReports]   = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState(searchParams.get('player') || '');
    const [filterRec, setFilterRec] = useState('');
    const [confirm,   setConfirm]   = useState(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await API.get('/reports');
            setReports(res.data);
        } catch {
            console.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    const handleDelete = async (id) => {
        try {
            await API.delete(`/reports/${id}`);
            setReports(reports.filter(r => r._id !== id));
            setConfirm(null);
        } catch {
            console.error('Error al borrar reporte');
        }
    };

    const filtered = reports.filter(r => {
        const matchSearch = r.playerName?.toLowerCase().includes(search.toLowerCase()) ||
                            r.scoutName?.toLowerCase().includes(search.toLowerCase());
        const matchRec    = !filterRec || r.recommendation === filterRec;
        return matchSearch && matchRec;
    });

    return (
        <div className="reports-page">
            <Header />
            <div className="reports-container">

                <div className="reports-header">
                    <div>
                        <h1>Informes de Scouting</h1>
                        <p>{reports.length} informes registrados</p>
                    </div>
                    <button className="btn-new-report" onClick={() => navigate('/reports/nuevo')}>
                        + Nuevo informe
                    </button>
                </div>

                <div className="reports-filters">
                    <input
                        type="text"
                        placeholder="Buscar por jugador o scout..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="reports-search"
                    />
                    <div className="reports-rec-filter">
                        {['', 'Sign', 'Monitor', 'Pass'].map(rec => (
                            <button
                                key={rec}
                                className={`rec-filter-btn ${filterRec === rec ? 'rec-filter-btn--active' : ''}`}
                                onClick={() => setFilterRec(rec)}
                                style={filterRec === rec && rec
                                    ? { background: RECOMMENDATION_COLORS[rec].bg, color: RECOMMENDATION_COLORS[rec].color, borderColor: 'transparent' }
                                    : {}
                                }
                            >
                                {rec ? RECOMMENDATION_LABELS[rec] : 'Todos'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="reports-loading">
                        <div className="reports-spinner" />
                        <p>Cargando informes...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="reports-empty">
                        <p>No hay informes{search ? ' con esa búsqueda' : ''}.</p>
                        {!search && !filterRec && (
                            <button onClick={() => navigate('/reports/nuevo')}>
                                Crear primer informe
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="reports-grid">
                        {filtered.map(r => {
                            const canEdit  = isAdmin() || r.scoutName === user?.name;
                            const recStyle = RECOMMENDATION_COLORS[r.recommendation] || { bg: '#f1f5f9', color: '#475569' };
                            return (
                                <div key={r._id} className="report-card">
                                    <div className="report-card__header">
                                        <div>
                                            <h3>{r.playerName}</h3>
                                            <p>{r.matchDetails?.competition} vs {r.matchDetails?.opponent}</p>
                                        </div>
                                        <span className="report-card__rec"
                                            style={{ background: recStyle.bg, color: recStyle.color }}>
                                            {RECOMMENDATION_LABELS[r.recommendation] || r.recommendation || '—'}
                                        </span>
                                    </div>

                                    <div className="report-card__meta">
                                        <span>🧑 {r.scoutName || '—'}</span>
                                        <span>📅 {r.date || '—'}</span>
                                        <span>⭐ {r.overallRating ?? '—'}/10</span>
                                    </div>

                                    {r.notes && (
                                        <p className="report-card__notes">{r.notes}</p>
                                    )}

                                    <div className="report-card__footer">
                                        <button className="btn-view"
                                            onClick={() => navigate(`/reports/${r._id}`)}>
                                            Ver
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button className="btn-edit"
                                                    onClick={() => navigate(`/reports/editar/${r._id}`)}>
                                                    Editar
                                                </button>
                                                <button className="btn-delete"
                                                    onClick={() => setConfirm(r._id)}>
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {confirm && (
                <ConfirmModal
                    message="¿Eliminar este informe? Esta acción no se puede deshacer."
                    onConfirm={() => handleDelete(confirm)}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    );
};

export default Reports;