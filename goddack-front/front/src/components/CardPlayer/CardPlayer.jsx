import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import API from '../../api/api';
import './CardPlayer.css';

const CardPlayer = ({ player, onDeleted }) => {
    const navigate = useNavigate();
    const { addPlayer, removePlayer, isSelected, selected } = useCompare();
    const [confirm, setConfirm] = useState(false);

    const selected_ = isSelected(player.id);
    const isFull    = selected.length >= 4 && !selected_;

    const handleCompare = (e) => {
        e.stopPropagation();
        selected_ ? removePlayer(player.id) : addPlayer(player);
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/players/${player.id}`);
            setConfirm(false);
            if (onDeleted) onDeleted(player.id);
        } catch {
            console.error('Error al eliminar jugador');
        }
    };

    return (
        <>
            <div className={`player-card ${selected_ ? 'player-card--selected' : ''}`}>
                <div className="card-img-container">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0ea5e9&color=fff&bold=true&size=128`}
                        alt={player.name}
                    />
                    <span className="player-position-badge">{player.position}</span>
                </div>

                <div className="player-info">
                    <h3>{player.name}</h3>
                    <p className="player-team">{player.team} | {player.nationality}</p>

                    <div className="player-stats-mini">
                        <span>Goles: {player.stats?.goals ?? '—'}</span>
                        <span>Pases: {player.stats?.passAccuracy ?? '—'}%</span>
                    </div>

                    <div className="card-footer">
                        <button className="view-btn" onClick={() => navigate(`/player/${player.id}`)}>
                            Ver Perfil
                        </button>
                        <button
                            className={`compare-btn ${selected_ ? 'compare-btn--active' : ''}`}
                            onClick={handleCompare}
                            disabled={isFull}
                            title={isFull ? 'Máximo 4 jugadores' : ''}
                        >
                            {selected_ ? '✓ Añadido' : '+ Comparar'}
                        </button>
                    </div>

                    <div className="card-footer card-footer--admin">
                        <button
                            className="edit-btn"
                            onClick={() => navigate(`/jugadores/editar/${player.id}`)}
                        >
                            ✏️ Editar
                        </button>
                        <button
                            className="delete-btn"
                            onClick={() => setConfirm(true)}
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>

            {confirm && (
                <ConfirmModal
                    message={`¿Eliminar a ${player.name}? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(false)}
                />
            )}
        </>
    );
};

export default CardPlayer;