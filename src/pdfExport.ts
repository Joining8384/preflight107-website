/**
 * pdfExport.ts  —  PreFlight 107 Official Flight Log PDF Generator
 *
 * Loads jsPDF + jspdf-autotable from cdnjs at runtime (no npm install needed).
 * Supports single-log and bulk (multi-page) export.
 *
 * ENCODING NOTE: jsPDF's built-in Helvetica/Courier fonts only support
 * Latin-1 (ISO-8859-1).  All section labels use plain ASCII only —
 * no emoji, no smart quotes, no Unicode symbols.
 */

// ── CDN loader ────────────────────────────────────────────────────────────────
const JSPDF_CDN     = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const AUTOTABLE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s  = document.createElement('script');
    s.src    = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

let _ready: Promise<any> | null = null;
async function getJsPDF(): Promise<any> {
  if (!_ready) {
    _ready = (async () => {
      await injectScript(JSPDF_CDN);
      await injectScript(AUTOTABLE_CDN);   // patches jsPDF.prototype.autoTable
      return (window as any).jspdf.jsPDF;
    })();
  }
  return _ready;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface WeatherData {
  wind?:        { value: number };
  temperature?: { value: number };
  gusts?:       { value: number };
}

export interface ExportableLog {
  id:                 string;
  timestamp:          number;
  drone_name:         string | null;
  duration:           number | null;
  gps_coords:         string | null;
  address:            string | null;
  mission_purpose:    string | null;
  weather_data:       WeatherData | null;
  notes:              string | null;
  maintenance_notes:  string | null;
  is_insured:         boolean;
  observed_wind:      number | null;
  insurance_provider: string | null;
  insurance_policy:   string | null;
  insurance_type:     string | null;
  client_name:        string | null;
  price_charged:      number | null;
  payment_status:     string | null;
  invoice_notes:      string | null;
}

// ── Colour palette (RGB tuples) — matches mobile app #111827 / #10B981 / #FBBF24
type RGB = [number, number, number];
const C = {
  ink:       [17,  24,  39]  as RGB,   // #111827
  emerald:   [16,  185, 129] as RGB,   // #10B981
  gold:      [251, 191, 36]  as RGB,   // #FBBF24
  ecdfgreen: [236, 253, 245] as RGB,   // #ECFDF5 — FAA badge bg
  white:     [255, 255, 255] as RGB,
  offwhite:  [249, 250, 251] as RGB,   // #F9FAFB
  border:    [229, 231, 235] as RGB,   // #E5E7EB
  linebdr:   [243, 244, 246] as RGB,   // #F3F4F6 — table row dividers
  muted:     [156, 163, 175] as RGB,   // #9CA3AF
  text:      [55,  65,  81]  as RGB,   // #374151
  dimtext:   [107, 114, 128] as RGB,   // #6B7280 — notes / dim values
  red:       [239, 68,  68]  as RGB,
};

// ── Text helpers ──────────────────────────────────────────────────────────────
function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
function fmtDuration(mins: number | null) {
  if (mins == null) return 'Not recorded';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m (${mins} min total)` : `${mins} min`;
}
function val(v: string | null | undefined, fallback = 'Not recorded') {
  return (v ?? '').trim() || fallback;
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE RENDERER  —  draws one complete log on the current jsPDF page
// ══════════════════════════════════════════════════════════════════════════════
function renderLog(
  doc:               any,
  log:               ExportableLog,
  pilotName:         string | null,
  logIndex:          number,          // 1-based
  totalLogs:         number,
  faaCert:           string | null,
  insurancePolicy:   string | null,
  insuranceProvider: string | null,
  insuranceType:     string | null,
): void {

  const PW     = doc.internal.pageSize.getWidth();   // 210 mm
  const PH     = doc.internal.pageSize.getHeight();  // 297 mm
  const MARGIN = 14;
  const CW     = PW - MARGIN * 2;                    // content width
  // Reserve bottom for cert block + footer
  const BODY_MAX = PH - 80;

  let y = 0;

  // ── Helper: set fill + text colours together ────────────────────────────────
  function fill(...rgb: RGB)  { doc.setFillColor(...rgb); }
  function ink(...rgb: RGB)   { doc.setTextColor(...rgb); }
  function draw(...rgb: RGB)  { doc.setDrawColor(...rgb); }

  // ── Helper: section heading band ────────────────────────────────────────────
  // accent defaults to emerald; pass C.gold for maintenance/insurance sections
  function sectionHeading(title: string, accent: RGB = C.emerald) {
    fill(...C.ink);
    doc.rect(MARGIN, y, CW, 7.5, 'F');
    fill(...accent);
    doc.rect(MARGIN, y, 3, 7.5, 'F');
    ink(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(title, MARGIN + 7, y + 5.1);
    y += 10.5;
  }

  // ── Helper: key-value row (alternating background) ──────────────────────────
  let _kvAlt = false;
  function kvRow(label: string, value: string) {
    _kvAlt = !_kvAlt;
    fill(...(_kvAlt ? C.offwhite : C.white));
    // Calculate text height first so we can size the row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(value, CW - 62) as string[];
    const rowH  = Math.max(7, lines.length * 4.2 + 3);
    doc.rect(MARGIN, y, CW, rowH, 'F');
    // Label
    ink(...C.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(label, MARGIN + 2, y + 4.8);
    // Value
    ink(...C.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(lines, MARGIN + 60, y + 4.8);
    y += rowH;
  }

  function divider() {
    draw(...C.linebdr);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, y, MARGIN + CW, y);
  }

  function gap(mm = 4) { y += mm; }

  // ────────────────────────────────────────────────────────────────────────────
  // HEADER BAND
  // ────────────────────────────────────────────────────────────────────────────
  // ── Dark header band (matches mobile: no edge stripes, clean ink bg) ────────
  fill(...C.ink);
  doc.rect(0, 0, PW, 36, 'F');

  // Circular logo mark
  fill(...C.emerald);
  doc.circle(MARGIN + 6, 18, 5, 'F');
  ink(...C.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('107', MARGIN + 3.3, 19.3);

  // App name
  ink(...C.white);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('PreFlight 107', MARGIN + 15, 15);

  // Sub-tagline
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  ink(...C.muted);
  doc.text('Drone Flight Operations & Compliance Record', MARGIN + 15, 22);

  // Right badge — #ECFDF5 bg + ink text (matches mobile "FAA PART 107" badge)
  const BADGE_W = 44;
  const BADGE_X = PW - MARGIN - BADGE_W;
  fill(...C.ecdfgreen);
  doc.roundedRect(BADGE_X, 11, BADGE_W, 14, 2, 2, 'F');
  ink(...C.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FAA PART 107', BADGE_X + BADGE_W / 2, 20, { align: 'center' });

  y = 38;

  // ────────────────────────────────────────────────────────────────────────────
  // PILOT INFO ROW  (taller, with subtle column dividers)
  // ────────────────────────────────────────────────────────────────────────────
  const INFO_H = 20;
  fill(...C.offwhite);
  doc.rect(0, y, PW, INFO_H, 'F');

  // Subtle column dividers
  draw(...C.border);
  doc.setLineWidth(0.2);
  doc.line(PW / 3, y + 3, PW / 3, y + INFO_H - 3);
  doc.line((2 * PW) / 3, y + 3, (2 * PW) / 3, y + INFO_H - 3);

  // Three columns
  const cols = [MARGIN, PW / 2, PW - MARGIN];
  const labels = ['PILOT IN COMMAND', 'FLIGHT DATE', 'DEPARTURE TIME'];
  const values = [
    val(pilotName, 'Unknown Pilot'),
    fmtDate(log.timestamp),
    fmtTime(log.timestamp),
  ];

  labels.forEach((lbl, i) => {
    const x     = cols[i];
    const align = i === 2 ? 'right' : 'left';
    ink(...C.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(lbl, x, y + 6, { align });
    ink(...C.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(values[i], x, y + 14, { align });
  });

  y = 64;

  // ────────────────────────────────────────────────────────────────────────────
  // SECTION 1 — FLIGHT DETAILS
  // ────────────────────────────────────────────────────────────────────────────
  sectionHeading('FLIGHT DETAILS', C.emerald);
  _kvAlt = false;

  kvRow('Aircraft / Drone',    val(log.drone_name, 'Not specified'));
  divider();
  kvRow('Flight Duration',     fmtDuration(log.duration));
  divider();
  kvRow('Mission Purpose',     val(log.mission_purpose));
  divider();
  kvRow('GPS Coordinates',     val(log.gps_coords));
  divider();
  kvRow('Location / Address',  val(log.address));

  gap(5);

  // ────────────────────────────────────────────────────────────────────────────
  // SECTION 2 — WEATHER CONDITIONS
  // ────────────────────────────────────────────────────────────────────────────
  sectionHeading('WEATHER CONDITIONS AT DEPARTURE', C.emerald);

  const wd       = log.weather_data;
  const windVal  = log.observed_wind ?? wd?.wind?.value;
  const tempVal  = wd?.temperature?.value;
  const gustsVal = wd?.gusts?.value;

  if (!wd && windVal == null) {
    ink(...C.muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('No weather data was recorded for this flight.', MARGIN + 2, y + 4);
    gap(10);
  } else {
    const wxHead: string[][] = [['Metric', 'Recorded Value', 'Data Source']];
    const wxBody: string[][] = [];
    if (tempVal  != null) wxBody.push(['Temperature',  `${tempVal}°F`,    'Open-Meteo API']);
    if (windVal  != null) wxBody.push(['Wind Speed',   `${windVal} mph`,  'Open-Meteo API']);
    if (gustsVal != null) wxBody.push(['Wind Gusts',   `${gustsVal} mph`, 'Open-Meteo API']);
    if (wxBody.length === 0) wxBody.push(['All metrics', 'Not available', '—']);

    doc.autoTable({
      startY:  y,
      margin:  { left: MARGIN, right: MARGIN },
      head:    wxHead,
      body:    wxBody,
      theme:   'grid',
      headStyles: {
        fillColor:   C.emerald,
        textColor:   C.ink,
        fontStyle:   'bold',
        fontSize:    7.5,
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize:    8.5,
        cellPadding: 5,
        textColor:   C.text,
      },
      alternateRowStyles: { fillColor: C.offwhite },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 46 },
        1: { cellWidth: 52 },
        2: { textColor: C.muted, fontStyle: 'italic' },
      },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SECTION 3 — INSURANCE & LIABILITY
  // ────────────────────────────────────────────────────────────────────────────
  sectionHeading('INSURANCE & LIABILITY', C.gold);
  _kvAlt = false;

  if (!log.is_insured) {
    fill(...C.offwhite);
    doc.rect(MARGIN, y, CW, 8, 'F');
    ink(...C.muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(
      'This flight was conducted without active drone insurance on record.',
      MARGIN + 2, y + 5.2,
    );
    gap(12);
  } else {
    kvRow('Coverage Status',    'INSURED');
    divider();
    kvRow('Insurance Provider', val(log.insurance_provider));
    divider();
    kvRow('Coverage Type',      val(log.insurance_type));
    divider();
    kvRow('Policy Number',      val(log.insurance_policy));
    gap(5);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SECTION 4 — NOTES & MAINTENANCE (only if present)
  // ────────────────────────────────────────────────────────────────────────────
  const hasNotes = (log.notes             ?? '').trim().length > 0;
  const hasMaint = (log.maintenance_notes ?? '').trim().length > 0;

  if (hasNotes || hasMaint) {
    sectionHeading('NOTES & MAINTENANCE RECORD', C.gold);

    if (hasNotes) {
      ink(...C.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('FLIGHT NOTES', MARGIN + 2, y + 3);
      gap(6);
      ink(...C.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const noteLines = doc.splitTextToSize(log.notes!, CW - 4) as string[];
      doc.text(noteLines, MARGIN + 2, y);
      gap(noteLines.length * 4.5 + 3);
    }

    if (hasMaint) {
      if (hasNotes) { divider(); gap(3); }
      ink(...C.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('MAINTENANCE LOG', MARGIN + 2, y + 3);
      gap(6);
      ink(...C.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const mLines = doc.splitTextToSize(log.maintenance_notes!, CW - 4) as string[];
      doc.text(mLines, MARGIN + 2, y);
      gap(mLines.length * 4.5 + 3);
    }

    gap(3);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SECTION 5 — BILLING & CLIENT INFO (only if any billing data present)
  // ────────────────────────────────────────────────────────────────────────────
  const hasBilling = log.client_name || log.price_charged != null || log.payment_status || log.invoice_notes;
  if (hasBilling) {
    sectionHeading('BILLING & CLIENT INFO', C.emerald);
    _kvAlt = false;

    kvRow('Client Name',      val(log.client_name));
    divider();
    kvRow('Price Charged',    log.price_charged != null ? `$${Number(log.price_charged).toFixed(2)}` : 'Not recorded');
    divider();
    kvRow('Payment Status',   val(log.payment_status, 'Unpaid'));

    if ((log.invoice_notes ?? '').trim()) {
      divider();
      kvRow('Invoice Notes',  val(log.invoice_notes));
    }
    gap(5);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PILOT CERTIFICATION BLOCK
  // Pinned to a fixed Y so it always appears at the bottom of every page.
  // Required for Part 107 compliance — every individual log entry must carry
  // the pilot's certification statement.
  // ────────────────────────────────────────────────────────────────────────────
  const CERT_Y = PH - 62;

  // Section heading band — matches mobile PILOT'S CERTIFICATION style
  fill(...C.ink);
  doc.rect(MARGIN, CERT_Y, CW, 7.5, 'F');
  fill(...C.emerald);
  doc.rect(MARGIN, CERT_Y, 3, 7.5, 'F');
  ink(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PILOT\'S CERTIFICATION', MARGIN + 7, CERT_Y + 5.1);

  // Certification text
  const certText = [
    'I certify that the above flight records are true and correct to the best of my knowledge,',
    'and that this flight was conducted in full compliance with 14 CFR Part 107.',
  ];
  ink(...C.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(certText, MARGIN + 2, CERT_Y + 13);

  // Signature lines — taller (matches mobile 28px height)
  const SIG_Y = CERT_Y + 29;
  draw(...C.text);
  doc.setLineWidth(0.4);
  doc.line(MARGIN,      SIG_Y, MARGIN + 72,      SIG_Y);  // signature
  doc.line(MARGIN + 80, SIG_Y, MARGIN + 130,     SIG_Y);  // date
  ink(...C.muted);
  doc.setFontSize(6.5);
  doc.text('Pilot Signature',  MARGIN,      SIG_Y + 4);
  doc.text('Date',             MARGIN + 80, SIG_Y + 4);

  // ────────────────────────────────────────────────────────────────────────────
  // TWO-TIER FOOTER — matches mobile app exactly
  //   Tier 1: offwhite pilot info band (#F9FAFB)
  //   Tier 2: ink document footer (#111827)
  // ────────────────────────────────────────────────────────────────────────────
  const hasCert     = !!faaCert;
  const hasIns      = !!(insurancePolicy || insuranceProvider || insuranceType);
  const hasPilotRow = hasCert || hasIns;

  // Tier 2 — dark document footer (always present, 12mm)
  const DOC_FH = 12;
  const DOC_FY = PH - DOC_FH;
  fill(...C.ink);
  doc.rect(0, DOC_FY, PW, DOC_FH, 'F');
  const genLine   = `Generated by PreFlight 107  |  ${new Date().toLocaleString()}  |  Log ID: ${log.id.slice(0, 8).toUpperCase()}`;
  const pageLabel = totalLogs > 1 ? `Record ${logIndex} of ${totalLogs}` : 'Page 1 of 1';
  ink(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text(genLine,   MARGIN,      DOC_FY + 7.5);
  doc.text(pageLabel, PW - MARGIN, DOC_FY + 7.5, { align: 'right' });

  // Tier 1 — offwhite pilot info band (only when credentials exist, 14mm)
  if (hasPilotRow) {
    const PIL_FH = 14;
    const PIL_FY = DOC_FY - PIL_FH;
    fill(...C.offwhite);
    doc.rect(0, PIL_FY, PW, PIL_FH, 'F');
    draw(...C.border);
    doc.setLineWidth(0.3);
    doc.line(0, PIL_FY, PW, PIL_FY);

    let px = MARGIN;
    if (hasCert) {
      ink(...C.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('FAA PART 107 CERTIFICATE:', px, PIL_FY + 5.5);
      ink(...C.ink);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(faaCert!, px, PIL_FY + 11);
      px += 68;
    }
    if (hasIns) {
      const insParts: string[] = [];
      if (insuranceProvider) insParts.push(insuranceProvider);
      if (insurancePolicy)   insParts.push(insurancePolicy);
      if (insuranceType)     insParts.push(`(${insuranceType})`);
      ink(...C.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('INSURANCE:', px, PIL_FY + 5.5);
      ink(...C.ink);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(insParts.join(' \xb7 '), px, PIL_FY + 11);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Export one or more flight logs as a single PDF file.
 * Each log occupies its own page with a full header, sections,
 * certification block, and footer.
 */
export async function exportFlightLogsPDF(
  logs:              ExportableLog[],
  pilotName:         string | null,
  faaCert:           string | null = null,
  insurancePolicy:   string | null = null,
  insuranceProvider: string | null = null,
  insuranceType:     string | null = null,
): Promise<void> {
  if (logs.length === 0) throw new Error('No logs selected for export.');

  const JsPDF = await getJsPDF();
  const doc   = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  logs.forEach((log, i) => {
    if (i > 0) doc.addPage();
    renderLog(doc, log, pilotName, i + 1, logs.length, faaCert, insurancePolicy, insuranceProvider, insuranceType);
  });

  // File name
  const pilotSlug = (pilotName ?? 'pilot').toLowerCase().replace(/\s+/g, '-');
  const datePart  = logs.length === 1
    ? new Date(logs[0].timestamp).toISOString().slice(0, 10)
    : `batch-${logs.length}-logs`;
  doc.save(`preflight107-${pilotSlug}-${datePart}.pdf`);
}

/**
 * Convenience wrapper: export a single flight log.
 */
export async function exportFlightLogPDF(
  log:               ExportableLog,
  pilotName:         string | null,
  faaCert:           string | null = null,
  insurancePolicy:   string | null = null,
  insuranceProvider: string | null = null,
  insuranceType:     string | null = null,
): Promise<void> {
  return exportFlightLogsPDF([log], pilotName, faaCert, insurancePolicy, insuranceProvider, insuranceType);
}
// ══════════════════════════════════════════════════════════════════════════════
// FAA COMPLIANCE LOGBOOK  —  HTML-based printer (matches mobile app exactly)
// Generates the same HTML template as buildFAALogbookHTML in HangarScreen.js
// ══════════════════════════════════════════════════════════════════════════════

export interface MaintenanceLogRow {
  id:               string;
  drone_id:         string;
  service_type:     string;
  hours_at_service: number;
  notes:            string | null;
  created_at:       string;
}

/** Full drone object — used to display FAA REG # and SERIAL # in the header */
export interface LogbookDrone {
  id:              string;
  name:            string | null;
  faa_reg_number?: string | null;
  serial_number?:  string | null;
}

/** Pre-flight record — same shape as the preflight_history Supabase table */
export interface LogbookPreflightRecord {
  completed_at?:  string | null;
  created_at:     string;
  checklist_data: Record<string, boolean> | null;
  latitude:       number | null;
  longitude:      number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal builder — generates the same HTML as the mobile buildFAALogbookHTML
// ─────────────────────────────────────────────────────────────────────────────
function buildLogbookHTML(
  logs:             MaintenanceLogRow[],
  droneMap:         Record<string, string>,
  pilotName:        string | null,
  pilotCert:        string | null,
  pilotInsurance:   string | null,
  pilotInsProvider: string | null,
  pilotInsType:     string | null,
  drones:           LogbookDrone[],
  preflightHistory: LogbookPreflightRecord[],
): string {
  const genTimestamp = new Date().toLocaleString([], {
    month: 'numeric', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  const primaryDrone  = drones.length === 1 ? drones[0] : null;
  const aircraftLabel = drones.length === 1
    ? (drones[0].name ?? 'Unknown')
    : drones.length > 1 ? `${drones.length} Aircraft` : 'Unknown';
  const faaRegDisplay = primaryDrone?.faa_reg_number ?? null;
  const serialDisplay = primaryDrone?.serial_number  ?? null;
  const multiDrone    = drones.length > 1;

  const maintRows = logs.length > 0
    ? logs.map((r, i) => {
        const bg      = i % 2 === 1 ? '#F9FAFB' : '#FFFFFF';
        const dateStr = new Date(r.created_at).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric',
        });
        const droneCell = multiDrone
          ? `<td style="padding:9px 14px;font-size:11px;border-bottom:1px solid #F3F4F6;">${droneMap[r.drone_id] ?? '\u2014'}</td>`
          : '';
        const notes = r.notes
          ? (r.notes.length > 100 ? r.notes.substring(0, 100) + '...' : r.notes)
          : '\u2014';
        return `<tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:${bg};">
          <td style="padding:9px 14px;font-size:11px;border-bottom:1px solid #F3F4F6;">${dateStr}</td>
          ${droneCell}
          <td style="padding:9px 14px;font-size:11px;font-weight:700;border-bottom:1px solid #F3F4F6;">${r.service_type || '\u2014'}</td>
          <td style="padding:9px 14px;font-size:11px;border-bottom:1px solid #F3F4F6;">${r.hours_at_service != null ? Number(r.hours_at_service).toFixed(1) + 'h' : '\u2014'}</td>
          <td style="padding:9px 14px;font-size:11px;color:#6B7280;border-bottom:1px solid #F3F4F6;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;">${notes}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="${multiDrone ? 5 : 4}" style="padding:12px;text-align:center;color:#9CA3AF;font-size:11px;">No maintenance records</td></tr>`;

  const preflightRows = preflightHistory.length > 0
    ? preflightHistory.map((r, i) => {
        const bg      = i % 2 === 1 ? '#F9FAFB' : '#FFFFFF';
        const d       = new Date(r.completed_at ?? r.created_at);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const checked = r.checklist_data ? Object.values(r.checklist_data).filter(Boolean).length : 0;
        const total   = r.checklist_data ? Object.keys(r.checklist_data).length : 0;
        const gps     = r.latitude != null
          ? `${Number(r.latitude).toFixed(4)}, ${Number(r.longitude).toFixed(4)}`
          : '\u2014';
        return `<tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:${bg};">
          <td style="padding:9px 14px;font-size:11px;border-bottom:1px solid #F3F4F6;">${dateStr}</td>
          <td style="padding:9px 14px;font-size:11px;border-bottom:1px solid #F3F4F6;">${timeStr}</td>
          <td style="padding:9px 14px;font-size:11px;border-bottom:1px solid #F3F4F6;">${checked}/${total}</td>
          <td style="padding:9px 14px;font-size:11px;color:#6B7280;border-bottom:1px solid #F3F4F6;">${gps}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#9CA3AF;font-size:11px;">No preflight records</td></tr>`;

  const insString = [pilotInsProvider, pilotInsurance, pilotInsType ? `(${pilotInsType})` : null]
    .filter(Boolean).join(' \u00b7 ');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { margin: 0; size: A4 portrait; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
        box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 210mm; font-family: Helvetica, Arial, sans-serif; background: #fff; }
  </style></head><body>
  <div style="font-family:Helvetica,Arial,sans-serif;">
    <div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#111827;padding:18px 36px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#10B981;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#111827;font-size:15px;font-weight:800;">107</div>
        <div>
          <div style="color:#fff;font-size:20px;font-weight:800;">PreFlight 107 \u2014 FAA Compliance Logbook</div>
          <div style="color:#9CA3AF;font-size:11px;margin-top:2px;">Drone Maintenance &amp; Pre-Flight History</div>
        </div>
      </div>
      <div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#ECFDF5;color:#111827;font-size:11px;font-weight:800;padding:8px 16px;border-radius:8px;">FAA PART 107</div>
    </div>
    <div style="padding:16px 36px;display:flex;gap:28px;flex-wrap:wrap;border-bottom:1px solid #E5E7EB;">
      <div>
        <div style="color:#9CA3AF;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">PILOT</div>
        <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${pilotName || 'Pilot'}</div>
      </div>
      ${pilotCert ? `<div>
        <div style="color:#9CA3AF;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">FAA PART 107 CERTIFICATE</div>
        <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${pilotCert}</div>
      </div>` : ''}
      ${insString ? `<div>
        <div style="color:#9CA3AF;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">INSURANCE</div>
        <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${insString}</div>
      </div>` : ''}
      <div>
        <div style="color:#9CA3AF;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">AIRCRAFT</div>
        <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${aircraftLabel}</div>
      </div>
      ${faaRegDisplay ? `<div>
        <div style="color:#9CA3AF;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">FAA REG #</div>
        <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${faaRegDisplay}</div>
      </div>` : ''}
      ${serialDisplay ? `<div>
        <div style="color:#9CA3AF;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">SERIAL #</div>
        <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${serialDisplay}</div>
      </div>` : ''}
      <div>
        <div style="color:#9CA3AF;font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">REPORT DATE</div>
        <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${genTimestamp}</div>
      </div>
    </div>
    <div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#111827;color:#fff;border-left:6px solid #FBBF24;padding:8px 14px;margin:16px 36px 0;font-size:11px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;">MAINTENANCE HISTORY</div>
    <div style="padding:0 36px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#FBBF24;">
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#111827;">Date</th>
            ${multiDrone ? '<th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#111827;">Drone</th>' : ''}
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#111827;">Service Type</th>
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#111827;">Hours</th>
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#111827;">Notes</th>
          </tr>
        </thead>
        <tbody>${maintRows}</tbody>
      </table>
    </div>
    <div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#111827;color:#fff;border-left:6px solid #10B981;padding:8px 14px;margin:24px 36px 0;font-size:11px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;">PRE-FLIGHT CHECK HISTORY</div>
    <div style="padding:0 36px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#10B981;">
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#fff;">Date</th>
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#fff;">Time</th>
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#fff;">Checks (\u2713/total)</th>
            <th style="padding:8px 12px;font-size:10px;font-weight:700;text-align:left;color:#fff;">GPS Coords</th>
          </tr>
        </thead>
        <tbody>${preflightRows}</tbody>
      </table>
    </div>
    <div style="padding:20px 36px;margin-top:24px;border-top:2px solid #E5E7EB;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;color:#111827;margin-bottom:12px;">PILOT'S CERTIFICATION</div>
      <div style="font-size:10px;color:#4B5563;line-height:1.6;margin-bottom:24px;">I certify that the above maintenance and pre-flight records are true and correct to the best of my knowledge.</div>
      <div style="display:flex;gap:36px;">
        <div style="flex:1;">
          <div style="border-bottom:1.5px solid #374151;margin-bottom:4px;height:28px;"></div>
          <div style="font-size:10px;color:#9CA3AF;">Pilot Signature</div>
        </div>
        <div style="flex:1;">
          <div style="border-bottom:1.5px solid #374151;margin-bottom:4px;height:28px;"></div>
          <div style="font-size:10px;color:#9CA3AF;">Date</div>
        </div>
      </div>
    </div>
    ${(pilotCert || insString) ? `<div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#F9FAFB;border-top:1px solid #E5E7EB;padding:12px 36px;display:flex;gap:36px;flex-wrap:wrap;">
      ${pilotCert ? `<div><span style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.6px;">FAA PART 107 CERTIFICATE: </span><span style="font-size:11px;font-weight:700;color:#111827;">${pilotCert}</span></div>` : ''}
      ${insString ? `<div><span style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.6px;">INSURANCE: </span><span style="font-size:11px;font-weight:700;color:#111827;">${insString}</span></div>` : ''}
    </div>` : ''}
    <div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background-color:#111827;color:#9CA3AF;font-size:9px;padding:10px 36px;display:flex;justify-content:space-between;">
      <span>Generated by PreFlight 107  |  ${genTimestamp}</span>
      <span>FAA Part 107 Compliance Document</span>
    </div>
  </div>
  </body></html>`;
}


// ─────────────────────────────────────────────────────────────────────────────
/**
 * Exports an FAA Compliance Logbook matching the mobile app PDF design.
 * Opens a new browser tab with the logbook HTML and triggers the print dialog.
 */
export async function exportMaintenanceLogsPDF(
  logs:              MaintenanceLogRow[],
  droneMap:          Record<string, string>,
  pilotName:         string | null,
  faaCert:           string | null            = null,
  insurancePolicy:   string | null            = null,
  insuranceProvider: string | null            = null,
  insuranceType:     string | null            = null,
  drones:            LogbookDrone[]           = [],
  preflightHistory:  LogbookPreflightRecord[] = [],
): Promise<void> {
  if (logs.length === 0 && preflightHistory.length === 0) {
    throw new Error('No records to export.');
  }
  const html = buildLogbookHTML(
    logs, droneMap, pilotName, faaCert,
    insurancePolicy, insuranceProvider, insuranceType,
    drones, preflightHistory,
  );
  const w = window.open('', '_blank');
  if (!w) throw new Error('Pop-up blocked — please allow pop-ups for this site.');
  w.document.write(html);
  w.document.close();
}
export interface DroneHealthRow {
  name:          string;
  faaReg?:       string;
  totalHours:    number;
  propHoursUsed: number;
  propInterval:  number | null;
  propHealthPct: number | null;
}

export interface BatteryReportRow {
  name:        string;
  cycleCount:  number;
  droneName:   string | null;
  capacityMah: number | null;
}

/**
 * Generates a printable Fleet Maintenance Report PDF.
 * Includes a drone maintenance summary (propeller health) and a battery
 * status table with cycle counts — designed for Part 107 professionals.
 */
export async function exportFleetReportPDF(
  drones:            DroneHealthRow[],
  batteries:         BatteryReportRow[],
  pilotName:         string | null,
  faaCert:           string | null = null,
  insurancePolicy:   string | null = null,
  insuranceProvider: string | null = null,
  insuranceType:     string | null = null,
): Promise<void> {
  const JsPDF = await getJsPDF();
  const doc   = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW     = doc.internal.pageSize.getWidth();
  const PH     = doc.internal.pageSize.getHeight();
  const MARGIN = 14;
  const CW     = PW - MARGIN * 2;
  let   y      = 0;

  // ── Header band (no edge stripes — matches mobile clean dark band) ──────────
  doc.setFillColor(...C.ink);
  doc.rect(0, 0, PW, 36, 'F');

  // Logo circle
  doc.setFillColor(...C.emerald);
  doc.circle(MARGIN + 6, 18, 5, 'F');
  doc.setTextColor(...C.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('107', MARGIN + 3.3, 19.3);

  // App name
  doc.setTextColor(...C.white);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('PreFlight 107', MARGIN + 15, 15);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text('FAA Part 107 Compliant Fleet Management System', MARGIN + 15, 22);

  // Badge — #ECFDF5 bg + ink text (matches mobile style)
  const BADGE_W = 44;
  const BADGE_X = PW - MARGIN - BADGE_W;
  doc.setFillColor(...C.ecdfgreen);
  doc.roundedRect(BADGE_X, 11, BADGE_W, 14, 2, 2, 'F');
  doc.setTextColor(...C.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FLEET REPORT', BADGE_X + BADGE_W / 2, 20, { align: 'center' });

  // ── Pilot info row (taller, with subtle column divider) ─────────────────────
  y = 36;
  doc.setFillColor(...C.offwhite);
  doc.rect(0, y, PW, 20, 'F');

  // Subtle column divider (2 columns — pilot + generated)
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.line(PW / 2, y + 3, PW / 2, y + 17);

  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('PILOT IN COMMAND', MARGIN,      y + 6);
  doc.text('REPORT GENERATED', PW - MARGIN, y + 6, { align: 'right' });
  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(pilotName ?? 'Unknown Pilot', MARGIN, y + 14);
  doc.text(
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    PW - MARGIN, y + 14, { align: 'right' },
  );

  y = 62;

  // ── Helper: section heading band ────────────────────────────────────────────
  function sectionHeading(title: string) {
    doc.setFillColor(...C.ink);
    doc.rect(MARGIN, y, CW, 7.5, 'F');
    doc.setFillColor(...C.emerald);
    doc.rect(MARGIN, y, 3, 7.5, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(title, MARGIN + 7, y + 5.1);
    y += 10.5;
  }

  // ── Section 1: Drone Fleet Maintenance Summary ───────────────────────────────
  sectionHeading('DRONE FLEET - MAINTENANCE SUMMARY');

  if (drones.length === 0) {
    doc.setTextColor(...C.muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('No drones registered in the fleet.', MARGIN + 2, y + 5);
    y += 12;
  } else {
    const droneHead: string[][] = [['Drone Name', 'FAA Reg', 'Total Hrs', 'Prop Hrs Used / Interval', 'Health']];
    const droneBody: string[][] = drones.map(d => {
      const healthStr = d.propHealthPct != null
        ? `${Math.min(d.propHealthPct, 999).toFixed(0)}%`
        : 'N/A';
      const propStr = d.propInterval != null
        ? `${d.propHoursUsed.toFixed(1)} / ${d.propInterval} hr`
        : 'N/A';
      return [
        d.name,
        d.faaReg ?? '--',
        `${d.totalHours.toFixed(1)} hr`,
        propStr,
        healthStr,
      ];
    });

    doc.autoTable({
      startY:  y,
      margin:  { left: MARGIN, right: MARGIN },
      head:    droneHead,
      body:    droneBody,
      theme:   'grid',
      headStyles: {
        fillColor:   C.emerald,
        textColor:   C.ink,
        fontStyle:   'bold',
        fontSize:    7.5,
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize:    8,
        cellPadding: 5,
        textColor:   C.text,
      },
      alternateRowStyles: { fillColor: C.offwhite },
      columnStyles: {
        0: { fontStyle: 'bold' },
        4: { fontStyle: 'bold', halign: 'center' },
      },
      didParseCell: (data: any) => {
        if (data.section !== 'body' || data.column.index !== 4) return;
        const pct = drones[data.row.index]?.propHealthPct;
        if (pct == null) return;
        if      (pct >= 100) data.cell.styles.textColor = C.red;
        else if (pct >= 80)  data.cell.styles.textColor = [251, 191, 36] as RGB;
        else                 data.cell.styles.textColor = C.emerald;
      },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Section 2: Battery Status ────────────────────────────────────────────────
  sectionHeading('BATTERY STATUS');

  if (batteries.length === 0) {
    doc.setTextColor(...C.muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('No batteries registered.', MARGIN + 2, y + 5);
    y += 12;
  } else {
    const batHead: string[][] = [['Battery Name', 'Assigned Drone', 'Capacity', 'Charge Cycles']];
    const batBody: string[][] = batteries.map(b => [
      b.name,
      b.droneName ?? '--',
      b.capacityMah != null ? `${b.capacityMah.toLocaleString()} mAh` : '--',
      String(b.cycleCount),
    ]);

    doc.autoTable({
      startY:  y,
      margin:  { left: MARGIN, right: MARGIN },
      head:    batHead,
      body:    batBody,
      theme:   'grid',
      headStyles: {
        fillColor:   C.emerald,
        textColor:   C.ink,
        fontStyle:   'bold',
        fontSize:    7.5,
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize:    8,
        cellPadding: 5,
        textColor:   C.text,
      },
      alternateRowStyles: { fillColor: C.offwhite },
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { fontStyle: 'bold', halign: 'center' },
      },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Footer — two-tier (offwhite pilot info + ink doc footer) ──────────────────
  const fCredParts: string[] = [];
  if (faaCert) fCredParts.push(faaCert);
  if (insurancePolicy || insuranceProvider || insuranceType) {
    const parts: string[] = [];
    if (insuranceProvider) parts.push(insuranceProvider);
    if (insurancePolicy)   parts.push(insurancePolicy);
    if (insuranceType)     parts.push(`(${insuranceType})`);
    fCredParts.push(parts.join(' \xb7 '));
  }
  const fHasCert = !!faaCert;
  const fHasIns  = !!(insurancePolicy || insuranceProvider || insuranceType);
  const fHasPil  = fHasCert || fHasIns;

  const F_DOC_FH = 12;
  const F_DOC_FY = PH - F_DOC_FH;
  doc.setFillColor(...C.ink);
  doc.rect(0, F_DOC_FY, PW, F_DOC_FH, 'F');
  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text(
    `Generated by PreFlight 107  |  ${new Date().toLocaleString()}  |  Fleet Maintenance Report`,
    MARGIN, F_DOC_FY + 7.5,
  );
  doc.text('Page 1 of 1', PW - MARGIN, F_DOC_FY + 7.5, { align: 'right' });

  if (fHasPil) {
    const F_PIL_FH = 14;
    const F_PIL_FY = F_DOC_FY - F_PIL_FH;
    doc.setFillColor(...C.offwhite);
    doc.rect(0, F_PIL_FY, PW, F_PIL_FH, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(0, F_PIL_FY, PW, F_PIL_FY);
    let fx = MARGIN;
    if (fHasCert) {
      doc.setTextColor(...C.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('FAA PART 107 CERTIFICATE:', fx, F_PIL_FY + 5.5);
      doc.setTextColor(...C.ink);
      doc.setFontSize(8);
      doc.text(faaCert!, fx, F_PIL_FY + 11);
      fx += 68;
    }
    if (fHasIns) {
      const insParts: string[] = [];
      if (insuranceProvider) insParts.push(insuranceProvider);
      if (insurancePolicy)   insParts.push(insurancePolicy);
      if (insuranceType)     insParts.push(`(${insuranceType})`);
      doc.setTextColor(...C.muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('INSURANCE:', fx, F_PIL_FY + 5.5);
      doc.setTextColor(...C.ink);
      doc.setFontSize(8);
      doc.text(insParts.join(' \xb7 '), fx, F_PIL_FY + 11);
    }
  }

  const pilotSlug = (pilotName ?? 'pilot').toLowerCase().replace(/\s+/g, '-');
  const datePart  = new Date().toISOString().slice(0, 10);
  doc.save(`preflight107-${pilotSlug}-fleet-report-${datePart}.pdf`);
}
