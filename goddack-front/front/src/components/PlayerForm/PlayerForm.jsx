import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import Header from '../Header/Header';
import './PlayerForm.css';

const POSITIONS = [
    'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
    'Mediocentro Defensivo', 'Mediocentro', 'Mediocentro Ofensivo',
    'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro', 'Segunda Punta'
];
const FEET            = ['Derecho', 'Izquierdo', 'Ambidiestro'];
const RECOMMENDATIONS = ['Fichar', 'Monitorear', 'Pasar'];
const PLAYER_STATUS   = ['Activo', 'Lesionado', 'Cedido', 'Libre'];
const TRANSFER_TYPES  = ['Compra', 'Cesión', 'Libre', 'Traspaso'];
const MOMENTUM        = ['Ascendente', 'Estable', 'Descendente'];
const CEILING         = ['Mundial', 'Top europeo', 'Primera división', 'Segunda división'];
const READINESS       = ['Listo ya', '1-2 años', '3+ años'];

const SECTIONS = [
    { id: 'identidad',     label: 'Identidad'      },
    { id: 'club',          label: 'Club'            },
    { id: 'stats',         label: 'Estadísticas'   },
    { id: 'stats_per90',   label: 'Stats por 90'   },
    { id: 'stats_adv',     label: 'Stats avanzadas'},
    { id: 'atributos',     label: 'Atributos'       },
    { id: 'contrato',      label: 'Contrato'        },
    { id: 'mercado',       label: 'Mercado'         },
    { id: 'scouting',      label: 'Scouting'        },
    { id: 'tactica',       label: 'Táctica'         },
    { id: 'competicion',   label: 'Competición'     },
    { id: 'forma',         label: 'Forma reciente'  },
    { id: 'carrera',       label: 'Carrera'         },
    { id: 'internacional', label: 'Internacional'   },
    { id: 'medico',        label: 'Médico'          },
    { id: 'marketing',     label: 'Marketing'       },
    { id: 'personalidad',  label: 'Personalidad'    },
];

const EMPTY = {
    name: '', fullName: '', displayName: '', age: '', dateOfBirth: '',
    placeOfBirth: '', nationality: '', secondNationality: '',
    height: '', weight: '', preferredFoot: '', image: '', profileImage: '', imageUrl: '',
    team: '', currentTeam: '', teamId: '', league: '', leagueId: '',
    division: '', country: '', jerseyNumber: '', position: '',
    secondaryPositions: '', playerStatus: '', isLoanPlayer: false,
    stats: {
        appearances: '', starts: '', minutesPlayed: '', goals: '', assists: '',
        passAccuracy: '', yellowCards: '', redCards: '', cleanSheets: '', ownGoals: '',
        per90: {
            goalsP90: '', assistsP90: '', shotsP90: '', shotsOnTargetP90: '',
            keyPassesP90: '', passesP90: '', dribblesP90: '', tacklesP90: '',
            interceptionsP90: '', clearancesP90: '', crossesP90: '',
            foulsConcededP90: '', foulsWonP90: '',
        },
        advanced: {
            xG: '', xA: '', xGP90: '', xAP90: '', xGOverperformance: '', xAOverperformance: '',
            shotsOnTarget: '', totalShots: '', shotAccuracy: '', shotConversion: '',
            bigChances: '', bigChancesMissed: '', goalConversionRate: '',
            totalPasses: '', shortPasses: '', shortPassAccuracy: '', mediumPasses: '',
            mediumPassAccuracy: '', longPasses: '', longPassAccuracy: '',
            forwardPasses: '', backwardPasses: '', sidewaysPasses: '',
            throughBalls: '', throughBallAccuracy: '', crossAccuracy: '', cornerAccuracy: '',
            dribblesCompleted: '', tacklesWon: '', tackleSuccessRate: '',
            aerialDuelsWon: '', aerialDuelSuccess: '', groundDuels: '', groundDuelSuccess: '',
            interceptions: '', blocks: '', clearances: '', pressures: '',
            pressureSuccessRate: '', recoveries: '',
            touches: '', touchesInBox: '', dribbleSuccessRate: '', dispossessed: '',
            badControls: '', skillMoves: '', skillMoveSuccess: '',
            topSpeed: '', distanceCovered: '', highIntensityRuns: '', sprints: '',
            accelerations: '', decelerations: '', intensityScore: '', distanceCoveredP90: '',
        }
    },
    attributes: {
        pace: '', shooting: '', passing: '', dribbling: '',
        defending: '', physical: '', finishing: '', crossing: '',
        longShots: '', positioning: '',
    },
    contractInfo: {
        contractStart: '', contractEnd: '', contractLength: '', releaseClause: '',
        salary: { weeklyWage: '', annualSalary: '', currency: 'EUR',
            bonuses: { signingBonus: '', loyaltyBonus: '', performanceBonus: '' }
        },
        agentInfo: { agentName: '', agencyName: '', agentFeePercentage: '' }
    },
    marketData: {
        currentMarketValue: '', currency: 'EUR', valuationDate: '',
        valueTrend: { last30Days: '', last90Days: '', last12Months: '' },
        transferData: { transferProbability: '', transferWindow: '', interestedClubs: '' }
    },
    scoutingAnalysis: {
        comparablePlayer: '', ceiling: '', readiness: '', potential: '',
        rating: '', recommendation: '', comments: '', strengths: '', weaknesses: '',
    },
    tacticalData: {
        positionData: { primaryPosition: '', positionFlexibility: '', preferredSide: '' },
        heatmaps: {
            averagePosition: { x: '', y: '' },
            zoneOccupancy: {
                defensiveThird: '', middleThird: '', attackingThird: '',
                leftFlank: '', central: '', rightFlank: '', penaltyArea: '',
            }
        },
        playingStyle: { styleDescription: '', preferredFormation: '', roleInTeam: '', strengths: '', weaknesses: '' }
    },
    competitionBreakdown: {
        homeVsAway: {
            home: { appearances: '', goals: '', assists: '', averageRating: '' },
            away: { appearances: '', goals: '', assists: '', averageRating: '' },
        },
        bigGamePerformance: {
            vsTop6:  { appearances: '', goals: '', assists: '', averageRating: '' },
            derbies: { appearances: '', goals: '', assists: '', averageRating: '' },
        }
    },
    recentForm: {
        currentForm: { formRating: '', consistencyScore: '', momentumIndicator: '' },
        streaks: {
            currentGoalStreak: '', longestGoalStreak: '',
            currentAssistStreak: '', longestAssistStreak: '',
            currentCleanSheetStreak: '',
        }
    },
    careerHistory: {
        lastClub: { club: '', league: '', startDate: '', endDate: '', transferFee: '', appearances: '', goals: '', assists: '', transferType: '' },
        youthCareer: { club: '', startYear: '', endYear: '' },
    },
    internationalCareer: {
        nationalTeam: '', caps: '', goals: '', assists: '', debut: '', lastCallUp: '', youthTeams: '',
    },
    medicalHistory: {
        injuryProneness: '', totalDaysInjured: '', availabilityPercentage: '',
        lastInjury: { injuryType: '', injuryDate: '', returnDate: '', daysOut: '', gamesMissed: '' }
    },
    marketingData: {
        instagramFollowers: '', twitterFollowers: '', facebookFollowers: '',
        tiktokFollowers: '', engagementRate: '', marketability: '',
    },
    personalTraits: {
        languages: '', traits: '', leadership: '', professionalism: '',
        adaptability: '', education: '', maritalStatus: '', children: '', footballingFamily: false,
    },
};

const serverToForm = (data) => {
    const d = { ...EMPTY, ...data };
    const arr2str = (v) => Array.isArray(v) ? v.join(', ') : v;
    if (Array.isArray(d.secondaryPositions)) d.secondaryPositions = arr2str(d.secondaryPositions);
    if (d.marketData?.transferData?.interestedClubs && Array.isArray(d.marketData.transferData.interestedClubs))
        d.marketData = { ...d.marketData, transferData: { ...d.marketData.transferData, interestedClubs: arr2str(d.marketData.transferData.interestedClubs) } };
    if (d.scoutingAnalysis?.strengths  && Array.isArray(d.scoutingAnalysis.strengths))  d.scoutingAnalysis = { ...d.scoutingAnalysis,  strengths:  arr2str(d.scoutingAnalysis.strengths)  };
    if (d.scoutingAnalysis?.weaknesses && Array.isArray(d.scoutingAnalysis.weaknesses)) d.scoutingAnalysis = { ...d.scoutingAnalysis,  weaknesses: arr2str(d.scoutingAnalysis.weaknesses) };
    if (d.tacticalData?.playingStyle?.strengths  && Array.isArray(d.tacticalData.playingStyle.strengths))  d.tacticalData = { ...d.tacticalData, playingStyle: { ...d.tacticalData.playingStyle, strengths:  arr2str(d.tacticalData.playingStyle.strengths)  } };
    if (d.tacticalData?.playingStyle?.weaknesses && Array.isArray(d.tacticalData.playingStyle.weaknesses)) d.tacticalData = { ...d.tacticalData, playingStyle: { ...d.tacticalData.playingStyle, weaknesses: arr2str(d.tacticalData.playingStyle.weaknesses) } };
    if (d.internationalCareer?.youthTeams && Array.isArray(d.internationalCareer.youthTeams)) d.internationalCareer = { ...d.internationalCareer, youthTeams: arr2str(d.internationalCareer.youthTeams) };
    if (d.personalTraits?.languages && Array.isArray(d.personalTraits.languages)) d.personalTraits = { ...d.personalTraits, languages: arr2str(d.personalTraits.languages) };
    if (d.personalTraits?.traits    && Array.isArray(d.personalTraits.traits))    d.personalTraits = { ...d.personalTraits, traits:    arr2str(d.personalTraits.traits)    };
    return {
        ...EMPTY, ...d,
        stats:                { ...EMPTY.stats,                ...d.stats,                per90: { ...EMPTY.stats.per90, ...d.stats?.per90 }, advanced: { ...EMPTY.stats.advanced, ...d.stats?.advanced } },
        attributes:           { ...EMPTY.attributes,           ...d.attributes },
        contractInfo:         { ...EMPTY.contractInfo,         ...d.contractInfo,         salary: { ...EMPTY.contractInfo.salary, ...d.contractInfo?.salary, bonuses: { ...EMPTY.contractInfo.salary.bonuses, ...d.contractInfo?.salary?.bonuses } }, agentInfo: { ...EMPTY.contractInfo.agentInfo, ...d.contractInfo?.agentInfo } },
        marketData:           { ...EMPTY.marketData,           ...d.marketData,           valueTrend: { ...EMPTY.marketData.valueTrend, ...d.marketData?.valueTrend }, transferData: { ...EMPTY.marketData.transferData, ...d.marketData?.transferData } },
        scoutingAnalysis:     { ...EMPTY.scoutingAnalysis,     ...d.scoutingAnalysis },
        tacticalData:         { ...EMPTY.tacticalData,         ...d.tacticalData,         positionData: { ...EMPTY.tacticalData.positionData, ...d.tacticalData?.positionData }, heatmaps: { ...EMPTY.tacticalData.heatmaps, averagePosition: { ...EMPTY.tacticalData.heatmaps.averagePosition, ...d.tacticalData?.heatmaps?.averagePosition }, zoneOccupancy: { ...EMPTY.tacticalData.heatmaps.zoneOccupancy, ...d.tacticalData?.heatmaps?.zoneOccupancy } }, playingStyle: { ...EMPTY.tacticalData.playingStyle, ...d.tacticalData?.playingStyle } },
        competitionBreakdown: { ...EMPTY.competitionBreakdown, homeVsAway: { home: { ...EMPTY.competitionBreakdown.homeVsAway.home, ...d.competitionBreakdown?.homeVsAway?.home }, away: { ...EMPTY.competitionBreakdown.homeVsAway.away, ...d.competitionBreakdown?.homeVsAway?.away } }, bigGamePerformance: { vsTop6: { ...EMPTY.competitionBreakdown.bigGamePerformance.vsTop6, ...d.competitionBreakdown?.bigGamePerformance?.vsTop6 }, derbies: { ...EMPTY.competitionBreakdown.bigGamePerformance.derbies, ...d.competitionBreakdown?.bigGamePerformance?.derbies } } },
        recentForm:           { ...EMPTY.recentForm,           currentForm: { ...EMPTY.recentForm.currentForm, ...d.recentForm?.currentForm }, streaks: { ...EMPTY.recentForm.streaks, ...d.recentForm?.streaks } },
        careerHistory:        { ...EMPTY.careerHistory,        lastClub: { ...EMPTY.careerHistory.lastClub, ...d.careerHistory?.lastClub }, youthCareer: { ...EMPTY.careerHistory.youthCareer, ...d.careerHistory?.youthCareer } },
        internationalCareer:  { ...EMPTY.internationalCareer,  ...d.internationalCareer },
        medicalHistory:       { ...EMPTY.medicalHistory,       ...d.medicalHistory,       lastInjury: { ...EMPTY.medicalHistory.lastInjury, ...d.medicalHistory?.lastInjury } },
        marketingData:        { ...EMPTY.marketingData,        ...d.marketingData },
        personalTraits:       { ...EMPTY.personalTraits,       ...d.personalTraits },
    };
};

const Field = ({ label, children, full = false }) => (
    <div className={`np-field${full ? ' np-field--full' : ''}`}>
        <label>{label}</label>
        {children}
    </div>
);
const NInput  = ({ name, value, onChange, placeholder = '', type = 'text', min, max, step }) => (
    <input name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} type={type} min={min} max={max} step={step} />
);
const NSelect = ({ name, value, onChange, options, placeholder = 'Seleccionar' }) => (
    <select name={name} value={value ?? ''} onChange={onChange}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
);
const NavButtons = ({ prev, next, goTo, loading, isEdit }) => (
    <div className="np-section-actions">
        {prev && <button type="button" className="btn-back" onClick={() => goTo(prev.id)}>← {prev.label}</button>}
        {next && <button type="button" className="btn-next" onClick={() => goTo(next.id)}>{next.label} →</button>}
        <button type="submit" className="btn-submit" disabled={loading}>
            {loading
                ? <><span className="np-spinner" /> {isEdit ? 'Guardando...' : 'Creando...'}</>
                : isEdit ? 'Guardar cambios' : 'Crear jugador'
            }
        </button>
    </div>
);

const PlayerForm = ({ mode = 'create', playerId = null }) => {
    const navigate = useNavigate();
    const isEdit   = mode === 'edit';

    const [form,           setForm]           = useState(EMPTY);
    const [errors,         setErrors]         = useState({});
    const [loading,        setLoading]        = useState(false);
    const [loadingData,    setLoadingData]    = useState(isEdit);
    const [activeSection,  setActiveSection]  = useState('identidad');

    useEffect(() => {
        if (!isEdit || !playerId) return;
        const fetch = async () => {
            try {
                const res  = await API.get(`/players/${playerId}`);
                const data = res.data.player ?? res.data;
                setForm(serverToForm(data));
            } catch {
                setErrors({ global: 'No se pudo cargar el jugador' });
            } finally {
                setLoadingData(false);
            }
        };
        fetch();
    }, [isEdit, playerId]);

    const set    = (name, value) => setForm(p => ({ ...p, [name]: value }));
    const setIn  = (s, name, value) => setForm(p => ({ ...p, [s]: { ...p[s], [name]: value } }));
    const setIn2 = (s1, s2, name, value) => setForm(p => ({ ...p, [s1]: { ...p[s1], [s2]: { ...p[s1][s2], [name]: value } } }));
    const setIn3 = (s1, s2, s3, name, value) => setForm(p => ({ ...p, [s1]: { ...p[s1], [s2]: { ...p[s1][s2], [s3]: { ...p[s1][s2][s3], [name]: value } } } }));

    const ch    = (s)          => (e) => setIn(s, e.target.name, e.target.value);
    const ch2   = (s1, s2)     => (e) => setIn2(s1, s2, e.target.name, e.target.value);
    const ch3   = (s1, s2, s3) => (e) => setIn3(s1, s2, s3, e.target.name, e.target.value);
    const chRoot               = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

    const attrColor = (v) => { const n = Number(v); if (!n) return '#94a3b8'; if (n >= 80) return '#10b981'; if (n >= 60) return '#f59e0b'; return '#ef4444'; };

    const validate = () => {
        const errs = {};
        if (!form.name?.trim()) errs.name     = 'Obligatorio';
        if (!form.position)     errs.position = 'Obligatorio';
        return errs;
    };

    const buildPayload = () => {
        const payload = JSON.parse(JSON.stringify(form, (_, v) => v === '' ? undefined : v));
        const arr = (v) => typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : v;
        if (payload.secondaryPositions) payload.secondaryPositions = arr(payload.secondaryPositions);
        if (payload.marketData?.transferData?.interestedClubs)     payload.marketData.transferData.interestedClubs = arr(payload.marketData.transferData.interestedClubs);
        if (payload.scoutingAnalysis?.strengths)                   payload.scoutingAnalysis.strengths  = arr(payload.scoutingAnalysis.strengths);
        if (payload.scoutingAnalysis?.weaknesses)                  payload.scoutingAnalysis.weaknesses = arr(payload.scoutingAnalysis.weaknesses);
        if (payload.tacticalData?.playingStyle?.strengths)         payload.tacticalData.playingStyle.strengths  = arr(payload.tacticalData.playingStyle.strengths);
        if (payload.tacticalData?.playingStyle?.weaknesses)        payload.tacticalData.playingStyle.weaknesses = arr(payload.tacticalData.playingStyle.weaknesses);
        if (payload.internationalCareer?.youthTeams)               payload.internationalCareer.youthTeams = arr(payload.internationalCareer.youthTeams);
        if (payload.personalTraits?.languages)                     payload.personalTraits.languages = arr(payload.personalTraits.languages);
        if (payload.personalTraits?.traits)                        payload.personalTraits.traits    = arr(payload.personalTraits.traits);
        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); setActiveSection('identidad'); return; }
        setLoading(true);
        try {
            const payload = buildPayload();
            if (isEdit) {
                await API.put(`/players/${playerId}`, payload);
                navigate(`/player/${playerId}`);
            } else {
                await API.post('/players', payload);
                navigate('/');
            }
        } catch (err) {
            setErrors({ global: err.response?.data?.message || `Error al ${isEdit ? 'actualizar' : 'crear'} el jugador` });
        } finally {
            setLoading(false);
        }
    };

    const goTo = (id) => setActiveSection(id);
    const idx  = SECTIONS.findIndex(s => s.id === activeSection);
    const prev = SECTIONS[idx - 1];
    const next = SECTIONS[idx + 1];

    if (loadingData) return (
        <div className="new-player-page">
            <Header />
            <div className="np-loading">Cargando jugador...</div>
        </div>
    );

    return (
        <div className="new-player-page">
            <Header />
            <div className="np-wrapper">

                {/* Sidebar */}
                <aside className="np-sidebar">
                    <div className="np-sidebar-header">
                        <span className="np-sidebar-title">{isEdit ? 'Editar jugador' : 'Nuevo jugador'}</span>
                        <span className="np-sidebar-sub">{isEdit && form.name ? form.name : `${SECTIONS.length} secciones`}</span>
                    </div>
                    <nav className="np-nav">
                        {SECTIONS.map(s => (
                            <button key={s.id} type="button"
                                className={`np-nav-item ${activeSection === s.id ? 'np-nav-item--active' : ''}`}
                                onClick={() => goTo(s.id)}>
                                {s.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Form */}
                <main className="np-main">
                    <form onSubmit={handleSubmit} className="np-form">
                        {errors.global && <div className="np-error-banner">{errors.global}</div>}

                        {/* 1. IDENTIDAD */}
                        <section className={`np-section ${activeSection === 'identidad' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Identidad</h2>
                                <div className="np-grid np-grid--2">
                                    <Field label={<>Nombre <span className="np-required">*</span></>} full>
                                        <input name="name" value={form.name} onChange={chRoot} placeholder="Nombre del jugador" className={errors.name ? 'np-input--error' : ''} />
                                        {errors.name && <span className="np-field-error">{errors.name}</span>}
                                    </Field>
                                    <Field label="Nombre completo" full><NInput name="fullName" value={form.fullName} onChange={chRoot} placeholder="Nombre completo oficial" /></Field>
                                    <Field label="Nombre para mostrar"><NInput name="displayName" value={form.displayName} onChange={chRoot} placeholder="Ej: L. Messi" /></Field>
                                    <Field label="Edad"><NInput name="age" value={form.age} onChange={chRoot} type="number" placeholder="24" min="14" max="50" /></Field>
                                    <Field label="Fecha de nacimiento"><NInput name="dateOfBirth" value={form.dateOfBirth} onChange={chRoot} type="date" /></Field>
                                    <Field label="Lugar de nacimiento"><NInput name="placeOfBirth" value={form.placeOfBirth} onChange={chRoot} placeholder="Ej: Buenos Aires" /></Field>
                                    <Field label="Nacionalidad"><NInput name="nationality" value={form.nationality} onChange={chRoot} placeholder="Ej: Argentina" /></Field>
                                    <Field label="Segunda nacionalidad"><NInput name="secondNationality" value={form.secondNationality} onChange={chRoot} placeholder="Ej: Española" /></Field>
                                    <Field label="Altura (cm)"><NInput name="height" value={form.height} onChange={chRoot} type="number" placeholder="182" /></Field>
                                    <Field label="Peso (kg)"><NInput name="weight" value={form.weight} onChange={chRoot} type="number" placeholder="78" /></Field>
                                    <Field label="Pie preferido"><NSelect name="preferredFoot" value={form.preferredFoot} onChange={chRoot} options={FEET} /></Field>
                                    <Field label="URL imagen"><NInput name="image" value={form.image} onChange={chRoot} placeholder="https://..." /></Field>
                                    <Field label="URL imagen perfil"><NInput name="profileImage" value={form.profileImage} onChange={chRoot} placeholder="https://..." /></Field>
                                    <Field label="imageUrl"><NInput name="imageUrl" value={form.imageUrl} onChange={chRoot} placeholder="https://..." /></Field>
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 2. CLUB */}
                        <section className={`np-section ${activeSection === 'club' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Club</h2>
                                <div className="np-grid np-grid--2">
                                    <Field label={<>Posición <span className="np-required">*</span></>} full>
                                        <select name="position" value={form.position} onChange={chRoot} className={errors.position ? 'np-input--error' : ''}>
                                            <option value="">Seleccionar posición</option>
                                            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        {errors.position && <span className="np-field-error">{errors.position}</span>}
                                    </Field>
                                    <Field label="Posiciones secundarias (separadas por coma)" full><NInput name="secondaryPositions" value={form.secondaryPositions} onChange={chRoot} placeholder="Extremo Derecho, Mediapunta" /></Field>
                                    <Field label="Equipo"><NInput name="team" value={form.team} onChange={chRoot} placeholder="FC Barcelona" /></Field>
                                    <Field label="Equipo actual"><NInput name="currentTeam" value={form.currentTeam} onChange={chRoot} placeholder="FC Barcelona" /></Field>
                                    <Field label="Team ID"><NInput name="teamId" value={form.teamId} onChange={chRoot} placeholder="ID interno" /></Field>
                                    <Field label="Liga"><NInput name="league" value={form.league} onChange={chRoot} placeholder="La Liga" /></Field>
                                    <Field label="League ID"><NInput name="leagueId" value={form.leagueId} onChange={chRoot} placeholder="ID de liga" /></Field>
                                    <Field label="División"><NInput name="division" value={form.division} onChange={chRoot} placeholder="Primera División" /></Field>
                                    <Field label="País"><NInput name="country" value={form.country} onChange={chRoot} placeholder="España" /></Field>
                                    <Field label="Dorsal"><NInput name="jerseyNumber" value={form.jerseyNumber} onChange={chRoot} type="number" placeholder="10" min="1" max="99" /></Field>
                                    <Field label="Estado del jugador"><NSelect name="playerStatus" value={form.playerStatus} onChange={chRoot} options={PLAYER_STATUS} /></Field>
                                    <Field label="¿Es jugador cedido?">
                                        <label className="np-toggle">
                                            <input type="checkbox" name="isLoanPlayer" checked={form.isLoanPlayer} onChange={chRoot} />
                                            <span className="np-toggle-label">{form.isLoanPlayer ? 'Sí' : 'No'}</span>
                                        </label>
                                    </Field>
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 3. ESTADÍSTICAS */}
                        <section className={`np-section ${activeSection === 'stats' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Estadísticas de temporada</h2>
                                <div className="np-grid np-grid--3">
                                    {[['appearances','Partidos jugados'],['starts','Titularidades'],['minutesPlayed','Minutos jugados'],
                                      ['goals','Goles'],['assists','Asistencias'],['passAccuracy','Precisión pases (%)'],
                                      ['yellowCards','Tarjetas amarillas'],['redCards','Tarjetas rojas'],
                                      ['cleanSheets','Porterías a cero'],['ownGoals','Goles en propia'],
                                    ].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} min="0" value={form.stats[k] ?? ''} onChange={ch('stats')} placeholder="0" /></Field>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 4. STATS POR 90 */}
                        <section className={`np-section ${activeSection === 'stats_per90' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Estadísticas por 90 minutos</h2>
                                <div className="np-grid np-grid--3">
                                    {[['goalsP90','Goles/90'],['assistsP90','Asistencias/90'],['shotsP90','Tiros/90'],
                                      ['shotsOnTargetP90','Tiros a puerta/90'],['keyPassesP90','Pases clave/90'],['passesP90','Pases/90'],
                                      ['dribblesP90','Regates/90'],['tacklesP90','Entradas/90'],['interceptionsP90','Intercepciones/90'],
                                      ['clearancesP90','Despejes/90'],['crossesP90','Centros/90'],
                                      ['foulsConcededP90','Faltas cometidas/90'],['foulsWonP90','Faltas ganadas/90'],
                                    ].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} step="0.01" min="0" value={form.stats.per90[k] ?? ''} onChange={ch2('stats','per90')} placeholder="0.00" /></Field>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 5. STATS AVANZADAS */}
                        <section className={`np-section ${activeSection === 'stats_adv' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Estadísticas avanzadas</h2>
                                <h3 className="np-subsection">xG / xA</h3>
                                <div className="np-grid np-grid--3">
                                    {[['xG','xG'],['xA','xA'],['xGP90','xG/90'],['xAP90','xA/90'],['xGOverperformance','xG Superrendimiento'],['xAOverperformance','xA Superrendimiento']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} step="0.01" value={form.stats.advanced[k] ?? ''} onChange={ch2('stats','advanced')} placeholder="0.00" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Tiro</h3>
                                <div className="np-grid np-grid--3">
                                    {[['shotsOnTarget','Tiros a puerta'],['totalShots','Tiros totales'],['shotAccuracy','Precisión tiro (%)'],['shotConversion','Conversión tiro (%)'],['bigChances','Grandes ocasiones'],['bigChancesMissed','Grandes ocasiones falladas'],['goalConversionRate','Tasa conversión gol (%)']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} step="0.01" min="0" value={form.stats.advanced[k] ?? ''} onChange={ch2('stats','advanced')} placeholder="0" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Pase</h3>
                                <div className="np-grid np-grid--3">
                                    {[['totalPasses','Pases totales'],['shortPasses','Pases cortos'],['shortPassAccuracy','Precisión pase corto (%)'],['mediumPasses','Pases medios'],['mediumPassAccuracy','Precisión pase medio (%)'],['longPasses','Pases largos'],['longPassAccuracy','Precisión pase largo (%)'],['forwardPasses','Pases adelante'],['backwardPasses','Pases atrás'],['sidewaysPasses','Pases laterales'],['throughBalls','Pases filtrados'],['throughBallAccuracy','Precisión pase filtrado (%)'],['crossAccuracy','Precisión centro (%)'],['cornerAccuracy','Precisión córner (%)']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} step="0.01" min="0" value={form.stats.advanced[k] ?? ''} onChange={ch2('stats','advanced')} placeholder="0" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Defensa</h3>
                                <div className="np-grid np-grid--3">
                                    {[['dribblesCompleted','Regates completados'],['tacklesWon','Entradas ganadas'],['tackleSuccessRate','Tasa éxito entrada (%)'],['aerialDuelsWon','Duelos aéreos ganados'],['aerialDuelSuccess','Éxito duelo aéreo (%)'],['groundDuels','Duelos en suelo'],['groundDuelSuccess','Éxito duelo suelo (%)'],['interceptions','Intercepciones'],['blocks','Bloqueos'],['clearances','Despejes'],['pressures','Presiones'],['pressureSuccessRate','Éxito presión (%)'],['recoveries','Recuperaciones']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} step="0.01" min="0" value={form.stats.advanced[k] ?? ''} onChange={ch2('stats','advanced')} placeholder="0" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Técnica</h3>
                                <div className="np-grid np-grid--3">
                                    {[['touches','Toques'],['touchesInBox','Toques en área'],['dribbleSuccessRate','Éxito regate (%)'],['dispossessed','Pérdidas'],['badControls','Malos controles'],['skillMoves','Regate habilidad'],['skillMoveSuccess','Éxito regate habilidad (%)']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} step="0.01" min="0" value={form.stats.advanced[k] ?? ''} onChange={ch2('stats','advanced')} placeholder="0" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Físico</h3>
                                <div className="np-grid np-grid--3">
                                    {[['topSpeed','Velocidad máxima'],['distanceCovered','Distancia recorrida'],['highIntensityRuns','Carreras alta intensidad'],['sprints','Sprints'],['accelerations','Aceleraciones'],['decelerations','Deceleraciones'],['intensityScore','Puntuación intensidad'],['distanceCoveredP90','Distancia/90']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="text" name={k} value={form.stats.advanced[k] ?? ''} onChange={ch2('stats','advanced')} placeholder="0" /></Field>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 6. ATRIBUTOS */}
                        <section className={`np-section ${activeSection === 'atributos' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Atributos (1–99)</h2>
                                <div className="np-attrs-grid">
                                    {[['pace','Velocidad'],['shooting','Disparo'],['passing','Pase'],['dribbling','Regate'],['defending','Defensa'],['physical','Físico'],['finishing','Finalización'],['crossing','Centro'],['longShots','Tiro lejano'],['positioning','Posicionamiento']].map(([k,l]) => (
                                        <div className="np-attr-card" key={k}>
                                            <label>{l}</label>
                                            <input type="number" name={k} min="1" max="99" value={form.attributes[k] ?? ''} onChange={ch('attributes')} placeholder="—" />
                                            <div className="np-attr-bar-track">
                                                <div className="np-attr-bar" style={{ width: form.attributes[k] ? `${Math.min(form.attributes[k],99)}%` : '0%', background: attrColor(form.attributes[k]) }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 7. CONTRATO */}
                        <section className={`np-section ${activeSection === 'contrato' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Contrato</h2>
                                <div className="np-grid np-grid--2">
                                    {[['contractStart','Inicio contrato','date'],['contractEnd','Fin contrato','date'],['contractLength','Duración (años)','number'],['releaseClause','Cláusula de rescisión','number']].map(([k,l,t]) => (
                                        <Field key={k} label={l}><input type={t} name={k} value={form.contractInfo[k] ?? ''} onChange={ch('contractInfo')} placeholder={t==='number'?'0':''} /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Salario</h3>
                                <div className="np-grid np-grid--3">
                                    {[['weeklyWage','Salario semanal'],['annualSalary','Salario anual'],['currency','Moneda']].map(([k,l]) => (
                                        <Field key={k} label={l}><input name={k} value={form.contractInfo.salary[k] ?? ''} onChange={ch2('contractInfo','salary')} placeholder={k==='currency'?'EUR':'0'} /></Field>
                                    ))}
                                    {[['signingBonus','Bonus fichaje'],['loyaltyBonus','Bonus fidelidad'],['performanceBonus','Bonus rendimiento']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} value={form.contractInfo.salary.bonuses[k] ?? ''} onChange={ch3('contractInfo','salary','bonuses')} placeholder="0" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Agente</h3>
                                <div className="np-grid np-grid--3">
                                    {[['agentName','Nombre agente'],['agencyName','Agencia'],['agentFeePercentage','Comisión (%)']].map(([k,l]) => (
                                        <Field key={k} label={l}><input name={k} value={form.contractInfo.agentInfo[k] ?? ''} onChange={ch2('contractInfo','agentInfo')} placeholder={k==='agentFeePercentage'?'0':''} /></Field>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 8. MERCADO */}
                        <section className={`np-section ${activeSection === 'mercado' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Datos de mercado</h2>
                                <div className="np-grid np-grid--2">
                                    {[['currentMarketValue','Valor de mercado actual'],['currency','Moneda'],['valuationDate','Fecha valoración']].map(([k,l]) => (
                                        <Field key={k} label={l}><input name={k} value={form.marketData[k] ?? ''} onChange={ch('marketData')} placeholder={k==='currency'?'EUR':k==='valuationDate'?'YYYY-MM-DD':'0'} /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Tendencia de valor</h3>
                                <div className="np-grid np-grid--3">
                                    {[['last30Days','Últimos 30 días'],['last90Days','Últimos 90 días'],['last12Months','Últimos 12 meses']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} value={form.marketData.valueTrend[k] ?? ''} onChange={ch2('marketData','valueTrend')} placeholder="0" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Transferencias</h3>
                                <div className="np-grid np-grid--2">
                                    <Field label="Probabilidad transferencia (%)"><input type="number" name="transferProbability" min="0" max="100" value={form.marketData.transferData.transferProbability ?? ''} onChange={ch2('marketData','transferData')} placeholder="0" /></Field>
                                    <Field label="Ventana de transferencia"><input name="transferWindow" value={form.marketData.transferData.transferWindow ?? ''} onChange={ch2('marketData','transferData')} placeholder="Ej: Verano 2025" /></Field>
                                    <Field label="Clubes interesados (separados por coma)" full><input name="interestedClubs" value={form.marketData.transferData.interestedClubs ?? ''} onChange={ch2('marketData','transferData')} placeholder="Real Madrid, PSG, Manchester City" /></Field>
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 9. SCOUTING */}
                        <section className={`np-section ${activeSection === 'scouting' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Análisis de scouting</h2>
                                <div className="np-grid np-grid--2">
                                    <Field label="Jugador comparable"><input name="comparablePlayer" value={form.scoutingAnalysis.comparablePlayer ?? ''} onChange={ch('scoutingAnalysis')} placeholder="Ej: Kylian Mbappé" /></Field>
                                    <Field label="Techo"><NSelect name="ceiling" value={form.scoutingAnalysis.ceiling} onChange={ch('scoutingAnalysis')} options={CEILING} /></Field>
                                    <Field label="Preparación"><NSelect name="readiness" value={form.scoutingAnalysis.readiness} onChange={ch('scoutingAnalysis')} options={READINESS} /></Field>
                                    <Field label="Recomendación"><NSelect name="recommendation" value={form.scoutingAnalysis.recommendation} onChange={ch('scoutingAnalysis')} options={RECOMMENDATIONS} /></Field>
                                    <Field label="Potencial (1-10)"><input type="number" name="potential" min="1" max="10" value={form.scoutingAnalysis.potential ?? ''} onChange={ch('scoutingAnalysis')} placeholder="0" /></Field>
                                    <Field label="Valoración (1-10)"><input type="number" name="rating" min="1" max="10" value={form.scoutingAnalysis.rating ?? ''} onChange={ch('scoutingAnalysis')} placeholder="0" /></Field>
                                    <Field label="Fortalezas (separadas por coma)" full><input name="strengths" value={form.scoutingAnalysis.strengths ?? ''} onChange={ch('scoutingAnalysis')} placeholder="Velocidad, Remate, Visión de juego" /></Field>
                                    <Field label="Debilidades (separadas por coma)" full><input name="weaknesses" value={form.scoutingAnalysis.weaknesses ?? ''} onChange={ch('scoutingAnalysis')} placeholder="Pie izquierdo, Juego aéreo" /></Field>
                                    <Field label="Comentarios" full><textarea name="comments" value={form.scoutingAnalysis.comments ?? ''} onChange={ch('scoutingAnalysis')} placeholder="Observaciones del scout..." rows={4} /></Field>
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 10. TÁCTICA */}
                        <section className={`np-section ${activeSection === 'tactica' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Datos tácticos</h2>
                                <h3 className="np-subsection">Posición</h3>
                                <div className="np-grid np-grid--3">
                                    <Field label="Posición principal"><input name="primaryPosition" value={form.tacticalData.positionData.primaryPosition ?? ''} onChange={ch2('tacticalData','positionData')} placeholder="Extremo Derecho" /></Field>
                                    <Field label="Flexibilidad posicional (1-10)"><input type="number" name="positionFlexibility" min="1" max="10" value={form.tacticalData.positionData.positionFlexibility ?? ''} onChange={ch2('tacticalData','positionData')} placeholder="0" /></Field>
                                    <Field label="Lado preferido"><input name="preferredSide" value={form.tacticalData.positionData.preferredSide ?? ''} onChange={ch2('tacticalData','positionData')} placeholder="Derecho" /></Field>
                                </div>
                                <h3 className="np-subsection">Posición media en campo (0–100)</h3>
                                <div className="np-grid np-grid--2">
                                    <Field label="Posición X"><input type="number" name="x" min="0" max="100" value={form.tacticalData.heatmaps.averagePosition.x ?? ''} onChange={ch3('tacticalData','heatmaps','averagePosition')} placeholder="50" /></Field>
                                    <Field label="Posición Y"><input type="number" name="y" min="0" max="100" value={form.tacticalData.heatmaps.averagePosition.y ?? ''} onChange={ch3('tacticalData','heatmaps','averagePosition')} placeholder="50" /></Field>
                                </div>
                                <h3 className="np-subsection">Ocupación de zonas (%)</h3>
                                <div className="np-grid np-grid--3">
                                    {[['defensiveThird','Tercio defensivo'],['middleThird','Tercio medio'],['attackingThird','Tercio ofensivo'],['leftFlank','Banda izquierda'],['central','Centro'],['rightFlank','Banda derecha'],['penaltyArea','Área']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} min="0" max="100" value={form.tacticalData.heatmaps.zoneOccupancy[k] ?? ''} onChange={ch3('tacticalData','heatmaps','zoneOccupancy')} placeholder="0" /></Field>
                                    ))}
                                </div>
                                <h3 className="np-subsection">Estilo de juego</h3>
                                <div className="np-grid np-grid--2">
                                    <Field label="Descripción" full><input name="styleDescription" value={form.tacticalData.playingStyle.styleDescription ?? ''} onChange={ch2('tacticalData','playingStyle')} placeholder="Extremo vertical con desborde..." /></Field>
                                    <Field label="Formación preferida"><input name="preferredFormation" value={form.tacticalData.playingStyle.preferredFormation ?? ''} onChange={ch2('tacticalData','playingStyle')} placeholder="4-3-3" /></Field>
                                    <Field label="Rol en el equipo"><input name="roleInTeam" value={form.tacticalData.playingStyle.roleInTeam ?? ''} onChange={ch2('tacticalData','playingStyle')} placeholder="Extremo titular" /></Field>
                                    <Field label="Fortalezas estilo (coma)" full><input name="strengths" value={form.tacticalData.playingStyle.strengths ?? ''} onChange={ch2('tacticalData','playingStyle')} placeholder="Presión alta, Transiciones" /></Field>
                                    <Field label="Debilidades estilo (coma)" full><input name="weaknesses" value={form.tacticalData.playingStyle.weaknesses ?? ''} onChange={ch2('tacticalData','playingStyle')} placeholder="Pressing defensivo" /></Field>
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 11. COMPETICIÓN */}
                        <section className={`np-section ${activeSection === 'competicion' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Desglose por competición</h2>
                                {[['home','Local','homeVsAway'],['away','Visitante','homeVsAway'],['vsTop6','vs Top 6','bigGamePerformance'],['derbies','Derbis','bigGamePerformance']].map(([key,label,parent]) => (
                                    <div key={key}>
                                        <h3 className="np-subsection">{label}</h3>
                                        <div className="np-grid np-grid--4">
                                            {[['appearances','Partidos'],['goals','Goles'],['assists','Asistencias'],['averageRating','Rating medio']].map(([k,l]) => (
                                                <Field key={k} label={l}><input type="number" name={k} step="0.01" min="0" value={form.competitionBreakdown[parent][key][k] ?? ''} onChange={ch3('competitionBreakdown',parent,key)} placeholder="0" /></Field>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 12. FORMA RECIENTE */}
                        <section className={`np-section ${activeSection === 'forma' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Forma reciente</h2>
                                <div className="np-grid np-grid--3">
                                    <Field label="Rating de forma (1-10)"><input type="number" name="formRating" min="1" max="10" step="0.1" value={form.recentForm.currentForm.formRating ?? ''} onChange={ch2('recentForm','currentForm')} placeholder="0" /></Field>
                                    <Field label="Puntuación consistencia (1-10)"><input type="number" name="consistencyScore" min="1" max="10" step="0.1" value={form.recentForm.currentForm.consistencyScore ?? ''} onChange={ch2('recentForm','currentForm')} placeholder="0" /></Field>
                                    <Field label="Indicador de momento"><NSelect name="momentumIndicator" value={form.recentForm.currentForm.momentumIndicator} onChange={ch2('recentForm','currentForm')} options={MOMENTUM} /></Field>
                                </div>
                                <h3 className="np-subsection">Rachas</h3>
                                <div className="np-grid np-grid--3">
                                    {[['currentGoalStreak','Racha goles actual'],['longestGoalStreak','Racha goles más larga'],['currentAssistStreak','Racha asistencias actual'],['longestAssistStreak','Racha asistencias más larga'],['currentCleanSheetStreak','Racha porterías a cero']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} min="0" value={form.recentForm.streaks[k] ?? ''} onChange={ch2('recentForm','streaks')} placeholder="0" /></Field>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 13. CARRERA */}
                        <section className={`np-section ${activeSection === 'carrera' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Historial de carrera</h2>
                                <h3 className="np-subsection">Último club anterior</h3>
                                <div className="np-grid np-grid--2">
                                    {[['club','Club'],['league','Liga'],['startDate','Fecha inicio'],['endDate','Fecha fin'],['appearances','Partidos'],['goals','Goles'],['assists','Asistencias'],['transferFee','Coste transferencia']].map(([k,l]) => (
                                        <Field key={k} label={l}><input name={k} value={form.careerHistory.lastClub[k] ?? ''} onChange={ch2('careerHistory','lastClub')} placeholder="" /></Field>
                                    ))}
                                    <Field label="Tipo transferencia"><NSelect name="transferType" value={form.careerHistory.lastClub.transferType} onChange={ch2('careerHistory','lastClub')} options={TRANSFER_TYPES} /></Field>
                                </div>
                                <h3 className="np-subsection">Carrera juvenil</h3>
                                <div className="np-grid np-grid--3">
                                    <Field label="Club"><input name="club" value={form.careerHistory.youthCareer.club ?? ''} onChange={ch2('careerHistory','youthCareer')} placeholder="Cantera" /></Field>
                                    <Field label="Año inicio"><input type="number" name="startYear" value={form.careerHistory.youthCareer.startYear ?? ''} onChange={ch2('careerHistory','youthCareer')} placeholder="2010" /></Field>
                                    <Field label="Año fin"><input type="number" name="endYear" value={form.careerHistory.youthCareer.endYear ?? ''} onChange={ch2('careerHistory','youthCareer')} placeholder="2018" /></Field>
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 14. INTERNACIONAL */}
                        <section className={`np-section ${activeSection === 'internacional' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Carrera internacional</h2>
                                <div className="np-grid np-grid--2">
                                    {[['nationalTeam','Selección nacional'],['caps','Internacionalidades'],['goals','Goles'],['assists','Asistencias'],['debut','Fecha debut'],['lastCallUp','Última convocatoria']].map(([k,l]) => (
                                        <Field key={k} label={l}><input name={k} value={form.internationalCareer[k] ?? ''} onChange={ch('internationalCareer')} placeholder="" /></Field>
                                    ))}
                                    <Field label="Selecciones juveniles (coma)" full><input name="youthTeams" value={form.internationalCareer.youthTeams ?? ''} onChange={ch('internationalCareer')} placeholder="Sub-17, Sub-19, Sub-21" /></Field>
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 15. MÉDICO */}
                        <section className={`np-section ${activeSection === 'medico' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Historial médico</h2>
                                <div className="np-grid np-grid--3">
                                    <Field label="Propensión lesiones (1-10)"><input type="number" name="injuryProneness" min="1" max="10" value={form.medicalHistory.injuryProneness ?? ''} onChange={ch('medicalHistory')} placeholder="0" /></Field>
                                    <Field label="Total días lesionado"><input type="number" name="totalDaysInjured" min="0" value={form.medicalHistory.totalDaysInjured ?? ''} onChange={ch('medicalHistory')} placeholder="0" /></Field>
                                    <Field label="Disponibilidad (%)"><input type="number" name="availabilityPercentage" min="0" max="100" value={form.medicalHistory.availabilityPercentage ?? ''} onChange={ch('medicalHistory')} placeholder="0" /></Field>
                                </div>
                                <h3 className="np-subsection">Última lesión</h3>
                                <div className="np-grid np-grid--2">
                                    {[['injuryType','Tipo de lesión'],['injuryDate','Fecha lesión'],['returnDate','Fecha regreso'],['daysOut','Días de baja'],['gamesMissed','Partidos perdidos']].map(([k,l]) => (
                                        <Field key={k} label={l}><input name={k} value={form.medicalHistory.lastInjury[k] ?? ''} onChange={ch2('medicalHistory','lastInjury')} placeholder="" /></Field>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 16. MARKETING */}
                        <section className={`np-section ${activeSection === 'marketing' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Datos de marketing</h2>
                                <div className="np-grid np-grid--3">
                                    {[['instagramFollowers','Seguidores Instagram'],['twitterFollowers','Seguidores Twitter'],['facebookFollowers','Seguidores Facebook'],['tiktokFollowers','Seguidores TikTok'],['engagementRate','Tasa de engagement (%)'],['marketability','Comercialidad (1-10)']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} min="0" step="0.01" value={form.marketingData[k] ?? ''} onChange={ch('marketingData')} placeholder="0" /></Field>
                                    ))}
                                </div>
                            </div>
                            <NavButtons prev={prev} next={next} goTo={goTo} loading={loading} isEdit={isEdit} />
                        </section>

                        {/* 17. PERSONALIDAD */}
                        <section className={`np-section ${activeSection === 'personalidad' ? 'np-section--active' : ''}`}>
                            <div className="np-card">
                                <h2 className="np-section-title">Personalidad</h2>
                                <div className="np-grid np-grid--2">
                                    <Field label="Idiomas (separados por coma)" full><input name="languages" value={form.personalTraits.languages ?? ''} onChange={ch('personalTraits')} placeholder="Español, Inglés, Portugués" /></Field>
                                    <Field label="Rasgos (separados por coma)" full><input name="traits" value={form.personalTraits.traits ?? ''} onChange={ch('personalTraits')} placeholder="Liderazgo, Competitivo, Trabajador" /></Field>
                                    {[['leadership','Liderazgo (1-10)'],['professionalism','Profesionalidad (1-10)'],['adaptability','Adaptabilidad (1-10)']].map(([k,l]) => (
                                        <Field key={k} label={l}><input type="number" name={k} min="1" max="10" value={form.personalTraits[k] ?? ''} onChange={ch('personalTraits')} placeholder="0" /></Field>
                                    ))}
                                    <Field label="Educación"><input name="education" value={form.personalTraits.education ?? ''} onChange={ch('personalTraits')} placeholder="Secundaria" /></Field>
                                    <Field label="Estado civil"><input name="maritalStatus" value={form.personalTraits.maritalStatus ?? ''} onChange={ch('personalTraits')} placeholder="Soltero" /></Field>
                                    <Field label="Hijos"><input type="number" name="children" min="0" value={form.personalTraits.children ?? ''} onChange={ch('personalTraits')} placeholder="0" /></Field>
                                    <Field label="¿Familia futbolística?">
                                        <label className="np-toggle">
                                            <input type="checkbox" name="footballingFamily" checked={form.personalTraits.footballingFamily}
                                                onChange={(e) => setForm(p => ({ ...p, personalTraits: { ...p.personalTraits, footballingFamily: e.target.checked } }))} />
                                            <span className="np-toggle-label">{form.personalTraits.footballingFamily ? 'Sí' : 'No'}</span>
                                        </label>
                                    </Field>
                                </div>
                            </div>
                            <div className="np-submit-area">
                                <button type="button" className="btn-back" onClick={() => prev && goTo(prev.id)}>← Anterior</button>
                                <div className="np-submit-actions">
                                    <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
                                    <button type="submit" className="btn-submit" disabled={loading}>
                                        {loading
                                            ? <><span className="np-spinner" /> {isEdit ? 'Guardando...' : 'Creando...'}</>
                                            : isEdit ? 'Guardar cambios' : 'Crear jugador'
                                        }
                                    </button>
                                </div>
                            </div>
                        </section>

                    </form>
                </main>
            </div>
        </div>
    );
};

export default PlayerForm;