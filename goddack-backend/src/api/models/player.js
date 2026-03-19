
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({

    // ─── IDENTIDAD ────────────────────────────────────────────────────────────
    id:                { type: Number, unique: true },
    playerId:          String,
    name:              { type: String, required: true },
    fullName:          String,
    displayName:       String,
    age:               Number,
    dateOfBirth:       String,
    placeOfBirth:      String,
    nationality:       String,
    secondNationality: String,
    height:            Number,
    weight:            Number,
    preferredFoot:     String,
    image:             String,
    profileImage:      String,
    imageUrl:          String,

    // ─── CLUB ─────────────────────────────────────────────────────────────────
    team:               String,
    currentTeam:        String,
    teamId:             String,
    league:             String,
    leagueId:           String,
    division:           String,
    country:            String,
    jerseyNumber:       Number,
    position:           String,
    secondaryPositions: [String],
    playerStatus:       String,
    isLoanPlayer:       { type: Boolean, default: false },
    loanDetails:        { type: mongoose.Schema.Types.Mixed, default: null },

    // ─── MERCADO ──────────────────────────────────────────────────────────────
    marketData: {
        currentMarketValue: Number,
        currency:           String,
        valuationDate:      String,
        valueTrend: {
            last30Days:   Number,
            last90Days:   Number,
            last12Months: Number
        },
        valueHistory: [{
            date:   String,
            value:  Number,
            source: String
        }],
        transferData: {
            transferProbability: Number,
            transferWindow:      String,
            interestedClubs:     [String],
            transferRumors: [{
                date:        String,
                club:        String,
                reliability: Number,
                source:      String
            }]
        }
    },

    // ─── ESTADÍSTICAS ─────────────────────────────────────────────────────────
    // FIX: sin default:0 para que null (sin dato) no se sobreescriba
    stats: {
        appearances:   Number,
        starts:        Number,
        minutesPlayed: Number,
        goals:         Number,
        assists:       Number,
        passAccuracy:  Number,
        yellowCards:   Number,
        redCards:      Number,
        cleanSheets:   Number,
        ownGoals:      Number,

        per90: {
            goalsP90:         Number,
            assistsP90:       Number,
            shotsP90:         Number,
            shotsOnTargetP90: Number,
            keyPassesP90:     Number,
            passesP90:        Number,
            dribblesP90:      Number,
            tacklesP90:       Number,
            interceptionsP90: Number,
            clearancesP90:    Number,
            crossesP90:       Number,
            foulsConcededP90: Number,
            foulsWonP90:      Number
        },

        advanced: {
            // xG / xA
            xG:                Number,
            xA:                Number,
            xGP90:             Number,
            xAP90:             Number,
            xGOverperformance: Number,
            xAOverperformance: Number,
            // Shooting
            shotsOnTarget:      Number,
            totalShots:         Number,
            shotAccuracy:       Number,
            shotConversion:     Number,
            bigChances:         Number,
            bigChancesMissed:   Number,
            goalConversionRate: Number,
            shotMap: [{
                x:       Number,
                y:       Number,
                outcome: String,
                xG:      Number
            }],
            // Passing
            totalPasses:         Number,
            shortPasses:         Number,
            shortPassAccuracy:   Number,
            mediumPasses:        Number,
            mediumPassAccuracy:  Number,
            longPasses:          Number,
            longPassAccuracy:    Number,
            forwardPasses:       Number,
            backwardPasses:      Number,
            sidewaysPasses:      Number,
            throughBalls:        Number,
            throughBallAccuracy: Number,
            crossAccuracy:       Number,
            cornerAccuracy:      Number,
            // Defensa
            dribblesCompleted:   Number,
            tacklesWon:          Number,
            tackleSuccessRate:   Number,
            aerialDuelsWon:      Number,
            aerialDuelSuccess:   Number,
            groundDuels:         Number,
            groundDuelSuccess:   Number,
            interceptions:       Number,
            blocks:              Number,
            clearances:          Number,
            pressures:           Number,
            pressureSuccessRate: Number,
            recoveries:          Number,
            // Técnica
            touches:             Number,
            touchesInBox:        Number,
            dribbleSuccessRate:  Number,
            dispossessed:        Number,
            badControls:         Number,
            skillMoves:          Number,
            skillMoveSuccess:    Number,
            // Físico
            topSpeed:            String,
            distanceCovered:     String,
            highIntensityRuns:   Number,
            sprints:             Number,
            accelerations:       Number,
            decelerations:       Number,
            intensityScore:      Number,
            distanceCoveredP90:  Number
        }
    },

    // ─── ATRIBUTOS ────────────────────────────────────────────────────────────
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
        positioning: Number
    },

    // ─── CONTRATO ─────────────────────────────────────────────────────────────
    contractInfo: {
        contractStart:  String,
        contractEnd:    String,
        contractLength: Number,
        releaseClause:  Number,
        salary: {
            weeklyWage:   Number,
            annualSalary: Number,
            currency:     String,
            bonuses: {
                signingBonus:     Number,
                loyaltyBonus:     Number,
                performanceBonus: Number
            }
        },
        agentInfo: {
            agentName:          String,
            agencyName:         String,
            agentFeePercentage: Number
        }
    },

    // ─── SCOUTING ─────────────────────────────────────────────────────────────
    scoutingAnalysis: {
        comparablePlayer: String,
        ceiling:          String,
        readiness:        String,
        potential:        Number,
        rating:           Number,
        recommendation:   String,
        comments:         String,
        strengths:        [String],
        weaknesses:       [String],
        scoutComments: [{
            date:           String,
            scout:          String,
            rating:         Number,
            comments:       String,
            recommendation: String
        }]
    },

    // ─── COMPETICIÓN ──────────────────────────────────────────────────────────
    competitionBreakdown: {
        byCompetition: [{
            competitionName: String,
            competitionType: String,
            appearances:     Number,
            goals:           Number,
            assists:         Number,
            averageRating:   Number
        }],
        homeVsAway: {
            home: { appearances: Number, goals: Number, assists: Number, averageRating: Number },
            away: { appearances: Number, goals: Number, assists: Number, averageRating: Number }
        },
        bigGamePerformance: {
            vsTop6:  { appearances: Number, goals: Number, assists: Number, averageRating: Number },
            derbies: { appearances: Number, goals: Number, assists: Number, averageRating: Number }
        }
    },

    // ─── MARKETING ────────────────────────────────────────────────────────────
    marketingData: {
        instagramFollowers: Number,
        twitterFollowers:   Number,
        facebookFollowers:  Number,
        tiktokFollowers:    Number,
        engagementRate:     Number,
        marketability:      Number
    },

    // ─── PERSONALIDAD ─────────────────────────────────────────────────────────
    personalTraits: {
        languages:        [String],
        traits:           [String],
        leadership:       Number,
        professionalism:  Number,
        adaptability:     Number,
        education:        String,
        maritalStatus:    String,
        children:         Number,
        footballingFamily:Boolean
    },

    // ─── TÁCTICA ──────────────────────────────────────────────────────────────
    tacticalData: {
        positionData: {
            primaryPosition: String,
            positionsPlayed: [{
                position:      String,
                appearances:   Number,
                effectiveness: Number
            }],
            positionFlexibility: Number,
            preferredSide:       String
        },
        heatmaps: {
            averagePosition: { x: Number, y: Number },
            zoneOccupancy: {
                defensiveThird: Number,
                middleThird:    Number,
                attackingThird: Number,
                leftFlank:      Number,
                central:        Number,
                rightFlank:     Number,
                penaltyArea:    Number
            }
        },
        playingStyle: {
            styleDescription:   String,
            strengths:          [String],
            weaknesses:         [String],
            preferredFormation: String,
            roleInTeam:         String
        }
    },

    // ─── MÉDICO ───────────────────────────────────────────────────────────────
    medicalHistory: {
        currentInjuries: [mongoose.Schema.Types.Mixed],
        injuryHistory: [{
            injuryType:   String,
            injuryDate:   String,
            returnDate:   String,
            daysOut:      Number,
            gamesMissed:  Number,
            gamessMissed: Number
        }],
        injuryProneness:        Number,
        totalDaysInjured:       Number,
        availabilityPercentage: Number
    },

    // ─── FORMA RECIENTE ───────────────────────────────────────────────────────
    recentForm: {
        currentForm: {
            last5Games: [{
                matchId:       String,
                date:          String,
                opponent:      String,
                result:        String,
                goals:         Number,
                assists:       Number,
                rating:        Number,
                minutesPlayed: Number
            }],
            last10Games: [{
                matchId:       String,
                date:          String,
                opponent:      String,
                result:        String,
                goals:         Number,
                assists:       Number,
                rating:        Number,
                minutesPlayed: Number
            }],
            formRating:        Number,
            consistencyScore:  Number,
            momentumIndicator: String
        },
        seasonProgression: [{
            month:         String,
            goals:         Number,
            assists:       Number,
            appearances:   Number,
            averageRating: Number
        }],
        streaks: {
            currentGoalStreak:       Number,
            longestGoalStreak:       Number,
            currentAssistStreak:     Number,
            longestAssistStreak:     Number,
            currentCleanSheetStreak: Number
        }
    },

    // ─── CARRERA ──────────────────────────────────────────────────────────────
    careerHistory: {
        previousClubs: [{
            club:         String,
            league:       String,
            startDate:    String,
            endDate:      String,
            transferFee:  Number,
            appearances:  Number,
            goals:        Number,
            assists:      Number,
            transferType: String
        }],
        youthCareer: [{
            club:      String,
            startYear: Number,
            endYear:   Number
        }]
    },

    // ─── INTERNACIONAL ────────────────────────────────────────────────────────
    internationalCareer: {
        nationalTeam: String,
        youthTeams:   [String],
        caps:         Number,
        goals:        Number,
        assists:      Number,
        debut:        String,
        lastCallUp:   String,
        majorTournaments: [{
            tournament:  String,
            year:        Number,
            appearances: Number,
            goals:       Number,
            assists:     Number
        }]
    },

    // ─── ALERTAS ──────────────────────────────────────────────────────────────
    alerts: [{
        type:     { type: String },
        message:  String,
        severity: String,
        date:     String
    }]

}, {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true }
});
// Autogenera el campo "id" si no viene en el body
playerSchema.pre('save', async function () {
    if (this.id != null) return;
    const last = await this.constructor.findOne({}, { id: 1 }).sort({ id: -1 });
    this.id = last ? last.id + 1 : 1;
});
module.exports = mongoose.model('Player', playerSchema);