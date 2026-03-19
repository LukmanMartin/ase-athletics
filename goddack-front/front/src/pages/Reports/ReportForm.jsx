import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/api';
import Header from '../../components/Header/Header';
import './Reports.css';

const RATINGS    = ['technical','physical','mental','tactical','finishing','passing','dribbling','defending','leadership','workRate'];
const RATING_LABELS = { technical:'Técnica', physical:'Físico', mental:'Mental', tactical:'Táctica', finishing:'Finalización', passing:'Pases', dribbling:'Regate', defending:'Defensa', leadership:'Liderazgo', workRate:'Trabajo' };
const ATTRIBUTES = ['pace','shooting','passing','dribbling','defending','physical','finishing','crossing','longShots','positioning'];
const ATTR_LABELS = { pace:'Velocidad', shooting:'Disparo', passing:'Pase', dribbling:'Regate', defending:'Defensa', physical:'Físico', finishing:'Finalización', crossing:'Centro', longShots:'Tiro lejano', positioning:'Posicionamiento' };
const POSITIONS  = ['Goalkeeper','Defender','Midfielder','Forward','Centre Back','Right Back','Left Back','Defensive Midfielder','Central Midfielder','Attacking Midfielder','Right Winger','Left Winger','Centre Forward','Striker'];
const CEILING_OPTS   = ['Mundial','Top europeo','Primera división','Segunda división'];
const READINESS_OPTS = ['Listo ya','1-2 años','3+ años'];

const EMPTY = {
    playerName:'', scoutName:'', date:'',
    matchDetails: { opponent:'', competition:'', result:'', minutesPlayed:'', position:'', goals:'', assists:'', rating:'' },
    ratings:     { technical:5, physical:5, mental:5, tactical:5, finishing:5, passing:5, dribbling:5, defending:5, leadership:5, workRate:5 },
    attributes:  { pace:'', shooting:'', passing:'', dribbling:'', defending:'', physical:'', finishing:'', crossing:'', longShots:'', positioning:'' },
    xG:'', xA:'', xGP90:'', xAP90:'', xGOverperformance:'', xAOverperformance:'',
    comparablePlayer:'', potential:'', ceiling:'', readiness:'',
    secondaryPositions:'',
    personalTraits: { leadership:'', professionalism:'', adaptability:'' },
    strengths:'', weaknesses:'', keyMoments:'',
    overallRating:5, recommendation:'Monitor', notes:''
};

const attrColor = (v) => { const n=Number(v); if(!n) return '#94a3b8'; if(n>=80) return '#10b981'; if(n>=60) return '#f59e0b'; return '#ef4444'; };

const Field = ({ label, children, full }) => (
    <div className={`form-field${full?' form-field--full':''}`}>
        <label>{label}</label>
        {children}
    </div>
);

const ReportForm = () => {
    const navigate = useNavigate();
    const { id }   = useParams();
    const { user } = useAuth();
    const isEdit   = !!id;

    const [form,    setForm]    = useState({ ...EMPTY, scoutName: user?.name || '' });
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        API.get('/players?limit=200').then(r => setPlayers(r.data.players || [])).catch(()=>{});
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        API.get(`/reports/${id}`).then(({ data: r }) => {
            setForm({
                ...EMPTY, ...r,
                strengths:          r.strengths?.join(', ')          || '',
                weaknesses:         r.weaknesses?.join(', ')         || '',
                keyMoments:         r.keyMoments?.join(', ')         || '',
                secondaryPositions: r.secondaryPositions?.join(', ') || '',
                attributes:         { ...EMPTY.attributes,     ...r.attributes },
                matchDetails:       { ...EMPTY.matchDetails,   ...r.matchDetails },
                personalTraits:     { ...EMPTY.personalTraits, ...r.personalTraits },
            });
        }).catch(() => setError('No se pudo cargar el informe'));
    }, [id]);

    // Precarga atributos del jugador seleccionado (solo en modo crear)
    useEffect(() => {
        if (isEdit) return;
        const found = players.find(p => p.name === form.playerName);
        if (!found) return;
        setForm(f => ({
            ...f,
            attributes: {
                pace:        found.attributes?.pace        || '',
                shooting:    found.attributes?.shooting    || '',
                passing:     found.attributes?.passing     || '',
                dribbling:   found.attributes?.dribbling   || '',
                defending:   found.attributes?.defending   || '',
                physical:    found.attributes?.physical    || '',
                finishing:   found.attributes?.finishing   || '',
                crossing:    found.attributes?.crossing    || '',
                longShots:   found.attributes?.longShots   || '',
                positioning: found.attributes?.positioning || '',
            },
            secondaryPositions:  found.secondaryPositions?.join(', ')                                    || '',
            comparablePlayer:    found.scoutingAnalysis?.comparablePlayer                               || '',
            potential:           found.scoutingAnalysis?.potential    != null ? String(found.scoutingAnalysis.potential)    : '',
            ceiling:             found.scoutingAnalysis?.ceiling                                         || '',
            readiness:           found.scoutingAnalysis?.readiness                                       || '',
            personalTraits: {
                leadership:      found.personalTraits?.leadership      != null ? String(found.personalTraits.leadership)      : '',
                professionalism: found.personalTraits?.professionalism != null ? String(found.personalTraits.professionalism) : '',
                adaptability:    found.personalTraits?.adaptability    != null ? String(found.personalTraits.adaptability)    : '',
            },
        }));
    }, [form.playerName, players]);

    const set     = (e) => { const {name,value}=e.target; setForm(f=>({...f,[name]:value})); };
    const setMD   = (e) => { const {name,value}=e.target; setForm(f=>({...f,matchDetails:{...f.matchDetails,[name]:value}})); };
    const setPT   = (e) => { const {name,value}=e.target; setForm(f=>({...f,personalTraits:{...f.personalTraits,[name]:value}})); };
    const setRate = (k,v) => setForm(f=>({...f,ratings:{...f.ratings,[k]:Number(v)}}));
    const setAttr = (k,v) => setForm(f=>({...f,attributes:{...f.attributes,[k]:v===''?'':Number(v)}}));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.playerName) { setError('El nombre del jugador es obligatorio'); return; }
        const player = players.find(p => p.name === form.playerName);
        if (!player) { setError('Jugador no encontrado'); return; }

        const cleanAttrs = Object.fromEntries(Object.entries(form.attributes).filter(([,v])=>v!==''&&v!=null));
        const cleanPT    = Object.fromEntries(Object.entries(form.personalTraits).filter(([,v])=>v!==''&&v!=null));

        const payload = {
            ...form,
            player:             player._id,
            playerId:           player.id,
            strengths:          form.strengths.split(',').map(s=>s.trim()).filter(Boolean),
            weaknesses:         form.weaknesses.split(',').map(s=>s.trim()).filter(Boolean),
            keyMoments:         form.keyMoments.split(',').map(s=>s.trim()).filter(Boolean),
            secondaryPositions: form.secondaryPositions.split(',').map(s=>s.trim()).filter(Boolean),
            overallRating:      Number(form.overallRating),
            potential:          form.potential         ? Number(form.potential)         : undefined,
            xG:                 form.xG                ? Number(form.xG)                : undefined,
            xA:                 form.xA                ? Number(form.xA)                : undefined,
            xGP90:              form.xGP90             ? Number(form.xGP90)             : undefined,
            xAP90:              form.xAP90             ? Number(form.xAP90)             : undefined,
            xGOverperformance:  form.xGOverperformance ? Number(form.xGOverperformance) : undefined,
            xAOverperformance:  form.xAOverperformance ? Number(form.xAOverperformance) : undefined,
            attributes:     cleanAttrs,
            personalTraits: Object.keys(cleanPT).length
                ? Object.fromEntries(Object.entries(cleanPT).map(([k,v])=>[k,Number(v)]))
                : undefined,
            matchDetails: {
                ...form.matchDetails,
                minutesPlayed: form.matchDetails.minutesPlayed !== '' ? Number(form.matchDetails.minutesPlayed) : null,
                goals:         form.matchDetails.goals         !== '' ? Number(form.matchDetails.goals)         : null,
                assists:       form.matchDetails.assists       !== '' ? Number(form.matchDetails.assists)        : null,
                rating:        form.matchDetails.rating        !== '' ? Number(form.matchDetails.rating)         : null,
            }
        };

        try {
            setLoading(true);
            if (isEdit) await API.put(`/reports/${id}`, payload);
            else        await API.post('/reports', payload);
            navigate('/reports');
        } catch { setError('Error al guardar el informe'); }
        finally   { setLoading(false); }
    };

    return (
        <div className="reports-page">
            <Header />
            <div className="reports-container">
                <div className="reports-header">
                    <div>
                        <h1>{isEdit ? 'Editar informe' : 'Nuevo informe'}</h1>
                        <p>Los datos marcados se actualizarán en el perfil del jugador</p>
                    </div>
                    <button className="btn-back" onClick={() => navigate('/reports')}>← Volver</button>
                </div>

                {error && <div className="form-error">{error}</div>}

                <form className="report-form" onSubmit={handleSubmit}>

                    {/* Info básica */}
                    <div className="form-section">
                        <h2>Información básica</h2>
                        <div className="form-grid">
                            <Field label="Jugador *">
                                <select name="playerName" value={form.playerName} onChange={set} required>
                                    <option value="">Selecciona un jugador</option>
                                    {players.map(p => <option key={p.id} value={p.name}>{p.name} — {p.team}</option>)}
                                </select>
                            </Field>
                            <Field label="Scout">
                                <input name="scoutName" value={form.scoutName} onChange={set} placeholder="Nombre del scout" />
                            </Field>
                            <Field label="Fecha">
                                <input name="date" type="date" value={form.date} onChange={set} />
                            </Field>
                        </div>
                    </div>

                    {/* Detalles del partido */}
                    <div className="form-section">
                        <h2>Detalles del partido <span className="form-section__badge">Actualiza historial</span></h2>
                        <p className="form-section__hint">Esta entrada se añadirá al historial de partidos. Los goles y asistencias se sumarán a las stats del jugador.</p>
                        <div className="form-grid">
                            <Field label="Rival"><input name="opponent" value={form.matchDetails.opponent} onChange={setMD} placeholder="Equipo rival" /></Field>
                            <Field label="Competición"><input name="competition" value={form.matchDetails.competition} onChange={setMD} placeholder="Liga, Copa..." /></Field>
                            <Field label="Resultado"><input name="result" value={form.matchDetails.result} onChange={setMD} placeholder="2-1 W" /></Field>
                            <Field label="Minutos jugados"><input name="minutesPlayed" type="number" value={form.matchDetails.minutesPlayed} onChange={setMD} min="0" max="120" placeholder="90" /></Field>
                            <Field label="Posición">
                                <select name="position" value={form.matchDetails.position} onChange={setMD}>
                                    <option value="">Selecciona posición</option>
                                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </Field>
                            <Field label="Goles"><input name="goals" type="number" value={form.matchDetails.goals} onChange={setMD} min="0" placeholder="0" /></Field>
                            <Field label="Asistencias"><input name="assists" type="number" value={form.matchDetails.assists} onChange={setMD} min="0" placeholder="0" /></Field>
                            <Field label="Rating del partido (1-10)"><input name="rating" type="number" value={form.matchDetails.rating} onChange={setMD} min="1" max="10" step="0.1" placeholder="7.5" /></Field>
                        </div>
                    </div>

                    {/* xG / xA */}
                    <div className="form-section">
                        <h2>Expected goals & assists <span className="form-section__badge">Se suman al perfil</span></h2>
                        <p className="form-section__hint">Estos valores se sumarán a las estadísticas avanzadas del jugador.</p>
                        <div className="form-grid">
                            {[['xG','xG'],['xA','xA'],['xGP90','xG P90'],['xAP90','xA P90'],['xGOverperformance','Over xG'],['xAOverperformance','Over xA']].map(([k,l]) => (
                                <Field key={k} label={l}><input type="number" name={k} step="0.01" value={form[k]} onChange={set} placeholder="0.00" /></Field>
                            ))}
                        </div>
                    </div>

                    {/* Atributos */}
                    <div className="form-section">
                        <h2>Atributos observados (1-99) <span className="form-section__badge">Actualiza perfil</span></h2>
                        <p className="form-section__hint">Se actualizarán en el perfil del jugador. Los valores actuales están precargados.</p>
                        <div className="attrs-form-grid">
                            {ATTRIBUTES.map(key => (
                                <div key={key} className="attr-form-item">
                                    <div className="attr-form-header">
                                        <label>{ATTR_LABELS[key]}</label>
                                        <span className="attr-form-val" style={{ color: attrColor(form.attributes[key]) }}>
                                            {form.attributes[key] || '—'}
                                        </span>
                                    </div>
                                    <input type="number" min="1" max="99"
                                        value={form.attributes[key]}
                                        onChange={e => setAttr(key, e.target.value)}
                                        placeholder="1-99" />
                                    <div className="attr-form-bar-track">
                                        <div className="attr-form-bar" style={{
                                            width: form.attributes[key] ? `${Math.min(form.attributes[key],99)}%` : '0%',
                                            background: attrColor(form.attributes[key])
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Valoraciones del informe */}
                    <div className="form-section">
                        <h2>Valoraciones del informe (1-10)</h2>
                        <div className="ratings-grid">
                            {RATINGS.map(key => (
                                <div key={key} className="rating-item">
                                    <label>{RATING_LABELS[key]}</label>
                                    <div className="rating-control">
                                        <input type="range" min="1" max="10" value={form.ratings[key]}
                                            onChange={e => setRate(key, e.target.value)} />
                                        <span className="rating-value">{form.ratings[key]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Análisis de scouting */}
                    <div className="form-section">
                        <h2>Análisis de scouting <span className="form-section__badge">Actualiza perfil</span></h2>
                        <div className="form-grid">
                            <Field label="Jugador comparable"><input name="comparablePlayer" value={form.comparablePlayer} onChange={set} placeholder="Ej: Kylian Mbappé" /></Field>
                            <Field label="Potencial (1-10)"><input name="potential" type="number" min="1" max="10" value={form.potential} onChange={set} placeholder="0" /></Field>
                            <Field label="Techo">
                                <select name="ceiling" value={form.ceiling} onChange={set}>
                                    <option value="">Seleccionar</option>
                                    {CEILING_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </Field>
                            <Field label="Preparado">
                                <select name="readiness" value={form.readiness} onChange={set}>
                                    <option value="">Seleccionar</option>
                                    {READINESS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </Field>
                            <Field label="Posiciones secundarias (coma)" full>
                                <input name="secondaryPositions" value={form.secondaryPositions} onChange={set} placeholder="Right Wing, Centre Forward..." />
                            </Field>
                            <Field label="Fortalezas (separadas por comas)" full>
                                <input name="strengths" value={form.strengths} onChange={set} placeholder="Velocidad, Remate, Visión..." />
                            </Field>
                            <Field label="Debilidades (separadas por comas)" full>
                                <input name="weaknesses" value={form.weaknesses} onChange={set} placeholder="Duelos aéreos, Defensa..." />
                            </Field>
                            <Field label="Momentos clave (separados por comas)" full>
                                <input name="keyMoments" value={form.keyMoments} onChange={set} placeholder="Gol en el 78', Asistencia..." />
                            </Field>
                            <Field label="Notas del scout" full>
                                <textarea name="notes" value={form.notes} onChange={set} rows={4} placeholder="Observaciones generales..." />
                            </Field>
                        </div>
                        <div className="form-grid form-grid--bottom">
                            <Field label={`Valoración global: ${form.overallRating}`}>
                                <input type="range" name="overallRating" min="1" max="10" value={form.overallRating} onChange={set} />
                            </Field>
                            <Field label="Recomendación">
                                <select name="recommendation" value={form.recommendation} onChange={set}>
                                    <option value="Sign">Fichar</option>
                                    <option value="Monitor">Seguir</option>
                                    <option value="Pass">Descartar</option>
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Personalidad */}
                    <div className="form-section">
                        <h2>Personalidad <span className="form-section__badge">Actualiza perfil</span></h2>
                        <div className="form-grid">
                            <Field label="Liderazgo (1-10)">
                                <input name="leadership" type="number" min="1" max="10" value={form.personalTraits.leadership} onChange={setPT} placeholder="0" />
                            </Field>
                            <Field label="Profesionalismo (1-10)">
                                <input name="professionalism" type="number" min="1" max="10" value={form.personalTraits.professionalism} onChange={setPT} placeholder="0" />
                            </Field>
                            <Field label="Adaptabilidad (1-10)">
                                <input name="adaptability" type="number" min="1" max="10" value={form.personalTraits.adaptability} onChange={setPT} placeholder="0" />
                            </Field>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/reports')}>Cancelar</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear informe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportForm;