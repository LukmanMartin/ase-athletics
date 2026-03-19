const playersStats = require('./data/player_statistics_detailed.json');

// Buscamos a Alessandro por ID o por Nombre
const statsSource = playersStats.playerDataSchema || playersStats;
const alessandro = Object.values(statsSource).find(p => 
    p.id == 2 || p.basicInfo?.name?.includes("Alessandro")
);

if (alessandro) {
    console.log("=== DIAGNÓSTICO DE ALESSANDRO ===");
    console.log("Claves encontradas en la raíz:", Object.keys(alessandro));
    
    if (alessandro.attributes) {
        console.log("Atributos en raíz:", alessandro.attributes);
    }
    
    if (alessandro.seasonStats) {
        console.log("Claves en seasonStats:", Object.keys(alessandro.seasonStats));
        if (alessandro.seasonStats.attributes) {
            console.log("Atributos en seasonStats:", alessandro.seasonStats.attributes);
        }
    }

    if (alessandro.scoutingReports) {
        console.log("¿Tiene Scouting Reports?: Sí, cantidad:", alessandro.scoutingReports.length);
        console.log("Primer reporte (Claves):", Object.keys(alessandro.scoutingReports[0]));
    }
} else {
    console.log("❌ No se encontró a Alessandro en el JSON. Revisa el nombre o el ID.");
}