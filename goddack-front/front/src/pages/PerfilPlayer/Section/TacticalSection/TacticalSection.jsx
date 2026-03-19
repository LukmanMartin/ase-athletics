import '../Section.css';
import './TacticalSection.css';

const val = (v, f = '—') => v != null ? v : f;

const Row = ({ label, children }) => (
    <p className="data-row">
        <span className="data-label">{label}</span>
        <span className="data-value">{children}</span>
    </p>
);

const TacticalSection = ({ player }) => {
    const ta = player.tacticalData || {};
    const pd = ta.positionData     || {};
    const hm = ta.heatmaps         || {};
    const ps = ta.playingStyle     || {};

    return (
        <div className="grid-2">
            <section className="card">
                <h2 className="card-title">Posicionamiento</h2>
                <Row label="Posición principal">{val(pd.primaryPosition)}</Row>
                <Row label="Flexibilidad">{val(pd.positionFlexibility)}</Row>
                <Row label="Lado preferido">{val(pd.preferredSide)}</Row>

                {pd.positionsPlayed?.length > 0
                    ? <table className="data-table">
                        <thead>
                            <tr><th>Posición</th><th>PJ</th><th>Efectividad</th></tr>
                        </thead>
                        <tbody>
                            {pd.positionsPlayed.map((p, i) => (
                                <tr key={i}>
                                    <td>{val(p.position)}</td>
                                    <td>{val(p.appearances)}</td>
                                    <td>{val(p.effectiveness)}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                    : <p className="empty-msg">Sin datos de posiciones</p>
                }
            </section>

            <section className="card">
                <h2 className="card-title">Mapa de calor — zonas</h2>
                {hm.zoneOccupancy
                    ? <div className="heatmap-zones">
                        {Object.entries(hm.zoneOccupancy)
                            .filter(([k]) => k !== '_id')
                            .map(([k, v]) => (
                                <div key={k} className="zone-item">
                                    <span>{k}</span>
                                    <div className="zone-bar-wrap">
                                        <div className="zone-bar" style={{ width: `${v}%` }} />
                                    </div>
                                    <span>{v}%</span>
                                </div>
                            ))}
                      </div>
                    : <p className="empty-msg">Sin datos de heatmap</p>
                }
            </section>

            <section className="card wide">
                <h2 className="card-title">Estilo de juego</h2>
                <Row label="Formación preferida">{val(ps.preferredFormation)}</Row>
                <Row label="Rol en el equipo">{val(ps.roleInTeam)}</Row>
                {ps.styleDescription && (
                    <p className="style-desc">{ps.styleDescription}</p>
                )}
            </section>
        </div>
    );
};

export default TacticalSection;