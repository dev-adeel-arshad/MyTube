import "./privacyPage.css";

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>Privacy Policy</h1>
        <p>Effective February 26, 2026</p>
      </div>
      <div className="legal-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect account details, content you upload, and usage data to operate
            and improve MyTube.
          </p>
        </section>
        <section>
          <h2>2. How We Use Data</h2>
          <p>
            Data helps us deliver the service, personalize recommendations, and keep
            the platform secure.
          </p>
        </section>
        <section>
          <h2>3. Sharing</h2>
          <p>
            We do not sell your personal data. We share data only as required to provide
            the service or comply with the law.
          </p>
        </section>
        <section>
          <h2>4. Your Choices</h2>
          <p>
            You can update your profile, delete content, or request account removal.
            Contact support for help with privacy requests.
          </p>
        </section>
        <section>
          <h2>5. Security</h2>
          <p>
            We use reasonable safeguards to protect your data, but no system is fully
            secure. Please keep your credentials private.
          </p>
        </section>
        <section>
          <h2>6. Updates</h2>
          <p>
            We may update this policy. Continued use means you accept the updated policy.
          </p>
        </section>
      </div>
    </div>
  );
}
