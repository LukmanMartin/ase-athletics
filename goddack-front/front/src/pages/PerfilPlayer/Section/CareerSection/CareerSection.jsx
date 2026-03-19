import '../Section.css';
import './CareerSection.css';


const val      = (v, f = '—') => v != null ? v : f;
const currency = (v) => v != null
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
    : '—';

const Row = ({ label, children }) => (
    <p className="data-row">
        <span className="data-label">{label}</span>
        <span className="data-value">{children}</span>
    </p>
);

const CareerSection = ({ player }) => {
    const ch = player.careerHistory        || {};
    const ic = player.internationalCareer  || {};

    return (
        <div className="grid-col-1">
            <section className="card">
                <h2 className="card-title">Clubes anteriores</h2>
                {ch.previousClubs?.length > 0
                    ? <table className="data-table">
                        <thead>
                            <tr><th>Club</th><th>Liga</th><th>Desde</th><th>Hasta</th><th>PJ</th><th>G</th><th>A</th><th>Tipo</th><th>Traspaso</th></tr>
                        </thead>
                        <tbody>
                            {ch.previousClubs.map((c, i) => (
                                <tr key={i}>
                                    <td>{val(c.club)}</td>
                                    <td>{val(c.league)}</td>
                                    <td>{val(c.startDate)}</td>
                                    <td>{val(c.endDate)}</td>
                                    <td>{val(c.appearances)}</td>
                                    <td>{val(c.goals)}</td>
                                    <td>{val(c.assists)}</td>
                                    <td>{val(c.transferType)}</td>
                                    <td>{currency(c.transferFee)}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                    : <p className="empty-msg">Sin historial de clubes</p>
                }
            </section>

            <section className="card">
                <h2 className="card-title">Carrera juvenil</h2>
                {ch.youthCareer?.length > 0
                    ? <table className="data-table">
                        <thead><tr><th>Club</th><th>Desde</th><th>Hasta</th></tr></thead>
                        <tbody>
                            {ch.youthCareer.map((y, i) => (
                                <tr key={i}>
                                    <td>{val(y.club)}</td>
                                    <td>{val(y.startYear)}</td>
                                    <td>{val(y.endYear)}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                    : <p className="empty-msg">Sin datos de carrera juvenil</p>
                }
            </section>

            <section className="card">
                <h2 className="card-title">Carrera internacional</h2>
                <Row label="Selección">{val(ic.nationalTeam)}</Row>
                <Row label="Internacionalidades">{val(ic.caps)}</Row>
                <Row label="Goles">{val(ic.goals)}</Row>
                <Row label="Asistencias">{val(ic.assists)}</Row>
                <Row label="Debut">{val(ic.debut)}</Row>
                <Row label="Última convocatoria">{val(ic.lastCallUp)}</Row>

                {ic.majorTournaments?.length > 0 && (
                    <>
                        <h4>Torneos</h4>
                        <table className="data-table">
                            <thead><tr><th>Torneo</th><th>Año</th><th>PJ</th><th>G</th><th>A</th></tr></thead>
                            <tbody>
                                {ic.majorTournaments.map((t, i) => (
                                    <tr key={i}>
                                        <td>{val(t.tournament)}</td>
                                        <td>{val(t.year)}</td>
                                        <td>{val(t.appearances)}</td>
                                        <td>{val(t.goals)}</td>
                                        <td>{val(t.assists)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </section>

            <section className="card">
                <h2 className="card-title">Alertas del sistema</h2>
                {player.alerts?.length > 0
                    ? player.alerts.map((a, i) => (
                        <div key={i} className={`alert-item alert-item--${a.severity?.toLowerCase()}`}>
                            <span className="alert-type">{a.type}</span>
                            <span className="alert-msg">{a.message}</span>
                            <span className="alert-date">{a.date}</span>
                        </div>
                      ))
                    : <p className="empty-msg">Sin alertas</p>
                }
            </section>
        </div>
    );
};

export default CareerSection;