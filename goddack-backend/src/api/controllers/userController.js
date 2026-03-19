const User         = require('../models/User');
const ScoutReport  = require('../models/scoutingReport');

// GET /api/users — lista todos los usuarios (solo admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ created_at: -1 });

        // Para cada scout, contar sus informes
        const usersWithStats = await Promise.all(users.map(async (u) => {
            const reportCount = await ScoutReport.countDocuments({ scoutName: u.name });
            return {
                _id:        u._id,
                name:       u.name,
                email:      u.email,
                role:       u.role,
                created_at: u.created_at,
                reportCount,
            };
        }));

        res.status(200).json(usersWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

// DELETE /api/users/:id — eliminar usuario (solo admin, no puede eliminarse a sí mismo)
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json({ message: `Usuario ${user.name} eliminado correctamente` });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};

// PUT /api/users/:id/role — cambiar rol (solo admin)
exports.updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['scout', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Rol no válido' });
        }
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { returnDocument: 'after' }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar rol', error: error.message });
    }
};

// GET /api/users/stats — estadísticas para el admin
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers   = await User.countDocuments({ role: 'scout' });
        const totalReports = await ScoutReport.countDocuments();

        // Informes por scout
        const reportsByScout = await ScoutReport.aggregate([
            { $group: { _id: '$scoutName', count: { $sum: 1 }, lastReport: { $max: '$createdAt' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Informes por recomendación
        const reportsByRec = await ScoutReport.aggregate([
            { $group: { _id: '$recommendation', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Informes por mes (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const reportsByMonth = await ScoutReport.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year:  { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Jugadores más scouted
        const mostScouted = await ScoutReport.aggregate([
            { $group: { _id: '$playerName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            totalUsers,
            totalReports,
            reportsByScout,
            reportsByRec,
            reportsByMonth,
            mostScouted,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};