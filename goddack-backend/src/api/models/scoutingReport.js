const mongoose = require('mongoose');

const scoutingReportSchema = new mongoose.Schema({
    player:     { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    playerId:   { type: Number, required: true },
    playerName: { type: String, required: true },
    scoutName:  { type: String },
    date:       { type: String },

    matchDetails: {
        opponent:      String,
        competition:   String,
        result:        String,
        minutesPlayed: Number,
        position:      String,
        goals:         Number,
        assists:       Number,
        rating:        Number,
    },

    // Valoraciones subjetivas del scout (1-10)
    ratings: {
        technical:  Number,
        physical:   Number,
        mental:     Number,
        tactical:   Number,
        finishing:  Number,
        passing:    Number,
        dribbling:  Number,
        defending:  Number,
        leadership: Number,
        workRate:   Number
    },

    // Atributos observados (1-99) — vuelcan al perfil
    attributes: {
        pace:        Number,
        shooting:    Number,
        passing:     Number,
        dribbling:   Number,
        defending:   Number,
        physical:    Number,
        finishing:   Number,
        crossing:    Number,
        longShots:   Number,
        positioning: Number,
    },

    // xG / xA del partido — suman al perfil
    xG:               Number,
    xA:               Number,
    xGP90:            Number,
    xAP90:            Number,
    xGOverperformance: Number,
    xAOverperformance: Number,

    // Análisis de scouting — vuelcan al perfil
    comparablePlayer:  String,
    potential:         Number,
    ceiling:           String,
    readiness:         String,

    // Posiciones secundarias — vuelcan al perfil
    secondaryPositions: [String],

    // Personalidad — vuelca al perfil
    personalTraits: {
        leadership:      Number,
        professionalism: Number,
        adaptability:    Number,
    },

    strengths:  [String],
    weaknesses: [String],
    keyMoments: [String],

    overallRating:  Number,
    recommendation: String,
    notes:          String,

}, { timestamps: true });

module.exports = mongoose.model('ScoutingReport', scoutingReportSchema);