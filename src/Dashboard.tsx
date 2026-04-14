import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';
import {
    BatteryReportRow,
    DroneHealthRow,
    exportFleetReportPDF,
    exportFlightLogPDF, exportFlightLogsPDF,
    exportMaintenanceLogsPDF, MaintenanceLogRow,
} from './pdfExport';
import {
    deleteRow, fetchTable, fetchUserIdentities, getLinkIdentityUrl,
    Identity, insertRow, updateRow,
} from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface WeatherData {
  wind?:        { value: number };
  temperature?: { value: number };
  gusts?:       { value: number };
}

interface FlightLog {
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

interface Drone {
  id:                           string;
  name:                         string | null;
  faa_reg_number:               string | null;
  serial_number:                string | null;
  created_at:                   string;
  // Legacy fields (kept for DB compat — not surfaced in UI)
  last_propeller_change_hours:  number | null;
  propeller_service_interval:   number | null;
  model:                        string | null;
  // Mission Readiness fields (synced with mobile app)
  prop_service_interval:        number;
  airframe_service_interval:    number;
  battery_max_cycles:           number;
  last_prop_service_hours:      number;
  last_airframe_service_hours:  number;
}

interface Battery {
  id:           string;
  drone_id:     string | null;
  name:         string | null;
  cycle_count:  number;
  capacity_mah: number | null;
  created_at:   string;
}

interface MaintenanceLog {
  id:               string;
  drone_id:         string;
  service_type:     'Propellers' | 'Airframe';
  hours_at_service: number;
  notes:            string | null;
  created_at:       string;
}

interface PreflightRecord {
  id:               string;
  drone_id:         string | null;
  location_name:    string | null;
  latitude:         number | null;
  longitude:        number | null;
  weather_snapshot: Record<string, unknown> | null;
  checklist_data:   Record<string, boolean> | null;
  created_at:       string;
}

interface Profile {
  full_name:           string | null;
  subscription_status: string | null;
  total_flight_hours:  number | null;
  pilot_license_type:  string | null;
  faa_certificate:     string | null;
  insurance_policy:    string | null;
  insurance_provider:  string | null;
  insurance_type:      string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FREE_LOG_LIMIT = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
function totalHours(logs: FlightLog[]) {
  const mins = logs.reduce((s, l) => s + (l.duration ?? 0), 0);
  return (mins / 60).toFixed(1);
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent = false }: {
  icon: string; label: string; value: string; accent?: boolean;
}) {
  return (
    <div className={`db-stat-card${accent ? ' db-stat-card--accent' : ''}`}>
      <span className="db-stat-icon">{icon}</span>
      <div>
        <div className="db-stat-value">{value}</div>
        <div className="db-stat-label">{label}</div>
      </div>
    </div>
  );
}

// ── Flight log row ─────────────────────────────────────────────────────────────
function LogRow({
  log, onDelete, isPro, pilotName, faaCert, insurancePolicy, insuranceProvider, insuranceType, isSelected, onToggleSelect,
}: {
  log:               FlightLog;
  onDelete:          (id: string) => void;
  isPro:             boolean;
  pilotName:         string | null;
  faaCert:           string | null;
  insurancePolicy:   string | null;
  insuranceProvider: string | null;
  insuranceType:     string | null;
  isSelected:        boolean;
  onToggleSelect:    (id: string) => void;
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [exporting,   setExporting]   = useState(false);
  const [exportError, setExportError] = useState('');
  const [confirming,  setConfirming]  = useState(false);  // inline delete confirm
  const wind = log.observed_wind ?? log.weather_data?.wind?.value ?? null;
  const temp = log.weather_data?.temperature?.value ?? null;

  async function handleExport(e: React.MouseEvent) {
    e.stopPropagation();
    setExporting(true);
    setExportError('');
    try {
      await exportFlightLogPDF(log, pilotName, faaCert, insurancePolicy, insuranceProvider, insuranceType);
    } catch (err: any) {
      console.error('[PreFlight107] PDF export error:', err);
      setExportError('PDF generation failed — check console.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <tr
        className={`db-log-row${expanded ? ' db-log-row--open' : ''}${isSelected ? ' db-log-row--selected' : ''}`}
        onClick={() => { if (!confirming) setExpanded(e => !e); }}
      >
        {/* Checkbox — stopPropagation so it doesn't toggle expand */}
        <td className="db-col-check" onClick={e => e.stopPropagation()}>
          <label className="db-checkbox-wrap">
            <input
              type="checkbox"
              className="db-checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(log.id)}
              aria-label={`Select log from ${fmt(log.timestamp)}`}
            />
            <span className="db-checkbox-box" />
          </label>
        </td>
        <td>
          <div className="db-log-date">{fmt(log.timestamp)}</div>
          <div className="db-log-time">{fmtTime(log.timestamp)}</div>
        </td>
        <td>{log.drone_name ?? <span className="db-muted">—</span>}</td>
        <td>{log.duration != null ? `${log.duration} min` : <span className="db-muted">—</span>}</td>
        <td>
          {wind != null ? <span>{wind} mph</span> : <span className="db-muted">—</span>}
          {temp != null && <span className="db-temp"> · {temp}°F</span>}
        </td>
        <td>{log.mission_purpose ?? <span className="db-muted">—</span>}</td>
        <td>{log.client_name ?? <span className="db-muted">—</span>}</td>
        <td>
          {log.payment_status ? (
            <span className={`db-badge ${
              log.payment_status === 'Paid'    ? 'db-badge--green' :
              log.payment_status === 'Pending' ? 'db-badge--yellow' :
                                                 'db-badge--gray'
            }`}>
              {log.payment_status}
            </span>
          ) : (
            <span className="db-muted">—</span>
          )}
        </td>
        <td>
          <span className={`db-badge ${log.is_insured ? 'db-badge--green' : 'db-badge--gray'}`}>
            {log.is_insured ? 'Insured' : 'Uninsured'}
          </span>
        </td>
        <td className="db-actions" onClick={e => e.stopPropagation()}>
          {confirming ? (
            /* ── Inline delete confirmation ── */
            <div className="db-delete-confirm">
              <span className="db-delete-confirm__msg">Delete?</span>
              <button
                className="db-delete-confirm__yes"
                onClick={() => { setConfirming(false); onDelete(log.id); }}
              >Yes</button>
              <button
                className="db-delete-confirm__no"
                onClick={() => setConfirming(false)}
              >No</button>
            </div>
          ) : (
            <>
              <button
                className="db-btn-icon db-btn-icon--trash"
                title="Delete this log"
                onClick={() => setConfirming(true)}
              >🗑</button>
              <button
                className="db-btn-chevron"
                onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >{expanded ? '▲' : '▼'}</button>
            </>
          )}
        </td>
      </tr>

      {expanded && (
        <tr className="db-log-detail">
          <td colSpan={10}>
            <div className="db-detail-grid">
              {log.gps_coords && (
                <div className="db-detail-item">
                  <span className="db-detail-label">📍 GPS</span>
                  <a
                    href={`https://maps.google.com/?q=${log.gps_coords}`}
                    target="_blank"
                    rel="noreferrer"
                    className="db-detail-link"
                  >{log.gps_coords}</a>
                </div>
              )}
              {log.address && (
                <div className="db-detail-item">
                  <span className="db-detail-label">🏙 Address</span>
                  <span>{log.address}</span>
                </div>
              )}
              {log.is_insured && log.insurance_provider && (
                <div className="db-detail-item">
                  <span className="db-detail-label">🛡 Provider</span>
                  <span>{log.insurance_provider}</span>
                </div>
              )}
              {log.is_insured && log.insurance_type && (
                <div className="db-detail-item">
                  <span className="db-detail-label">📄 Type</span>
                  <span>{log.insurance_type}</span>
                </div>
              )}
              {log.is_insured && log.insurance_policy && (
                <div className="db-detail-item">
                  <span className="db-detail-label">🔢 Policy #</span>
                  <span className="db-detail-mono">{log.insurance_policy}</span>
                </div>
              )}
              {log.client_name && (
                <div className="db-detail-item">
                  <span className="db-detail-label">💼 Client</span>
                  <span>{log.client_name}</span>
                </div>
              )}
              {log.price_charged != null && (
                <div className="db-detail-item">
                  <span className="db-detail-label">💲 Price</span>
                  <span>${log.price_charged.toFixed(2)}</span>
                </div>
              )}
              {log.payment_status && (
                <div className="db-detail-item">
                  <span className="db-detail-label">💳 Payment</span>
                  <span className={`db-badge ${
                    log.payment_status === 'Paid'    ? 'db-badge--green' :
                    log.payment_status === 'Pending' ? 'db-badge--yellow' :
                                                       'db-badge--gray'
                  }`}>{log.payment_status}</span>
                </div>
              )}
              {log.invoice_notes && (
                <div className="db-detail-item db-detail-item--full">
                  <span className="db-detail-label">🧾 Invoice Notes</span>
                  <span>{log.invoice_notes}</span>
                </div>
              )}
              {log.notes && (
                <div className="db-detail-item db-detail-item--full">
                  <span className="db-detail-label">📝 Notes</span>
                  <span>{log.notes}</span>
                </div>
              )}
              {log.maintenance_notes && (
                <div className="db-detail-item db-detail-item--full">
                  <span className="db-detail-label">🔧 Maintenance</span>
                  <span>{log.maintenance_notes}</span>
                </div>
              )}
              {!log.gps_coords && !log.address && !log.notes && !log.maintenance_notes &&
               !(log.is_insured && (log.insurance_provider || log.insurance_policy || log.insurance_type)) && (
                <span className="db-muted">No additional details.</span>
              )}
            </div>

            {/* ── Export PDF — Pro only ── */}
            <div className="db-detail-actions">
              {isPro ? (
                <>
                  <button
                    className="db-btn-export-pdf"
                    onClick={handleExport}
                    disabled={exporting}
                    title="Download official Part 107 PDF for this flight"
                  >
                    {exporting
                      ? <><span className="db-spinner db-spinner--sm" /> Generating PDF…</>
                      : <>📄 Export PDF</>}
                  </button>
                  {exportError && (
                    <span className="db-export-error">{exportError}</span>
                  )}
                </>
              ) : (
                <span className="db-btn-export-pdf db-btn-export-pdf--locked" title="Upgrade to Pro to export PDFs">
                  🔒 Export PDF <span className="db-pro-tag">Pro</span>
                </span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NEW LOG MODAL
// ══════════════════════════════════════════════════════════════════════════════
interface NewLogModalProps {
  drones:      Drone[];
  userId:      string;
  accessToken: string;
  isPro:       boolean;
  logsCount:   number;
  onSave:      (log: FlightLog) => void;
  onClose:     () => void;
}

const INSURANCE_TYPES   = ['Hull', 'Liability', 'Hull & Liability', 'Other'];
const PAYMENT_STATUSES  = ['Unpaid', 'Paid', 'Pending'];

function NewLogModal({
  drones, userId, accessToken, isPro, logsCount, onSave, onClose,
}: NewLogModalProps) {

  // ── Free-tier limit check ─────────────────────────────────────────────────
  const atLimit = !isPro && logsCount >= FREE_LOG_LIMIT;

  // ── Form fields ──────────────────────────────────────────────────────────
  const [droneId,           setDroneId]           = useState('');
  const [isCustomDrone,     setIsCustomDrone]     = useState(false);
  const [customDroneName,   setCustomDroneName]   = useState('');
  const [duration,          setDuration]          = useState('');
  const [missionPurpose,    setMissionPurpose]    = useState('');
  const [notes,             setNotes]             = useState('');

  // ── Billing fields ───────────────────────────────────────────────────────
  const [clientName,     setClientName]     = useState('');
  const [priceCharged,   setPriceCharged]   = useState('');
  const [paymentStatus,  setPaymentStatus]  = useState('Unpaid');
  const [invoiceNotes,   setInvoiceNotes]   = useState('');

  // ── Insurance fields ─────────────────────────────────────────────────────
  const [isInsured,         setIsInsured]         = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicy,   setInsurancePolicy]   = useState('');
  const [insuranceType,     setInsuranceType]     = useState('');

  // ── Weather / location state ─────────────────────────────────────────────
  const [weatherData,       setWeatherData]       = useState<WeatherData | null>(null);
  const [gpsCoords,         setGpsCoords]         = useState('');
  const [address,           setAddress]           = useState('');
  const [weatherLoading,    setWeatherLoading]    = useState(false);
  const [weatherError,      setWeatherError]      = useState('');

  // ── Save state ────────────────────────────────────────────────────────────
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Weather fetch ─────────────────────────────────────────────────────────
  async function handleFetchWeather() {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 12000, maximumAge: 60_000, enableHighAccuracy: false,
        })
      );
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setGpsCoords(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);

      const wmRes = await fetch(
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,wind_speed_10m,wind_gusts_10m` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
      );
      if (!wmRes.ok) throw new Error('Weather service unavailable');
      const wm = await wmRes.json();
      const c  = wm.current;

      setWeatherData({
        wind:        { value: Math.round(Number(c.wind_speed_10m)) },
        temperature: { value: Math.round(Number(c.temperature_2m)) },
        gusts:       { value: Math.round(Number(c.wind_gusts_10m)) },
      });

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'Accept-Language': 'en-US,en' } }
      );
      if (geoRes.ok) {
        const geo   = await geoRes.json();
        const parts = (geo.display_name as string)?.split(',') ?? [];
        setAddress(parts.slice(0, 3).join(',').trim());
      }
    } catch (err: any) {
      if      (err?.code === 1) setWeatherError('Location permission denied. Enable it in browser settings.');
      else if (err?.code === 2) setWeatherError('Could not determine location. Try again.');
      else                      setWeatherError(err.message || 'Weather fetch failed.');
    } finally {
      setWeatherLoading(false);
    }
  }

  // ── Save to Supabase ──────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (atLimit) return;
    setSaveError('');
    setSaving(true);

    try {
      // Resolve the drone name: garage selection → its stored name;
      // "other" → whatever the pilot typed; blank selection → null.
      const resolvedDroneName: string | null = (() => {
        if (droneId === 'other') return customDroneName.trim() || null;
        const garage = drones.find(d => d.id === droneId);
        return garage?.name ?? null;
      })();

      // Build payload — all types explicitly cast to match DB schema
      const payload: Record<string, unknown> = {
        user_id:            userId,
        timestamp:          Date.now(),                                      // bigint (JS number)
        drone_name:         resolvedDroneName,                               // text
        duration:           duration ? Number(parseFloat(duration)) : null,  // numeric
        mission_purpose:    missionPurpose.trim() || null,                   // text
        notes:              notes.trim()           || null,                   // text
        weather_data:       weatherData,                                     // jsonb
        gps_coords:         gpsCoords              || null,                   // text
        address:            address.trim()         || null,                   // text
        observed_wind:      weatherData?.wind?.value != null                 // numeric
                              ? Number(weatherData.wind.value)
                              : null,
        // ── Insurance ────────────────────────────────────────────────────
        is_insured:         Boolean(isInsured),                              // boolean
        insurance_provider: isInsured ? (insuranceProvider.trim() || null) : null,
        insurance_policy:   isInsured ? (insurancePolicy.trim()   || null) : null,
        insurance_type:     isInsured ? (insuranceType            || null) : null,
        // ── Billing & Client ─────────────────────────────────────────────
        client_name:        clientName.trim()    || null,                    // text
        price_charged:      priceCharged ? Number(parseFloat(priceCharged)) : null, // numeric
        payment_status:     paymentStatus        || 'Unpaid',                // text
        invoice_notes:      invoiceNotes.trim()  || null,                    // text
      };

      const saved = await insertRow<FlightLog>('flight_logs', payload, accessToken);
      onSave(saved);
      onClose();
    } catch (err: any) {
      console.error('[PreFlight107] Save error:', err);
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="New Flight Log"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">📋 New Flight Log</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Free-tier limit banner ── */}
        {atLimit && (
          <div className="modal-limit-banner">
            🔒 Free tier is limited to {FREE_LOG_LIMIT} logs.
            Upgrade to <strong>Pro</strong> to log unlimited flights.
          </div>
        )}

        <form onSubmit={handleSave} className="modal-body">

          {/* ── Drone ── */}
          <div className="modal-section">
            <label className="modal-label" htmlFor="ml-drone">Drone</label>
            <select
              id="ml-drone"
              className="modal-select"
              value={droneId}
              onChange={e => {
                const val = e.target.value;
                setDroneId(val);
                const custom = val === 'other';
                setIsCustomDrone(custom);
                if (!custom) setCustomDroneName('');  // clear text if switching back
              }}
              disabled={atLimit}
            >
              <option value="">— Select drone (optional) —</option>
              {drones.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name ?? 'Unnamed'}{d.faa_reg_number ? ` · ${d.faa_reg_number}` : ''}
                </option>
              ))}
              <option value="other">Other (Manual Entry)</option>
            </select>

            {/* Shown only when the pilot picks "Other" */}
            {isCustomDrone && (
              <input
                id="ml-drone-custom"
                type="text"
                className="modal-input modal-input--custom-drone"
                placeholder="Enter drone name…"
                value={customDroneName}
                onChange={e => setCustomDroneName(e.target.value)}
                disabled={atLimit}
                autoFocus
              />
            )}

            {drones.length === 0 && !isCustomDrone && (
              <p className="modal-hint">No drones in your hangar yet — select "Other" to enter a name manually.</p>
            )}
          </div>

          {/* ── Duration + Mission ── */}
          <div className="modal-section--flex">
            <div className="modal-section">
              <label className="modal-label" htmlFor="ml-duration">
                Duration{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  (minutes)
                </span>
              </label>
              <input
                id="ml-duration"
                type="number"
                min="0"
                step="1"
                className="modal-input"
                placeholder="e.g. 18"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                disabled={atLimit}
              />
            </div>

            <div className="modal-section">
              <label className="modal-label" htmlFor="ml-mission">Mission Purpose</label>
              <input
                id="ml-mission"
                type="text"
                className="modal-input"
                placeholder="e.g. Real-estate photo"
                value={missionPurpose}
                onChange={e => setMissionPurpose(e.target.value)}
                disabled={atLimit}
              />
            </div>
          </div>

          {/* ── Billing & Client Info ── */}
          <div className="modal-section">
            <label className="modal-label" style={{ color: '#FBBF24' }}>💼 Billing & Client Info</label>
          </div>

          <div className="modal-section--flex">
            <div className="modal-section">
              <label className="modal-label" htmlFor="ml-client">Client Name</label>
              <input
                id="ml-client"
                type="text"
                className="modal-input"
                placeholder="e.g. Acme Realty"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                disabled={atLimit}
              />
            </div>

            <div className="modal-section">
              <label className="modal-label" htmlFor="ml-price">Price Charged ($)</label>
              <input
                id="ml-price"
                type="number"
                min="0"
                step="0.01"
                className="modal-input"
                placeholder="e.g. 250.00"
                value={priceCharged}
                onChange={e => setPriceCharged(e.target.value)}
                disabled={atLimit}
              />
            </div>
          </div>

          <div className="modal-section">
            <label className="modal-label" htmlFor="ml-payment">Payment Status</label>
            <select
              id="ml-payment"
              className="modal-select"
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value)}
              disabled={atLimit}
            >
              {PAYMENT_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="modal-section">
            <label className="modal-label" htmlFor="ml-invoice-notes">Invoice Notes</label>
            <textarea
              id="ml-invoice-notes"
              className="modal-textarea"
              rows={2}
              placeholder="e.g. Invoice #1042 sent, net-30 terms…"
              value={invoiceNotes}
              onChange={e => setInvoiceNotes(e.target.value)}
              disabled={atLimit}
            />
          </div>

          {/* ── Weather ── */}
          <div className="modal-section">
            <label className="modal-label">Weather Conditions</label>
            <button
              type="button"
              className="modal-weather-btn"
              onClick={handleFetchWeather}
              disabled={weatherLoading || atLimit}
            >
              {weatherLoading ? (
                <><span className="db-spinner modal-spinner" /> Locating &amp; fetching weather…</>
              ) : weatherData ? (
                <>🔄 Refresh Weather</>
              ) : (
                <>🌤 Fetch Current Weather</>
              )}
            </button>

            {weatherError && <p className="modal-weather-error">{weatherError}</p>}

            {weatherData && !weatherError && (
              <div className="modal-weather-result">
                <div className="modal-weather-chip">
                  🌡 <strong>{weatherData.temperature?.value}°F</strong>
                </div>
                <div className="modal-weather-chip">
                  💨 <strong>{weatherData.wind?.value} mph</strong>
                  {weatherData.gusts && (
                    <span className="modal-weather-sub">
                      &nbsp;· gusts {weatherData.gusts.value} mph
                    </span>
                  )}
                </div>
                {gpsCoords && (
                  <div className="modal-weather-chip modal-weather-chip--geo">
                    📍 <span>{gpsCoords}</span>
                  </div>
                )}
                {address && (
                  <div className="modal-weather-chip modal-weather-chip--geo modal-weather-chip--wide">
                    🏙 <span>{address}</span>
                  </div>
                )}
              </div>
            )}

            {!weatherData && !weatherLoading && (
              <p className="modal-hint">Uses your browser location + Open-Meteo (free, no account needed).</p>
            )}
          </div>

          {/* ── Insurance ── */}
          <div className="modal-section">
            <label className="modal-label">Insurance</label>
            <label className="modal-toggle-row">
              <div
                className={`modal-toggle${isInsured ? ' modal-toggle--on' : ''}`}
                onClick={() => !atLimit && setIsInsured(v => !v)}
                role="switch"
                aria-checked={isInsured}
                tabIndex={0}
                onKeyDown={e => {
                  if (!atLimit && (e.key === ' ' || e.key === 'Enter')) setIsInsured(v => !v);
                }}
              >
                <div className="modal-toggle-thumb" />
              </div>
              <span className="modal-toggle-label">
                {isInsured ? '🛡 Insured flight' : 'Not insured'}
              </span>
            </label>

            {isInsured && (
              <div className="modal-insurance-fields">
                <div className="modal-section--flex">
                  <div className="modal-section">
                    <label className="modal-label" htmlFor="ml-ins-provider">Provider</label>
                    <input
                      id="ml-ins-provider"
                      type="text"
                      className="modal-input"
                      placeholder="e.g. Verifly"
                      value={insuranceProvider}
                      onChange={e => setInsuranceProvider(e.target.value)}
                    />
                  </div>
                  <div className="modal-section">
                    <label className="modal-label" htmlFor="ml-ins-type">Type</label>
                    <select
                      id="ml-ins-type"
                      className="modal-select"
                      value={insuranceType}
                      onChange={e => setInsuranceType(e.target.value)}
                    >
                      <option value="">— Select type —</option>
                      {INSURANCE_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-section" style={{ marginTop: '0.5rem' }}>
                  <label className="modal-label" htmlFor="ml-ins-policy">Policy Number</label>
                  <input
                    id="ml-ins-policy"
                    type="text"
                    className="modal-input"
                    placeholder="e.g. PF107-123456"
                    value={insurancePolicy}
                    onChange={e => setInsurancePolicy(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Notes ── */}
          <div className="modal-section">
            <label className="modal-label" htmlFor="ml-notes">Notes</label>
            <textarea
              id="ml-notes"
              className="modal-textarea"
              rows={3}
              placeholder="Observations, incidents, or anything worth recording…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={atLimit}
            />
          </div>

          {/* Save error */}
          {saveError && <div className="db-alert">{saveError}</div>}

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="db-btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="modal-btn-save"
              disabled={saving || atLimit}
              title={atLimit ? `Upgrade to Pro to log more than ${FREE_LOG_LIMIT} flights` : undefined}
            >
              {atLimit ? (
                '🔒 Upgrade to Pro'
              ) : saving ? (
                <><span className="db-spinner modal-spinner" /> Saving…</>
              ) : (
                '✓ Save Flight Log'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, session, loading: authLoading, signOut } = useAuth();

  const [logs,           setLogs]           = useState<FlightLog[]>([]);
  const [drones,         setDrones]         = useState<Drone[]>([]);
  const [batteries,      setBatteries]      = useState<Battery[]>([]);
  const [profile,        setProfile]        = useState<Profile | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [tab,            setTab]            = useState<'logs' | 'drones' | 'reports' | 'settings'>('logs');

  // ── Battery form state ─────────────────────────────────────────────────────
  const [showAddBattery,  setShowAddBattery]  = useState(false);
  const [newBatteryName,  setNewBatteryName]  = useState('');
  const [newBatteryDroneId, setNewBatteryDroneId] = useState('');
  const [newBatteryCapacity, setNewBatteryCapacity] = useState('');
  const [addingBattery,   setAddingBattery]   = useState(false);
  const [addBatteryError, setAddBatteryError] = useState('');

  // ── Add Drone form state ───────────────────────────────────────────────────
  const [showAddDrone,       setShowAddDrone]       = useState(false);
  const [newDroneName,       setNewDroneName]       = useState('');
  const [newDroneFaa,        setNewDroneFaa]        = useState('');
  const [newDroneSerial,     setNewDroneSerial]     = useState('');
  const [newDronePropInt,    setNewDronePropInt]    = useState('20');
  const [newDroneAirframeInt,setNewDroneAirframeInt]= useState('50');
  const [addingDrone,        setAddingDrone]        = useState(false);
  const [addDroneError,      setAddDroneError]      = useState('');

  // ── Reports / maintenance logs / preflight history ────────────────────────
  const [maintenanceLogs,   setMaintenanceLogs]   = useState<MaintenanceLog[]>([]);
  const [preflightHistory,  setPreflightHistory]  = useState<PreflightRecord[]>([]);

  // ── Pilot credentials (Settings tab) ─────────────────────────────────────
  const [faaInput,               setFaaInput]               = useState('');
  const [insurancePolicyInput,   setInsurancePolicyInput]   = useState('');
  const [insuranceProviderInput, setInsuranceProviderInput] = useState('');
  const [insuranceTypeInput,     setInsuranceTypeInput]     = useState('');
  const [savingCreds,            setSavingCreds]            = useState(false);
  const [credsSaved,             setCredsSaved]             = useState(false);
  const [credsError,             setCredsError]             = useState('');

  // ── Edit drone modal ──────────────────────────────────────────────────────
  const [editingDrone,         setEditingDrone]         = useState<Drone | null>(null);
  const [editDroneName,        setEditDroneName]        = useState('');
  const [editDroneFaa,         setEditDroneFaa]         = useState('');
  const [editDroneSerial,      setEditDroneSerial]      = useState('');
  const [editDronePropInt,     setEditDronePropInt]     = useState('');
  const [editDroneAirframeInt, setEditDroneAirframeInt] = useState('');
  const [editDroneMaxCycles,   setEditDroneMaxCycles]   = useState('');
  const [savingEditDrone,      setSavingEditDrone]      = useState(false);
  const [editDroneError,       setEditDroneError]       = useState('');

  // ── Edit maintenance log modal ────────────────────────────────────────────
  const [editingLog,       setEditingLog]       = useState<MaintenanceLog | null>(null);
  const [editLogNotes,     setEditLogNotes]     = useState('');
  const [editLogHours,     setEditLogHours]     = useState('');
  const [savingEditLog,    setSavingEditLog]    = useState(false);
  const [editLogError,     setEditLogError]     = useState('');
  const [maintenanceExporting, setMaintenanceExporting] = useState(false);

  // ── Pre-flight checklist modal ─────────────────────────────────────────────
  const CHECKLIST_ITEMS: Record<string, string> = {
    docs:       '📋 Registration & pilot cert on-site',
    airspace:   '🗺 Airspace authorization confirmed (LAANCIE/NOTAM)',
    weather:    '☁️ Weather conditions acceptable',
    battery:    '🔋 Battery fully charged',
    props:      '🔩 Props inspected — no cracks, properly seated',
    motors:     '⚙️ Motors spin freely, no obstructions',
    payload:    '📷 Camera/payload secured',
    gps:        '📡 GPS signal acquired (≥6 satellites)',
    controller: '🎮 Controller connected & calibrated',
    rth:        '🏠 Return-to-Home altitude set',
    area:       '👁 Flight area inspected — no hazards',
  };
  // Active drone: persisted in localStorage so it survives page refreshes
  const ACTIVE_DRONE_KEY = 'pf107_active_drone_id';
  const [activeDroneId,     setActiveDroneIdState] = useState<string>(
    () => localStorage.getItem(ACTIVE_DRONE_KEY) ?? '',
  );
  function setActiveDroneId(id: string) {
    if (id) {
      localStorage.setItem(ACTIVE_DRONE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_DRONE_KEY);
    }
    setActiveDroneIdState(id);
  }

  const [showChecklist,        setShowChecklist]        = useState(false);
  const [checklistItems,       setChecklistItems]       = useState<Record<string, boolean>>({});
  const [savingChecklist,      setSavingChecklist]      = useState(false);
  const [checklistSaved,       setChecklistSaved]       = useState(false);
  const [checklistDroneError,  setChecklistDroneError]  = useState(false);

  // ── Fleet report PDF state ─────────────────────────────────────────────────
  const [fleetExporting,  setFleetExporting]  = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [bulkExporting, setBulkExporting] = useState(false);

  // ── New-account detection ─────────────────────────────────────────────────
  const [isNewAccount,     setIsNewAccount]     = useState(false);

  // ── Linked Accounts (Settings tab) ───────────────────────────────────────
  const [identities,        setIdentities]        = useState<Identity[]>([]);
  const [identitiesLoading, setIdentitiesLoading] = useState(false);
  const [linkingProvider,   setLinkingProvider]   = useState<'google' | 'apple' | null>(null);
  const [linkError,         setLinkError]         = useState('');

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterFrom,  setFilterFrom]  = useState('');   // YYYY-MM-DD
  const [filterTo,    setFilterTo]    = useState('');
  const [filterDrone, setFilterDrone] = useState('');   // drone_name or ''

  // Unique drone names present in current logs (for dropdown)
  const droneOptions = useMemo(() => {
    const names = new Set(logs.map(l => l.drone_name).filter(Boolean) as string[]);
    return Array.from(names).sort();
  }, [logs]);

  // Filtered view — all export + select-all operations use this, not raw `logs`
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterFrom) {
        const from = new Date(filterFrom + 'T00:00:00').getTime();
        if (log.timestamp < from) return false;
      }
      if (filterTo) {
        const to = new Date(filterTo + 'T23:59:59.999').getTime();
        if (log.timestamp > to) return false;
      }
      if (filterDrone && log.drone_name !== filterDrone) return false;
      return true;
    });
  }, [logs, filterFrom, filterTo, filterDrone]);

  const isFiltered = filterFrom !== '' || filterTo !== '' || filterDrone !== '';

  function clearFilters() {
    setFilterFrom('');
    setFilterTo('');
    setFilterDrone('');
  }

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading]);

  const loadData = useCallback(async () => {
    if (!session || !user) return;
    setLoading(true);
    setError('');

    try {
      // ── Flight logs + drones: fatal if these fail ──────────────────────────
      // pilot_drones sorted by created_at (NOT updated_at — that column doesn't exist)
      const [logsData, dronesData] = await Promise.all([
        fetchTable<FlightLog>('flight_logs', session.access_token, {
          order: 'timestamp.desc',
        }),
        fetchTable<Drone>('pilot_drones', session.access_token, {
          order: 'created_at.desc',
        }),
      ]);
      console.log('[PreFlight107] Logs loaded:', logsData.length, '| Drones loaded:', dronesData.length);
      setLogs(logsData);
      setDrones(dronesData);
    } catch (err: any) {
      console.error('[PreFlight107] Data load error:', err);
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }

    // ── Batteries: non-fatal ──────────────────────────────────────────────────
    try {
      const batteriesData = await fetchTable<Battery>('pilot_batteries', session.access_token, {
        order: 'created_at.desc',
      });
      console.log('[PreFlight107] Batteries loaded:', batteriesData.length);
      setBatteries(batteriesData);
    } catch (err) {
      console.warn('[PreFlight107] Battery fetch failed (non-fatal):', err);
    }

    // ── Maintenance logs: non-fatal ───────────────────────────────────────────
    try {
      const mLogs = await fetchTable<MaintenanceLog>('maintenance_logs', session.access_token, {
        order: 'created_at.desc',
      });
      setMaintenanceLogs(mLogs);
    } catch (err) {
      console.warn('[PreFlight107] Maintenance logs fetch failed (non-fatal):', err);
    }

    // ── Preflight history: non-fatal ──────────────────────────────────────────
    try {
      const pfHistory = await fetchTable<PreflightRecord>('preflight_history', session.access_token, {
        order: 'created_at.desc',
      });
      setPreflightHistory(pfHistory);
    } catch (err) {
      console.warn('[PreFlight107] Preflight history fetch failed (non-fatal):', err);
    }

    // ── Profile: non-fatal — fetched separately so a bad profile row
    //    never crashes the rest of the dashboard.
    //
    //    NOTE: profiles has `updated_at` but NO `created_at` column.
    //    We must override fetchTable's default order=created_at.desc or
    //    PostgREST returns PGRST116 ("JSON object requested, multiple rows").
    try {
      const profileRows = await fetchTable<Profile>('profiles', session.access_token, {
        select: 'full_name,subscription_status,total_flight_hours,pilot_license_type,faa_certificate,insurance_policy,insurance_provider,insurance_type',
        id:     `eq.${user.id}`,
        order:  'updated_at.desc',   // ← profiles has updated_at, NOT created_at
        limit:  '1',
      });
      if (profileRows.length === 0) {
        // No profile row → this looks like a brand-new or orphaned account.
        // Surface a one-time prompt so the user can switch to their real account.
        setIsNewAccount(true);
        setProfile({ subscription_status: 'free', full_name: null, total_flight_hours: null, pilot_license_type: null, faa_certificate: null, insurance_policy: null, insurance_provider: null, insurance_type: null });
      } else {
        setIsNewAccount(false);
        setProfile(profileRows[0]);
      }
    } catch (err) {
      console.warn('[PreFlight107] Profile fetch failed (non-fatal):', err);
      // Safe fallback — treat any profile error as free tier, dashboard still works
      setProfile({ subscription_status: 'free', full_name: null, total_flight_hours: null, pilot_license_type: null, faa_certificate: null, insurance_policy: null, insurance_provider: null, insurance_type: null });
    }
  }, [session, user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Seed credential inputs whenever profile loads / changes
  useEffect(() => {
    if (profile) {
      setFaaInput(profile.faa_certificate ?? '');
      setInsurancePolicyInput(profile.insurance_policy ?? '');
      setInsuranceProviderInput(profile.insurance_provider ?? '');
      setInsuranceTypeInput(profile.insurance_type ?? '');
    }
  }, [profile]);

  // Real-time sync: refresh when the tab becomes visible again (user returns from mobile app)
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible') loadData();
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [loadData]);

  // Load linked identities whenever the Settings tab is opened
  useEffect(() => {
    if (tab !== 'settings' || !session) return;
    setIdentitiesLoading(true);
    setLinkError('');
    fetchUserIdentities(session.access_token)
      .then(setIdentities)
      .catch(() => setLinkError('Could not load linked accounts.'))
      .finally(() => setIdentitiesLoading(false));
  }, [tab, session]);

  // Kick off the OAuth identity-linking flow for the chosen provider
  async function handleLinkIdentity(provider: 'google' | 'apple') {
    if (!session || linkingProvider) return;
    setLinkingProvider(provider);
    setLinkError('');
    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      const url = await getLinkIdentityUrl(provider, session.access_token, redirectTo);
      if (url) {
        window.location.href = url;
      } else {
        setLinkError('Could not start identity linking — please try again.');
      }
    } catch {
      setLinkError('Identity linking failed — please try again.');
    } finally {
      setLinkingProvider(null);
    }
  }

  function handleLogSaved(newLog: FlightLog) {
    setLogs(prev => [newLog, ...prev]);
  }

  // ── Selection helpers ─────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll(allIds: string[]) {
    setSelectedIds(prev =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    );
  }

  // ── Bulk PDF export ───────────────────────────────────────────────────────
  async function handleBulkExport() {
    if (selectedIds.size === 0 || bulkExporting) return;
    setBulkExporting(true);
    try {
      // Export only logs that are BOTH selected AND visible through the current filters
      const selected = filteredLogs
        .filter(l => selectedIds.has(l.id))
        .sort((a, b) => a.timestamp - b.timestamp);   // chronological order
      if (selected.length === 0) return;
      await exportFlightLogsPDF(selected, profile?.full_name ?? null, profile?.faa_certificate ?? null, profile?.insurance_policy ?? null, profile?.insurance_provider ?? null, profile?.insurance_type ?? null);
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('[PreFlight107] Bulk PDF export error:', err);
      alert(`Bulk export failed: ${err.message}`);
    } finally {
      setBulkExporting(false);
    }
  }

  // ── Fleet report PDF ──────────────────────────────────────────────────────
  async function handleFleetReport() {
    if (!session || fleetExporting) return;
    setFleetExporting(true);
    try {
      const dronesHealth: DroneHealthRow[] = drones.map(drone => {
        // flight_logs uses drone_name (text), not drone_id — match by name
        const droneLogs  = logs.filter(l => l.drone_name === drone.name);
        const totalMins  = droneLogs.reduce((s, l) => s + (l.duration ?? 0), 0);
        const totalHrs   = totalMins / 60;
        const lastChange = drone.last_propeller_change_hours ?? 0;
        const interval   = drone.propeller_service_interval;
        const hoursSince = Math.max(0, totalHrs - lastChange);
        const propHealthPct = interval && interval > 0 ? (hoursSince / interval) * 100 : null;
        return {
          name:          drone.name ?? 'Unnamed Drone',
          faaReg:        drone.faa_reg_number ?? undefined,
          totalHours:    totalHrs,
          propHoursUsed: hoursSince,
          propInterval:  interval,
          propHealthPct,
        };
      });

      const batteriesReport: BatteryReportRow[] = batteries.map(b => ({
        name:        b.name ?? 'Unnamed Battery',
        cycleCount:  b.cycle_count,
        droneName:   b.drone_id ? (drones.find(d => d.id === b.drone_id)?.name ?? 'Unknown') : null,
        capacityMah: b.capacity_mah,
      }));

      await exportFleetReportPDF(dronesHealth, batteriesReport, profile?.full_name ?? null, profile?.faa_certificate ?? null, profile?.insurance_policy ?? null, profile?.insurance_provider ?? null, profile?.insurance_type ?? null);
    } catch (err: any) {
      console.error('[PreFlight107] Fleet report error:', err);
      alert(`Fleet report failed: ${err.message}`);
    } finally {
      setFleetExporting(false);
    }
  }

  // ── Drone: add new drone to fleet ────────────────────────────────────────
  async function handleAddDrone() {
    if (!session || !user) return;
    if (!newDroneName.trim()) { setAddDroneError('Please enter a drone name.'); return; }
    setAddDroneError('');
    setAddingDrone(true);
    try {
      const saved = await insertRow<Drone>('pilot_drones', {
        user_id:                     user.id,
        name:                        newDroneName.trim(),
        faa_reg_number:              newDroneFaa.trim()       || null,
        serial_number:               newDroneSerial.trim()    || null,
        // Mission Readiness columns (match mobile app schema)
        prop_service_interval:       newDronePropInt     ? Number(newDronePropInt)     : 20,
        airframe_service_interval:   newDroneAirframeInt ? Number(newDroneAirframeInt) : 50,
        battery_max_cycles:          300,
        last_prop_service_hours:     0,
        last_airframe_service_hours: 0,
      }, session.access_token);
      setDrones(prev => [saved, ...prev]);
      setNewDroneName('');
      setNewDroneFaa('');
      setNewDroneSerial('');
      setNewDronePropInt('20');
      setNewDroneAirframeInt('50');
      setShowAddDrone(false);
    } catch (err: any) {
      setAddDroneError(err.message || 'Failed to add drone.');
    } finally {
      setAddingDrone(false);
    }
  }

  // ── Drone: update existing drone ─────────────────────────────────────────
  async function handleUpdateDrone() {
    if (!session || !editingDrone) return;
    if (!editDroneName.trim()) { setEditDroneError('Drone name is required.'); return; }
    setEditDroneError('');
    setSavingEditDrone(true);
    try {
      const payload = {
        name:                      editDroneName.trim(),
        faa_reg_number:            editDroneFaa.trim()         || null,
        serial_number:             editDroneSerial.trim()      || null,
        prop_service_interval:     editDronePropInt     ? Number(editDronePropInt)     : 20,
        airframe_service_interval: editDroneAirframeInt ? Number(editDroneAirframeInt) : 50,
        battery_max_cycles:        editDroneMaxCycles   ? Number(editDroneMaxCycles)   : 300,
      };
      await updateRow<Drone>('pilot_drones', editingDrone.id, payload, session.access_token);
      setDrones(prev => prev.map(d =>
        d.id === editingDrone.id ? { ...d, ...payload } : d,
      ));
      setEditingDrone(null);
    } catch (err: any) {
      setEditDroneError(err.message || 'Failed to update drone.');
    } finally {
      setSavingEditDrone(false);
    }
  }

  // ── Battery: add new battery ──────────────────────────────────────────────
  async function handleAddBattery() {
    if (!session || !user) return;
    if (!newBatteryName.trim()) { setAddBatteryError('Please enter a battery name.'); return; }
    setAddBatteryError('');
    setAddingBattery(true);
    try {
      const saved = await insertRow<Battery>('pilot_batteries', {
        user_id:      user.id,
        name:         newBatteryName.trim(),
        drone_id:     newBatteryDroneId || null,
        capacity_mah: newBatteryCapacity ? Number(newBatteryCapacity) : null,
        cycle_count:  0,
      }, session.access_token);
      setBatteries(prev => [saved, ...prev]);
      setNewBatteryName('');
      setNewBatteryDroneId('');
      setNewBatteryCapacity('');
      setShowAddBattery(false);
    } catch (err: any) {
      setAddBatteryError(err.message || 'Failed to add battery.');
    } finally {
      setAddingBattery(false);
    }
  }

  // ── Battery: log one charge cycle (optimistic update) ─────────────────────
  async function handleLogCharge(batteryId: string, currentCount: number) {
    if (!session) return;
    const next = currentCount + 1;
    // Optimistic update — feels instant for the user
    setBatteries(prev => prev.map(b => b.id === batteryId ? { ...b, cycle_count: next } : b));
    try {
      await updateRow<Battery>('pilot_batteries', batteryId, { cycle_count: next }, session.access_token);
    } catch (err: any) {
      // Revert on failure
      setBatteries(prev => prev.map(b => b.id === batteryId ? { ...b, cycle_count: currentCount } : b));
      alert('Failed to log charge: ' + (err.message || 'Unknown error'));
    }
  }

  // ── Drone: reset propeller service clock + log to maintenance_logs ────────
  async function handleResetPropellers(droneId: string, currentTotalHrs: number, prevHrs: number) {
    if (!session || !user) return;
    // Optimistic update
    setDrones(prev => prev.map(d =>
      d.id === droneId ? { ...d, last_prop_service_hours: currentTotalHrs } : d,
    ));
    try {
      // Update drone maintenance baseline + insert FAA log entry in parallel
      const logEntry = await Promise.all([
        updateRow<Drone>('pilot_drones', droneId, {
          last_prop_service_hours: currentTotalHrs,
        }, session.access_token),
        insertRow<MaintenanceLog>('maintenance_logs', {
          drone_id:         droneId,
          user_id:          user.id,
          service_type:     'Propellers',
          hours_at_service: currentTotalHrs,
          notes:            null,
        }, session.access_token),
      ]);
      // Prepend to local maintenance log state
      setMaintenanceLogs(prev => [logEntry[1], ...prev]);
    } catch (err: any) {
      setDrones(prev => prev.map(d =>
        d.id === droneId ? { ...d, last_prop_service_hours: prevHrs } : d,
      ));
      alert('Failed to reset propellers: ' + (err.message || 'Unknown error'));
    }
  }

  // ── Drone: reset airframe service clock + log to maintenance_logs ─────────
  async function handleResetAirframe(droneId: string, currentTotalHrs: number, prevHrs: number) {
    if (!session || !user) return;
    // Optimistic update
    setDrones(prev => prev.map(d =>
      d.id === droneId ? { ...d, last_airframe_service_hours: currentTotalHrs } : d,
    ));
    try {
      const logEntry = await Promise.all([
        updateRow<Drone>('pilot_drones', droneId, {
          last_airframe_service_hours: currentTotalHrs,
        }, session.access_token),
        insertRow<MaintenanceLog>('maintenance_logs', {
          drone_id:         droneId,
          user_id:          user.id,
          service_type:     'Airframe',
          hours_at_service: currentTotalHrs,
          notes:            null,
        }, session.access_token),
      ]);
      setMaintenanceLogs(prev => [logEntry[1], ...prev]);
    } catch (err: any) {
      setDrones(prev => prev.map(d =>
        d.id === droneId ? { ...d, last_airframe_service_hours: prevHrs } : d,
      ));
      alert('Failed to reset airframe: ' + (err.message || 'Unknown error'));
    }
  }

  async function handleDeleteLog(id: string) {
    if (!session) return;
    try {
      await deleteRow('flight_logs', id, session.access_token);
      setLogs(prev => prev.filter(l => l.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch {
      alert('Failed to delete log.');
    }
  }

  // ── Drone: delete with cascade warning ───────────────────────────────────
  async function handleDeleteDrone(droneId: string, droneName: string | null) {
    if (!session) return;
    const label = droneName ?? 'this drone';
    const confirmed = window.confirm(
      `Delete "${label}"?\n\nThis will also permanently remove all batteries associated with this drone (cascading delete). This action cannot be undone.`,
    );
    if (!confirmed) return;
    // Optimistic update — remove drone and its batteries from local state immediately
    setDrones(prev => prev.filter(d => d.id !== droneId));
    setBatteries(prev => prev.filter(b => b.drone_id !== droneId));
    try {
      await deleteRow('pilot_drones', droneId, session.access_token);
    } catch (err: any) {
      alert('Failed to delete drone: ' + (err.message || 'Unknown error'));
      // Reload fresh state from server on failure
      loadData();
    }
  }

  // ── Battery: delete ───────────────────────────────────────────────────────
  async function handleDeleteBattery(batteryId: string, batteryName: string | null) {
    if (!session) return;
    const label = batteryName ?? 'this battery';
    const confirmed = window.confirm(`Delete "${label}"? This action cannot be undone.`);
    if (!confirmed) return;
    // Optimistic update
    setBatteries(prev => prev.filter(b => b.id !== batteryId));
    try {
      await deleteRow('pilot_batteries', batteryId, session.access_token);
    } catch (err: any) {
      alert('Failed to delete battery: ' + (err.message || 'Unknown error'));
      loadData();
    }
  }

  // ── Pre-flight checklist: save to preflight_history ──────────────────────
  async function handleSavePreflight() {
    if (!session || !user) return;
    // Require an active drone to be selected
    if (!activeDroneId) {
      setChecklistDroneError(true);
      return;
    }
    setChecklistDroneError(false);
    setSavingChecklist(true);
    try {
      // Try to get GPS coordinates from browser
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }),
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // GPS unavailable — proceed without coordinates
      }

      // Build weather snapshot from the most recent flight log that has weather
      const latestWithWeather = logs.find(l => l.weather_data != null);
      const weatherSnap = latestWithWeather?.weather_data
        ? {
            wind_mph:  latestWithWeather.weather_data.wind?.value ?? null,
            temp_f:    latestWithWeather.weather_data.temperature?.value ?? null,
            gusts_mph: latestWithWeather.weather_data.gusts?.value ?? null,
          }
        : null;

      const saved = await insertRow<PreflightRecord>('preflight_history', {
        drone_id:         activeDroneId,   // always the persistent active drone
        user_id:          user.id,
        location_name:    null,
        latitude:         lat,
        longitude:        lng,
        weather_snapshot: weatherSnap,
        checklist_data:   checklistItems,
      }, session.access_token);

      setPreflightHistory(prev => [saved, ...prev]);
      setChecklistSaved(true);
      // Auto-close after brief confirmation; keep activeDroneId in localStorage
      setTimeout(() => {
        setShowChecklist(false);
        setChecklistSaved(false);
        setChecklistItems({});
      }, 1800);
    } catch (err: any) {
      alert('Failed to save pre-flight record: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingChecklist(false);
    }
  }

  // ── Maintenance log: delete a single record ──────────────────────────────
  async function handleDeleteMaintenanceLog(logId: string) {
    if (!session) return;
    const confirmed = window.confirm('Delete this maintenance record? This action cannot be undone.');
    if (!confirmed) return;
    setMaintenanceLogs(prev => prev.filter(l => l.id !== logId));
    try {
      await deleteRow('maintenance_logs', logId, session.access_token);
    } catch (err: any) {
      alert('Failed to delete record: ' + (err.message || 'Unknown error'));
      loadData();
    }
  }

  // ── Maintenance log: export as branded PDF ───────────────────────────────
  async function handleExportMaintenancePDF() {
    if (maintenanceExporting) return;
    setMaintenanceExporting(true);
    try {
      const droneMap: Record<string, string> = {};
      drones.forEach(d => { droneMap[d.id] = d.name ?? 'Unnamed Drone'; });
      await exportMaintenanceLogsPDF(
        maintenanceLogs as MaintenanceLogRow[],
        droneMap,
        profile?.full_name ?? null,
        profile?.faa_certificate ?? null,
        profile?.insurance_policy ?? null,
        profile?.insurance_provider ?? null,
        profile?.insurance_type ?? null,
      );
    } catch (err: any) {
      alert('PDF export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setMaintenanceExporting(false);
    }
  }

  // ── Maintenance log: update notes + hours via modal ────────────────────────
  async function handleUpdateMaintenanceLog() {
    if (!session || !editingLog) return;
    if (!editLogHours.trim()) { setEditLogError('Hours at service is required.'); return; }
    setEditLogError('');
    setSavingEditLog(true);
    try {
      await updateRow<MaintenanceLog>('maintenance_logs', editingLog.id, {
        notes:            editLogNotes.trim() || null,
        hours_at_service: Number(editLogHours),
      }, session.access_token);
      setMaintenanceLogs(prev => prev.map(l =>
        l.id === editingLog.id
          ? { ...l, notes: editLogNotes.trim() || null, hours_at_service: Number(editLogHours) }
          : l,
      ));
      setEditingLog(null);
    } catch (err: any) {
      setEditLogError(err.message || 'Failed to update record.');
    } finally {
      setSavingEditLog(false);
    }
  }

  // ── Save pilot credentials (FAA cert + all insurance fields) ────────────
  async function handleSavePilotCreds() {
    if (!session || !user) return;
    setSavingCreds(true);
    setCredsSaved(false);
    setCredsError('');
    const newFaa      = faaInput.trim()               || null;
    const newPolicy   = insurancePolicyInput.trim()   || null;
    const newProvider = insuranceProviderInput.trim() || null;
    const newType     = insuranceTypeInput             || null;
    try {
      await updateRow<Profile>(
        'profiles',
        user.id,
        {
          faa_certificate:    newFaa,
          insurance_policy:   newPolicy,
          insurance_provider: newProvider,
          insurance_type:     newType,
        },
        session.access_token,
      );
      // Instantly reflect in state so any PDF export uses the newest values
      setProfile(prev => prev ? {
        ...prev,
        faa_certificate:    newFaa,
        insurance_policy:   newPolicy,
        insurance_provider: newProvider,
        insurance_type:     newType,
      } : prev);
      setCredsSaved(true);
      setTimeout(() => setCredsSaved(false), 3000);
    } catch (err: any) {
      setCredsError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSavingCreds(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (authLoading) {
    return (
      <div className="db-loading" style={{ justifyContent: 'center', paddingTop: '40vh' }}>
        <div className="db-spinner" /> Loading…
      </div>
    );
  }
  if (!user) return null;

  // Treat null profile (failed fetch / new user) as free tier — never throw
  const isPro     = (profile?.subscription_status ?? 'free') === 'pro';
  const logsCount = logs.length;

  return (
    <div className="db-shell">

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          ✈ PreFlight <span>107</span>
        </div>

        <nav className="db-nav">
          <button
            className={`db-nav-item${tab === 'logs' ? ' active' : ''}`}
            onClick={() => setTab('logs')}
          >
            📋 Flight Logs
          </button>
          <button
            className={`db-nav-item${tab === 'drones' ? ' active' : ''}`}
            onClick={() => setTab('drones')}
          >
            🛠 Smart Hangar
          </button>
          <button
            className={`db-nav-item${tab === 'reports' ? ' active' : ''}`}
            onClick={() => setTab('reports')}
          >
            📊 Reports
          </button>
          <button
            className={`db-nav-item${tab === 'settings' ? ' active' : ''}`}
            onClick={() => setTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-user-email">{user.email}</div>
          <button className="db-btn-ghost" onClick={handleSignOut}>Sign Out</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="db-main">

        {/* Header */}
        <div className="db-header">
          <div>
            <h1>{tab === 'logs' ? 'Flight Logs' : tab === 'drones' ? 'Smart Hangar' : tab === 'reports' ? 'Reports' : 'Settings'}</h1>
            {profile?.full_name && (
              <p className="db-header-sub">Welcome back, {profile.full_name}</p>
            )}
          </div>
          <div className="db-header-right">
            {isPro
              ? <span className="db-badge db-badge--pro">★ Pro Pilot</span>
              : <span className="db-badge db-badge--gray">Free Tier</span>}

            {tab === 'logs' && (
              <button className="db-btn-new-log" onClick={() => setShowModal(true)}>
                + New Flight Log
              </button>
            )}

            <button
              className="db-btn-preflight"
              onClick={() => { setShowChecklist(true); setChecklistItems({}); setChecklistSaved(false); setChecklistDroneError(false); }}
              title="Run Part 107 pre-flight checklist"
            >
              ✅ Pre-flight
            </button>

            <button
              className="db-btn-ghost db-btn-refresh"
              onClick={loadData}
              title="Refresh"
            >↻</button>
          </div>
        </div>

        {/* ── New-account detection banner ── */}
        {isNewAccount && (
          <div className="db-new-account-banner">
            <span className="db-new-account-banner__icon">👤</span>
            <div className="db-new-account-banner__body">
              <strong>It looks like this is a new account.</strong>
              {' '}Did you mean to sign in with a different email address?
            </div>
            <div className="db-new-account-banner__actions">
              <button
                className="db-new-account-banner__btn db-new-account-banner__btn--switch"
                onClick={async () => { await signOut(); navigate('/login'); }}
              >
                Switch account
              </button>
              <button
                className="db-new-account-banner__btn db-new-account-banner__btn--dismiss"
                onClick={() => setIsNewAccount(false)}
              >
                No, this is correct
              </button>
            </div>
          </div>
        )}

        {/* ── Free-tier log counter ── */}
        {!isPro && tab === 'logs' && (
          <div className="db-free-tier-bar">
            <span>
              Free tier: <strong>{logsCount} / {FREE_LOG_LIMIT}</strong> logs used
            </span>
            {logsCount >= FREE_LOG_LIMIT && (
              <span className="db-free-tier-bar__limit">
                Limit reached — upgrade to Pro for unlimited logs
              </span>
            )}
          </div>
        )}

        {/* ── Filter & Search bar (logs tab only) ── */}
        {tab === 'logs' && logsCount > 0 && (
          <div className="db-filter-bar">
            {/* Date range */}
            <div className="db-filter-group">
              <label className="db-filter-label">From</label>
              <input
                type="date"
                className="db-filter-input"
                value={filterFrom}
                onChange={e => setFilterFrom(e.target.value)}
                max={filterTo || undefined}
              />
            </div>
            <div className="db-filter-group">
              <label className="db-filter-label">To</label>
              <input
                type="date"
                className="db-filter-input"
                value={filterTo}
                onChange={e => setFilterTo(e.target.value)}
                min={filterFrom || undefined}
              />
            </div>

            {/* Drone filter */}
            <div className="db-filter-group db-filter-group--grow">
              <label className="db-filter-label">Drone</label>
              <select
                className="db-filter-select"
                value={filterDrone}
                onChange={e => setFilterDrone(e.target.value)}
              >
                <option value="">All drones</option>
                {droneOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Result count + clear */}
            <div className="db-filter-meta">
              {isFiltered && (
                <>
                  <span className="db-filter-count">
                    {filteredLogs.length} of {logsCount} logs
                  </span>
                  <button className="db-filter-clear" onClick={clearFilters} title="Clear all filters">
                    ✕ Clear
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="db-stats-row">
          <StatCard icon="📋" label="Total Logs"   value={String(logsCount)} />
          <StatCard icon="⏱"  label="Flight Hours" value={`${totalHours(logs)} hr`} accent />
          <StatCard icon="🚁" label="Drones"        value={String(drones.length)} />
          <StatCard icon="🎖" label="Certificate"   value={profile?.pilot_license_type ?? '—'} />
        </div>

        {error && <div className="db-alert db-alert--full">{error}</div>}
        {loading && <div className="db-loading"><div className="db-spinner" /> Loading your data…</div>}

        {/* ── FLIGHT LOGS TAB ── */}
        {!loading && tab === 'logs' && (
          logsCount === 0 ? (    // no logs at all → empty state
            <div className="db-empty">
              <div className="db-empty-icon">📋</div>
              <h3>No flight logs yet</h3>
              <p>Hit <strong>+ New Flight Log</strong> above to record your first flight,
                 or sync from the mobile app.</p>
              <button
                className="db-btn-new-log"
                style={{ marginTop: 20 }}
                onClick={() => setShowModal(true)}
              >+ New Flight Log</button>
            </div>
          ) : (
            <div className="db-table-wrap">

              {/* ── Bulk export toolbar (Pro only) ── */}
              {isPro && (
                <div className="db-bulk-toolbar">
                  <span className="db-bulk-count">
                    {selectedIds.size > 0
                      ? `${selectedIds.size} log${selectedIds.size > 1 ? 's' : ''} selected`
                        + (isFiltered ? ` (filtered view)` : '')
                      : isFiltered
                        ? `Showing ${filteredLogs.length} of ${logsCount} logs`
                        : 'Select logs to export'}
                  </span>
                  <button
                    className="db-btn-bulk-export"
                    disabled={selectedIds.size === 0 || bulkExporting}
                    onClick={handleBulkExport}
                    title={selectedIds.size === 0
                      ? 'Select at least one log'
                      : `Export ${selectedIds.size} selected log(s) from current view`}
                  >
                    {bulkExporting
                      ? <><span className="db-spinner db-spinner--sm" /> Generating PDF…</>
                      : <>📄 Bulk Export PDF {selectedIds.size > 0 && `(${selectedIds.size})`}</>}
                  </button>
                </div>
              )}

              {/* ── No results from filter ── */}
              {filteredLogs.length === 0 && isFiltered && (
                <div className="db-filter-empty">
                  No logs match the current filters.{' '}
                  <button className="db-filter-clear" onClick={clearFilters}>Clear filters</button>
                </div>
              )}

              {filteredLogs.length > 0 && (
              <table className="db-table">
                <thead>
                  <tr>
                    {/* Select-all — scoped to filteredLogs */}
                    <th className="db-col-check">
                      {isPro && (
                        <label className="db-checkbox-wrap">
                          <input
                            type="checkbox"
                            className="db-checkbox"
                            checked={filteredLogs.length > 0 &&
                              filteredLogs.every(l => selectedIds.has(l.id))}
                            ref={el => {
                              if (el) {
                                const selInView = filteredLogs.filter(l => selectedIds.has(l.id)).length;
                                el.indeterminate = selInView > 0 && selInView < filteredLogs.length;
                              }
                            }}
                            onChange={() => toggleSelectAll(filteredLogs.map(l => l.id))}
                            aria-label="Select all visible logs"
                          />
                          <span className="db-checkbox-box" />
                        </label>
                      )}
                    </th>
                    <th>Date</th>
                    <th>Drone</th>
                    <th>Duration</th>
                    <th>Weather</th>
                    <th>Mission</th>
                    <th>Client</th>
                    <th>Payment</th>
                    <th>Insurance</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <LogRow
                      key={log.id}
                      log={log}
                      onDelete={handleDeleteLog}
                      isPro={isPro}
                      pilotName={profile?.full_name ?? null}
                      faaCert={profile?.faa_certificate ?? null}
                      insurancePolicy={profile?.insurance_policy ?? null}
                      insuranceProvider={profile?.insurance_provider ?? null}
                      insuranceType={profile?.insurance_type ?? null}
                      isSelected={selectedIds.has(log.id)}
                      onToggleSelect={toggleSelect}
                    />
                  ))}
                </tbody>
              </table>
              )}  {/* end filteredLogs.length > 0 */}
            </div>
          )
        )}

        {/* ── SMART HANGAR TAB ── */}
        {!loading && tab === 'drones' && (
          <div className="db-hangar-wrap">

            {/* ── Fleet Health ── */}
            <div className="db-hangar-section">
              <div className="db-hangar-header">
                <h2 className="db-hangar-title">🚁 Fleet Health</h2>
                <div className="db-hangar-header-actions">
                  {isPro && drones.length > 0 && (
                    <button
                      className="db-btn-fleet-pdf"
                      onClick={handleFleetReport}
                      disabled={fleetExporting}
                      title="Download printable Part 107 fleet maintenance report"
                    >
                      {fleetExporting
                        ? <><span className="db-spinner db-spinner--sm" /> Generating…</>
                        : <>📄 Print Fleet Report</>}
                    </button>
                  )}
                  <button
                    className="db-btn-add-drone"
                    onClick={() => { setShowAddDrone(v => !v); setAddDroneError(''); }}
                  >
                    {showAddDrone ? '✕ Cancel' : '+ Add to Fleet'}
                  </button>
                </div>
              </div>

              {/* ── Inline add-drone form ── */}
              {showAddDrone && (
                <div className="db-add-drone-form">
                  <div className="db-add-drone-row">
                    <input
                      className="modal-input"
                      placeholder="Drone name (required)"
                      value={newDroneName}
                      onChange={e => setNewDroneName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddDrone(); }}
                    />
                    <input
                      className="modal-input"
                      placeholder="FAA Reg # (e.g. FA3XXXXXX)"
                      value={newDroneFaa}
                      onChange={e => setNewDroneFaa(e.target.value)}
                    />
                    <input
                      className="modal-input"
                      placeholder="Serial number"
                      value={newDroneSerial}
                      onChange={e => setNewDroneSerial(e.target.value)}
                    />
                    <input
                      className="modal-input"
                      type="number"
                      min="1"
                      placeholder="Prop service (hrs)"
                      value={newDronePropInt}
                      onChange={e => setNewDronePropInt(e.target.value)}
                      style={{ maxWidth: 150 }}
                      title="Hours between propeller replacements (default 20 hrs)"
                    />
                    <input
                      className="modal-input"
                      type="number"
                      min="1"
                      placeholder="Airframe service (hrs)"
                      value={newDroneAirframeInt}
                      onChange={e => setNewDroneAirframeInt(e.target.value)}
                      style={{ maxWidth: 160 }}
                      title="Hours between airframe inspections (default 50 hrs)"
                    />
                    <button
                      className="modal-btn-save"
                      onClick={handleAddDrone}
                      disabled={addingDrone}
                    >
                      {addingDrone ? 'Saving…' : '🚁 Save Drone'}
                    </button>
                  </div>
                  {addDroneError && (
                    <div className="db-alert" style={{ marginTop: '0.5rem' }}>{addDroneError}</div>
                  )}
                </div>
              )}

              {drones.length === 0 && !showAddDrone ? (
                <div className="db-empty">
                  <div className="db-empty-icon">🚁</div>
                  <h3>No drones in your hangar</h3>
                  <p>Click <strong>+ Add to Fleet</strong> above or add drones in the mobile app — they'll sync here automatically.</p>
                </div>
              ) : drones.length > 0 && (
                <div className="db-drone-grid">
                  {drones.map(drone => {
                    // flight_logs uses drone_name (text) — match by name, not drone_id
                    const droneLogs = logs.filter(l => l.drone_name === drone.name);
                    const totalMins = droneLogs.reduce((s, l) => s + (l.duration ?? 0), 0);
                    const totalHrs  = totalMins / 60;

                    // ── Prop health (Mission Readiness columns) ──
                    const propInterval  = drone.prop_service_interval  ?? 20;
                    const propLastReset = drone.last_prop_service_hours ?? 0;
                    const propHrsSince  = Math.max(0, totalHrs - propLastReset);
                    const propPct       = propInterval > 0 ? (propHrsSince / propInterval) * 100 : 0;
                    const propColor     = propPct < 80 ? 'db-health-bar--green' :
                                         propPct < 100 ? 'db-health-bar--yellow' :
                                                         'db-health-bar--red';

                    // ── Airframe health ──
                    const airInterval  = drone.airframe_service_interval  ?? 50;
                    const airLastReset = drone.last_airframe_service_hours ?? 0;
                    const airHrsSince  = Math.max(0, totalHrs - airLastReset);
                    const airPct       = airInterval > 0 ? (airHrsSince / airInterval) * 100 : 0;
                    const airColor     = airPct < 80 ? 'db-health-bar--green' :
                                        airPct < 100 ? 'db-health-bar--yellow' :
                                                       'db-health-bar--red';

                    return (
                      <div key={drone.id} className={`db-drone-card${drone.id === activeDroneId ? ' db-drone-card--active' : ''}`}>
                        <div className="db-drone-card-top">
                          <div className="db-drone-icon">🚁</div>
                          {drone.id === activeDroneId && (
                            <span className="db-badge-active">✈ Active</span>
                          )}
                        </div>
                        <div className="db-drone-name">{drone.name ?? 'Unnamed Drone'}</div>

                        {drone.faa_reg_number && (
                          <div className="db-drone-detail">
                            <span className="db-detail-label">FAA Reg</span>
                            <span>{drone.faa_reg_number}</span>
                          </div>
                        )}
                        {drone.serial_number && (
                          <div className="db-drone-detail">
                            <span className="db-detail-label">Serial</span>
                            <span>{drone.serial_number}</span>
                          </div>
                        )}
                        <div className="db-drone-detail">
                          <span className="db-detail-label">Total Hours</span>
                          <span>{totalHrs.toFixed(1)} hr</span>
                        </div>

                        {/* ── Propeller Health Bar ── */}
                        <div className="db-health-section">
                          <div className="db-health-label-row">
                            <span className="db-health-label-text">🔩 Props</span>
                            <span className={`db-health-pct ${propColor}`}>
                              {Math.min(propPct, 999).toFixed(0)}%
                            </span>
                          </div>
                          <div className="db-health-track">
                            <div
                              className={`db-health-fill ${propColor}`}
                              style={{ width: `${Math.min(propPct, 100)}%` }}
                            />
                          </div>
                          <div className="db-health-meta">
                            {propHrsSince.toFixed(1)}h used &middot; {Math.max(0, propInterval - propHrsSince).toFixed(1)}h left
                          </div>
                        </div>

                        {/* ── Airframe Health Bar ── */}
                        <div className="db-health-section">
                          <div className="db-health-label-row">
                            <span className="db-health-label-text">🛠 Airframe</span>
                            <span className={`db-health-pct ${airColor}`}>
                              {Math.min(airPct, 999).toFixed(0)}%
                            </span>
                          </div>
                          <div className="db-health-track">
                            <div
                              className={`db-health-fill ${airColor}`}
                              style={{ width: `${Math.min(airPct, 100)}%` }}
                            />
                          </div>
                          <div className="db-health-meta">
                            {airHrsSince.toFixed(1)}h used &middot; {Math.max(0, airInterval - airHrsSince).toFixed(1)}h left
                          </div>
                        </div>

                        {/* ── Maintenance reset buttons ── */}
                        <div className="db-drone-reset-row">
                          <button
                            className="db-btn-reset-prop"
                            onClick={() => handleResetPropellers(drone.id, totalHrs, drone.last_prop_service_hours)}
                            title="Mark props as replaced — resets prop service clock"
                          >
                            🔩 Props OK
                          </button>
                          <button
                            className="db-btn-reset-airframe"
                            onClick={() => handleResetAirframe(drone.id, totalHrs, drone.last_airframe_service_hours)}
                            title="Mark airframe inspected — resets airframe service clock"
                          >
                            🛠 Airframe OK
                          </button>
                        </div>

                        <div className="db-drone-card-footer">
                          <div className="db-drone-added">
                            Added {new Date(drone.created_at).toLocaleDateString()}
                          </div>
                          <div className="db-drone-card-actions">
                            <button
                              className="db-btn-edit-drone"
                              onClick={() => {
                                setEditingDrone(drone);
                                setEditDroneName(drone.name ?? '');
                                setEditDroneFaa(drone.faa_reg_number ?? '');
                                setEditDroneSerial(drone.serial_number ?? '');
                                setEditDronePropInt(String(drone.prop_service_interval ?? 20));
                                setEditDroneAirframeInt(String(drone.airframe_service_interval ?? 50));
                                setEditDroneMaxCycles(String(drone.battery_max_cycles ?? 300));
                                setEditDroneError('');
                              }}
                              title="Edit this drone's details and service intervals"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="db-btn-delete-drone"
                              onClick={() => handleDeleteDrone(drone.id, drone.name)}
                              title="Permanently delete this drone and all its batteries"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Battery Management ── */}
            <div className="db-hangar-section">
              <div className="db-hangar-header">
                <h2 className="db-hangar-title">🔋 Battery Management</h2>
                <button
                  className="db-btn-add-battery"
                  onClick={() => { setShowAddBattery(v => !v); setAddBatteryError(''); }}
                >
                  {showAddBattery ? '✕ Cancel' : '+ Add Battery'}
                </button>
              </div>

              {/* Inline add-battery form */}
              {showAddBattery && (
                <div className="db-add-battery-form">
                  <div className="db-add-battery-row">
                    <input
                      className="modal-input"
                      placeholder="Battery name (e.g. LiPo 4S #1)"
                      value={newBatteryName}
                      onChange={e => setNewBatteryName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddBattery(); }}
                    />
                    <select
                      className="modal-select"
                      value={newBatteryDroneId}
                      onChange={e => setNewBatteryDroneId(e.target.value)}
                    >
                      <option value="">No drone assigned</option>
                      {drones.map(d => (
                        <option key={d.id} value={d.id}>{d.name ?? 'Unnamed Drone'}</option>
                      ))}
                    </select>
                    <input
                      className="modal-input"
                      type="number"
                      min="0"
                      placeholder="Capacity (mAh)"
                      value={newBatteryCapacity}
                      onChange={e => setNewBatteryCapacity(e.target.value)}
                      style={{ maxWidth: 150 }}
                    />
                    <button
                      className="modal-btn-save"
                      onClick={handleAddBattery}
                      disabled={addingBattery}
                    >
                      {addingBattery ? 'Saving…' : 'Save Battery'}
                    </button>
                  </div>
                  {addBatteryError && (
                    <div className="db-alert" style={{ marginTop: '0.5rem' }}>{addBatteryError}</div>
                  )}
                </div>
              )}

              {batteries.length === 0 && !showAddBattery ? (
                <div className="db-empty-inline">
                  No batteries tracked yet. Click <strong>+ Add Battery</strong> to start.
                </div>
              ) : batteries.length > 0 && (
                <div className="db-battery-grid">
                  {batteries.map(battery => {
                    const assignedDrone = battery.drone_id
                      ? drones.find(d => d.id === battery.drone_id)
                      : null;
                    const droneName  = assignedDrone?.name ?? (battery.drone_id ? 'Unknown Drone' : null);
                    const maxCycles  = assignedDrone?.battery_max_cycles ?? 300;
                    const cyclePct   = Math.min((battery.cycle_count / maxCycles) * 100, 100);
                    const cycleColor = cyclePct < 60  ? 'db-health-bar--green' :
                                       cyclePct < 85  ? 'db-health-bar--yellow' :
                                                        'db-health-bar--red';
                    return (
                      <div key={battery.id} className="db-battery-card">
                        <div className="db-battery-name">{battery.name ?? 'Unnamed Battery'}</div>
                        <div className="db-battery-cycles">
                          <span className="db-battery-cycle-val">{battery.cycle_count}</span>
                          <span className="db-battery-cycle-lbl">/ {maxCycles} cycles</span>
                        </div>

                        {/* ── Battery cycle health bar ── */}
                        <div className="db-battery-health">
                          <div className="db-health-track">
                            <div
                              className={`db-health-fill ${cycleColor}`}
                              style={{ width: `${cyclePct}%` }}
                            />
                          </div>
                          <div className="db-health-meta">{cyclePct.toFixed(0)}% worn</div>
                        </div>

                        {battery.capacity_mah != null && (
                          <div className="db-battery-meta">{battery.capacity_mah.toLocaleString()} mAh</div>
                        )}
                        {droneName && (
                          <div className="db-battery-drone">🚁 {droneName}</div>
                        )}
                        <div className="db-battery-actions">
                          <button
                            className="db-btn-log-charge"
                            onClick={() => handleLogCharge(battery.id, battery.cycle_count)}
                            title="Increment charge cycle count by 1"
                          >
                            ⚡ Log Charge
                          </button>
                          <button
                            className="db-btn-delete-battery"
                            onClick={() => handleDeleteBattery(battery.id, battery.name)}
                            title="Permanently delete this battery"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
        {/* ── REPORTS TAB ── */}
        {tab === 'reports' && (
          <div className="db-reports-wrap">

            {/* ── Maintenance History ── */}
            <div className="db-report-section">
              <div className="db-report-section-header">
                <h2 className="db-report-section-title">🔧 Maintenance History</h2>
                <div className="db-report-header-actions">
                  <span className="db-report-count">{maintenanceLogs.length} records</span>
                  {maintenanceLogs.length > 0 && (
                    <button
                      className="db-btn-export-pdf"
                      onClick={handleExportMaintenancePDF}
                      disabled={maintenanceExporting}
                      title="Download maintenance history as PDF"
                    >
                      {maintenanceExporting ? '⏳ Generating…' : '⬇ Export PDF'}
                    </button>
                  )}
                </div>
              </div>
              {maintenanceLogs.length === 0 ? (
                <div className="db-empty-inline">No maintenance records yet. Reset a Prop or Airframe service clock to create your first entry.</div>
              ) : (
                <div className="db-report-table-wrap">
                  <table className="db-report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Drone</th>
                        <th>Service Type</th>
                        <th>Hours at Service</th>
                        <th>Notes</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceLogs.map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td>{drones.find(d => d.id === log.drone_id)?.name ?? <span className="db-muted">Unknown</span>}</td>
                          <td>
                            <span className={`db-badge ${log.service_type === 'Propellers' ? 'db-badge--purple' : 'db-badge--blue'}`}>
                              {log.service_type === 'Propellers' ? '🔩' : '🛠'} {log.service_type}
                            </span>
                          </td>
                          <td>{Number(log.hours_at_service).toFixed(1)} hr</td>
                          <td>{log.notes ?? <span className="db-muted">—</span>}</td>
                          <td>
                            <div className="db-report-row-actions">
                              <button
                                className="db-btn-edit-log"
                                onClick={() => {
                                  setEditingLog(log);
                                  setEditLogNotes(log.notes ?? '');
                                  setEditLogHours(String(log.hours_at_service));
                                  setEditLogError('');
                                }}
                                title="Edit this maintenance record"
                              >✏️</button>
                              <button
                                className="db-btn-report-delete"
                                onClick={() => handleDeleteMaintenanceLog(log.id)}
                                title="Delete this maintenance record"
                              >🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Pre-flight History ── */}
            <div className="db-report-section">
              <div className="db-report-section-header">
                <h2 className="db-report-section-title">✅ Pre-flight History</h2>
                <span className="db-report-count">{preflightHistory.length} records</span>
              </div>
              {preflightHistory.length === 0 ? (
                <div className="db-empty-inline">No pre-flight records yet. Click <strong>✅ Pre-flight</strong> in the header to run your first check.</div>
              ) : (
                <div className="db-report-table-wrap">
                  <table className="db-report-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Drone</th>
                        <th>Location</th>
                        <th>Checklist</th>
                        <th>Weather</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preflightHistory.map(record => {
                        const items      = record.checklist_data ?? {};
                        const total      = Object.keys(items).length;
                        const checked    = Object.values(items).filter(Boolean).length;
                        const allGreen   = total > 0 && checked === total;
                        const weather    = record.weather_snapshot as any;
                        return (
                          <tr key={record.id}>
                            <td>
                              <div>{new Date(record.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              <div className="db-muted" style={{ fontSize: '0.78rem' }}>{new Date(record.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                            </td>
                            <td>{record.drone_id ? (drones.find(d => d.id === record.drone_id)?.name ?? <span className="db-muted">Unknown</span>) : <span className="db-muted">—</span>}</td>
                            <td>
                              {record.latitude != null && record.longitude != null ? (
                                <a
                                  href={`https://maps.google.com/?q=${record.latitude},${record.longitude}`}
                                  target="_blank" rel="noreferrer"
                                  className="db-detail-link"
                                >
                                  {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                                </a>
                              ) : (
                                <span className="db-muted">{record.location_name ?? '—'}</span>
                              )}
                            </td>
                            <td>
                              <span className={`db-badge ${allGreen ? 'db-badge--green' : 'db-badge--yellow'}`}>
                                {checked}/{total} ✓
                              </span>
                            </td>
                            <td>
                              {weather
                                ? <span>{weather.wind_mph != null ? `${weather.wind_mph} mph` : '—'}{weather.temp_f != null ? ` · ${weather.temp_f}°F` : ''}</span>
                                : <span className="db-muted">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── EDIT DRONE MODAL ── */}
        {editingDrone && (
          <div className="db-modal-overlay" onClick={() => setEditingDrone(null)}>
            <div className="db-modal db-edit-drone-modal" onClick={e => e.stopPropagation()}>

              <button
                className="db-modal-close-abs"
                onClick={() => setEditingDrone(null)}
                aria-label="Close"
              >✕</button>

              <div className="db-modal-header">
                <h2 className="db-modal-title">✏️ Edit Drone</h2>
              </div>

              <div className="db-modal-body">
                <div className="db-form-group">
                  <label className="db-form-label">Drone Name <span className="db-form-required">*</span></label>
                  <input
                    type="text"
                    className="db-form-input"
                    placeholder="e.g. DJI Mini 4 Pro"
                    value={editDroneName}
                    onChange={e => setEditDroneName(e.target.value)}
                  />
                </div>

                <div className="db-form-group">
                  <label className="db-form-label">FAA Reg # <span className="db-form-optional">(optional)</span></label>
                  <input
                    type="text"
                    className="db-form-input"
                    placeholder="e.g. FA3-XXXX-XXXX"
                    value={editDroneFaa}
                    onChange={e => setEditDroneFaa(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="db-form-group">
                  <label className="db-form-label">Serial Number <span className="db-form-optional">(optional)</span></label>
                  <input
                    type="text"
                    className="db-form-input"
                    placeholder="Manufacturer serial #"
                    value={editDroneSerial}
                    onChange={e => setEditDroneSerial(e.target.value)}
                  />
                </div>

                <div className="db-edit-drone-intervals">
                  <div className="db-form-group">
                    <label className="db-form-label">Prop Service Interval (hrs)</label>
                    <input
                      type="number"
                      min="1"
                      className="db-form-input"
                      placeholder="e.g. 20"
                      value={editDronePropInt}
                      onChange={e => setEditDronePropInt(e.target.value)}
                    />
                  </div>
                  <div className="db-form-group">
                    <label className="db-form-label">Airframe Service Interval (hrs)</label>
                    <input
                      type="number"
                      min="1"
                      className="db-form-input"
                      placeholder="e.g. 50"
                      value={editDroneAirframeInt}
                      onChange={e => setEditDroneAirframeInt(e.target.value)}
                    />
                  </div>
                  <div className="db-form-group">
                    <label className="db-form-label">Max Battery Cycles</label>
                    <input
                      type="number"
                      min="1"
                      className="db-form-input"
                      placeholder="e.g. 300"
                      value={editDroneMaxCycles}
                      onChange={e => setEditDroneMaxCycles(e.target.value)}
                    />
                  </div>
                </div>

                {editDroneError && (
                  <div className="db-form-error">{editDroneError}</div>
                )}
              </div>

              <div className="db-modal-footer">
                <button
                  className="db-btn-ghost"
                  onClick={() => setEditingDrone(null)}
                  disabled={savingEditDrone}
                >
                  Cancel
                </button>
                <button
                  className="db-btn-primary db-btn-gold"
                  onClick={handleUpdateDrone}
                  disabled={savingEditDrone}
                >
                  {savingEditDrone ? '⏳ Saving…' : '✔ Save Changes'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── EDIT MAINTENANCE LOG MODAL ── */}
        {editingLog && (
          <div className="db-modal-overlay" onClick={() => setEditingLog(null)}>
            <div className="db-modal db-edit-log-modal" onClick={e => e.stopPropagation()}>

              {/* Absolute close button — top-right corner */}
              <button
                className="db-modal-close-abs"
                onClick={() => setEditingLog(null)}
                aria-label="Close"
              >✕</button>

              {/* Header — title only, no close button competing for space */}
              <div className="db-modal-header">
                <h2 className="db-modal-title">✏️ Edit Maintenance Record</h2>
              </div>

              {/* Scrollable body */}
              <div className="db-modal-body">

                {/* Context badge */}
                <div className="db-edit-log-meta">
                  <span className={`db-badge ${editingLog.service_type === 'Propellers' ? 'db-badge--purple' : 'db-badge--blue'}`}>
                    {editingLog.service_type === 'Propellers' ? '🔩' : '🛠'} {editingLog.service_type}
                  </span>
                  <span className="db-muted" style={{ fontSize: '0.85rem' }}>
                    {drones.find(d => d.id === editingLog.drone_id)?.name ?? 'Unknown Drone'} · {new Date(editingLog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="db-form-group">
                  <label className="db-form-label">Hours at Service <span className="db-form-required">*</span></label>
                  <input
                    type="number"
                    className="db-form-input"
                    placeholder="e.g. 42.5"
                    min="0"
                    step="0.1"
                    value={editLogHours}
                    onChange={e => setEditLogHours(e.target.value)}
                  />
                </div>

                <div className="db-form-group">
                  <label className="db-form-label">Notes <span className="db-form-optional">(optional)</span></label>
                  <textarea
                    className="db-form-textarea"
                    placeholder="Add any notes about this service…"
                    rows={3}
                    value={editLogNotes}
                    onChange={e => setEditLogNotes(e.target.value)}
                  />
                </div>

                {editLogError && (
                  <div className="db-form-error">{editLogError}</div>
                )}

              </div>

              {/* Footer — ghost Cancel + gold Update, bottom-right */}
              <div className="db-modal-footer">
                <button
                  className="db-btn-ghost"
                  onClick={() => setEditingLog(null)}
                  disabled={savingEditLog}
                >
                  Cancel
                </button>
                <button
                  className="db-btn-primary db-btn-gold"
                  onClick={handleUpdateMaintenanceLog}
                  disabled={savingEditLog}
                >
                  {savingEditLog ? '⏳ Saving…' : '✔ Update Record'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── PRE-FLIGHT CHECKLIST MODAL ── */}
        {showChecklist && (
          <div className="db-modal-overlay" onClick={() => setShowChecklist(false)}>
            <div className="db-modal db-checklist-modal" onClick={e => e.stopPropagation()}>
              <div className="db-modal-header">
                <h2 className="db-modal-title">✅ Part 107 Pre-flight Checklist</h2>
                <button className="db-modal-close" onClick={() => setShowChecklist(false)}>✕</button>
              </div>

              {/* Active Drone selector — persisted to localStorage */}
              <div className="db-checklist-drone-row">
                <label className="db-checklist-label">Active Drone</label>
                <select
                  className={`modal-select${checklistDroneError ? ' db-select--error' : ''}`}
                  value={activeDroneId}
                  onChange={e => { setActiveDroneId(e.target.value); setChecklistDroneError(false); }}
                >
                  <option value="">— Select active drone —</option>
                  {drones.map(d => (
                    <option key={d.id} value={d.id}>{d.name ?? 'Unnamed Drone'}</option>
                  ))}
                </select>
              </div>
              {checklistDroneError && (
                <div className="db-checklist-drone-warning">
                  ⚠️ Please select an active drone from your fleet to log this flight.
                </div>
              )}

              {/* Checklist items */}
              <div className="db-checklist-items">
                {Object.entries(CHECKLIST_ITEMS).map(([key, label]) => (
                  <label key={key} className={`db-checklist-item${checklistItems[key] ? ' db-checklist-item--checked' : ''}`}>
                    <input
                      type="checkbox"
                      className="db-checklist-checkbox"
                      checked={!!checklistItems[key]}
                      onChange={e => setChecklistItems(prev => ({ ...prev, [key]: e.target.checked }))}
                    />
                    <span className="db-checklist-item-label">{label}</span>
                  </label>
                ))}
              </div>

              {/* Progress bar */}
              {(() => {
                const total   = Object.keys(CHECKLIST_ITEMS).length;
                const checked = Object.values(checklistItems).filter(Boolean).length;
                const pct     = (checked / total) * 100;
                return (
                  <div className="db-checklist-progress">
                    <div className="db-health-track">
                      <div
                        className={`db-health-fill ${pct === 100 ? 'db-health-bar--green' : pct > 50 ? 'db-health-bar--yellow' : 'db-health-bar--red'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="db-checklist-progress-label">{checked} / {total} items complete</div>
                  </div>
                );
              })()}

              <div className="db-checklist-footer">
                {checklistSaved ? (
                  <div className="db-checklist-saved">✅ Pre-flight record saved!</div>
                ) : (
                  <button
                    className="db-btn-checklist-save"
                    onClick={handleSavePreflight}
                    disabled={savingChecklist}
                  >
                    {savingChecklist ? 'Saving…' : '📋 Complete & Save Pre-flight Record'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="db-settings-page">

            {/* Account info */}
            <section className="db-settings-section">
              <h2 className="db-settings-section__title">Account</h2>
              <div className="db-settings-row">
                <span className="db-settings-label">Email</span>
                <span className="db-settings-value">{user.email}</span>
              </div>
            </section>

            {/* Pilot Credentials */}
            <section className="db-settings-section">
              <h2 className="db-settings-section__title">Pilot Credentials</h2>
              <p className="db-settings-desc">
                These details are embedded in the footer of every exported PDF report
                for FAA Part 107 compliance.
              </p>

              <div className="db-settings-creds-grid">

                {/* Row 1 — FAA cert + Insurance Policy */}
                <div className="db-settings-field-group">
                  <label className="db-settings-field-label" htmlFor="faa-cert-input">
                    FAA Part 107 Certificate #
                  </label>
                  <input
                    id="faa-cert-input"
                    type="text"
                    className="db-settings-input"
                    placeholder="e.g. 4057732"
                    maxLength={20}
                    value={faaInput}
                    onChange={e => { setFaaInput(e.target.value); setCredsSaved(false); setCredsError(''); }}
                  />
                </div>

                <div className="db-settings-field-group">
                  <label className="db-settings-field-label" htmlFor="insurance-policy-input">
                    Insurance Policy #
                  </label>
                  <input
                    id="insurance-policy-input"
                    type="text"
                    className="db-settings-input"
                    placeholder="e.g. PF107-123456"
                    maxLength={40}
                    value={insurancePolicyInput}
                    onChange={e => { setInsurancePolicyInput(e.target.value); setCredsSaved(false); setCredsError(''); }}
                  />
                </div>

                {/* Row 2 — Insurance Provider + Insurance Type */}
                <div className="db-settings-field-group">
                  <label className="db-settings-field-label" htmlFor="insurance-provider-input">
                    Insurance Provider
                  </label>
                  <input
                    id="insurance-provider-input"
                    type="text"
                    className="db-settings-input"
                    placeholder="e.g. SkyWatch, Global Aerospace"
                    maxLength={60}
                    value={insuranceProviderInput}
                    onChange={e => { setInsuranceProviderInput(e.target.value); setCredsSaved(false); setCredsError(''); }}
                  />
                </div>

                <div className="db-settings-field-group">
                  <label className="db-settings-field-label" htmlFor="insurance-type-input">
                    Insurance Type
                  </label>
                  <select
                    id="insurance-type-input"
                    className="db-settings-select"
                    value={insuranceTypeInput}
                    onChange={e => { setInsuranceTypeInput(e.target.value); setCredsSaved(false); setCredsError(''); }}
                  >
                    <option value="">— Select type —</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

              </div>

              {credsError && <div className="db-settings-error">{credsError}</div>}

              <div className="db-settings-save-row">
                <button
                  className="db-settings-save-btn"
                  onClick={handleSavePilotCreds}
                  disabled={savingCreds}
                >
                  {savingCreds ? '⏳ Saving…' : 'Save Credentials'}
                </button>
                {credsSaved && (
                  <span className="db-settings-saved-badge">✔ Saved!</span>
                )}
              </div>
            </section>

            {/* Linked Accounts */}
            <section className="db-settings-section">
              <h2 className="db-settings-section__title">Linked Accounts</h2>
              <p className="db-settings-desc">
                Link additional sign-in methods so both point to the same account,
                keeping your Garage and Flight Logs synced regardless of which
                provider you use.
              </p>

              {linkError && <div className="db-alert">{linkError}</div>}

              {identitiesLoading ? (
                <div className="db-loading db-loading--inline">
                  <div className="db-spinner db-spinner--sm" /> Loading linked accounts…
                </div>
              ) : (
                <div className="db-linked-accounts">
                  {/* Google */}
                  {(() => {
                    const linked = identities.some(i => i.provider === 'google');
                    return (
                      <div className="db-linked-account-row">
                        <span className="db-linked-account-icon">🔵</span>
                        <span className="db-linked-account-name">Google</span>
                        {linked ? (
                          <span className="db-badge db-badge--green db-linked-account-status">
                            ✓ Linked
                          </span>
                        ) : (
                          <button
                            className="db-btn-link-provider"
                            disabled={!!linkingProvider}
                            onClick={() => handleLinkIdentity('google')}
                          >
                            {linkingProvider === 'google' ? 'Redirecting…' : 'Link Google'}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Apple */}
                  {(() => {
                    const linked = identities.some(i => i.provider === 'apple');
                    return (
                      <div className="db-linked-account-row">
                        <span className="db-linked-account-icon">🍎</span>
                        <span className="db-linked-account-name">Apple ID</span>
                        {linked ? (
                          <span className="db-badge db-badge--green db-linked-account-status">
                            ✓ Linked
                          </span>
                        ) : (
                          <button
                            className="db-btn-link-provider"
                            disabled={!!linkingProvider}
                            onClick={() => handleLinkIdentity('apple')}
                          >
                            {linkingProvider === 'apple' ? 'Redirecting…' : 'Link Apple ID'}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>

            {/* Legal */}
            <section className="db-settings-section">
              <h2 className="db-settings-section__title">Legal</h2>
              <div className="db-settings-legal-links">
                <a
                  href="/terms"
                  className="db-settings-legal-link"
                  onClick={e => { e.preventDefault(); navigate('/terms'); }}
                >
                  📄 Terms of Service
                </a>
                <a
                  href="/privacy"
                  className="db-settings-legal-link"
                  onClick={e => { e.preventDefault(); navigate('/privacy'); }}
                >
                  🔒 Privacy Policy
                </a>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* ── New Log Modal ── */}
      {showModal && session && user && (
        <NewLogModal
          drones={drones}
          userId={user.id}
          accessToken={session.access_token}
          isPro={isPro}
          logsCount={logsCount}
          onSave={handleLogSaved}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
