import CardPlayer from '../CardPlayer/CardPlayer';
import './PlayerGrid.css';

const PlayerGrid = ({ players, primary, secondary, grouped, position, loading, error, onDeleted }) => {

    if (loading) return <div className="pg-loading">Cargando analíticas...</div>;
    if (error)   return <div className="pg-error">{error}</div>;

    if (grouped) return (
        <div className="grouped-results">
            <div className="group-section">
                <h2 className="group-title">
                    {position} — posición principal
                    <span className="group-count">{primary.length} jugadores</span>
                </h2>
                {primary.length > 0
                    ? <div className="players-grid">
                        {primary.map(p => <CardPlayer key={p.id} player={p} onDeleted={onDeleted} />)}
                      </div>
                    : <p className="pg-empty">Ningún jugador con esta posición principal.</p>
                }
            </div>

            <div className="group-section">
                <h2 className="group-title">
                    También juegan como {position}
                    <span className="group-count">{secondary.length} jugadores</span>
                </h2>
                {secondary.length > 0
                    ? <div className="players-grid">
                        {secondary.map(p => <CardPlayer key={p.id} player={p} onDeleted={onDeleted} />)}
                      </div>
                    : <p className="pg-empty">Ningún jugador con esta posición secundaria.</p>
                }
            </div>
        </div>
    );

    if (players.length === 0) return (
        <div className="pg-empty-state">No se encontraron jugadores con esos filtros.</div>
    );

    return (
        <div className="players-grid">
            {players.map(p => <CardPlayer key={p.id} player={p} onDeleted={onDeleted} />)}
        </div>
    );
};

export default PlayerGrid;