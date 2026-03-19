import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import API from '../../api/api';
import Header from '../../components/Header/Header';
import ReportPDF from '../../components/PDF/ReportPDF';
import './Reports.css';

const RATING_LABELS = {
    technical:'Técnica', physical:'Físico', mental:'Mental', tactical:'Táctica',
    finishing:'Finalización', passing:'Pases', dribbling:'Regate', defending:'Defensa',
    leadership:'Liderazgo', workRate:'Trabajo'
};
const ATTR_LABELS = {
    pace:'Velocidad', shooting:'Disparo', passing:'Pase', dribbling:'Regate',
    defending:'Defensa', physical:'Físico', finishing:'Finalización',
    crossing:'Centro', longShots:'Tiro lejano', positioning:'Posicionamiento'
};
const REC_COLORS = {
    Sign:    { bg:'#dcfce7', color:'#166534' },
    Monitor: { bg:'#fef9c3', color:'#92400e' },
    Pass:    { bg:'#fee2e2', color:'#991b1b' },
};
const REC_LABELS = { Sign:'Fichar', Monitor:'Seguir', Pass:'Descartar' };

const attrColor = (v) => {
    const n = Number(v);
    if (!n) return '#94a3b8';
    if (n >= 80) return '#10b981';
    if (n >= 60) return '#f59e0b';
    return '#ef4444';
};

const ReadField = ({ label, value, badge }) => (
    <div className="read-field">
        <span className="read-field__label">{label}</span>
        {badge
            ? <span className="read-field__badge" style={badge}>{value||'—'}</span>
            : <span className="read-field__value">{value??'—'}</span>
        }
    </div>
);

const ReadSection = ({ title, badge, hint, children }) => (
    <div className="form-section">
        <h2>{title}{badge && <span className="form-section__badge">{badge}</span>}</h2>
        {hint && <p className="form-section__hint">{hint}</p>}
        {children}
    </div>
);

const ReportDetail = () => {
    const { id }   = useParams();
    const navigate = useNavigate();
    const [report,    setReport]    = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        API.get(`/reports/${id}`)
            .then(r => setReport(r.data))
            .catch(() => setError('No se pudo cargar el informe'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleExportPDF = async () => {
        if (!report) return;
        try {
            setExporting(true);
            const blob = await pdf(<ReportPDF report={report} />).toBlob();
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href     = url;
            link.download = `informe_${report.playerName?.replace(/\s+/g,'_')}_${report.date || 'sin_fecha'}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error al generar PDF:', err);
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="reports-page"><Header /><div className="reports-loading"><div className="reports-spinner"/><p>Cargando informe...</p></div></div>;
    if (error)   return <div className="reports-page"><Header /><div className="reports-empty"><p>{error}</p></div></div>;

    const md        = report.matchDetails   || {};
    const pt        = report.personalTraits || {};
    const recStyle  = REC_COLORS[report.recommendation] || { bg:'#f1f5f9', color:'#475569' };
    const hasAttrs  = report.attributes && Object.values(report.attributes).some(v => v != null);
    const hasRatings= report.ratings    && Object.values(report.ratings).some(v => v != null);
    const hasXG     = [report.xG, report.xA, report.xGP90, report.xAP90, report.xGOverperformance, report.xAOverperformance].some(v => v != null);
    const hasPT     = pt.leadership != null || pt.professionalism != null || pt.adaptability != null;

    return (
        <div className="reports-page">
            <Header />
            <div className="reports-container">
                <div className="reports-header">
                    <div>
                        <h1>{report.playerName}</h1>
                        <p>Informe de scouting · solo lectura</p>
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <button
                            className="btn-back"
                            onClick={handleExportPDF}
                            disabled={exporting}
                            style={{ borderColor:'#0ea5e9', color:'#0ea5e9' }}
                        >
                            {exporting ? 'Generando...' : '⬇ Exportar PDF'}
                        </button>
                        <button className="btn-back" onClick={() => navigate('/reports')}>← Volver</button>
                    </div>
                </div>

                <div className="report-form">

                    <ReadSection title="Información básica">
                        <div className="form-grid">
                            <ReadField label="Jugador"  value={report.playerName} />
                            <ReadField label="Scout"    value={report.scoutName}  />
                            <ReadField label="Fecha"    value={report.date}       />
                        </div>
                    </ReadSection>

                    <ReadSection title="Detalles del partido" badge="Volcado al historial"
                        hint="Esta entrada fue añadida al historial de partidos. Los goles y asistencias se sumaron a las stats del jugador.">
                        <div className="form-grid">
                            <ReadField label="Rival"              value={md.opponent}      />
                            <ReadField label="Competición"        value={md.competition}   />
                            <ReadField label="Resultado"          value={md.result}        />
                            <ReadField label="Minutos jugados"    value={md.minutesPlayed != null ? `${md.minutesPlayed}'` : null} />
                            <ReadField label="Posición"           value={md.position}      />
                            <ReadField label="Goles"              value={md.goals}         />
                            <ReadField label="Asistencias"        value={md.assists}       />
                            <ReadField label="Rating del partido" value={md.rating}        />
                        </div>
                    </ReadSection>

                    {hasXG && (
                        <ReadSection title="Expected goals & assists" badge="Sumado al perfil"
                            hint="Estos valores fueron sumados a las estadísticas avanzadas del jugador.">
                            <div className="form-grid">
                                {[['xG','xG'],['xA','xA'],['xGP90','xG P90'],['xAP90','xA P90'],['xGOverperformance','Over xG'],['xAOverperformance','Over xA']].map(([k,l]) => (
                                    <ReadField key={k} label={l} value={report[k]} />
                                ))}
                            </div>
                        </ReadSection>
                    )}

                    {hasAttrs && (
                        <ReadSection title="Atributos observados (1-99)" badge="Volcado al perfil"
                            hint="Estos atributos fueron actualizados en el perfil del jugador.">
                            <div className="attrs-form-grid">
                                {Object.entries(report.attributes)
                                    .filter(([k,v]) => v != null && ATTR_LABELS[k])
                                    .map(([k,v]) => (
                                        <div key={k} className="attr-form-item">
                                            <div className="attr-form-header">
                                                <label>{ATTR_LABELS[k]}</label>
                                                <span className="attr-form-val" style={{ color: attrColor(v) }}>{v}</span>
                                            </div>
                                            <div className="attr-read-bar-wrap">
                                                <div className="attr-read-bar" style={{ width:`${Math.min(v,99)}%`, background: attrColor(v) }} />
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </ReadSection>
                    )}

                    {hasRatings && (
                        <ReadSection title="Valoraciones del informe (1-10)">
                            <div className="ratings-grid">
                                {Object.entries(report.ratings)
                                    .filter(([,v]) => v != null)
                                    .map(([k,v]) => (
                                        <div key={k} className="rating-item">
                                            <label>{RATING_LABELS[k]||k}</label>
                                            <div className="rating-control">
                                                <div className="rating-read-bar-wrap">
                                                    <div className="rating-read-bar" style={{ width:`${(v/10)*100}%` }} />
                                                </div>
                                                <span className="rating-value">{v}</span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </ReadSection>
                    )}

                    <ReadSection title="Análisis de scouting" badge="Volcado al perfil"
                        hint="Estos datos fueron actualizados en el perfil del jugador.">
                        <div className="form-grid">
                            <ReadField label="Jugador comparable"  value={report.comparablePlayer} />
                            <ReadField label="Potencial (1-10)"    value={report.potential}        />
                            <ReadField label="Techo"               value={report.ceiling}          />
                            <ReadField label="Preparado"           value={report.readiness}        />
                            <ReadField label="Valoración global"   value={report.overallRating != null ? `${report.overallRating}/10` : null} />
                            <ReadField label="Recomendación"
                                value={REC_LABELS[report.recommendation]||report.recommendation}
                                badge={recStyle} />
                            {report.secondaryPositions?.length > 0 && (
                                <ReadField label="Posiciones secundarias" value={report.secondaryPositions.join(', ')} />
                            )}
                        </div>

                        {report.strengths?.length > 0 && (
                            <div className="read-tags-group">
                                <span className="read-tags-label">Fortalezas</span>
                                <ul className="detail-tags">{report.strengths.map((s,i) => <li key={i} className="detail-tag detail-tag--green">{s}</li>)}</ul>
                            </div>
                        )}
                        {report.weaknesses?.length > 0 && (
                            <div className="read-tags-group">
                                <span className="read-tags-label">Debilidades</span>
                                <ul className="detail-tags">{report.weaknesses.map((w,i) => <li key={i} className="detail-tag detail-tag--red">{w}</li>)}</ul>
                            </div>
                        )}
                        {report.keyMoments?.length > 0 && (
                            <div className="read-tags-group">
                                <span className="read-tags-label">Momentos clave</span>
                                <ul className="detail-moments">{report.keyMoments.map((m,i) => <li key={i}>⚡ {m}</li>)}</ul>
                            </div>
                        )}
                        {report.notes && (
                            <div className="read-tags-group">
                                <span className="read-tags-label">Notas del scout</span>
                                <p className="detail-notes">{report.notes}</p>
                            </div>
                        )}
                    </ReadSection>

                    {hasPT && (
                        <ReadSection title="Personalidad" badge="Volcado al perfil">
                            <div className="form-grid">
                                <ReadField label="Liderazgo"       value={pt.leadership      != null ? `${pt.leadership}/10`      : null} />
                                <ReadField label="Profesionalismo" value={pt.professionalism != null ? `${pt.professionalism}/10` : null} />
                                <ReadField label="Adaptabilidad"   value={pt.adaptability    != null ? `${pt.adaptability}/10`    : null} />
                            </div>
                        </ReadSection>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ReportDetail;