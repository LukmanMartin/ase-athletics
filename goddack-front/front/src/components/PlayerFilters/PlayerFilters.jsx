import { useState } from 'react';
import './PlayerFilters.css';

const SORT_OPTIONS = [
    { value: '',                  label: 'Sin ordenar' },
    { value: 'name_asc',          label: 'Nombre A-Z' },
    { value: 'name_desc',         label: 'Nombre Z-A' },
    { value: 'age_asc',           label: 'Edad ↑' },
    { value: 'age_desc',          label: 'Edad ↓' },
    { value: 'marketValue_asc',   label: 'Valor de mercado ↑' },
    { value: 'marketValue_desc',  label: 'Valor de mercado ↓' },
    { value: 'goals_desc',        label: 'Más goles' },
    { value: 'assists_desc',      label: 'Más asistencias' },
];

const PlayerFilters = ({
    search, position, team, nationality, minAge, maxAge,
    sortBy, minMarketValue, maxMarketValue, minGoals, minAssists,
    onSearchChange, onPositionChange, onTeamChange, onNationalityChange,
    onMinAgeChange, onMaxAgeChange, onSortByChange,
    onMinMarketValueChange, onMaxMarketValueChange,
    onMinGoalsChange, onMinAssistsChange,
    positions, teams, nationalities,
    onApply, onClear,
    hasActiveFilters,
}) => {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="player-filters">

            {/* ── Barra superior: búsqueda + ordenar + toggle ── */}
            <div className="filters-top">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="search-bar"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                />
                <select
                    className="sort-select"
                    value={sortBy}
                    onChange={e => onSortByChange(e.target.value)}
                >
                    {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <button
                    className={`btn-toggle-filters ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
                    {hasActiveFilters && <span className="filters-dot" />}
                </button>
            </div>

            {/* ── Filtros avanzados ── */}
            {showFilters && (
                <div className="advanced-filters">

                    {/* Fila 1: posición, equipo, nacionalidad */}
                    <div className="filters-row">
                        <select value={position} onChange={e => onPositionChange(e.target.value)}>
                            <option value="">Todas las posiciones</option>
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <select value={team} onChange={e => onTeamChange(e.target.value)}>
                            <option value="">Todos los equipos</option>
                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <select value={nationality} onChange={e => onNationalityChange(e.target.value)}>
                            <option value="">Todas las nacionalidades</option>
                            {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    {/* Fila 2: edad y valor de mercado */}
                    <div className="filters-row">
                        <div className="filter-group">
                            <label className="filter-label">Edad</label>
                            <div className="range-inputs">
                                <input
                                    type="number" placeholder="Min" value={minAge}
                                    onChange={e => onMinAgeChange(e.target.value)}
                                    min="15" max="45"
                                />
                                <span>—</span>
                                <input
                                    type="number" placeholder="Max" value={maxAge}
                                    onChange={e => onMaxAgeChange(e.target.value)}
                                    min="15" max="45"
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Valor de mercado (€)</label>
                            <div className="range-inputs">
                                <input
                                    type="number" placeholder="Min" value={minMarketValue}
                                    onChange={e => onMinMarketValueChange(e.target.value)}
                                    min="0"
                                />
                                <span>—</span>
                                <input
                                    type="number" placeholder="Max" value={maxMarketValue}
                                    onChange={e => onMaxMarketValueChange(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fila 3: estadísticas */}
                    <div className="filters-row">
                        <div className="filter-group">
                            <label className="filter-label">Goles mínimos</label>
                            <input
                                type="number" placeholder="0" value={minGoals}
                                onChange={e => onMinGoalsChange(e.target.value)}
                                min="0"
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Asistencias mínimas</label>
                            <input
                                type="number" placeholder="0" value={minAssists}
                                onChange={e => onMinAssistsChange(e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="filters-actions">
                        <button className="btn-apply" onClick={onApply}>Aplicar filtros</button>
                        {hasActiveFilters && (
                            <button className="btn-clear-all" onClick={onClear}>Limpiar todo</button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Badges filtros activos ── */}
            {hasActiveFilters && (
                <div className="active-filters">
                    <span className="active-filters-label">Filtrando por:</span>
                    {position        && <span className="filter-tag">{position} <button onClick={() => onPositionChange('')}>✕</button></span>}
                    {team            && <span className="filter-tag">{team} <button onClick={() => onTeamChange('')}>✕</button></span>}
                    {nationality     && <span className="filter-tag">{nationality} <button onClick={() => onNationalityChange('')}>✕</button></span>}
                    {minAge          && <span className="filter-tag">Edad ≥ {minAge} <button onClick={() => onMinAgeChange('')}>✕</button></span>}
                    {maxAge          && <span className="filter-tag">Edad ≤ {maxAge} <button onClick={() => onMaxAgeChange('')}>✕</button></span>}
                    {minMarketValue  && <span className="filter-tag">Valor ≥ {Number(minMarketValue).toLocaleString()}€ <button onClick={() => onMinMarketValueChange('')}>✕</button></span>}
                    {maxMarketValue  && <span className="filter-tag">Valor ≤ {Number(maxMarketValue).toLocaleString()}€ <button onClick={() => onMaxMarketValueChange('')}>✕</button></span>}
                    {minGoals        && <span className="filter-tag">Goles ≥ {minGoals} <button onClick={() => onMinGoalsChange('')}>✕</button></span>}
                    {minAssists      && <span className="filter-tag">Asist. ≥ {minAssists} <button onClick={() => onMinAssistsChange('')}>✕</button></span>}
                    {search          && <span className="filter-tag">"{search}" <button onClick={() => onSearchChange('')}>✕</button></span>}
                    {sortBy          && <span className="filter-tag">{SORT_OPTIONS.find(o => o.value === sortBy)?.label} <button onClick={() => onSortByChange('')}>✕</button></span>}
                    <button className="filter-clear" onClick={onClear}>✕ Limpiar todo</button>
                </div>
            )}
        </div>
    );
};

export default PlayerFilters;