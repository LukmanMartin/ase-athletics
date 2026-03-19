import '../Section.css';
import './BioSection.css';



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

const BioSection = ({ player }) => {
    const c = player.contractInfo || {};

    return (
        <div className="grid-2">
            <section className="card">
                <h2 className="card-title">Datos personales</h2>
                <Row label="Nombre completo">{val(player.fullName)}</Row>
                <Row label="Savvyo ID">{val(player.playerId)}</Row>
                <Row label="Fecha nacimiento">{val(player.dateOfBirth)} ({val(player.age)} años)</Row>
                <Row label="Lugar de nacimiento">{val(player.placeOfBirth)}</Row>
                <Row label="Nacionalidad">
                    {val(player.nationality)}{player.secondNationality ? ` / ${player.secondNationality}` : ''}
                </Row>
                <Row label="Pie preferido">{val(player.preferredFoot)}</Row>
                <Row label="Altura / Peso">{val(player.height)} cm · {val(player.weight)} kg</Row>
            </section>

            <section className="card">
                <h2 className="card-title">Club y contrato</h2>
                <Row label="Equipo">{val(player.currentTeam)}</Row>
                <Row label="Liga">{val(player.league)}</Row>
                <Row label="Posición">{val(player.position)}</Row>
                <Row label="Pos. secundarias">
                    {player.secondaryPositions?.length ? player.secondaryPositions.join(', ') : '—'}
                </Row>
                <Row label="Estado">{val(player.playerStatus)}</Row>
                <Row label="Salario semanal">{currency(c.salary?.weeklyWage)}</Row>
                <Row label="Salario anual">{currency(c.salary?.annualSalary)}</Row>
                <Row label="Cláusula">{currency(c.releaseClause)}</Row>
                <Row label="Fin contrato">{val(c.contractEnd)}</Row>
                <Row label="Agente">{val(c.agentInfo?.agentName)} · {val(c.agentInfo?.agencyName)}</Row>
            </section>
        </div>
    );
};

export default BioSection;