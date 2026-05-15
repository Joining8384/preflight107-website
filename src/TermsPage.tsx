import { navigate } from './navigate';

const EFFECTIVE_DATE = 'May 15, 2026';

export default function TermsPage() {
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
        <h1 className="legal-header-title">Terms of Service</h1>
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
          By downloading, installing, or using Preflight 107 ("the App"), you agree to be bound by the
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
          or agents, exceed (a) for paid subscribers, the total amount paid by the user for the App
          in the twelve (12) months preceding the event giving rise to the claim, or (b) for
          free-tier users, fifty US dollars ($50.00), whichever applies. In no event shall
          Mcuztoms LLC be liable for any indirect, incidental, special, consequential, or punitive
          damages, including but not limited to loss of profits, loss of drone or equipment, FAA
          enforcement action, regulatory fines, business interruption, or property damage to third
          parties.
        </p>

        <h2 className="legal-section-title">3a. Informational Tool — Not a Replacement for Official Sources</h2>
        <p className="legal-body">
          The App is an informational planning tool. It is NOT a replacement for official FAA
          guidance, Air Traffic Control (ATC) communications, B4UFLY, LAANC authorization, the
          National Weather Service (NWS), or your own judgment as Pilot in Command. The pilot
          remains solely responsible for compliance with 14 CFR Part 107 and all other applicable
          laws. You agree to cross-reference all critical pre-flight information with official
          sources before every flight.
        </p>

        <h2 className="legal-section-title">3b. Third-Party Data Sources</h2>
        <p className="legal-body">
          The App displays data sourced from third parties, including but not limited to
          Open-Meteo, NOAA, the National Weather Service, FAA datasets, CheckWX, OpenSky Network,
          Mapbox, and other public APIs. Mcuztoms LLC does not control, verify, or guarantee the
          accuracy, completeness, or timeliness of any third-party data. Third-party data may be
          delayed, incomplete, cached, or temporarily unavailable. Mcuztoms LLC accepts no
          liability for errors, omissions, or interruptions in third-party data.
        </p>

        <h2 className="legal-section-title">3c. Indemnification</h2>
        <p className="legal-body">
          You agree to indemnify, defend, and hold harmless Mcuztoms LLC, its officers, employees,
          contractors, and affiliates from and against any and all claims, liabilities, damages,
          judgments, awards, losses, costs, expenses, and fees (including reasonable attorneys'
          fees) arising out of or relating to: (a) your use or misuse of the App; (b) your violation
          of these Terms; (c) your violation of any FAA regulation or applicable law; (d) any flight
          you operate using information from the App; or (e) any damage you cause to persons or
          property while operating a drone.
        </p>

        <h2 className="legal-section-title">3d. Force Majeure</h2>
        <p className="legal-body">
          Mcuztoms LLC shall not be liable for any delay, interruption, or failure of the App caused
          by events beyond its reasonable control, including but not limited to acts of God,
          third-party API outages, cellular or internet outages, government action, FAA system
          changes, or natural disasters.
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
