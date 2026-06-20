import { navigate } from './navigate';

const EFFECTIVE_DATE = 'May 15, 2026';

export default function PrivacyPage() {
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
        <h1 className="legal-header-title">Privacy Policy</h1>
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
          This Privacy Policy describes how Mcuztoms LLC ("we", "our", or "us") collects, uses, and
          protects information when you use Preflight 107 ("the App").
        </p>

        {/* 1 */}
        <h2 className="legal-section-title">1. Information We Collect</h2>

        <h3 className="legal-sub-title">Location Data</h3>
        <p className="legal-body">
          We collect your device's location data to provide real-time weather conditions, airspace
          information, LAANC authorization status, and nearby airport data. Location data is used
          solely for in-app functionality and is not sold, shared with, or disclosed to third parties
          for marketing or advertising purposes.
        </p>

        <h3 className="legal-sub-title">Account Information</h3>
        <p className="legal-body">
          If you create an account or subscribe to Pro features, we may collect your email address and
          subscription status. This information is used exclusively for account management and service
          delivery.
        </p>

        <h3 className="legal-sub-title">Newsletter &amp; Marketing Emails</h3>
        <p className="legal-body">
          If you subscribe to our email newsletter, we collect your email address for the purpose of
          sending product updates, feature announcements, and promotional content related to PreFlight 107.
          Newsletter subscriptions are entirely optional and separate from your app account. Your email
          address is never sold or shared with third parties for marketing purposes. You may unsubscribe
          at any time by clicking the "Unsubscribe" link in any email we send, or by emailing
          <a href="mailto:support@preflight107.com" className="legal-link">support@preflight107.com</a>.
        </p>

        <h3 className="legal-sub-title">Usage Data</h3>
        <p className="legal-body">
          We may collect anonymized usage analytics (e.g., screens visited, feature usage frequency)
          to improve the App. This data cannot be used to identify individual users.
        </p>

        {/* 2 */}
        <h2 className="legal-section-title">2. Third-Party Services</h2>

        <h3 className="legal-sub-title">Supabase</h3>
        <p className="legal-body">
          We use Supabase as our backend data storage provider. Account data and flight logs (if
          enabled) are stored securely on Supabase infrastructure. Supabase's privacy policy applies
          to data stored on their servers.
        </p>

        <h3 className="legal-sub-title">RevenueCat</h3>
        <p className="legal-body">
          We use RevenueCat to manage in-app subscriptions and purchases. RevenueCat processes payment
          verification through Apple App Store and Google Play Store. We do not store or have access to
          your payment card information. RevenueCat's privacy policy governs their handling of
          transaction data.
        </p>

        <h3 className="legal-sub-title">Weather &amp; Aviation APIs</h3>
        <p className="legal-body">
          We transmit your location coordinates to weather and aviation data providers (Open-Meteo,
          NOAA, CheckWX, NWS, OpenSky Network) to retrieve real-time data. These requests contain only
          geographic coordinates and no personal identifiers.
        </p>

        <h3 className="legal-sub-title">AI Risk Assessments (Anthropic)</h3>
        <p className="legal-body">
          When you request an AI Risk Assessment, the current weather, airspace, and flight-condition
          data for your location is sent to our AI provider, Anthropic, to generate a plain-language
          summary. These requests contain only the conditions snapshot and your coordinates — no name,
          email, or account identifiers — and the data is used solely to produce your assessment. It is
          <strong> not used to train AI models.</strong>
        </p>

        {/* 3 */}
        <h2 className="legal-section-title">3. Data We Do NOT Collect or Sell</h2>
        <p className="legal-body">
          We do not sell, rent, or trade your personal data to any third party.
          <br /><br />
          We do not collect contacts, photos, browsing history, or any data unrelated to App
          functionality.
          <br /><br />
          We do not use your location data for advertising or behavioral targeting.
        </p>

        {/* 4 */}
        <h2 className="legal-section-title">4. Data Security</h2>
        <p className="legal-body">
          We implement industry-standard security measures to protect your information, including
          encrypted data transmission (TLS/SSL) and secure storage. However, no method of electronic
          storage or transmission is 100% secure, and we cannot guarantee absolute security.
        </p>

        {/* 5 */}
        <h2 className="legal-section-title">5. Data Retention</h2>
        <p className="legal-body">
          Location data is processed in real time and is not persistently stored on our servers.
          Flight logs, drone configurations, saved sites, and FAA ID Vault entries are stored
          locally on your device and synced to Supabase if you have an account. When you request
          account deletion (via Settings → Delete Account or preflight107.com/delete-account), your
          profile is flagged for deletion immediately and you are signed out. All data tied to your
          account is permanently purged within thirty (30) days. The 30-day grace period exists to
          support fraud chargeback resolution and accidental-deletion recovery; you may contact
          support@preflight107.com during this window to restore your account.
        </p>

        <h2 className="legal-section-title">5a. Saved Sites &amp; Shared Launch Links</h2>
        <p className="legal-body">
          Saved Sites (named launch locations) are private to your account and protected by Postgres
          row-level security. Shared Launch links create a time-limited public token that exposes
          your name, the drone model, weather conditions at launch time, and airspace classification
          at the launch point. Shared Launch links automatically expire after your stated session
          window plus a 60-minute grace period (maximum 24 hours). You can end a shared link at any
          time from within the App.
        </p>

        {/* 6 */}
        <h2 className="legal-section-title">6. Children's Privacy</h2>
        <p className="legal-body">
          The App is not intended for use by children under the age of 13. We do not knowingly collect
          personal information from children under 13. If we become aware that a child under 13 has
          provided us with personal information, we will delete it promptly.
        </p>

        {/* 7 */}
        <h2 className="legal-section-title">7. Your Rights</h2>
        <p className="legal-body">
          You may request access to, correction of, or deletion of your personal data at any time by
          contacting us at support@preflight107.com. If you are a resident of California, the EU, or other
          jurisdictions with data protection laws, you may have additional rights under applicable law.
        </p>

        {/* 8 */}
        <h2 className="legal-section-title">8. Changes to This Policy</h2>
        <p className="legal-body">
          We may update this Privacy Policy from time to time. Changes will be posted within the App
          and the "Effective Date" will be updated. Continued use of the App after changes constitutes
          acceptance of the revised policy.
        </p>

        {/* 9 */}
        <h2 className="legal-section-title">9. Contact Us</h2>
        <p className="legal-body">
          If you have any questions about this Privacy Policy, please contact us at:
          <br /><br />
          Mcuztoms LLC<br />
          Email: <a href="mailto:support@preflight107.com" className="legal-link">support@preflight107.com</a>
        </p>

        <div className="legal-footer">© {new Date().getFullYear()} Mcuztoms LLC. All rights reserved.</div>
      </div>
    </div>
  );
}
