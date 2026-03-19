import { useCompare } from '../../context/CompareContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import './Comparar.css';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
const val = (v, f = '—') => v != null ? v : f;

const Comparar = () => {
    const { selected, removePlayer, clearAll } = useCompare();
    const navigate = useNavigate();

    if (selected.length < 2) return (
        <div>
            <Header />
            <div className="comp-empty">
                <p>Necesitas seleccionar al menos 2 jugadores para comparar.</p>
                <button onClick={() => navigate('/')}>← Volver a la lista</button>
            </div>
        </div>
    );

    // ── Datos para el radar de atributos ─────────────────────────────────
    const attrKeys = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
    const radarData = attrKeys.map(key => {
        const entry = { attr: key };
        selected.forEach(p => {
            entry[p.name] = p.attributes?.[key] ?? 0;
        });
        return entry;
    });

    // ── Métricas para la tabla ────────────────────────────────────────────
    const metrics = [
        { label: 'Equipo',          get: p => val(p.currentTeam) },
        { label: 'Posición',        get: p => val(p.position) },
        { label: 'Edad',            get: p => val(p.age) },
        { label: 'Nacionalidad',    get: p => val(p.nationality) },
        { label: 'Partidos',        get: p => val(p.stats?.appearances) },
        { label: 'Goles',           get: p => val(p.stats?.goals) },
        { label: 'Asistencias',     get: p => val(p.stats?.assists) },
        { label: 'Minutos',         get: p => val(p.stats?.minutesPlayed) },
        { label: 'Prec. pases %',   get: p => val(p.stats?.passAccuracy) },
        { label: 'Amarillas',       get: p => val(p.stats?.yellowCards) },
        { label: 'Rojas',           get: p => val(p.stats?.redCards) },
        { label: 'xG',              get: p => val(p.stats?.advanced?.xG) },
        { label: 'xA',              get: p => val(p.stats?.advanced?.xA) },
        { label: 'Vel. máx.',       get: p => p.stats?.advanced?.topSpeed ? `${p.stats.advanced.topSpeed} km/h` : '—' },
        { label: 'Valor mercado',   get: p => p.marketData?.currentMarketValue
            ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.marketData.currentMarketValue)
            : '—'
        },
        { label: 'Fin contrato',    get: p => val(p.contractInfo?.contractEnd) },
        { label: 'Salario semanal', get: p => p.contractInfo?.salary?.weeklyWage
            ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.contractInfo.salary.weeklyWage)
            : '—'
        },
    ];

    return (
        <div className="comp-page">
            <Header />
            <div className="comp-container">

                {/* ── Cabecera ── */}
                <div className="comp-header">
                    <h1>Comparador de jugadores</h1>
                    <div className="comp-header__actions">
                        <button className="comp-btn-clear" onClick={clearAll}>
                            Limpiar selección
                        </button>
                        <button className="comp-btn-back" onClick={() => navigate('/')}>
                            ← Añadir más jugadores
                        </button>
                    </div>
                </div>

                {/* ── Tarjetas de jugadores seleccionados ── */}
                <div className="comp-players">
                    {selected.map((p, i) => (
                        <div key={p.id} className="comp-player-card" style={{ borderTopColor: COLORS[i] }}>
                            <button className="comp-player-remove" onClick={() => removePlayer(p.id)}>✕</button>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=${COLORS[i].replace('#','')}&color=fff&bold=true&size=80`}
                                alt={p.name}
                            />
                            <h3>{p.name}</h3>
                            <p>{val(p.currentTeam)}</p>
                            <span className="comp-player-pos">{val(p.position)}</span>
                        </div>
                    ))}
                </div>

                {/* ── Gráfico radar de atributos ── */}
                <div className="comp-card">
                    <h2>Atributos técnicos</h2>
                    <ResponsiveContainer width="100%" height={380}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                                dataKey="attr"
                                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                            />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                                labelStyle={{ color: 'white' }}
                            />
                            <Legend />
                            {selected.map((p, i) => (
                                <Radar
                                    key={p.id}
                                    name={p.name}
                                    dataKey={p.name}
                                    stroke={COLORS[i]}
                                    fill={COLORS[i]}
                                    fillOpacity={0.15}
                                />
                            ))}
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* ── Tabla comparativa ── */}
                <div className="comp-card">
                    <h2>Estadísticas detalladas</h2>
                    <div className="comp-table-wrap">
                        <table className="comp-table">
                            <thead>
                                <tr>
                                    <th>Métrica</th>
                                    {selected.map((p, i) => (
                                        <th key={p.id} style={{ color: COLORS[i] }}>{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map(({ label, get }) => (
                                    <tr key={label}>
                                        <td className="comp-table__label">{label}</td>
                                        {selected.map(p => (
                                            <td key={p.id}>{get(p)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Comparar;