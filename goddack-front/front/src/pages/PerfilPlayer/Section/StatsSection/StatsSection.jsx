import '../Section.css';
import './StatsSection.css';


const val = (v, f = '—') => v != null ? v : f;
const pct = (v) => v != null ? `${v}%` : '—';
const num = (v) => v != null ? Number(v).toLocaleString('de-DE') : '—';

const StatBox = ({ label, value, accent }) => (
    <div className={`stat-box ${accent ? 'stat-box--accent' : ''}`}>
        <span className="stat-box__val">{value}</span>
        <span className="stat-box__label">{label}</span>
    </div>
);

const StatsSection = ({ player }) => {
    const s   = player.stats                || {};
    const adv = s.advanced                  || {};
    const p90 = s.per90                     || {};
    const rf  = player.recentForm           || {};
    const cf  = rf.currentForm              || {};
    const cb  = player.competitionBreakdown || {};

    return (
        <div className="grid-col-1">

            <section className="card">
                <h2 className="card-title">Estadísticas básicas</h2>
                <div className="stats-row">
                    <StatBox label="Partidos"    value={val(s.appearances)}   />
                    <StatBox label="Titular"     value={val(s.starts)}        />
                    <StatBox label="Minutos"     value={val(s.minutesPlayed)} />
                    <StatBox label="Goles"       value={val(s.goals)}         />
                    <StatBox label="Asistencias" value={val(s.assists)}       />
                    <StatBox label="Prec. pases" value={pct(s.passAccuracy)}  />
                    <StatBox label="Amarillas"   value={val(s.yellowCards)}   />
                    <StatBox label="Rojas"       value={val(s.redCards)}      />
                </div>
            </section>

            <section className="card card--highlight">
                <h2 className="card-title">Expected goals & assists</h2>
                <div className="stats-row">
                    <StatBox label="xG"      value={val(adv.xG)}                accent />
                    <StatBox label="xA"      value={val(adv.xA)}                accent />
                    <StatBox label="xG P90"  value={val(adv.xGP90)}             />
                    <StatBox label="xA P90"  value={val(adv.xAP90)}             />
                    <StatBox label="Over xG" value={val(adv.xGOverperformance)} />
                    <StatBox label="Over xA" value={val(adv.xAOverperformance)} />
                </div>
            </section>

            <section className="card">
                <h2 className="card-title">Métricas per 90</h2>
                <div className="stats-row">
                    <StatBox label="Goles"       value={val(p90.goalsP90)}         />
                    <StatBox label="Asist."      value={val(p90.assistsP90)}       />
                    <StatBox label="Pases clave" value={val(p90.keyPassesP90)}     />
                    <StatBox label="Regates"     value={val(p90.dribblesP90)}      />
                    <StatBox label="Tackles"     value={val(p90.tacklesP90)}       />
                    <StatBox label="Interc."     value={val(p90.interceptionsP90)} />
                    <StatBox label="Despejes"    value={val(p90.clearancesP90)}    />
                    <StatBox label="Centros"     value={val(p90.crossesP90)}       />
                </div>
            </section>

            <section className="card">
                <h2 className="card-title">Tiro</h2>
                <div className="stats-row">
                    <StatBox label="Tiros totales" value={val(adv.totalShots)}       />
                    <StatBox label="A puerta"      value={val(adv.shotsOnTarget)}    />
                    <StatBox label="Precisión"     value={pct(adv.shotAccuracy)}     />
                    <StatBox label="Conversión"    value={pct(adv.shotConversion)}   />
                    <StatBox label="Ocas. claras"  value={val(adv.bigChances)}       />
                    <StatBox label="Falladas"      value={val(adv.bigChancesMissed)} />
                </div>
            </section>

            <section className="card">
                <h2 className="card-title">Pase</h2>
                <div className="stats-row">
                    <StatBox label="Total"           value={num(adv.totalPasses)}          />
                    <StatBox label="Cortos prec."    value={pct(adv.shortPassAccuracy)}    />
                    <StatBox label="Largos prec."    value={pct(adv.longPassAccuracy)}     />
                    <StatBox label="Filtrados"       value={num(adv.throughBalls)}         />
                    <StatBox label="Prec. filtrados" value={pct(adv.throughBallAccuracy)}  />
                    <StatBox label="Prec. centros"   value={pct(adv.crossAccuracy)}        />
                </div>
            </section>

            <section className="card">
                <h2 className="card-title">Defensa</h2>
                <div className="stats-row">
                    <StatBox label="Tackles"       value={val(adv.tacklesWon)}          />
                    <StatBox label="% Tackle"      value={pct(adv.tackleSuccessRate)}   />
                    <StatBox label="Duelos aéreos" value={val(adv.aerialDuelsWon)}      />
                    <StatBox label="% Aéreos"      value={pct(adv.aerialDuelSuccess)}   />
                    <StatBox label="Regates comp." value={val(adv.dribblesCompleted)}   />
                    <StatBox label="Duelos tierra" value={val(adv.groundDuels)}         />
                    <StatBox label="Presiones"     value={val(adv.pressures)}           />
                    <StatBox label="% Presiones"   value={pct(adv.pressureSuccessRate)} />
                    <StatBox label="Recuperac."    value={val(adv.recoveries)}          />
                </div>
            </section>

            <section className="card">
                <h2 className="card-title">Físico</h2>
                <div className="stats-row">
                    <StatBox label="Dist. cubierta" value={adv.distanceCovered    != null ? `${adv.distanceCovered} km`    : '—'} />
                    <StatBox label="Dist. P90"      value={adv.distanceCoveredP90 != null ? `${adv.distanceCoveredP90} km` : '—'} />
                    <StatBox label="Vel. máx."      value={adv.topSpeed           != null ? `${adv.topSpeed} km/h`         : '—'} />
                    <StatBox label="Sprints"        value={val(adv.sprints)}            />
                    <StatBox label="Alta intens."   value={val(adv.highIntensityRuns)}  />
                    <StatBox label="Intensidad"     value={val(adv.intensityScore)}     />
                </div>
            </section>

            <section className="card">
                <h2 className="card-title">Perfil de atributos</h2>
                {player.attributes
                    ? <div className="attributes-grid">
                        {Object.entries(player.attributes)
                            .filter(([k]) => k !== '_id')
                            .map(([k, v]) => (
                                <div key={k} className="attr-item">
                                    <span className="attr-label">{k}</span>
                                    <div className="attr-bar-wrap">
                                        <div className="attr-bar" style={{ width: v != null ? `${v}%` : '0%' }} />
                                    </div>
                                    <span className="attr-num">{val(v)}</span>
                                </div>
                            ))}
                      </div>
                    : <p className="empty-msg">Sin datos de atributos</p>
                }
            </section>

            {cb.byCompetition?.length > 0 && (
                <section className="card">
                    <h2 className="card-title">Desglose por competición</h2>
                    <table className="data-table">
                        <thead>
                            <tr><th>Competición</th><th>PJ</th><th>G</th><th>A</th><th>Rating</th></tr>
                        </thead>
                        <tbody>
                            {cb.byCompetition.map((c, i) => (
                                <tr key={i}>
                                    <td>{c.competitionName} <span className="comp-type">({c.competitionType})</span></td>
                                    <td>{val(c.appearances)}</td>
                                    <td>{val(c.goals)}</td>
                                    <td>{val(c.assists)}</td>
                                    <td>{val(c.averageRating)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {cb.homeVsAway?.home && (
                        <div className="home-away">
                            {['home', 'away'].map(k => (
                                <div key={k} className="home-away__block">
                                    <h5>{k === 'home' ? 'Local' : 'Visitante'}</h5>
                                    <p>PJ {val(cb.homeVsAway[k]?.appearances)} · G {val(cb.homeVsAway[k]?.goals)} · A {val(cb.homeVsAway[k]?.assists)} · Rating {val(cb.homeVsAway[k]?.averageRating)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <section className="card">
                <h2 className="card-title">Forma reciente</h2>
                <div className="stats-row form-meta">
                    <StatBox label="Form rating"  value={val(cf.formRating)}        accent />
                    <StatBox label="Consistencia" value={val(cf.consistencyScore)}  />
                    <StatBox label="Momento"      value={val(cf.momentumIndicator)} />
                </div>
                {cf.last5Games?.length > 0
                    ? <table className="data-table">
                        <thead>
                            <tr><th>Fecha</th><th>Rival</th><th>Res.</th><th>G</th><th>A</th><th>Rating</th><th>Min</th></tr>
                        </thead>
                        <tbody>
                            {cf.last5Games.map((g, i) => (
                                <tr key={i}>
                                    <td>{val(g.date)}</td>
                                    <td>{val(g.opponent)}</td>
                                    <td><span className={`result result--${g.result}`}>{g.result}</span></td>
                                    <td>{val(g.goals)}</td>
                                    <td>{val(g.assists)}</td>
                                    <td>{val(g.rating)}</td>
                                    <td>{val(g.minutesPlayed)}'</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                    : <p className="empty-msg">Sin partidos recientes</p>
                }
                {rf.streaks && (
                    <div className="streaks">
                        <h4>Rachas</h4>
                        <div className="stats-row">
                            <StatBox label="Racha goles"  value={val(rf.streaks.currentGoalStreak)}   />
                            <StatBox label="Mejor racha"  value={val(rf.streaks.longestGoalStreak)}   />
                            <StatBox label="Racha asist." value={val(rf.streaks.currentAssistStreak)} />
                            <StatBox label="Mejor asist." value={val(rf.streaks.longestAssistStreak)} />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default StatsSection;