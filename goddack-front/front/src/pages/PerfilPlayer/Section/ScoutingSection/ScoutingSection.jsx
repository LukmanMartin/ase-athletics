import '../Section.css';
import './ScoutingSection.css';


const val = (v, f = '—') => v != null ? v : f;
const num = (v) => v != null ? Number(v).toLocaleString('de-DE') : '—';

const Row = ({ label, children }) => (
    <p className="data-row">
        <span className="data-label">{label}</span>
        <span className="data-value">{children}</span>
    </p>
);

const TagList = ({ items, color }) => (
    <ul className="tag-list">
        {items?.length > 0
            ? items.map((t, i) => <li key={i} className={`tag tag--${color}`}>{t}</li>)
            : <li className="empty-msg">—</li>
        }
    </ul>
);

const StatBox = ({ label, value }) => (
    <div className="stat-box">
        <span className="stat-box__val">{value}</span>
        <span className="stat-box__label">{label}</span>
    </div>
);

const ScoutingSection = ({ player }) => {
    const sc = player.scoutingAnalysis || {};
    const mk = player.marketingData    || {};

    return (
        <div className="grid-2">
            <section className="card">
                <h2 className="card-title">Análisis de scouting</h2>
                <Row label="Comparable a">{val(sc.comparablePlayer)}</Row>
                <Row label="Techo">{val(sc.ceiling)}</Row>
                <Row label="Potencial">{val(sc.potential)}</Row>
                <Row label="Preparado">{val(sc.readiness)}</Row>
                <Row label="Rating global">{val(sc.rating)}</Row>
                <Row label="Recomendación">{val(sc.recommendation)}</Row>

                <h4>Fortalezas</h4>
                <TagList items={sc.strengths} color="green" />

                <h4>Debilidades</h4>
                <TagList items={sc.weaknesses} color="red" />
            </section>

            <section className="card">
                <h2 className="card-title">Informes de scout</h2>
                {sc.scoutComments?.length > 0
                    ? sc.scoutComments.map((r, i) => (
                        <div key={i} className="scout-report">
                            <div className="scout-report__header">
                                <span className="scout-name">{val(r.scout)}</span>
                                <span className="scout-rating">{val(r.rating)}/100</span>
                                <span className="scout-date">{val(r.date)}</span>
                            </div>
                            <p className="scout-comment">{val(r.comments)}</p>
                            <span className={`scout-rec scout-rec--${r.recommendation?.toLowerCase()}`}>
                                {val(r.recommendation)}
                            </span>
                        </div>
                      ))
                    : <p className="empty-msg">Sin informes de scout registrados</p>
                }
            </section>

            <section className="card wide">
                <h2 className="card-title">Marketing & social</h2>
                <div className="stats-row">
                    <StatBox label="Instagram" value={num(mk.instagramFollowers)} />
                    <StatBox label="Twitter"   value={num(mk.twitterFollowers)}   />
                    <StatBox label="Facebook"  value={num(mk.facebookFollowers)}  />
                    <StatBox label="TikTok"    value={num(mk.tiktokFollowers)}    />
                    <StatBox label="Engagement"value={mk.engagementRate != null ? `${mk.engagementRate}%` : '—'} />
                    <StatBox label="Marketab." value={val(mk.marketability)}      />
                </div>
            </section>
        </div>
    );
};

export default ScoutingSection;