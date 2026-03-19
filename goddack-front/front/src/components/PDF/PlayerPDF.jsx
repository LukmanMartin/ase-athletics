// components/PDF/PlayerPDF.jsx
import {
    Document, Page, Text, View, StyleSheet, Font
} from '@react-pdf/renderer';

const BLUE   = '#0ea5e9';
const DARK   = '#0f172a';
const GRAY   = '#64748b';
const LIGHT  = '#f8fafc';
const BORDER = '#e2e8f0';
const GREEN  = '#10b981';
const YELLOW = '#f59e0b';
const RED    = '#ef4444';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        padding: 32,
        fontSize: 10,
        color: DARK,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: BLUE,
    },
    headerLeft: { flex: 1 },
    playerName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 4 },
    playerSub:  { fontSize: 10, color: GRAY },
    headerRight: { alignItems: 'flex-end' },
    idBadge: { fontSize: 8, color: GRAY, backgroundColor: LIGHT, padding: '4 8', borderRadius: 4 },
    exportDate: { fontSize: 8, color: GRAY, marginTop: 4 },

    // Secciones
    section: { marginBottom: 16 },
    sectionTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: BLUE,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },

    // Grid 2 columnas
    grid2: { flexDirection: 'row', gap: 12 },
    col:   { flex: 1 },

    // Fila de dato
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dataLabel: { color: GRAY, fontSize: 9 },
    dataValue: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: DARK },

    // Stats en fila
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    statBox: {
        backgroundColor: LIGHT,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 4,
        padding: '6 10',
        alignItems: 'center',
        minWidth: 60,
    },
    statVal:   { fontSize: 12, fontFamily: 'Helvetica-Bold', color: DARK },
    statLabel: { fontSize: 7, color: GRAY, marginTop: 2 },

    // Atributos
    attrRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    attrLabel: { width: 80, fontSize: 8, color: GRAY },
    attrBarWrap: { flex: 1, backgroundColor: '#f1f5f9', height: 6, borderRadius: 3, marginHorizontal: 8 },
    attrBar: { height: 6, borderRadius: 3 },
    attrNum: { width: 24, fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

    // Tags
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    tagGreen: { backgroundColor: '#dcfce7', color: '#166534', padding: '3 8', borderRadius: 9999, fontSize: 8 },
    tagRed:   { backgroundColor: '#fee2e2', color: '#991b1b', padding: '3 8', borderRadius: 9999, fontSize: 8 },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 32,
        right: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingTop: 6,
    },
    footerText: { fontSize: 7, color: GRAY },
});

const val = (v, fallback = '—') => v != null ? String(v) : fallback;
const currency = (v) => v != null
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
    : '—';

const attrColor = (v) => {
    const n = Number(v);
    if (!n) return GRAY;
    if (n >= 80) return GREEN;
    if (n >= 60) return YELLOW;
    return RED;
};

const DataRow = ({ label, value }) => (
    <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={styles.dataValue}>{val(value)}</Text>
    </View>
);

const StatBox = ({ label, value }) => (
    <View style={styles.statBox}>
        <Text style={styles.statVal}>{val(value)}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const AttrRow = ({ label, value }) => (
    <View style={styles.attrRow}>
        <Text style={styles.attrLabel}>{label}</Text>
        <View style={styles.attrBarWrap}>
            <View style={[styles.attrBar, { width: `${Math.min(value || 0, 99)}%`, backgroundColor: attrColor(value) }]} />
        </View>
        <Text style={styles.attrNum}>{val(value)}</Text>
    </View>
);

const PlayerPDF = ({ player }) => {
    const s   = player.stats              || {};
    const sc  = player.scoutingAnalysis   || {};
    const mk  = player.marketData         || {};
    const ct  = player.contractInfo       || {};
    const att = player.attributes         || {};
    const date = new Date().toLocaleDateString('es-ES');

    const REC_LABELS = { Sign:'Fichar', Monitor:'Seguir', Pass:'Descartar' };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerSub}>
                            {val(player.currentTeam)} · {val(player.position)} · #{val(player.jerseyNumber)}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.idBadge}>GODDACK ANALÍTICA</Text>
                        <Text style={styles.exportDate}>Exportado: {date}</Text>
                    </View>
                </View>

                {/* Datos personales + Club */}
                <View style={styles.grid2}>
                    <View style={[styles.col, styles.section]}>
                        <Text style={styles.sectionTitle}>Datos personales</Text>
                        <DataRow label="Nombre completo" value={player.fullName} />
                        <DataRow label="Fecha nacimiento" value={player.dateOfBirth} />
                        <DataRow label="Edad"             value={player.age} />
                        <DataRow label="Nacionalidad"     value={player.nationality} />
                        <DataRow label="Altura"           value={player.height ? `${player.height} cm` : null} />
                        <DataRow label="Peso"             value={player.weight ? `${player.weight} kg` : null} />
                        <DataRow label="Pie preferido"    value={player.preferredFoot} />
                    </View>
                    <View style={[styles.col, styles.section]}>
                        <Text style={styles.sectionTitle}>Club y contrato</Text>
                        <DataRow label="Equipo"           value={player.currentTeam} />
                        <DataRow label="Liga"             value={player.league} />
                        <DataRow label="Posición"         value={player.position} />
                        <DataRow label="Pos. secundarias" value={player.secondaryPositions?.join(', ')} />
                        <DataRow label="Fin contrato"     value={ct.contractEnd} />
                        <DataRow label="Salario semanal"  value={currency(ct.salary?.weeklyWage)} />
                        <DataRow label="Cláusula"         value={currency(ct.releaseClause)} />
                    </View>
                </View>

                {/* Valor de mercado */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mercado</Text>
                    <View style={styles.statsRow}>
                        <StatBox label="Valor actual"   value={currency(mk.currentMarketValue)} />
                        <StatBox label="Últ. 30 días"   value={mk.valueTrend?.last30Days    != null ? `${mk.valueTrend.last30Days > 0 ? '+' : ''}${mk.valueTrend.last30Days}%` : '—'} />
                        <StatBox label="Últ. 90 días"   value={mk.valueTrend?.last90Days    != null ? `${mk.valueTrend.last90Days > 0 ? '+' : ''}${mk.valueTrend.last90Days}%` : '—'} />
                        <StatBox label="Últ. 12 meses"  value={mk.valueTrend?.last12Months  != null ? `${mk.valueTrend.last12Months > 0 ? '+' : ''}${mk.valueTrend.last12Months}%` : '—'} />
                    </View>
                </View>

                {/* Estadísticas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Estadísticas de temporada</Text>
                    <View style={styles.statsRow}>
                        <StatBox label="Partidos"    value={s.appearances}   />
                        <StatBox label="Goles"       value={s.goals}         />
                        <StatBox label="Asistencias" value={s.assists}       />
                        <StatBox label="Minutos"     value={s.minutesPlayed} />
                        <StatBox label="Prec. pases" value={s.passAccuracy != null ? `${s.passAccuracy}%` : null} />
                        <StatBox label="Amarillas"   value={s.yellowCards}   />
                        <StatBox label="Rojas"       value={s.redCards}      />
                    </View>
                </View>

                {/* Atributos */}
                {Object.keys(att).filter(k => k !== '_id' && att[k] != null).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Perfil de atributos</Text>
                        {[
                            ['Velocidad',      att.pace],
                            ['Disparo',        att.shooting],
                            ['Pase',           att.passing],
                            ['Regate',         att.dribbling],
                            ['Defensa',        att.defending],
                            ['Físico',         att.physical],
                            ['Finalización',   att.finishing],
                            ['Centro',         att.crossing],
                            ['Tiro lejano',    att.longShots],
                            ['Posicionamiento',att.positioning],
                        ].filter(([,v]) => v != null).map(([l, v]) => (
                            <AttrRow key={l} label={l} value={v} />
                        ))}
                    </View>
                )}

                {/* Scouting */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Análisis de scouting</Text>
                    <View style={styles.grid2}>
                        <View style={styles.col}>
                            <DataRow label="Comparable"    value={sc.comparablePlayer} />
                            <DataRow label="Techo"         value={sc.ceiling}          />
                            <DataRow label="Potencial"     value={sc.potential}        />
                            <DataRow label="Preparado"     value={sc.readiness}        />
                        </View>
                        <View style={styles.col}>
                            <DataRow label="Rating"        value={sc.rating}           />
                            <DataRow label="Recomendación" value={REC_LABELS[sc.recommendation] || sc.recommendation} />
                        </View>
                    </View>
                    {sc.strengths?.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={[styles.dataLabel, { marginBottom: 4 }]}>Fortalezas</Text>
                            <View style={styles.tagRow}>
                                {sc.strengths.map((s, i) => <Text key={i} style={styles.tagGreen}>{s}</Text>)}
                            </View>
                        </View>
                    )}
                    {sc.weaknesses?.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={[styles.dataLabel, { marginBottom: 4 }]}>Debilidades</Text>
                            <View style={styles.tagRow}>
                                {sc.weaknesses.map((w, i) => <Text key={i} style={styles.tagRed}>{w}</Text>)}
                            </View>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>GODDACK ANALÍTICA — Informe de jugador</Text>
                    <Text style={styles.footerText}>{player.name} · {date}</Text>
                </View>

            </Page>
        </Document>
    );
};

export default PlayerPDF;