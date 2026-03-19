import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import BioSection      from './Section/BioSection/BioSection';
import StatsSection    from './Section/StatsSection/StatsSection';
import MarketSection   from './Section/MarketSection/MarketSection';
import ScoutingSection from './Section/ScoutingSection/ScoutingSection';
import TacticalSection from './Section/TacticalSection/TacticalSection';
import MedicalSection  from './Section/MedicalSection/MedicalSection';
import CareerSection   from './Section/CareerSection/CareerSection';
import PersonalSection from './Section/PersonalSection/PersonalSection';
import './PerfilPlayer.css';

const TABS = [
    { key: 'bio',      label: 'Identidad'  },
    { key: 'stats',    label: 'Rendimiento'},
    { key: 'market',   label: 'Mercado'    },
    { key: 'scouting', label: 'Scouting'   },
    { key: 'tactical', label: 'Táctica'    },
    { key: 'medical',  label: 'Salud'      },
    { key: 'career',   label: 'Carrera'    },
    { key: 'personal', label: 'Personal'   },
];

const SECTIONS = {
    bio:      BioSection,
    stats:    StatsSection,
    market:   MarketSection,
    scouting: ScoutingSection,
    tactical: TacticalSection,
    medical:  MedicalSection,
    career:   CareerSection,
    personal: PersonalSection,
};

const PerfilPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [player,    setPlayer]    = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [activeTab, setActive]    = useState('bio');

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/players/${id}`);
                setPlayer(res.data.player);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id]);

    if (loading) return <div className="perfil-state">Cargando informe...</div>;
    if (!player) return <div className="perfil-state perfil-state--error">Jugador no encontrado</div>;

    const ActiveSection = SECTIONS[activeTab];

    return (
        <div className="perfil">
            <header className="perfil-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Volver</button>

                <div className="perfil-header__info">
                    <div className="perfil-avatar">{player.image || '?'}</div>
                    <div>
                        <h1>{player.name}</h1>
                        <p className="perfil-header__sub">
                            {player.currentTeam ?? '—'} · {player.position ?? '—'} · #{player.jerseyNumber ?? '—'}
                        </p>
                    </div>
                </div>

                <div className="perfil-header__actions">
                    <span className="id-badge">ID: {player.id}</span>
                    <button
                        className="perfil-btn perfil-btn--secondary"
                        onClick={() => navigate(`/reports?player=${encodeURIComponent(player.name)}`)}
                    >
                        📋 Ver informes
                    </button>
                    <button
                        className="perfil-btn perfil-btn--primary"
                        onClick={() => navigate(`/jugadores/editar/${player.id}`)}
                    >
                        ✏️ Editar
                    </button>
                </div>
            </header>

            <nav className="tab-nav">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={`tab-btn ${activeTab === t.key ? 'tab-btn--active' : ''}`}
                        onClick={() => setActive(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            <div className="perfil-body">
                <ActiveSection player={player} />
            </div>
        </div>
    );
};

export default PerfilPlayer;