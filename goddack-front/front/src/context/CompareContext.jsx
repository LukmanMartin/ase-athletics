import { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
    const [selected, setSelected] = useState([]); // máx 4 jugadores

    const addPlayer = (player) => {
        if (selected.length >= 4) return;
        if (selected.find(p => p.id === player.id)) return;
        setSelected([...selected, player]);
    };

    const removePlayer = (playerId) => {
        setSelected(selected.filter(p => p.id !== playerId));
    };

    const clearAll = () => setSelected([]);

    const isSelected = (playerId) => !!selected.find(p => p.id === playerId);

    return (
        <CompareContext.Provider value={{ selected, addPlayer, removePlayer, clearAll, isSelected }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => useContext(CompareContext);