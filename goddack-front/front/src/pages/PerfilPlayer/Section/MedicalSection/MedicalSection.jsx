const val = (v, f = '—') => v != null ? v : f;

const Row = ({ label, children }) => (
    <p className="data-row">
        <span className="data-label">{label}</span>
        <span className="data-value">{children}</span>
    </p>
);

const MedicalSection = ({ player }) => {
    const med = player.medicalHistory || {};

    return (
        <div className="grid-2">
            <section className="card">
                <h2 className="card-title">Estado de salud</h2>
                <Row label="Propensión a lesiones">
                    {med.injuryProneness != null ? `${(med.injuryProneness * 100).toFixed(0)}%` : '—'}
                </Row>
                <Row label="Días lesionado">{val(med.totalDaysInjured)}</Row>
                <Row label="Disponibilidad">
                    {med.availabilityPercentage != null ? `${med.availabilityPercentage}%` : '—'}
                </Row>

                <h4>Lesiones activas</h4>
                {med.currentInjuries?.length > 0
                    ? med.currentInjuries.map((inj, i) => (
                        <p key={i} className="data-row">{JSON.stringify(inj)}</p>
                      ))
                    : <span className="tag tag--green">Sin lesiones activas ✓</span>
                }
            </section>

            <section className="card">
                <h2 className="card-title">Historial de lesiones</h2>
                {med.injuryHistory?.length > 0
                    ? <table className="data-table">
                        <thead>
                            <tr><th>Tipo</th><th>Fecha</th><th>Vuelta</th><th>Días</th><th>Partidos</th></tr>
                        </thead>
                        <tbody>
                            {med.injuryHistory.map((inj, i) => (
                                <tr key={i}>
                                    <td>{val(inj.injuryType)}</td>
                                    <td>{val(inj.injuryDate)}</td>
                                    <td>{val(inj.returnDate)}</td>
                                    <td>{val(inj.daysOut)}</td>
                                    <td>{val(inj.gamesMissed)}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                    : <p className="empty-msg">Sin historial de lesiones</p>
                }
            </section>
        </div>
    );
};

export default MedicalSection;