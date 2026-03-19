// components/PDF/ReportPDF.jsx
import {
    Document, Page, Text, View, StyleSheet
} from '@react-pdf/renderer';

const BLUE   = '#0ea5e9';
const DARK   = '#0f172a';
const GRAY   = '#64748b';
const LIGHT  = '#f8fafc';
const BORDER = '#e2e8f0';
const GREEN  = '#10b981';
const YELLOW = '#f59e0b';
const RED    = '#ef4444';

const REC_COLORS = {
    Sign:    { bg: '#dcfce7', color: '#166534' },
    Monitor: { bg: '#fef9c3', color: '#92400e' },
    Pass:    { bg: '#fee2e2', color: '#991b1b' },
};
const REC_LABELS = { Sign:'Fichar', Monitor:'Seguir', Pass:'Descartar' };

const RATING_LABELS = {
    technical:'Técnica', physical:'Físico', mental:'Mental', tactical:'Táctica',
    finishing:'Finalización', passing:'Pases', dribbling:'Regate', defending:'Defensa',
    leadership:'Liderazgo', workRate:'Trabajo'
};
const ATTR_LABELS = {
    pace:'Velocidad', shooting:'Disparo', passing:'Pase', dribbling:'Regate',
    defending:'Defensa', physical:'Físico', finishing:'Finalización',
    crossing:'Centro', longShots:'Tiro lejano', positioning:'Posicionamiento'
};

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
    playerName:  { fontSize: 22, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 4 },
    playerSub:   { fontSize: 10, color: GRAY },
    headerRight: { alignItems: 'flex-end' },
    badge:       { fontSize: 8, color: GRAY, backgroundColor: LIGHT, padding: '4 8', borderRadius: 4 },
    exportDate:  { fontSize: 8, color: GRAY, marginTop: 4 },

    // Recomendación grande
    recBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        padding: 12,
        backgroundColor: LIGHT,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: BORDER,
    },
    ratingBig:      { fontSize: 28, fontFamily: 'Helvetica-Bold', color: DARK },
    ratingSlash:    { fontSize: 14, color: GRAY },
    ratingLabelSm:  { fontSize: 8, color: GRAY },
    recPill:        { padding: '4 12', borderRadius: 9999, fontSize: 10, fontFamily: 'Helvetica-Bold' },

    // Secciones
    section: { marginBottom: 14 },
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

    // Grid
    grid2: { flexDirection: 'row', gap: 12 },
    col:   { flex: 1 },

    // Data row
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dataLabel: { color: GRAY, fontSize: 9 },
    dataValue: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: DARK },

    // Barras de rating (1-10)
    ratingRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    ratingLabel:   { width: 80, fontSize: 8, color: GRAY },
    ratingBarWrap: { flex: 1, backgroundColor: '#f1f5f9', height: 6, borderRadius: 3, marginHorizontal: 8 },
    ratingBar:     { height: 6, borderRadius: 3, backgroundColor: BLUE },
    ratingNum:     { width: 20, fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: DARK },

    // Barras de atributos (1-99)
    attrRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    attrLabel:   { width: 80, fontSize: 8, color: GRAY },
    attrBarWrap: { flex: 1, backgroundColor: '#f1f5f9', height: 6, borderRadius: 3, marginHorizontal: 8 },
    attrBar:     { height: 6, borderRadius: 3 },
    attrNum:     { width: 24, fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

    // Tags
    tagRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    tagGreen: { backgroundColor: '#dcfce7', color: '#166534', padding: '3 8', borderRadius: 9999, fontSize: 8 },
    tagRed:   { backgroundColor: '#fee2e2', color: '#991b1b', padding: '3 8', borderRadius: 9999, fontSize: 8 },
    tagAmber: { backgroundColor: '#fef9c3', color: '#92400e', padding: '3 8', borderRadius: 9999, fontSize: 8 },

    // Notas
    notesBox: {
        backgroundColor: LIGHT,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 4,
        padding: 10,
        marginTop: 4,
    },
    notesText: { fontSize: 9, color: GRAY, lineHeight: 1.5 },

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

const ReportPDF = ({ report }) => {
    const md      = report.matchDetails  || {};
    const ratings = report.ratings       || {};
    const attrs   = report.attributes    || {};
    const pt      = report.personalTraits || {};
    const recStyle = REC_COLORS[report.recommendation] || { bg: LIGHT, color: GRAY };
    const date     = new Date().toLocaleDateString('es-ES');

    const hasRatings = Object.values(ratings).some(v => v != null);
    const hasAttrs   = Object.values(attrs).some(v => v != null);
    const hasXG      = [report.xG, report.xA, report.xGP90, report.xAP90].some(v => v != null);
    const hasPT      = pt.leadership != null || pt.professionalism != null || pt.adaptability != null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.playerName}>{report.playerName}</Text>
                        <Text style={styles.playerSub}>
                            Informe de scouting · {val(report.scoutName)} · {val(report.date)}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.badge}>GODDACK ANALÍTICA</Text>
                        <Text style={styles.exportDate}>Exportado: {date}</Text>
                    </View>
                </View>

                {/* Valoración global + recomendación */}
                <View style={styles.recBlock}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                        <Text style={styles.ratingBig}>{val(report.overallRating)}</Text>
                        <Text style={styles.ratingSlash}>/10</Text>
                    </View>
                    <Text style={styles.ratingLabelSm}>Valoración global</Text>
                    <View style={{ marginLeft: 8 }}>
                        <Text style={[styles.recPill, { backgroundColor: recStyle.bg, color: recStyle.color }]}>
                            {REC_LABELS[report.recommendation] || val(report.recommendation)}
                        </Text>
                    </View>
                    {report.comparablePlayer && (
                        <View style={{ marginLeft: 8 }}>
                            <Text style={[styles.dataLabel, { marginBottom: 2 }]}>Similar a</Text>
                            <Text style={[styles.dataValue]}>{report.comparablePlayer}</Text>
                        </View>
                    )}
                </View>

                {/* Partido */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detalles del partido</Text>
                    <View style={styles.grid2}>
                        <View style={styles.col}>
                            <DataRow label="Rival"        value={md.opponent}      />
                            <DataRow label="Competición"  value={md.competition}   />
                            <DataRow label="Resultado"    value={md.result}        />
                            <DataRow label="Minutos"      value={md.minutesPlayed != null ? `${md.minutesPlayed}'` : null} />
                        </View>
                        <View style={styles.col}>
                            <DataRow label="Posición"     value={md.position}  />
                            <DataRow label="Goles"        value={md.goals}     />
                            <DataRow label="Asistencias"  value={md.assists}   />
                            <DataRow label="Rating"       value={md.rating}    />
                        </View>
                    </View>
                </View>

                {/* xG / xA */}
                {hasXG && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Expected goals & assists</Text>
                        <View style={styles.grid2}>
                            <View style={styles.col}>
                                <DataRow label="xG"      value={report.xG}  />
                                <DataRow label="xA"      value={report.xA}  />
                                <DataRow label="Over xG" value={report.xGOverperformance} />
                            </View>
                            <View style={styles.col}>
                                <DataRow label="xG P90"  value={report.xGP90} />
                                <DataRow label="xA P90"  value={report.xAP90} />
                                <DataRow label="Over xA" value={report.xAOverperformance} />
                            </View>
                        </View>
                    </View>
                )}

                {/* Atributos */}
                {hasAttrs && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Atributos observados (1-99)</Text>
                        {Object.entries(attrs)
                            .filter(([k, v]) => v != null && ATTR_LABELS[k])
                            .map(([k, v]) => (
                                <View key={k} style={styles.attrRow}>
                                    <Text style={styles.attrLabel}>{ATTR_LABELS[k]}</Text>
                                    <View style={styles.attrBarWrap}>
                                        <View style={[styles.attrBar, { width: `${Math.min(v,99)}%`, backgroundColor: attrColor(v) }]} />
                                    </View>
                                    <Text style={[styles.attrNum, { color: attrColor(v) }]}>{v}</Text>
                                </View>
                            ))
                        }
                    </View>
                )}

                {/* Valoraciones del informe */}
                {hasRatings && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Valoraciones del informe (1-10)</Text>
                        {Object.entries(ratings)
                            .filter(([, v]) => v != null)
                            .map(([k, v]) => (
                                <View key={k} style={styles.ratingRow}>
                                    <Text style={styles.ratingLabel}>{RATING_LABELS[k] || k}</Text>
                                    <View style={styles.ratingBarWrap}>
                                        <View style={[styles.ratingBar, { width: `${(v/10)*100}%` }]} />
                                    </View>
                                    <Text style={styles.ratingNum}>{v}</Text>
                                </View>
                            ))
                        }
                    </View>
                )}

                {/* Scouting */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Análisis de scouting</Text>
                    <View style={styles.grid2}>
                        <View style={styles.col}>
                            <DataRow label="Potencial" value={report.potential} />
                            <DataRow label="Techo"     value={report.ceiling}   />
                            <DataRow label="Preparado" value={report.readiness} />
                        </View>
                        <View style={styles.col}>
                            {report.secondaryPositions?.length > 0 && (
                                <DataRow label="Pos. secundarias" value={report.secondaryPositions.join(', ')} />
                            )}
                        </View>
                    </View>

                    {report.strengths?.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={[styles.dataLabel, { marginBottom: 4 }]}>Fortalezas</Text>
                            <View style={styles.tagRow}>
                                {report.strengths.map((s, i) => <Text key={i} style={styles.tagGreen}>{s}</Text>)}
                            </View>
                        </View>
                    )}
                    {report.weaknesses?.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={[styles.dataLabel, { marginBottom: 4 }]}>Debilidades</Text>
                            <View style={styles.tagRow}>
                                {report.weaknesses.map((w, i) => <Text key={i} style={styles.tagRed}>{w}</Text>)}
                            </View>
                        </View>
                    )}
                    {report.keyMoments?.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={[styles.dataLabel, { marginBottom: 4 }]}>Momentos clave</Text>
                            <View style={styles.tagRow}>
                                {report.keyMoments.map((m, i) => <Text key={i} style={styles.tagAmber}>⚡ {m}</Text>)}
                            </View>
                        </View>
                    )}
                </View>

                {/* Personalidad */}
                {hasPT && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personalidad</Text>
                        <View style={styles.grid2}>
                            <View style={styles.col}>
                                <DataRow label="Liderazgo"       value={pt.leadership      != null ? `${pt.leadership}/10`      : null} />
                                <DataRow label="Profesionalismo" value={pt.professionalism != null ? `${pt.professionalism}/10` : null} />
                            </View>
                            <View style={styles.col}>
                                <DataRow label="Adaptabilidad"   value={pt.adaptability    != null ? `${pt.adaptability}/10`    : null} />
                            </View>
                        </View>
                    </View>
                )}

                {/* Notas */}
                {report.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notas del scout</Text>
                        <View style={styles.notesBox}>
                            <Text style={styles.notesText}>{report.notes}</Text>
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>GODDACK ANALÍTICA — Informe de scouting</Text>
                    <Text style={styles.footerText}>{report.playerName} · {val(report.scoutName)} · {date}</Text>
                </View>

            </Page>
        </Document>
    );
};

export default ReportPDF;