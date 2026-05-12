import { navigate } from './navigate';

const EFFECTIVE_DATE = 'May 12, 2026';

export default function DeleteAccountPage() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button
          className="legal-back-btn"
          onClick={() => navigate('/')}
          aria-label="Go to home page"
        >
          ← Home
        </button>
        <h1 className="legal-header-title">Delete Account</h1>
        <button
          className="legal-back-btn"
          onClick={() => navigate('/support')}
          aria-label="Go to support"
        >
          Support
        </button>
      </div>

      <div className="legal-content">
        <div className="legal-company">Mcuztoms LLC</div>
        <div className="legal-effective">Effective Date: {EFFECTIVE_DATE}</div>

        <p className="legal-intro">
          You can permanently delete your PreFlight 107 account and all associated data at any time.
          This page describes how to request deletion and what data is removed or retained.
        </p>

        <h2 className="legal-section-title">1. Delete Your Account In-App (Recommended)</h2>
        <p className="legal-body">
          The fastest and most secure way to delete your account is directly inside the PreFlight 107
          app, where the request is authenticated against your signed-in session:
        </p>
        <ol className="legal-body" style={{ paddingLeft: '1.25rem' }}>
          <li>Open the PreFlight 107 app on your iPhone or Android device.</li>
          <li>Tap the <strong>Settings</strong> tab in the bottom navigation.</li>
          <li>Scroll to the bottom of the Settings screen.</li>
          <li>Tap <strong>Delete Account</strong>.</li>
          <li>Confirm the prompt. Your account and all associated data are removed immediately.</li>
        </ol>

        <h2 className="legal-section-title">2. Request Deletion by Email</h2>
        <p className="legal-body">
          If you no longer have access to the app (lost device, uninstalled, etc.), you may request
          deletion by emailing us. To verify ownership, the email must be sent <strong>from the same
          email address used to register the PreFlight 107 account</strong>.
        </p>
        <p className="legal-body">
          Send your request to:{' '}
          <a
            href="mailto:support@preflight107.com?subject=Delete%20Account%20Request"
            className="legal-link"
          >
            support@preflight107.com
          </a>
        </p>
        <p className="legal-body">
          Subject line: <strong>Delete Account Request</strong>
        </p>
        <p className="legal-body">
          We will process the request within 7 business days. You will receive a confirmation email
          once deletion is complete. If we cannot verify ownership of the account, we will reply
          asking for additional information before any action is taken.
        </p>

        <h2 className="legal-section-title">3. What Is Deleted</h2>
        <p className="legal-body">
          When your account is deleted, the following data is permanently removed from our systems:
        </p>
        <ul className="legal-body" style={{ paddingLeft: '1.25rem' }}>
          <li>Your email address and account credentials</li>
          <li>Your unique user identifier</li>
          <li>All flight logs you have recorded</li>
          <li>All drone, battery, maintenance, and checklist records</li>
          <li>Your pilot profile (insurance details, certifications, etc.)</li>
          <li>Push notification tokens for your devices</li>
          <li>Any Pro subscription override records associated with your account</li>
        </ul>

        <h2 className="legal-section-title">4. What Is Retained</h2>
        <p className="legal-body">
          We retain the following only as required by law, billing reconciliation, or fraud prevention:
        </p>
        <ul className="legal-body" style={{ paddingLeft: '1.25rem' }}>
          <li>
            <strong>Subscription billing records</strong> — Apple and Google retain transaction
            records under their own platform policies. Deleting your PreFlight 107 account does
            <em> not</em> cancel an active subscription. You must cancel subscriptions through your
            Apple ID or Google Play account separately.
          </li>
          <li>
            <strong>Anonymized analytics</strong> — Aggregated, non-identifying usage data may remain
            in our analytics systems but cannot be linked back to you.
          </li>
        </ul>

        <h2 className="legal-section-title">5. Subscriptions</h2>
        <p className="legal-body">
          Account deletion does not automatically cancel a paid subscription. To cancel:
        </p>
        <ul className="legal-body" style={{ paddingLeft: '1.25rem' }}>
          <li>
            <strong>iOS:</strong> Settings → [your name] → Subscriptions → PreFlight 107 → Cancel
          </li>
          <li>
            <strong>Android:</strong> Google Play Store → Profile icon → Payments &amp; subscriptions
            → Subscriptions → PreFlight 107 → Cancel
          </li>
        </ul>

        <h2 className="legal-section-title">6. Retention Period</h2>
        <p className="legal-body">
          Account and personal data are deleted immediately upon a verified deletion request.
          Backups containing your data are rotated out within 30 days. After this period, no
          recoverable copy of your account remains in our systems.
        </p>

        <h2 className="legal-section-title">7. Questions</h2>
        <p className="legal-body">
          For questions about account deletion, data retention, or this policy, contact us at{' '}
          <a href="mailto:support@preflight107.com" className="legal-link">
            support@preflight107.com
          </a>.
        </p>
      </div>
    </div>
  );
}
