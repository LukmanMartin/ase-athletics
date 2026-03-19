import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import './CompareBar.css';

const CompareBar = () => {
    const navigate = useNavigate();
    const { selected, removePlayer, clearAll } = useCompare();

    if (selected.length < 2) return null;

    return (
        <div className="compare-bar">
            <div className="compare-bar__players">
                {selected.map(p => (
                    <div key={p.id} className="compare-bar__player">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0ea5e9&color=fff&bold=true&size=40`}
                            alt={p.name}
                        />
                        <span>{p.name}</span>
                        <button onClick={() => removePlayer(p.id)}>✕</button>
                    </div>
                ))}
            </div>

            <div className="compare-bar__actions">
                <span className="compare-bar__count">{selected.length}/4 jugadores</span>
                <button className="compare-bar__clear" onClick={clearAll}>
                    Limpiar
                </button>
                <button
                    className="compare-bar__go"
                    onClick={() => navigate('/comparar')}
                >
                    Comparar ahora →
                </button>
            </div>
        </div>
    );
};

export default CompareBar;