// Reusable Dashboard sidebar — shared between /dashboard and /app/briefings/*.
//
// Keeps navigation consistent across the logged-in experience so a pilot
// can jump between Flight Logs, Smart Hangar, Reports, Mission Briefings,
// and Settings without losing the side rail.

import { navigate } from './navigate';

type ActiveSection = 'logs' | 'drones' | 'reports' | 'briefings' | 'settings';

interface Props {
  /** Which item to highlight. Pages outside the Dashboard tabs pass the
   *  closest match (e.g. /app/briefings/* passes 'briefings'). */
  active: ActiveSection;
  /** User email shown at the bottom — optional. */
  userEmail?: string | null;
  /** Sign-out handler. If omitted, no sign-out button is rendered. */
  onSignOut?: () => void;
  /** For Dashboard's internal tab state — when set, clicks update the
   *  dashboard's local tab instead of navigating away. /app/* pages
   *  don't pass this and clicks navigate to /dashboard. */
  onSelectDashboardTab?: (tab: 'logs' | 'drones' | 'reports' | 'settings') => void;
}

export default function DashboardSidebar({ active, userEmail, onSignOut, onSelectDashboardTab }: Props) {
  function goDashboard(tab: 'logs' | 'drones' | 'reports' | 'settings') {
    if (onSelectDashboardTab) {
      onSelectDashboardTab(tab);
    } else {
      // Outside-the-dashboard pages: route to /dashboard. The dashboard
      // will land on its default tab (logs) since we don't pass state.
      navigate('/dashboard');
    }
  }

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        ✈ <span style={{ fontWeight: 700 }}>PreFlight</span> <span style={{ color: 'var(--accent)' }}>107</span>
      </div>

      <nav className="db-nav">
        <button
          className={`db-nav-item${active === 'logs' ? ' active' : ''}`}
          onClick={() => goDashboard('logs')}
        >
          📋 Flight Logs
        </button>
        <button
          className={`db-nav-item${active === 'drones' ? ' active' : ''}`}
          onClick={() => goDashboard('drones')}
        >
          🛠 Smart Hangar
        </button>
        <button
          className={`db-nav-item${active === 'reports' ? ' active' : ''}`}
          onClick={() => goDashboard('reports')}
        >
          📊 Reports
        </button>
        <button
          className={`db-nav-item${active === 'briefings' ? ' active' : ''}`}
          onClick={() => navigate('/app/briefings')}
        >
          📄 Mission Briefings
        </button>
        <button
          className={`db-nav-item${active === 'settings' ? ' active' : ''}`}
          onClick={() => goDashboard('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      {(userEmail || onSignOut) && (
        <div className="db-sidebar-footer">
          {userEmail && <div className="db-user-email">{userEmail}</div>}
          {onSignOut && <button className="db-btn-ghost" onClick={onSignOut}>Sign Out</button>}
        </div>
      )}
    </aside>
  );
}
