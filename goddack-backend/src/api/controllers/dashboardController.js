const Player = require('../models/player');

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
    try {
        const { position, team, nationality, minAge, maxAge } = req.query;

        const filter = {};

        // position puede ser una posición individual o un grupo separado por comas
        if (position) {
            const posArray = position.split(',').map(p => p.trim());
            if (posArray.length === 1) {
                filter.$or = [
                    { position: posArray[0] },
                    { secondaryPositions: posArray[0] }
                ];
            } else {
                filter.$or = [
                    { position: { $in: posArray } },
                    { secondaryPositions: { $in: posArray } }
                ];
            }
        }

        if (team)        filter.team        = team;
        if (nationality) filter.nationality = nationality;
        if (minAge || maxAge) {
            filter.age = {};
            if (minAge) filter.age.$gte = parseInt(minAge);
            if (maxAge) filter.age.$lte = parseInt(maxAge);
        }

        // ── KPIs ──────────────────────────────────────────────────────────
        const totalPlayers = await Player.countDocuments(filter);

        const avgAgeResult = await Player.aggregate([
            { $match: filter },
            { $group: { _id: null, average: { $avg: '$age' } } }
        ]);
        const averageAge = avgAgeResult[0]
            ? Number(avgAgeResult[0].average.toFixed(1))
            : 0;

        const topPlayer = await Player.findOne(filter)
            .sort({ 'marketData.currentMarketValue': -1 })
            .select('name team marketData.currentMarketValue position');

        const currentYear = new Date().getFullYear();
        const expiringContracts = await Player.countDocuments({
            ...filter,
            'contractInfo.contractEnd': {
                $regex: `^(${currentYear}|${currentYear + 1})`
            }
        });

        // ── GRÁFICO 1: Goles y asistencias por posición ───────────────────
        const goalsByPosition = await Player.aggregate([
            { $match: filter },
            {
                $group: {
                    _id:          '$position',
                    totalGoals:   { $sum: '$stats.goals' },
                    totalAssists: { $sum: '$stats.assists' },
                    playerCount:  { $sum: 1 }
                }
            },
            { $sort: { totalGoals: -1 } }
        ]);

        // ── GRÁFICO 2: Distribución de edades ─────────────────────────────
        const ageDistribution = await Player.aggregate([
            { $match: filter },
            {
                $bucket: {
                    groupBy:    '$age',
                    boundaries: [15, 20, 25, 30, 35, 45],
                    default:    'Otros',
                    output:     { count: { $sum: 1 } }
                }
            }
        ]);

        // ── GRÁFICO 3: Jugadores por equipo (top 10) ──────────────────────
        const playersByTeam = await Player.aggregate([
            { $match: filter },
            { $group: { _id: '$team', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // ── GRÁFICO 4: Top 10 jugadores por valor de mercado ──────────────
        const topValuePlayers = await Player.find(filter)
            .sort({ 'marketData.currentMarketValue': -1 })
            .limit(10)
            .select('name team position marketData.currentMarketValue');

        // ── GRÁFICO 5: Distribución por posición ──────────────────────────
        const playersByPosition = await Player.aggregate([
            { $match: filter },
            { $group: { _id: '$position', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // ── GRÁFICO 6: Atributos medios por posición (radar) ──────────────
        const attributesByPosition = await Player.aggregate([
            { $match: { ...filter, 'attributes.pace': { $exists: true, $ne: null } } },
            {
                $group: {
                    _id:             '$position',
                    pace:            { $avg: '$attributes.pace' },
                    shooting:        { $avg: '$attributes.shooting' },
                    passing:         { $avg: '$attributes.passing' },
                    dribbling:       { $avg: '$attributes.dribbling' },
                    defending:       { $avg: '$attributes.defending' },
                    physical:        { $avg: '$attributes.physical' },
                    finishing:       { $avg: '$attributes.finishing' },
                    playerCount:     { $sum: 1 }
                }
            },
            { $sort: { playerCount: -1 } },
            { $limit: 6 }  // Top 6 posiciones con más jugadores
        ]);

        // Redondear valores del radar
        const radarData = attributesByPosition.map(p => ({
            position: p._id,
            pace:      Math.round(p.pace      || 0),
            shooting:  Math.round(p.shooting  || 0),
            passing:   Math.round(p.passing   || 0),
            dribbling: Math.round(p.dribbling || 0),
            defending: Math.round(p.defending || 0),
            physical:  Math.round(p.physical  || 0),
            finishing: Math.round(p.finishing || 0),
            count:     p.playerCount
        }));

        // ── GRÁFICO 7: Evolución de valor de mercado (líneas) ─────────────
        // Jugadores que tienen valueHistory con al menos 2 entradas
        const playersWithHistory = await Player.find({
            ...filter,
            'marketData.valueHistory.1': { $exists: true }  // al menos 2 entradas
        })
            .select('name marketData.valueHistory marketData.currentMarketValue')
            .sort({ 'marketData.currentMarketValue': -1 })
            .limit(8);

        // Construir datos para gráfico de líneas
        // Formato: [{ date: '2024-01', Player1: 10M, Player2: 8M, ... }]
        const allDates = new Set();
        playersWithHistory.forEach(p => {
            (p.marketData?.valueHistory || []).forEach(h => {
                if (h.date) allDates.add(h.date.substring(0, 7)); // YYYY-MM
            });
        });

        const sortedDates = [...allDates].sort();
        const valueHistoryData = sortedDates.map(date => {
            const entry = { date };
            playersWithHistory.forEach(p => {
                const match = (p.marketData?.valueHistory || []).find(
                    h => h.date && h.date.startsWith(date)
                );
                if (match) {
                    entry[p.name] = match.value;
                }
            });
            return entry;
        });

        const valueHistoryPlayers = playersWithHistory.map(p => p.name);

        // ── JUGADORES FILTRADOS (mini panel) ──────────────────────────────
        const filteredPlayers = await Player.find(filter)
            .sort({ 'marketData.currentMarketValue': -1 })
            .limit(20)
            .select('id name position team nationality age marketData.currentMarketValue stats.goals stats.assists');

        // ── FILTROS disponibles ────────────────────────────────────────────
        const teams     = await Player.distinct('team');
        const positions = await Player.distinct('position');

        res.status(200).json({
            // KPIs
            totalPlayers,
            averageAge,
            topPlayer,
            expiringContracts,
            // Gráficos
            goalsByPosition,
            ageDistribution,
            playersByTeam,
            topValuePlayers,
            playersByPosition,
            radarData,
            valueHistoryData,
            valueHistoryPlayers,
            // Mini panel
            filteredPlayers,
            // Filtros disponibles
            filters: { teams: teams.sort(), positions: positions.sort() }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};