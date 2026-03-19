const Player = require('../models/player'); 
const ScoutingReport = require('../models/scoutingReport');

// ── Helper: construye el objeto de ordenación para Mongoose ──────────────────
const buildSort = (sortField, sortOrder) => {
    const order = sortOrder === 'desc' ? -1 : 1;
    switch (sortField) {
        case 'name':        return { name: order };
        case 'age':         return { age: order };
        case 'marketValue': return { 'marketData.currentMarketValue': order };
        case 'goals':       return { 'stats.goals': order };
        case 'assists':     return { 'stats.assists': order };
        default:            return { id: 1 };
    }
};

// 1. GET /api/players - Lista paginada con filtrado y ordenación
exports.getPlayers = async (req, res) => {
    try {
        const {
            position, team, nationality,
            minAge, maxAge,
            minMarketValue, maxMarketValue,
            minGoals, minAssists,
            sortField, sortOrder,
            page = 1, limit = 20
        } = req.query;

        const p = parseInt(page);
        const l = parseInt(limit);
        const sort = buildSort(sortField, sortOrder);

        // ── Filtros base ──────────────────────────────────────────────────
        const baseQuery = {};

        if (team)        baseQuery.team        = team;
        if (nationality) baseQuery.nationality = nationality;

        if (minAge || maxAge) {
            baseQuery.age = {};
            if (minAge) baseQuery.age.$gte = parseInt(minAge);
            if (maxAge) baseQuery.age.$lte = parseInt(maxAge);
        }

        if (minMarketValue || maxMarketValue) {
            baseQuery['marketData.currentMarketValue'] = {};
            if (minMarketValue) baseQuery['marketData.currentMarketValue'].$gte = parseFloat(minMarketValue);
            if (maxMarketValue) baseQuery['marketData.currentMarketValue'].$lte = parseFloat(maxMarketValue);
        }

        if (minGoals) {
            baseQuery['stats.goals'] = { ...baseQuery['stats.goals'], $gte: parseInt(minGoals) };
        }
        if (minAssists) {
            baseQuery['stats.assists'] = { ...baseQuery['stats.assists'], $gte: parseInt(minAssists) };
        }

        // ── Si hay filtro de posición devolvemos dos grupos ───────────────
        if (position) {
            const primaryQuery   = { ...baseQuery, position };
            const secondaryQuery = { ...baseQuery, secondaryPositions: position, position: { $ne: position } };

            const [primary, secondary, primaryCount, secondaryCount] = await Promise.all([
                Player.find(primaryQuery).sort(sort),
                Player.find(secondaryQuery).sort(sort),
                Player.countDocuments(primaryQuery),
                Player.countDocuments(secondaryQuery),
            ]);

            return res.status(200).json({
                grouped: true,
                position,
                primary,
                secondary,
                primaryCount,
                secondaryCount,
                totalResults: primaryCount + secondaryCount,
            });
        }

        // ── Sin filtro de posición — lista normal paginada ────────────────
        const [players, count] = await Promise.all([
            Player.find(baseQuery).sort(sort).limit(l).skip((p - 1) * l),
            Player.countDocuments(baseQuery),
        ]);

        res.status(200).json({
            grouped:      false,
            players,
            totalPages:   Math.ceil(count / l),
            currentPage:  p,
            totalResults: count,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener jugadores', error: error.message });
    }
};

// 2. GET /api/players/:id - Detalle del jugador + sus reportes
exports.getPlayerById = async (req, res) => {
    try {
        const player = await Player.findOne({ id: req.params.id });
        if (!player) return res.status(404).json({ message: "Jugador no encontrado" });

        const reports = await ScoutingReport.find({ player: player._id });

        res.status(200).json({ player, reports });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener detalles", error: error.message });
    }
};

// 3. POST /api/players - Crear nuevo perfil
exports.createPlayer = async (req, res) => {
    try {
        const newPlayer = new Player(req.body);
        const savedPlayer = await newPlayer.save();
        res.status(201).json(savedPlayer);
    } catch (error) {
        res.status(400).json({ message: "Error al crear", error: error.message });
    }
};

// 4. PUT /api/players/:id - Actualizar
exports.updatePlayer = async (req, res) => {
    try {
        const updatedPlayer = await Player.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedPlayer) return res.status(404).json({ message: "No encontrado" });
        res.status(200).json(updatedPlayer);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar", error: error.message });
    }
};

// 5. DELETE /api/players/:id - Eliminar jugador y sus reportes
exports.deletePlayer = async (req, res) => {
    try {
        const player = await Player.findOne({ id: req.params.id });
        if (!player) return res.status(404).json({ message: "No encontrado" });

        await ScoutingReport.deleteMany({ player: player._id });
        await Player.deleteOne({ _id: player._id });

        res.status(200).json({ message: "Jugador y reportes eliminados correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar", error: error.message });
    }
};

// 6. GET /api/players/search
exports.searchPlayers = async (req, res) => {
    try {
        const { q, sortField, sortOrder } = req.query;
        const sort = buildSort(sortField, sortOrder);

        const players = await Player.find({
            name: { $regex: q, $options: 'i' }
        }).sort(sort).limit(50);

        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: "Error en la búsqueda", error: error.message });
    }
};