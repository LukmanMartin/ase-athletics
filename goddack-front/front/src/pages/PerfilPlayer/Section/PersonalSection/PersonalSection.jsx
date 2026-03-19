const val = (v, f = '—') => v != null ? v : f;

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

const PersonalSection = ({ player }) => {
    const pt = player.personalTraits || {};

    return (
        <div className="grid-2">
            <section className="card">
                <h2 className="card-title">Personalidad</h2>
                <Row label="Liderazgo">{val(pt.leadership)}/10</Row>
                <Row label="Profesionalismo">{val(pt.professionalism)}/10</Row>
                <Row label="Adaptabilidad">{val(pt.adaptability)}/10</Row>
                <Row label="Educación">{val(pt.education)}</Row>
                <Row label="Estado civil">{val(pt.maritalStatus)}</Row>
                <Row label="Hijos">{val(pt.children)}</Row>
                <Row label="Familia futbolera">
                    {pt.footballingFamily != null ? (pt.footballingFamily ? 'Sí' : 'No') : '—'}
                </Row>

                <h4>Rasgos</h4>
                <TagList items={pt.traits} color="blue" />

                <h4>Idiomas</h4>
                <TagList items={pt.languages} color="gray" />
            </section>
        </div>
    );
};

export default PersonalSection;