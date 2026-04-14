import { navigate } from './navigate';

const EFFECTIVE_DATE = 'March 10, 2026';

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button
          className="legal-back-btn"
          onClick={() => window.history.length > 1 ? window.history.back() : navigate('/')}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="legal-header-title">Terms of Service</h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="legal-content">
        <div className="legal-company">Mcuztoms LLC</div>
        <div className="legal-effective">Effective Date: {EFFECTIVE_DATE}</div>

        <p className="legal-intro">
          By downloading, installing, or using DroneWeather ("the App"), you agree to be bound by the
          following Terms of Service. If you do not agree, do not use the App.
        </p>

        <h2 className="legal-section-title">1. Liability Release</h2>
        <p className="legal-body">
          The App is provided for informational purposes only. Mcuztoms LLC is not responsible for
          property damage, personal injury, drone loss, or Federal Aviation Administration (FAA)
          violations arising from the use of information provided by the App. You acknowledge that
          all flight decisions are made solely at your own risk and discretion.
        </p>

        <h2 className="legal-section-title">2. Accuracy Disclaimer</h2>
        <p className="legal-body">
          Weather data, airspace information, LAANC authorization status, NOTAMs, and all other data
          displayed within the App are provided on an "as-is" and "as-available" basis without
          warranties of any kind, whether express or implied. The user is solely responsible for
          verifying all conditions via official FAA sources, including but not limited to
          1-800-WX-BRIEF, FAA TFRs, and NOTAM databases, before every flight.
        </p>

        <h2 className="legal-section-title">3. Limitation of Liability</h2>
        <p className="legal-body">
          In no event shall the total liability of Mcuztoms LLC, its officers, directors, employees,
          or agents, exceed the amount paid by the user for the App or service during the twelve (12)
          months preceding the event giving rise to the claim. In no event shall Mcuztoms LLC be
          liable for any indirect, incidental, special, consequential, or punitive damages.
        </p>

        <h2 className="legal-section-title">4. Binding Arbitration</h2>
        <p className="legal-body">
          Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach,
          termination, or validity thereof, shall be settled by binding arbitration administered by the
          American Arbitration Association (AAA) in accordance with its Consumer Arbitration Rules.
          Arbitration shall take place in the State of Michigan, unless otherwise agreed upon by the
          parties. Judgment on the award rendered by the arbitrator may be entered in any court having
          jurisdiction thereof.
        </p>

        <h2 className="legal-section-title">5. Class Action Waiver</h2>
        <p className="legal-body">
          You agree that any arbitration or legal proceeding shall be conducted solely on an individual
          basis. You waive any right to participate in a class action lawsuit, class-wide arbitration,
          or any other representative proceeding against Mcuztoms LLC. This waiver applies to the
          fullest extent permitted by law.
        </p>

        <h2 className="legal-section-title">6. Refund Policy</h2>
        <p className="legal-body">
          Subscription purchases are processed through Apple App Store or Google Play Store and are
          subject to the refund policies of the respective platform. Mcuztoms LLC does not process
          refunds directly. For refund requests, please contact the platform through which you made
          your purchase.
        </p>

        <h2 className="legal-section-title">7. Modifications to Terms</h2>
        <p className="legal-body">
          Mcuztoms LLC reserves the right to modify these Terms at any time. Continued use of the App
          after changes are posted constitutes acceptance of the modified Terms. We encourage you to
          review these Terms periodically.
        </p>

        <h2 className="legal-section-title">8. Governing Law</h2>
        <p className="legal-body">
          These Terms shall be governed by and construed in accordance with the laws of the State of
          Michigan, without regard to its conflict of law provisions.
        </p>

        <div className="legal-footer">© {new Date().getFullYear()} Mcuztoms LLC. All rights reserved.</div>
      </div>
    </div>
  );
}
