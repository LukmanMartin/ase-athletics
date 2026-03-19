import '../Section.css';
import './MarketSection.css';


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

const MarketSection = ({ player }) => {
    const mkt = player.marketData  || {};
    const tr  = mkt.transferData   || {};
    const vt  = mkt.valueTrend     || {};

    return (
        <div className="grid-2">
            <section className="card">
                <h2 className="card-title">Valoración</h2>
                <p className="big-price">{currency(mkt.currentMarketValue)}</p>
                <Row label="Fecha valoración">{val(mkt.valuationDate)}</Row>
                <Row label="Tendencia 30d">{vt.last30Days   != null ? `${vt.last30Days}%`   : '—'}</Row>
                <Row label="Tendencia 90d">{vt.last90Days   != null ? `${vt.last90Days}%`   : '—'}</Row>
                <Row label="Tendencia 12m">{vt.last12Months != null ? `${vt.last12Months}%` : '—'}</Row>

                <h4>Historial de valor</h4>
                {mkt.valueHistory?.length > 0
                    ? <table className="data-table">
                        <thead><tr><th>Fecha</th><th>Valor</th><th>Fuente</th></tr></thead>
                        <tbody>
                            {mkt.valueHistory.map((h, i) => (
                                <tr key={i}>
                                    <td>{h.date}</td>
                                    <td>{currency(h.value)}</td>
                                    <td>{h.source}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                    : <p className="empty-msg">Sin historial de valor</p>
                }
            </section>

            <section className="card">
                <h2 className="card-title">Transferencias</h2>
                <Row label="Prob. transferencia">
                    {tr.transferProbability != null ? `${(tr.transferProbability * 100).toFixed(0)}%` : '—'}
                </Row>
                <Row label="Ventana">{val(tr.transferWindow)}</Row>
                <Row label="Clubes interesados">{tr.interestedClubs?.join(', ') || '—'}</Row>

                <h4>Rumores</h4>
                {tr.transferRumors?.length > 0
                    ? tr.transferRumors.map((r, i) => (
                        <div key={i} className="rumor-item">
                            <span className="rumor-club">{r.club}</span>
                            <span className="rumor-source">{r.source}</span>
                            <span className="rumor-reliability">Fiabilidad: {r.reliability}/10</span>
                            <span className="rumor-date">{r.date}</span>
                        </div>
                      ))
                    : <p className="empty-msg">Sin rumores registrados</p>
                }
            </section>
        </div>
    );
};

export default MarketSection;