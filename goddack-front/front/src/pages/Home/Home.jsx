import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/api';
import Header from '../../components/Header/Header';
import PlayerFilters from '../../components/PlayerFilters/PlayerFilters';
import PlayerGrid from '../../components/PlayerGrid/PlayerGrid';
import Pagination from '../../components/Pagination/Pagination';
import './Home.css';

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [players,   setPlayers]   = useState([]);
    const [primary,   setPrimary]   = useState([]);
    const [secondary, setSecondary] = useState([]);
    const [grouped,   setGrouped]   = useState(false);
    const [totalResults, setTotal]  = useState(0);
    const [currentPage,  setPage]   = useState(1);
    const [totalPages,   setTotalPages] = useState(1);
    const [loading, setLoading]     = useState(true);
    const [error,   setError]       = useState(null);

    const [search,      setSearch]      = useState('');
    const [position,    setPosition]    = useState(searchParams.get('position') || '');
    const [team,        setTeam]        = useState(searchParams.get('team')     || '');
    const [nationality, setNationality] = useState('');
    const [minAge,      setMinAge]      = useState('');
    const [maxAge,      setMaxAge]      = useState('');
    const [sortBy,          setSortBy]          = useState('');
    const [minMarketValue,  setMinMarketValue]  = useState('');
    const [maxMarketValue,  setMaxMarketValue]  = useState('');
    const [minGoals,        setMinGoals]        = useState('');
    const [minAssists,      setMinAssists]      = useState('');

    const [positions,     setPositions]     = useState([]);
    const [teams,         setTeams]         = useState([]);
    const [nationalities, setNationalities] = useState([]);

    const LIMIT = 20;

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const res = await API.get('/dashboard/stats');
                setPositions(res.data.filters.positions);
                setTeams(res.data.filters.teams);
                const nat = await API.get('/players?limit=200');
                const all = nat.data.players || [];
                const unique = [...new Set(all.map(p => p.nationality).filter(Boolean))].sort();
                setNationalities(unique);
            } catch {}
        };
        loadOptions();
    }, []);

    useEffect(() => {
        setPosition(searchParams.get('position') || '');
        setTeam(searchParams.get('team') || '');
    }, [searchParams]);

    const parseSortBy = (sort) => {
        if (!sort) return {};
        const parts = sort.split('_');
        const order = parts.pop();
        const field = parts.join('_');
        return { sortField: field, sortOrder: order };
    };

    const fetchPlayers = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            if (search) {
                const sp = { q: search };
                if (sortBy) {
                    const { sortField, sortOrder } = parseSortBy(sortBy);
                    sp.sortField = sortField;
                    sp.sortOrder = sortOrder;
                }
                const res = await API.get('/players/search', { params: sp });
                setPlayers(res.data);
                setTotal(res.data.length);
                setGrouped(false);
                return;
            }

            const params = { page, limit: LIMIT };
            if (position)       params.position       = position;
            if (team)           params.team           = team;
            if (nationality)    params.nationality    = nationality;
            if (minAge)         params.minAge         = minAge;
            if (maxAge)         params.maxAge         = maxAge;
            if (minMarketValue) params.minMarketValue = minMarketValue;
            if (maxMarketValue) params.maxMarketValue = maxMarketValue;
            if (minGoals)       params.minGoals       = minGoals;
            if (minAssists)     params.minAssists     = minAssists;
            if (sortBy) {
                const { sortField, sortOrder } = parseSortBy(sortBy);
                params.sortField = sortField;
                params.sortOrder = sortOrder;
            }

            const { data } = await API.get('/players', { params });

            if (data.grouped) {
                setGrouped(true);
                setPrimary(data.primary);
                setSecondary(data.secondary);
                setTotal(data.totalResults);
                setPlayers([]);
            } else {
                setGrouped(false);
                setPlayers(data.players || []);
                setTotal(data.totalResults || 0);
                setTotalPages(data.totalPages || 1);
                setPrimary([]); setSecondary([]);
            }
        } catch {
            setError('No se pudo conectar con la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlayers(currentPage); }, [position, team, currentPage]);
    useEffect(() => {
        if (!search) { fetchPlayers(1); return; }
        const delay = setTimeout(() => fetchPlayers(1), 500);
        return () => clearTimeout(delay);
    }, [search]);
    useEffect(() => { fetchPlayers(1); }, [sortBy]);

    const applyFilters = () => { setPage(1); setSearchParams({}); fetchPlayers(1); };
    const clearFilters = () => {
        setSearch(''); setPosition(''); setTeam('');
        setNationality(''); setMinAge(''); setMaxAge('');
        setSortBy(''); setMinMarketValue(''); setMaxMarketValue('');
        setMinGoals(''); setMinAssists('');
        setPage(1); setSearchParams({});
    };

    const handlePlayerDeleted = (deletedId) => {
        setPlayers(prev   => prev.filter(p => p.id !== deletedId));
        setPrimary(prev   => prev.filter(p => p.id !== deletedId));
        setSecondary(prev => prev.filter(p => p.id !== deletedId));
        setTotal(prev     => prev - 1);
    };

    const hasActiveFilters = !!(
        position || team || nationality || minAge || maxAge ||
        search || sortBy || minMarketValue || maxMarketValue ||
        minGoals || minAssists
    );

    const subtitle = totalResults > 0
        ? `${totalResults} jugador${totalResults !== 1 ? 'es' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
        : 'Sin resultados';

    return (
        <div className="home-page">
            <Header />
            <div className="home-container">
                <header className="home-header">
                    <div className="header-text">
                        <h1>Panel de Scouting</h1>
                        <p>{subtitle}</p>
                    </div>

                </header>

                <PlayerFilters
                    search={search}           position={position}
                    team={team}               nationality={nationality}
                    minAge={minAge}           maxAge={maxAge}
                    sortBy={sortBy}
                    minMarketValue={minMarketValue}  maxMarketValue={maxMarketValue}
                    minGoals={minGoals}              minAssists={minAssists}
                    positions={positions}     teams={teams}
                    nationalities={nationalities}
                    onSearchChange={setSearch}
                    onPositionChange={setPosition}
                    onTeamChange={setTeam}
                    onNationalityChange={setNationality}
                    onMinAgeChange={setMinAge}
                    onMaxAgeChange={setMaxAge}
                    onSortByChange={setSortBy}
                    onMinMarketValueChange={setMinMarketValue}
                    onMaxMarketValueChange={setMaxMarketValue}
                    onMinGoalsChange={setMinGoals}
                    onMinAssistsChange={setMinAssists}
                    onApply={applyFilters}
                    onClear={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                <PlayerGrid
                    players={players}
                    primary={primary}
                    secondary={secondary}
                    grouped={grouped}
                    position={position}
                    loading={loading}
                    error={error}
                    onDeleted={handlePlayerDeleted}
                />

                {!search && !grouped && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;