import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/api';
import Header from '../../components/Header/Header';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import './Dashboard.css';

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#ec4899'];

// Grupos de posiciones — al seleccionar uno se filtran todas sus posiciones a la vez
const POSITION_GROUPS = [
    { label: 'Delanteros',      positions: ['Forward', 'ST', 'CAM', 'Attacking Midfielder', 'Centre Forward', 'Second Striker', 'CF'] },
    { label: 'Centrocampistas', positions: ['Midfielder', 'Central Midfielder', 'Defensive Midfielder', 'Box-to-Box Midfielder', 'CM', 'Right Midfielder'] },
    { label: 'Extremos',        positions: ['Left Winger', 'Right Winger', 'Left Wing', 'Right Wing', 'LW', 'RW'] },
    { label: 'Defensas',        positions: ['Defender', 'Centre Back', 'Centre-Back', 'Left Back', 'Right Back'] },
    { label: 'Porteros',        positions: ['Goalkeeper', 'Portero'] },
];

const currency = (v) => v != null
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
    : '—';

const AGE_LABELS = { 15: '15-19', 20: '20-24', 25: '25-29', 30: '30-34', 35: '35+' };

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ value, label, sub, accent }) => (
    <div className={`kpi-card ${accent ? `kpi-card--${accent}` : ''}`}>
        <span className={`kpi-value ${typeof value === 'string' && value.length > 10 ? 'kpi-value--sm' : ''}`}>
            {value}
        </span>
        <span className="kpi-label">{label}</span>
        {sub && <span className="kpi-sub">{sub}</span>}
    </div>
);

// ── Chart Card ────────────────────────────────────────────────────────────────
const ChartCard = ({ title, hint, wide, children }) => (
    <div className={`chart-card ${wide ? 'chart-card--wide' : ''}`}>
        <h3>
            {title}
            {hint && <span className="chart-hint"> — {hint}</span>}
        </h3>
        {children}
    </div>
);

// ── Mini panel de jugadores ───────────────────────────────────────────────────
const PlayersPanel = ({ players, onPlayerClick }) => {
    if (!players?.length) return null;
    return (
        <div className="players-panel">
            <h3 className="players-panel__title">
                Jugadores con estos filtros
                <span className="players-panel__count">{players.length}</span>
            </h3>
            <div className="players-panel__table-wrap">
                <table className="players-panel__table">
                    <thead>
                        <tr>
                            <th>Jugador</th>
                            <th>Posición</th>
                            <th>Equipo</th>
                            <th>Edad</th>
                            <th>Goles</th>
                            <th>Asist.</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(p => (
                            <tr key={p.id} onClick={() => onPlayerClick(p.id)} className="players-panel__row">
                                <td className="players-panel__name">{p.name}</td>
                                <td><span className="players-panel__badge">{p.position}</span></td>
                                <td>{p.team || '—'}</td>
                                <td>{p.age || '—'}</td>
                                <td>{p.stats?.goals ?? '—'}</td>
                                <td>{p.stats?.assists ?? '—'}</td>
                                <td>{currency(p.marketData?.currentMarketValue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // filterPos guarda el label del grupo (ej: "Delanteros")
    const [filterPos,   setFilterPos]   = useState(searchParams.get('posGroup') || '');
    const [filterTeam,  setFilterTeam]  = useState(searchParams.get('team')     || '');
    const [minAge,      setMinAge]      = useState(searchParams.get('minAge')   || '');
    const [maxAge,      setMaxAge]      = useState(searchParams.get('maxAge')   || '');

    const [stats,        setStats]        = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [radarPosition, setRadarPosition] = useState(null);

    // Convierte el label del grupo en string de posiciones para el backend
    const groupToPositions = (groupLabel) => {
        if (!groupLabel) return '';
        const group = POSITION_GROUPS.find(g => g.label === groupLabel);
        return group ? group.positions.join(',') : groupLabel;
    };

    const fetchStats = useCallback(async (posGroup, team, min, max) => {
        try {
            setLoading(true);
            const params = {};
            if (posGroup) params.position = groupToPositions(posGroup);
            if (team)     params.team     = team;
            if (min)      params.minAge   = min;
            if (max)      params.maxAge   = max;
            const res = await API.get('/dashboard/stats', { params });
            setStats(res.data);
            if (res.data.radarData?.length && !radarPosition) {
                setRadarPosition(res.data.radarData[0].position);
            }
        } catch {
            setError('Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats(filterPos, filterTeam, minAge, maxAge);
    }, []);

    const handleApply = () => {
        const params = {};
        if (filterPos)  params.posGroup = filterPos;
        if (filterTeam) params.team     = filterTeam;
        if (minAge)     params.minAge   = minAge;
        if (maxAge)     params.maxAge   = maxAge;
        setSearchParams(params);
        fetchStats(filterPos, filterTeam, minAge, maxAge);
    };

    const handleClear = () => {
        setFilterPos(''); setFilterTeam('');
        setMinAge('');    setMaxAge('');
        setSearchParams({});
        fetchStats('', '', '', '');
    };

    const goToPlayers = (params) => {
        navigate(`/?${new URLSearchParams(params).toString()}`);
    };

    const hasFilters = !!(filterPos || filterTeam || minAge || maxAge);

    if (loading) return (
        <div className="dash-page">
            <Header />
            <div className="dash-loading">
                <div className="dash-spinner" />
                <p>Cargando dashboard...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="dash-page">
            <Header />
            <div className="dash-error">{error}</div>
        </div>
    );

    const ageData = stats.ageDistribution.map(d => ({
        name:  AGE_LABELS[d._id] || d._id,
        count: d.count
    }));

    const radarEntry = stats.radarData?.find(r => r.position === radarPosition);
    const radarChartData = radarEntry ? [
        { attr: 'Velocidad',    value: radarEntry.pace      },
        { attr: 'Disparo',      value: radarEntry.shooting  },
        { attr: 'Pase',         value: radarEntry.passing   },
        { attr: 'Regate',       value: radarEntry.dribbling },
        { attr: 'Defensa',      value: radarEntry.defending },
        { attr: 'Físico',       value: radarEntry.physical  },
        { attr: 'Finalización', value: radarEntry.finishing },
    ] : [];

    const tooltipStyle = {
        contentStyle: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' },
        labelStyle:   { color: '#0f172a', fontWeight: 600 }
    };

    return (
        <div className="dash-page">
            <Header />
            <div className="dashboard">

                {/* Header */}
                <div className="dash-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Análisis global de jugadores</p>
                    </div>
                    {hasFilters && (
                        <div className="dash-header__badges">
                            {filterPos  && <span className="dash-badge dash-badge--blue">{filterPos}</span>}
                            {filterTeam && <span className="dash-badge dash-badge--green">{filterTeam}</span>}
                            {minAge     && <span className="dash-badge dash-badge--gray">Edad ≥ {minAge}</span>}
                            {maxAge     && <span className="dash-badge dash-badge--gray">Edad ≤ {maxAge}</span>}
                        </div>
                    )}
                </div>

                {/* Filtros */}
                <div className="dash-filters">
                    <select value={filterPos} onChange={e => setFilterPos(e.target.value)}>
                        <option value="">Todas las posiciones</option>
                        {POSITION_GROUPS.map(g => (
                            <option key={g.label} value={g.label}>{g.label}</option>
                        ))}
                    </select>

                    <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
                        <option value="">Todos los equipos</option>
                        {stats.filters.teams.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <div className="age-filter">
                        <input type="number" placeholder="Edad mín" value={minAge}
                            onChange={e => setMinAge(e.target.value)} min="15" max="45" />
                        <span>—</span>
                        <input type="number" placeholder="Edad máx" value={maxAge}
                            onChange={e => setMaxAge(e.target.value)} min="15" max="45" />
                    </div>

                    <button className="btn-filter" onClick={handleApply}>Aplicar</button>
                    {hasFilters && (
                        <button className="btn-clear" onClick={handleClear}>Limpiar</button>
                    )}
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                    <KpiCard value={stats.totalPlayers} label="Total jugadores" />
                    <KpiCard value={stats.averageAge}   label="Edad media" />
                    <KpiCard
                        value={stats.topPlayer?.name || '—'}
                        label="Jugador más valioso"
                        sub={currency(stats.topPlayer?.marketData?.currentMarketValue)}
                        accent="green"
                    />
                    <KpiCard
                        value={stats.expiringContracts}
                        label="Contratos expirando"
                        sub="Este año o el próximo"
                        accent="yellow"
                    />
                </div>

                {/* Gráficos */}
                <div className="charts-grid">

                    <ChartCard title="Goles y asistencias por posición" hint="haz click en una barra para ver los jugadores" wide>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.goalsByPosition}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <Tooltip {...tooltipStyle} />
                                <Legend />
                                <Bar dataKey="totalGoals"   name="Goles"      fill="#0ea5e9" radius={[4,4,0,0]}
                                    style={{ cursor: 'pointer' }} onClick={d => goToPlayers({ position: d._id })} />
                                <Bar dataKey="totalAssists" name="Asistencias" fill="#10b981" radius={[4,4,0,0]}
                                    style={{ cursor: 'pointer' }} onClick={d => goToPlayers({ position: d._id })} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Jugadores por posición">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={stats.playersByPosition} dataKey="count" nameKey="_id"
                                    cx="50%" cy="50%" outerRadius={100}
                                    label={({ _id, percent }) => `${_id} ${(percent*100).toFixed(0)}%`}
                                    labelLine={{ stroke: '#94a3b8' }}>
                                    {stats.playersByPosition.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Distribución de edades">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="count" name="Jugadores" fill="#8b5cf6" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Atributos medios por posición">
                        {stats.radarData?.length > 0 ? (
                            <>
                                <div className="radar-tabs">
                                    {stats.radarData.map(r => (
                                        <button key={r.position}
                                            className={`radar-tab ${radarPosition === r.position ? 'radar-tab--active' : ''}`}
                                            onClick={() => setRadarPosition(r.position)}>
                                            {r.position}
                                        </button>
                                    ))}
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <RadarChart data={radarChartData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="attr" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 99]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Radar name={radarPosition} dataKey="value"
                                            stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} />
                                        <Tooltip {...tooltipStyle} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </>
                        ) : (
                            <p className="chart-empty">No hay datos de atributos disponibles.</p>
                        )}
                    </ChartCard>

                    <ChartCard title="Top 10 jugadores por valor de mercado" wide>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.topValuePlayers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }}
                                    tickFormatter={v => `${(v/1_000_000).toFixed(0)}M`} />
                                <YAxis type="category" dataKey="name" width={130}
                                    tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <Tooltip {...tooltipStyle} formatter={v => currency(v)} />
                                <Bar dataKey="marketData.currentMarketValue" name="Valor"
                                    fill="#f59e0b" radius={[0,4,4,0]}
                                    style={{ cursor: 'pointer' }}
                                    onClick={d => navigate(`/player/${d.id}`)} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {stats.valueHistoryData?.length > 0 && (
                        <ChartCard title="Evolución del valor de mercado" wide>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.valueHistoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }}
                                        tickFormatter={v => `${(v/1_000_000).toFixed(0)}M`} />
                                    <Tooltip {...tooltipStyle} formatter={v => currency(v)} />
                                    <Legend />
                                    {stats.valueHistoryPlayers.map((name, i) => (
                                        <Line key={name} type="monotone" dataKey={name}
                                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                            strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    <ChartCard title="Jugadores por equipo (top 10)" hint="haz click para ver los jugadores" wide>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={stats.playersByTeam}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="count" name="Jugadores" fill="#ec4899" radius={[4,4,0,0]}
                                    style={{ cursor: 'pointer' }}
                                    onClick={d => goToPlayers({ team: d._id })} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                </div>

                {/* Mini panel — solo con filtros activos */}
                {hasFilters && (
                    <PlayersPanel
                        players={stats.filteredPlayers}
                        onPlayerClick={id => navigate(`/player/${id}`)}
                    />
                )}

            </div>
        </div>
    );
};

export default Dashboard;