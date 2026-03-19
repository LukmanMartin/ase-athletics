
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Player       = require('../src/api/models/player');
const playersBio   = require('../data/players_Data_production.json');
const playersStats = require('../data/player_statistics_detailed.json');
const scoutReports = require('../data/scout_report.json');

// ─── Helper: primer valor definido, si no → null (nunca 0 por defecto) ───────
const pick = (...vals) => {
    for (const v of vals) {
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
};

const normalize = str => str?.toLowerCase().trim() ?? '';

// ─────────────────────────────────────────────────────────────────────────────
const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('📡 Conectado a MongoDB.');

        await Player.deleteMany({});
        console.log('🗑️  Base de datos limpia.');

        const bioArray   = playersBio.players || [];
        const SKIP_KEYS  = new Set(['metadata', 'dataQuality']);
        const statsArray = Object.entries(playersStats.playerDataSchema || playersStats)
            .filter(([k]) => !SKIP_KEYS.has(k))
            .map(([, v]) => v);
        const scoutArray = scoutReports.scoutingReports || [];

        // Cruce SOLO por nombre exacto — evita falsos positivos por id numérico
        const findDetailed = bio =>
            statsArray.find(p => normalize(p.basicInfo?.name) === normalize(bio.name)) || null;

        const findScout = name =>
            scoutArray.find(s => normalize(s.playerName) === normalize(name)) || null;

        const productionPlayers = bioArray.map(bio =>
            mapPlayerData(bio, findDetailed(bio), findScout(bio.name))
        );

        const bioNames = new Set(bioArray.map(b => normalize(b.name)));
        const extraPlayers = statsArray
            .filter(p => p.basicInfo?.name && !bioNames.has(normalize(p.basicInfo.name)))
            .map((detailed, idx) => {
                const mockBio = { id: 9000 + idx, name: detailed.basicInfo.name };
                return mapPlayerData(mockBio, detailed, findScout(detailed.basicInfo.name));
            });

        const allPlayers = [...productionPlayers, ...extraPlayers];
        await Player.insertMany(allPlayers, { ordered: false });

        console.log(`✅  Jugadores insertados: ${allPlayers.length}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ ERROR EN SEED:', err);
        process.exit(1);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAPEADOR — jugadores SIN datos detallados (solo bio)
// ─────────────────────────────────────────────────────────────────────────────
function mapBasicOnly(bio) {
    const s = bio.stats      || {};
    const a = bio.attributes || {};

    return {
        id:                bio.id,
        name:              bio.name,
        fullName:          bio.name,
        displayName:       bio.name,
        age:               pick(bio.age),
        nationality:       pick(bio.nationality),
        secondNationality: null,
        height:            pick(bio.height),
        weight:            pick(bio.weight),
        preferredFoot:     pick(bio.preferredFoot),
        image:             bio.imageUrl || 'default_player',
        team:              pick(bio.team),
        currentTeam:       pick(bio.team),
        league:            pick(bio.league),
        jerseyNumber:      pick(bio.jerseyNumber),
        position:          pick(bio.position),
        secondaryPositions:[],
        playerStatus:      'Active',
        isLoanPlayer:      false,
        loanDetails:       null,

        stats: {
            appearances:   pick(s.appearances),
            starts:        null,
            minutesPlayed: pick(s.minutesPlayed),
            goals:         pick(s.goals),
            assists:       pick(s.assists),
            passAccuracy:  pick(s.passAccuracy),
            yellowCards:   pick(s.yellowCards),
            redCards:      pick(s.redCards),
            cleanSheets:   pick(s.cleanSheets),
            ownGoals:      null,
            per90:         {},
            advanced: {
                shotsOnTarget:     pick(s.shotsOnTarget),
                totalShots:        pick(s.totalShots),
                dribblesCompleted: pick(s.dribblesCompleted),
                tacklesWon:        pick(s.tacklesWon),
                aerialDuelsWon:    pick(s.aerialDuelsWon),
                topSpeed:          null,
                distanceCovered:   null,
                shotMap:           [],
            },
        },

        attributes: {
            pace:        pick(a.pace),
            shooting:    pick(a.shooting),
            passing:     pick(a.passing),
            dribbling:   pick(a.dribbling),
            defending:   pick(a.defending),
            physical:    pick(a.physical),
            finishing:   pick(a.finishing),
            crossing:    pick(a.crossing),
            longShots:   pick(a.longShots),
            positioning: pick(a.positioning),
        },

        contractInfo: {
            contractEnd: pick(bio.contract?.contractEnd),
            salary: { weeklyWage: pick(bio.contract?.salary) }
        },

        marketData:           {},
        scoutingAnalysis:     { strengths: [], weaknesses: [], scoutComments: [] },
        competitionBreakdown: { byCompetition: [] },
        marketingData:        {},
        personalTraits:       { languages: [], traits: [] },
        tacticalData:         {},
        medicalHistory:       { currentInjuries: [], injuryHistory: [] },
        recentForm:           { currentForm: { last5Games: [], last10Games: [] }, seasonProgression: [], streaks: {} },
        careerHistory:        { previousClubs: [], youthCareer: [] },
        internationalCareer:  { youthTeams: [], majorTournaments: [] },
        alerts:               [],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPEADOR — jugadores CON datos detallados
// ─────────────────────────────────────────────────────────────────────────────
function mapPlayerData(bio, det, scoutReport) {
    if (!det) return mapBasicOnly(bio);

    const b     = det.basicInfo            || {};
    const c     = det.clubInfo             || {};
    const s     = det.seasonStats          || {};
    const bs    = s.basicStats             || {};
    const p90   = s.per90Stats             || {};
    const adv   = s.advancedStats          || {};
    const exSt  = adv.expectedStats        || {};
    const shot  = adv.shootingMetrics      || {};
    const pass  = adv.passingMetrics       || {};
    const def   = adv.defensiveMetrics     || {};
    const tech  = adv.technicalMetrics     || {};
    const phys  = s.physicalMetrics        || {};
    const cont  = det.contractInfo         || {};
    const mkt   = det.marketData           || {};
    const med   = det.injuryHistory        || {};
    const form  = det.formAnalysis         || {};
    const tact  = det.tacticalData         || {};
    const soc   = det.socialMedia          || {};
    const misc  = det.miscellaneous        || {};
    const scout = det.scoutingNotes        || {};
    const attrT = scout.attributes?.technical || {};
    const attrD = scout.attributes?.detailed  || {};
    const bioA  = bio.attributes           || {};
    const comp  = det.competitionBreakdown || {};

    return {
        // ── IDENTIDAD ──────────────────────────────────────────────────────
        id:                bio.id,
        playerId:          pick(b.playerId),
        name:              pick(bio.name, b.name),
        fullName:          pick(b.fullName, bio.name),
        displayName:       pick(b.displayName, bio.name),
        age:               pick(b.age, bio.age),
        dateOfBirth:       pick(b.dateOfBirth),
        placeOfBirth:      pick(b.placeOfBirth),
        nationality:       pick(b.nationality, bio.nationality),
        secondNationality: pick(b.secondNationality),
        height:            pick(b.height, bio.height),
        weight:            pick(b.weight, bio.weight),
        preferredFoot:     pick(b.preferredFoot, bio.preferredFoot),
        image:             pick(bio.imageUrl, b.profileImage) || 'default_player',

        // ── CLUB ───────────────────────────────────────────────────────────
        team:               pick(c.currentTeam, bio.team),
        currentTeam:        pick(c.currentTeam, bio.team),
        teamId:             pick(c.teamId),
        league:             pick(c.league, bio.league),
        leagueId:           pick(c.leagueId),
        division:           pick(c.division),
        country:            pick(c.country),
        jerseyNumber:       pick(c.jerseyNumber, bio.jerseyNumber),
        position:           pick(c.position, bio.position),
        secondaryPositions: c.secondaryPositions?.length ? c.secondaryPositions : [],
        playerStatus:       pick(c.playerStatus) || 'Active',
        isLoanPlayer:       c.isLoanPlayer ?? false,
        loanDetails:        c.loanDetails  ?? null,

        // ── MERCADO ────────────────────────────────────────────────────────
        marketData: {
            currentMarketValue: pick(mkt.currentMarketValue),
            currency:           pick(mkt.currency) || 'EUR',
            valuationDate:      pick(mkt.valuationDate),
            valueTrend: {
                last30Days:   pick(mkt.valueTrend?.last30Days),
                last90Days:   pick(mkt.valueTrend?.last90Days),
                last12Months: pick(mkt.valueTrend?.last12Months),
            },
            valueHistory: mkt.valueHistory || [],
            transferData: {
                transferProbability: pick(mkt.transferData?.transferProbability),
                transferWindow:      pick(mkt.transferData?.transferWindow),
                interestedClubs:     mkt.transferData?.interestedClubs || [],
                transferRumors:      mkt.transferData?.transferRumors  || [],
            },
        },

        // ── ESTADÍSTICAS ───────────────────────────────────────────────────
        stats: {
            appearances:   pick(bs.appearances,   bio.stats?.appearances),
            starts:        pick(bs.starts),
            minutesPlayed: pick(bs.minutesPlayed, bio.stats?.minutesPlayed),
            goals:         pick(bs.goals,         bio.stats?.goals),
            assists:       pick(bs.assists,       bio.stats?.assists),
            passAccuracy:  pick(bs.passAccuracy,  pass.passAccuracy, bio.stats?.passAccuracy),
            yellowCards:   pick(bs.yellowCards,   bio.stats?.yellowCards),
            redCards:      pick(bs.redCards,      bio.stats?.redCards),
            cleanSheets:   pick(bs.cleanSheets,   bio.stats?.cleanSheets),
            ownGoals:      pick(bs.ownGoals),

            per90: {
                goalsP90:         pick(p90.goalsP90),
                assistsP90:       pick(p90.assistsP90),
                shotsP90:         pick(p90.shotsP90),
                shotsOnTargetP90: pick(p90.shotsOnTargetP90),
                keyPassesP90:     pick(p90.keyPassesP90),
                passesP90:        pick(p90.passesP90),
                dribblesP90:      pick(p90.dribblesP90),
                tacklesP90:       pick(p90.tacklesP90),
                interceptionsP90: pick(p90.interceptionsP90),
                clearancesP90:    pick(p90.clearancesP90),
                crossesP90:       pick(p90.crossesP90),
                foulsConcededP90: pick(p90.foulsConcededP90),
                foulsWonP90:      pick(p90.foulsWonP90),
            },

            advanced: {
                xG:                pick(exSt.xG),
                xA:                pick(exSt.xA),
                xGP90:             pick(exSt.xGP90),
                xAP90:             pick(exSt.xAP90),
                xGOverperformance: pick(exSt.xGOverperformance),
                xAOverperformance: pick(exSt.xAOverperformance),
                // Shooting
                shotsOnTarget:      pick(shot.shotsOnTarget,    bio.stats?.shotsOnTarget),
                totalShots:         pick(shot.totalShots,       bio.stats?.totalShots),
                shotAccuracy:       pick(shot.shotAccuracy),
                shotConversion:     pick(shot.shotConversion),
                bigChances:         pick(shot.bigChances),
                bigChancesMissed:   pick(shot.bigChancesMissed),
                goalConversionRate: pick(shot.goalConversionRate),
                shotMap:            shot.shotMap || [],
                // Passing
                totalPasses:         pick(pass.totalPasses),
                shortPasses:         pick(pass.shortPasses),
                shortPassAccuracy:   pick(pass.shortPassAccuracy),
                mediumPasses:        pick(pass.mediumPasses),
                mediumPassAccuracy:  pick(pass.mediumPassAccuracy),
                longPasses:          pick(pass.longPasses),
                longPassAccuracy:    pick(pass.longPassAccuracy),
                forwardPasses:       pick(pass.forwardPasses),
                backwardPasses:      pick(pass.backwardPasses),
                sidewaysPasses:      pick(pass.sidewaysPasses),
                throughBalls:        pick(pass.throughBalls),
                throughBallAccuracy: pick(pass.throughBallAccuracy),
                crossAccuracy:       pick(pass.crossAccuracy),
                cornerAccuracy:      pick(pass.cornerAccuracy),
                // Defensa
                dribblesCompleted:   pick(tech.dribbles,          bio.stats?.dribblesCompleted),
                tacklesWon:          pick(def.tacklesWon,         bio.stats?.tacklesWon),
                tackleSuccessRate:   pick(def.tackleSuccessRate),
                aerialDuelsWon:      pick(def.aerialDuels,        bio.stats?.aerialDuelsWon),
                aerialDuelSuccess:   pick(def.aerialDuelSuccess),
                groundDuels:         pick(def.groundDuels),
                groundDuelSuccess:   pick(def.groundDuelSuccess),
                interceptions:       pick(def.interceptions),
                blocks:              pick(def.blocks),
                clearances:          pick(def.clearances),
                pressures:           pick(def.pressures),
                pressureSuccessRate: pick(def.pressureSuccessRate),
                recoveries:          pick(def.recoveries),
                // Técnica
                touches:             pick(tech.touches),
                touchesInBox:        pick(tech.touchesInBox),
                dribbleSuccessRate:  pick(tech.dribbleSuccessRate),
                dispossessed:        pick(tech.dispossessed),
                badControls:         pick(tech.badControls),
                skillMoves:          pick(tech.skillMoves),
                skillMoveSuccess:    pick(tech.skillMoveSuccess),
                // Físico
                topSpeed:            phys.topSpeed        != null ? String(phys.topSpeed)        : null,
                distanceCovered:     phys.distanceCovered != null ? String(phys.distanceCovered) : null,
                distanceCoveredP90:  pick(phys.distanceCoveredP90),
                highIntensityRuns:   pick(phys.highIntensityRuns),
                sprints:             pick(phys.sprints),
                accelerations:       pick(phys.accelerations),
                decelerations:       pick(phys.decelerations),
                intensityScore:      pick(phys.intensityScore),
            },
        },

        // ── ATRIBUTOS ──────────────────────────────────────────────────────
        attributes: {
            pace:        pick(attrT.pace,        bioA.pace),
            shooting:    pick(attrT.shooting,    bioA.shooting),
            passing:     pick(attrT.passing,     bioA.passing),
            dribbling:   pick(attrT.dribbling,   bioA.dribbling),
            defending:   pick(attrT.defending,   bioA.defending),
            physical:    pick(attrT.physical,    bioA.physical),
            finishing:   pick(attrD.finishing,   bioA.finishing),
            crossing:    pick(attrD.crossing,    bioA.crossing),
            longShots:   pick(attrD.longShots,   bioA.longShots),
            positioning: pick(attrD.positioning, bioA.positioning),
        },

        // ── CONTRATO ───────────────────────────────────────────────────────
        contractInfo: {
            contractStart:  pick(cont.contractStart),
            contractEnd:    pick(cont.contractEnd,  bio.contract?.contractEnd),
            contractLength: pick(cont.contractLength),
            releaseClause:  pick(cont.releaseClause),
            salary: {
                weeklyWage:   pick(cont.salary?.weeklyWage,   bio.contract?.salary),
                annualSalary: pick(cont.salary?.annualSalary),
                currency:     pick(cont.salary?.currency) || 'EUR',
                bonuses: {
                    signingBonus:     pick(cont.salary?.bonuses?.signingBonus),
                    loyaltyBonus:     pick(cont.salary?.bonuses?.loyaltyBonus),
                    performanceBonus: pick(cont.salary?.bonuses?.performanceBonus),
                },
            },
            agentInfo: {
                agentName:          pick(cont.agentInfo?.agentName),
                agencyName:         pick(cont.agentInfo?.agencyName),
                agentFeePercentage: pick(cont.agentInfo?.agentFeePercentage),
            },
        },

        // ── SCOUTING ───────────────────────────────────────────────────────
        scoutingAnalysis: {
            comparablePlayer: pick(scout.comparablePlayer),
            ceiling:          pick(scout.ceiling),
            readiness:        pick(scout.readiness),
            potential:        pick(scout.potential),
            rating:           pick(scoutReport?.overallRating, scout.overallRating),
            recommendation:   pick(scoutReport?.recommendation, scout.scoutComments?.[0]?.recommendation),
            comments:         pick(scoutReport?.notes, scout.scoutComments?.[0]?.comments),
            strengths:        scoutReport?.strengths  || tact.playingStyle?.strengths  || [],
            weaknesses:       scoutReport?.weaknesses || tact.playingStyle?.weaknesses || [],
            scoutComments: (scout.scoutComments || []).map(sc => ({
                date:           pick(sc.date),
                scout:          pick(sc.scout),
                rating:         pick(sc.rating),
                comments:       pick(sc.comments),
                recommendation: pick(sc.recommendation),
            })),
        },

        // ── COMPETICIÓN ────────────────────────────────────────────────────
        competitionBreakdown: {
            byCompetition:      comp.byCompetition      || [],
            homeVsAway:         comp.homeVsAway         || {},
            bigGamePerformance: comp.bigGamePerformance || {},
        },

        // ── MARKETING ──────────────────────────────────────────────────────
        marketingData: {
            instagramFollowers: pick(soc.followersCount?.instagram),
            twitterFollowers:   pick(soc.followersCount?.twitter),
            facebookFollowers:  pick(soc.followersCount?.facebook),
            tiktokFollowers:    pick(soc.followersCount?.tiktok),
            engagementRate:     pick(soc.engagementRate),
            marketability:      pick(soc.marketability),
        },

        // ── PERSONALIDAD ───────────────────────────────────────────────────
        personalTraits: {
            languages:         misc.languages         || [],
            traits:            misc.personalityTraits || [],
            leadership:        pick(misc.leadership),
            professionalism:   pick(misc.professionalism),
            adaptability:      pick(misc.adaptability),
            education:         pick(misc.education),
            maritalStatus:     pick(misc.family?.maritalStatus),
            children:          pick(misc.family?.children),
            footballingFamily: misc.family?.footballingFamily ?? null,
        },

        // ── TÁCTICA ────────────────────────────────────────────────────────
        tacticalData: tact,

        // ── MÉDICO ─────────────────────────────────────────────────────────
        medicalHistory: {
            currentInjuries: med.currentInjuries || [],
            injuryHistory: (med.injuryHistory || []).map(i => ({
                injuryType:   pick(i.injuryType),
                injuryDate:   pick(i.injuryDate),
                returnDate:   pick(i.returnDate),
                daysOut:      pick(i.daysOut),
                gamesMissed:  pick(i.gamesMissed, i.gamessMissed),
                gamessMissed: pick(i.gamessMissed),
            })),
            injuryProneness:        pick(med.injuryProneness),
            totalDaysInjured:       pick(med.totalDaysInjured),
            availabilityPercentage: pick(med.availabilityPercentage),
        },

        // ── FORMA ──────────────────────────────────────────────────────────
        recentForm: {
            currentForm: {
                last5Games:        form.currentForm?.last5Games   || [],
                last10Games:       form.currentForm?.last10Games  || [],
                formRating:        pick(form.currentForm?.formRating),
                consistencyScore:  pick(form.currentForm?.consistencyScore),
                momentumIndicator: pick(form.currentForm?.momentumIndicator),
            },
            seasonProgression: form.seasonProgression || [],
            streaks: {
                currentGoalStreak:       pick(form.streaks?.currentGoalStreak),
                longestGoalStreak:       pick(form.streaks?.longestGoalStreak),
                currentAssistStreak:     pick(form.streaks?.currentAssistStreak),
                longestAssistStreak:     pick(form.streaks?.longestAssistStreak),
                currentCleanSheetStreak: pick(form.streaks?.currentCleanSheetStreak),
            },
        },

        // ── CARRERA ────────────────────────────────────────────────────────
        careerHistory: det.careerHistory || {},

        // ── INTERNACIONAL ──────────────────────────────────────────────────
        internationalCareer: det.internationalCareer || {},

        // ── ALERTAS ────────────────────────────────────────────────────────
        alerts: det.alerts || [],
    };
}

seedDB();