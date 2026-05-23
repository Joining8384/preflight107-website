// /app/briefings/new — Create a Mission Briefing (web)
//
// Mirrors the iOS app's 6-step Mission Briefing form, laid out as a single
// scrolling page with section headers (more natural for desktop than a
// stepper). Writes a draft row to `briefings`, then invokes the same
// `generate-briefing-pdf` Edge Function the app calls — resulting PDF is
// byte-identical to the one the iOS app produces.

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import DashboardSidebar from './DashboardSidebar';
import { navigate } from './navigate';
import { SUPABASE_URL, insertRow, updateRow } from './supabase';

type Tier = 'free' | 'pro' | 'pro_plus';

async function fetchTier(accessToken: string, userId: string): Promise<Tier> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_tier`, {
      method: 'POST',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON as string,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid: userId }),
    });
    if (!res.ok) return 'free';
    const data = await res.json();
    return (data as Tier) ?? 'free';
  } catch { return 'free'; }
}

// User-editable form state — mirrors DraftBriefing in the iOS app exactly.
interface Form {
  mission_name: string;
  client_name: string;
  project_code: string;
  mission_objective: string;
  planned_departure_at: string;
  planned_duration_minutes: string;
  client_mode_enabled: boolean;

  pilot_name: string;
  pilot_part107_cert: string;
  pilot_recurrent_date: string;

  drone_model: string;
  drone_manufacturer: string;
  drone_faa_registration: string;
  drone_serial: string;
  drone_firmware_version: string;
  drone_max_wind_kt: string;
  drone_max_flight_time_min: string;

  insurance_carrier: string;
  insurance_policy_number: string;
  insurance_coverage_amount: string;

  launch_address: string;
  launch_latitude: string;
  launch_longitude: string;
  operational_radius_ft: string;
  laanc_approval_id: string;
  laanc_ceiling_ft: string;

  fly_now_score: string;
  emergency_procedures: string;
  risk_factors_text: string;
  emergency_contacts_text: string;

  pre_flight_checklist_text: string;
  battery_levels_text: string;
  visual_observer_name: string;
  visual_observer_cert: string;
  crew_roster_text: string;
}

const EMPTY: Form = {
  mission_name: '', client_name: '', project_code: '', mission_objective: '',
  planned_departure_at: '', planned_duration_minutes: '',
  client_mode_enabled: false,
  pilot_name: '', pilot_part107_cert: '', pilot_recurrent_date: '',
  drone_model: '', drone_manufacturer: '', drone_faa_registration: '',
  drone_serial: '', drone_firmware_version: '', drone_max_wind_kt: '',
  drone_max_flight_time_min: '',
  insurance_carrier: '', insurance_policy_number: '', insurance_coverage_amount: '',
  launch_address: '', launch_latitude: '', launch_longitude: '',
  operational_radius_ft: '', laanc_approval_id: '', laanc_ceiling_ft: '',
  fly_now_score: '', emergency_procedures: '',
  risk_factors_text: '', emergency_contacts_text: '',
  pre_flight_checklist_text: '', battery_levels_text: '',
  visual_observer_name: '', visual_observer_cert: '', crew_roster_text: '',
};

// Same text-block parsers the iOS app uses, kept consistent so PDFs match.
function parseRiskFactors(text: string): Array<{ risk: string; severity: string; mitigation: string }> {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split('|').map(p => p.trim());
    return { risk: parts[0] || '', severity: parts[1] || '', mitigation: parts[2] || '' };
  });
}

function parseEmergencyContacts(text: string): Array<{ name: string; phone: string; relation: string }> {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split(',').map(p => p.trim());
    return { name: parts[0] || '', phone: parts[1] || '', relation: parts[2] || '' };
  });
}

function parseChecklist(text: string): Array<{ item: string; checked: boolean; notes: string }> {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => ({
    item: line, checked: false, notes: '',
  }));
}

function parseBatteries(text: string): Array<{ battery_id: string; charge_percent: number }> {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const m = line.match(/^(.+?):\s*(\d+)\s*%?$/);
    return { battery_id: m?.[1] ?? line, charge_percent: m ? Number(m[2]) : 0 };
  });
}

function parseCrew(text: string): Array<{ name: string; role: string }> {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split(',').map(p => p.trim());
    return { name: parts[0] || '', role: parts[1] || '' };
  });
}

export default function AppBriefingNewPage() {
  const { session, user, signOut } = useAuth();
  const [tier, setTier] = useState<Tier | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token || !user?.id) {
      navigate('/login');
      return;
    }
    fetchTier(session.access_token, user.id).then(setTier);
  }, [session?.access_token, user?.id]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  const valid = useMemo(() => {
    if (!form.mission_name.trim()) return 'Mission name is required';
    if (!form.launch_latitude || !form.launch_longitude) return 'Launch coordinates are required';
    if (isNaN(parseFloat(form.launch_latitude)) || isNaN(parseFloat(form.launch_longitude))) {
      return 'Launch coordinates must be decimal numbers';
    }
    if (!form.planned_departure_at) return 'Planned departure time is required';
    return null;
  }, [form]);

  async function handleGenerate() {
    if (!session?.access_token) return;
    if (valid) { setError(valid); return; }
    setSubmitting(true);
    setError(null);

    try {
      // 1. INSERT a draft briefing row. RLS scopes to user.id automatically.
      setProgress('Saving draft…');
      const draftPayload = {
        mission_name: form.mission_name.trim(),
        client_name: form.client_name.trim() || null,
        project_code: form.project_code.trim() || null,
        mission_objective: form.mission_objective.trim() || null,
        planned_departure_at: form.planned_departure_at || null,
        planned_duration_minutes: form.planned_duration_minutes ? parseInt(form.planned_duration_minutes, 10) : null,
        client_mode_enabled: form.client_mode_enabled,

        pilot_name: form.pilot_name.trim() || null,
        pilot_part107_cert: form.pilot_part107_cert.trim() || null,
        pilot_recurrent_date: form.pilot_recurrent_date || null,

        drone_model: form.drone_model.trim() || null,
        drone_manufacturer: form.drone_manufacturer.trim() || null,
        drone_faa_registration: form.drone_faa_registration.trim() || null,
        drone_serial: form.drone_serial.trim() || null,
        drone_firmware_version: form.drone_firmware_version.trim() || null,
        drone_max_wind_kt: form.drone_max_wind_kt ? parseInt(form.drone_max_wind_kt, 10) : null,
        drone_max_flight_time_min: form.drone_max_flight_time_min ? parseInt(form.drone_max_flight_time_min, 10) : null,

        insurance_carrier: form.insurance_carrier.trim() || null,
        insurance_policy_number: form.insurance_policy_number.trim() || null,
        insurance_coverage_amount: form.insurance_coverage_amount.trim() || null,

        launch_address: form.launch_address.trim() || null,
        launch_latitude: parseFloat(form.launch_latitude),
        launch_longitude: parseFloat(form.launch_longitude),
        operational_radius_ft: form.operational_radius_ft ? parseInt(form.operational_radius_ft, 10) : null,
        laanc_approval_id: form.laanc_approval_id.trim() || null,
        laanc_ceiling_ft: form.laanc_ceiling_ft ? parseInt(form.laanc_ceiling_ft, 10) : null,

        fly_now_score: form.fly_now_score ? parseInt(form.fly_now_score, 10) : null,
        emergency_procedures: form.emergency_procedures.trim() || null,
        risk_factors: form.risk_factors_text.trim() ? parseRiskFactors(form.risk_factors_text) : null,
        emergency_contacts: form.emergency_contacts_text.trim() ? parseEmergencyContacts(form.emergency_contacts_text) : null,

        pre_flight_checklist: form.pre_flight_checklist_text.trim() ? parseChecklist(form.pre_flight_checklist_text) : null,
        battery_levels: form.battery_levels_text.trim() ? parseBatteries(form.battery_levels_text) : null,
        visual_observer_name: form.visual_observer_name.trim() || null,
        visual_observer_cert: form.visual_observer_cert.trim() || null,
        crew_roster: form.crew_roster_text.trim() ? parseCrew(form.crew_roster_text) : null,

        status: 'draft' as const,
      };

      const draft = await insertRow<{ id: string }>('briefings', draftPayload, session.access_token);

      // 2. Invoke the Edge Function with the briefing_id.
      setProgress('Generating PDF — fetching weather, airspace, hazards…');
      const fnRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-briefing-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefing_id: draft.id }),
      });

      const fnBody = await fnRes.json().catch(() => ({}));
      if (!fnRes.ok || !fnBody.ok) {
        // Best-effort: archive the draft so it doesn't clutter the list. RLS allows
        // the owner to mark their own row archived.
        try {
          await updateRow('briefings', draft.id, { status: 'archived' }, session.access_token);
        } catch { /* swallow */ }
        throw new Error(fnBody.message || fnBody.error || 'Generation failed');
      }

      // 3. Success — route to detail page.
      navigate(`/app/briefings/${draft.id}`);
    } catch (e) {
      setError((e as Error).message);
      setProgress('');
    } finally {
      setSubmitting(false);
    }
  }

  if (tier === null) {
    return (
      <div className="db-shell">
        <DashboardSidebar active="briefings" userEmail={user?.email} onSignOut={() => { signOut(); navigate('/'); }} />
        <main className="app-shell-with-sidebar">
          <div className="app-shell-main"><div className="app-loading">Loading…</div></div>
        </main>
      </div>
    );
  }

  if (tier !== 'pro_plus') {
    return (
      <div className="db-shell">
        <DashboardSidebar active="briefings" userEmail={user?.email} onSignOut={() => { signOut(); navigate('/'); }} />
        <main className="app-shell-with-sidebar">
          <header className="app-shell-header">
            <div className="app-shell-title">New Briefing</div>
            <div style={{ width: 80 }} />
          </header>
          <div className="app-shell-main">
            <div className="app-tier-banner">
              <strong>Mission Briefings are a Pro+ feature.</strong>{' '}
              Upgrade in the iOS app or <a href="/#pricing" onClick={e => { e.preventDefault(); navigate('/#pricing'); }}>see plans</a> to generate tamper-evident briefing PDFs from the web.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="db-shell">
      <DashboardSidebar active="briefings" userEmail={user?.email} onSignOut={() => { signOut(); navigate('/'); }} />
      <main className="app-shell-with-sidebar">
        <header className="app-shell-header">
          <button className="app-shell-back" onClick={() => navigate('/app/briefings')} disabled={submitting}>← Briefings</button>
          <div className="app-shell-title">New Mission Briefing</div>
          <button
            className="app-shell-cta app-shell-cta--gen"
            onClick={handleGenerate}
            disabled={submitting}
          >
            {submitting ? (progress || 'Generating…') : 'Generate PDF'}
          </button>
        </header>

        <div className="app-shell-main">
          <p className="app-form-intro">
          The same 6-step briefing the iOS app produces. Weather, airspace, hazards, and NOTAMs are auto-fetched and locked at generation time — you can't edit them after.
          A SHA-256 tamper hash is stamped on every page; clients verify at <code>/verify</code>.
        </p>

        {error && <div className="app-error">{error}</div>}

        {/* Step 1 — Mission overview */}
        <section className="app-form-section">
          <h2 className="app-form-h">1. Mission Overview</h2>
          <div className="app-form-grid">
            <Field label="Mission name *" value={form.mission_name} onChange={v => set('mission_name', v)} placeholder="e.g. Cherry Park roof inspection" />
            <Field label="Client name"     value={form.client_name}  onChange={v => set('client_name', v)}  placeholder="e.g. Acme Properties LLC" />
            <Field label="Project code"    value={form.project_code} onChange={v => set('project_code', v)} placeholder="Internal reference" />
            <Field label="Mission objective" value={form.mission_objective} onChange={v => set('mission_objective', v)} placeholder="One-line goal" />
            <Field label="Planned departure *" type="datetime-local" value={form.planned_departure_at} onChange={v => set('planned_departure_at', v)} />
            <Field label="Planned duration (min)" type="number" value={form.planned_duration_minutes} onChange={v => set('planned_duration_minutes', v)} placeholder="e.g. 30" />
          </div>
          <label className="app-checkbox">
            <input type="checkbox" checked={form.client_mode_enabled} onChange={e => set('client_mode_enabled', e.target.checked)} />
            <span>White-label Client Mode — use my business branding on the PDF</span>
          </label>
        </section>

        {/* Step 2 — Pilot & Aircraft */}
        <section className="app-form-section">
          <h2 className="app-form-h">2. Pilot &amp; Aircraft</h2>
          <div className="app-form-grid">
            <Field label="Pilot name"            value={form.pilot_name} onChange={v => set('pilot_name', v)} />
            <Field label="Part 107 cert #"       value={form.pilot_part107_cert} onChange={v => set('pilot_part107_cert', v)} placeholder="e.g. 41170000" />
            <Field label="Recurrent training"    type="date" value={form.pilot_recurrent_date} onChange={v => set('pilot_recurrent_date', v)} />
            <Field label="Drone model"           value={form.drone_model} onChange={v => set('drone_model', v)} placeholder="e.g. DJI Mavic 3" />
            <Field label="Manufacturer"          value={form.drone_manufacturer} onChange={v => set('drone_manufacturer', v)} />
            <Field label="FAA registration"      value={form.drone_faa_registration} onChange={v => set('drone_faa_registration', v)} placeholder="FA…" />
            <Field label="Serial number"         value={form.drone_serial} onChange={v => set('drone_serial', v)} />
            <Field label="Firmware version"      value={form.drone_firmware_version} onChange={v => set('drone_firmware_version', v)} />
            <Field label="Max wind (kt)"         type="number" value={form.drone_max_wind_kt} onChange={v => set('drone_max_wind_kt', v)} />
            <Field label="Max flight time (min)" type="number" value={form.drone_max_flight_time_min} onChange={v => set('drone_max_flight_time_min', v)} />
            <Field label="Insurance carrier"     value={form.insurance_carrier} onChange={v => set('insurance_carrier', v)} />
            <Field label="Policy number"         value={form.insurance_policy_number} onChange={v => set('insurance_policy_number', v)} />
            <Field label="Coverage amount"       value={form.insurance_coverage_amount} onChange={v => set('insurance_coverage_amount', v)} placeholder="e.g. $1,000,000" />
          </div>
        </section>

        {/* Step 3 — Launch Site */}
        <section className="app-form-section">
          <h2 className="app-form-h">3. Launch Site &amp; Airspace</h2>
          <div className="app-form-grid">
            <Field label="Launch address" value={form.launch_address} onChange={v => set('launch_address', v)} placeholder="Street address or descriptor" full />
            <Field label="Latitude *"  value={form.launch_latitude}  onChange={v => set('launch_latitude', v)}  placeholder="e.g. 43.2342" />
            <Field label="Longitude *" value={form.launch_longitude} onChange={v => set('launch_longitude', v)} placeholder="e.g. -86.2484" />
            <Field label="Operational radius (ft)" type="number" value={form.operational_radius_ft} onChange={v => set('operational_radius_ft', v)} />
            <Field label="LAANC approval ID" value={form.laanc_approval_id} onChange={v => set('laanc_approval_id', v)} placeholder="If applicable" />
            <Field label="LAANC ceiling (ft)" type="number" value={form.laanc_ceiling_ft} onChange={v => set('laanc_ceiling_ft', v)} />
          </div>
          <p className="app-form-hint">Airspace class, METAR/TAF, SIGMETs, AIRMETs, PIREPs, and NOTAMs are auto-fetched at generation time.</p>
        </section>

        {/* Step 4 — Risk */}
        <section className="app-form-section">
          <h2 className="app-form-h">4. Risk &amp; Emergency</h2>
          <div className="app-form-grid">
            <Field label="Fly-now score (0–100)" type="number" value={form.fly_now_score} onChange={v => set('fly_now_score', v)} placeholder="e.g. 78" />
          </div>
          <TextArea
            label="Risk factors"
            help="One per line. Format: Risk | Severity | Mitigation"
            value={form.risk_factors_text}
            onChange={v => set('risk_factors_text', v)}
            placeholder={'Wind gusts | Medium | Postpone if sustained > 18 kt\nVO sight line | Low | Position VO at apex of route'}
            rows={4}
          />
          <TextArea
            label="Emergency procedures"
            value={form.emergency_procedures}
            onChange={v => set('emergency_procedures', v)}
            placeholder="LOS recovery, fly-away, battery low, etc."
            rows={3}
          />
          <TextArea
            label="Emergency contacts"
            help="One per line. Format: Name, Phone, Relation"
            value={form.emergency_contacts_text}
            onChange={v => set('emergency_contacts_text', v)}
            placeholder={'Jane Doe, 555-123-4567, Spouse\nFire/EMS, 911, Emergency services'}
            rows={3}
          />
        </section>

        {/* Step 5 — Checklist & Crew */}
        <section className="app-form-section">
          <h2 className="app-form-h">5. Checklist &amp; Crew</h2>
          <TextArea
            label="Pre-flight checklist"
            help="One item per line."
            value={form.pre_flight_checklist_text}
            onChange={v => set('pre_flight_checklist_text', v)}
            placeholder={'Visual airframe inspection\nProps secured and damage-free\nGimbal calibration\nCompass calibrated\nGo/no-go briefed with VO'}
            rows={5}
          />
          <TextArea
            label="Battery levels"
            help="One per line. Format: Battery name: percent"
            value={form.battery_levels_text}
            onChange={v => set('battery_levels_text', v)}
            placeholder={'Battery 1: 100%\nBattery 2: 96%'}
            rows={2}
          />
          <div className="app-form-grid">
            <Field label="Visual observer name" value={form.visual_observer_name} onChange={v => set('visual_observer_name', v)} />
            <Field label="VO cert / qualifications" value={form.visual_observer_cert} onChange={v => set('visual_observer_cert', v)} />
          </div>
          <TextArea
            label="Additional crew"
            help="One per line. Format: Name, Role"
            value={form.crew_roster_text}
            onChange={v => set('crew_roster_text', v)}
            placeholder={'Sam Brown, Spotter\nLee Tran, Photographer'}
            rows={3}
          />
        </section>

        {/* Step 6 — Review (just the generate button) */}
        <section className="app-form-section app-form-review">
          <h2 className="app-form-h">6. Review &amp; Generate</h2>
          <p className="app-form-body">
            Tap <strong>Generate PDF</strong> to lock the briefing and produce the PDF. The form fields above
            stay editable until generation — after generation, the briefing is frozen with a SHA-256
            tamper hash. Need a fix afterwards? Clone via "Update" on the detail page.
          </p>
          <button
            className="app-shell-cta app-shell-cta--gen app-shell-cta--lg"
            onClick={handleGenerate}
            disabled={submitting}
          >
            {submitting ? (progress || 'Generating…') : 'Generate PDF →'}
          </button>
        </section>
        </div>
      </main>
    </div>
  );
}

// ── Small field helpers ──────────────────────────────────────────────────────
function Field({
  label, value, onChange, type, placeholder, full,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; full?: boolean;
}) {
  return (
    <label className={'app-field' + (full ? ' app-field--full' : '')}>
      <span className="app-field-label">{label}</span>
      <input
        className="app-field-input"
        type={type || 'text'}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label, help, value, onChange, placeholder, rows,
}: {
  label: string; help?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <label className="app-field app-field--ta">
      <span className="app-field-label">{label}</span>
      {help && <span className="app-field-help">{help}</span>}
      <textarea
        className="app-field-input app-field-textarea"
        value={value}
        rows={rows ?? 3}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}
