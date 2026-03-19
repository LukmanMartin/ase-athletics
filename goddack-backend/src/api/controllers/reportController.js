const ScoutReport = require('../models/scoutingReport.js');
const Player      = require('../models/player');

// ── Helper: construye la actualización del jugador ────────────────────────────
const buildPlayerUpdate = (body, reportId) => {
    const set  = {};
    const inc  = {};
    const push = {};

    // ── 1. Entrada nueva en recentForm.currentForm.last5Games ────────────────
    push['recentForm.currentForm.last5Games'] = {
        date:          body.date                        || new Date().toISOString().split('T')[0],
        opponent:      body.matchDetails?.opponent      || '',
        result:        body.matchDetails?.result        || '',
        goals:         body.matchDetails?.goals         ?? null,
        assists:       body.matchDetails?.assists       ?? null,
        rating:        body.matchDetails?.rating        ?? null,
        minutesPlayed: body.matchDetails?.minutesPlayed ?? null,
    };

    // ── 2. Stats básicas — SUMAN con $inc ────────────────────────────────────
    const statMap = {
        goals:         body.matchDetails?.goals,
        assists:       body.matchDetails?.assists,
        appearances:   body.matchDetails?.minutesPlayed != null ? 1 : null, // cuenta 1 partido
        minutesPlayed: body.matchDetails?.minutesPlayed,
    };
    Object.entries(statMap).forEach(([k, v]) => {
        if (v != null && v !== '') inc[`stats.${k}`] = Number(v);
    });

    // Stats avanzadas xG/xA — suman
    const advMap = {
        xG:               body.xG,
        xA:               body.xA,
        xGP90:            body.xGP90,
        xAP90:            body.xAP90,
        xGOverperformance: body.xGOverperformance,
        xAOverperformance: body.xAOverperformance,
    };
    Object.entries(advMap).forEach(([k, v]) => {
        if (v != null && v !== '') inc[`stats.advanced.${k}`] = Number(v);
    });

    // ── 3. Atributos (1-99) — reemplazan ─────────────────────────────────────
    if (body.attributes && typeof body.attributes === 'object') {
        ['pace','shooting','passing','dribbling','defending','physical','finishing','crossing','longShots','positioning'].forEach(k => {
            if (body.attributes[k] != null && body.attributes[k] !== '') {
                set[`attributes.${k}`] = Number(body.attributes[k]);
            }
        });
    }

    // ── 4. scoutingAnalysis — reemplaza ──────────────────────────────────────
    if (body.overallRating   != null) set['scoutingAnalysis.rating']           = body.overallRating;
    if (body.recommendation)          set['scoutingAnalysis.recommendation']   = body.recommendation;
    if (body.strengths?.length)       set['scoutingAnalysis.strengths']        = body.strengths;
    if (body.weaknesses?.length)      set['scoutingAnalysis.weaknesses']       = body.weaknesses;
    if (body.notes)                   set['scoutingAnalysis.comments']         = body.notes;
    if (body.comparablePlayer)        set['scoutingAnalysis.comparablePlayer'] = body.comparablePlayer;
    if (body.potential  != null)      set['scoutingAnalysis.potential']        = body.potential;
    if (body.ceiling)                 set['scoutingAnalysis.ceiling']          = body.ceiling;
    if (body.readiness)               set['scoutingAnalysis.readiness']        = body.readiness;

    // ── 5. secondaryPositions — reemplaza ────────────────────────────────────
    if (body.secondaryPositions?.length) {
        set['secondaryPositions'] = body.secondaryPositions;
    }

    // ── 6. personalTraits — reemplaza ────────────────────────────────────────
    if (body.personalTraits?.leadership    != null) set['personalTraits.leadership']    = body.personalTraits.leadership;
    if (body.personalTraits?.professionalism != null) set['personalTraits.professionalism'] = body.personalTraits.professionalism;
    if (body.personalTraits?.adaptability  != null) set['personalTraits.adaptability'] = body.personalTraits.adaptability;

    // ── 7. Historial de comentarios del scout (con reportId) ─────────────────
    push['scoutingAnalysis.scoutComments'] = {
        reportId:       reportId?.toString() || null,
        date:           body.date            || new Date().toISOString().split('T')[0],
        scout:          body.scoutName       || 'Anónimo',
        rating:         body.overallRating   || null,
        comments:       body.notes           || '',
        recommendation: body.recommendation  || '',
    };

    const update = {};
    if (Object.keys(set).length)  update.$set  = set;
    if (Object.keys(inc).length)  update.$inc  = inc;
    if (Object.keys(push).length) update.$push = push;

    return update;
};

// ── GET /api/reports ──────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
    try {
        const reports = await ScoutReport.find().sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los informes", error: error.message });
    }
};

// ── GET /api/reports/:id ──────────────────────────────────────────────────────
exports.getReportById = async (req, res) => {
    try {
        const report = await ScoutReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Informe no encontrado' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el informe', error: error.message });
    }
};

// ── GET /api/reports/player/:playerId ────────────────────────────────────────
exports.getReportsByPlayer = async (req, res) => {
    try {
        const reports = await ScoutReport.find({ playerId: req.params.playerId }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener informes del jugador", error: error.message });
    }
};

// ── POST /api/reports ────────────────────────────────────────────────────────
exports.createReport = async (req, res) => {
    try {
        const newReport   = new ScoutReport(req.body);
        const savedReport = await newReport.save();

        // Actualizar jugador usando el _id del informe recién creado
        const playerUpdate = buildPlayerUpdate(req.body, savedReport._id);
        if (Object.keys(playerUpdate).length > 0) {
            await Player.findOneAndUpdate(
                { _id: req.body.player },
                playerUpdate,
                { new: true }
            );
        }

        res.status(201).json(savedReport);
    } catch (error) {
        res.status(400).json({ message: "Error al crear el informe", error: error.message });
    }
};

// ── PUT /api/reports/:id ─────────────────────────────────────────────────────
exports.updateReport = async (req, res) => {
    try {
        const report = await ScoutReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Informe no encontrado" });

        const isOwner = report.scoutName === req.user.name;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "No tienes permiso para editar este informe" });
        }

        const updated = await ScoutReport.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Al editar solo actualizamos $set (no sumamos de nuevo ni añadimos otra entrada al historial)
        const { $set } = buildPlayerUpdate(req.body, req.params.id);
        if ($set && Object.keys($set).length > 0) {
            await Player.findOneAndUpdate(
                { _id: report.player },
                { $set },
                { new: true }
            );
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar el informe", error: error.message });
    }
};

// ── DELETE /api/reports/:id ──────────────────────────────────────────────────
exports.deleteReport = async (req, res) => {
    try {
        const report = await ScoutReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Informe no encontrado" });

        const isOwner = report.scoutName === req.user.name;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "No tienes permiso para eliminar este informe" });
        }

        await ScoutReport.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Informe eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el informe", error: error.message });
    }
};