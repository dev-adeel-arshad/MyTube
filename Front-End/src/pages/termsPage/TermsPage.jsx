import "./termsPage.css";

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>Terms of Service</h1>
        <p>Effective February 26, 2026</p>
      </div>
      <div className="legal-content">
        <section>
          <h2>1. Overview</h2>
          <p>
            These terms govern access to MyTube. By using the service, you agree to follow
            these terms and any posted guidelines.
          </p>
        </section>
        <section>
          <h2>2. Your Content</h2>
          <p>
            You keep ownership of your uploads. You grant MyTube a license to host and
            display your content so the platform can function.
          </p>
        </section>
        <section>
          <h2>3. Acceptable Use</h2>
          <p>
            Do not upload illegal content, attempt to disrupt the service, or misuse
            other users data. We may remove content that violates these terms.
          </p>
        </section>
        <section>
          <h2>4. Accounts</h2>
          <p>
            You are responsible for your account security. If you suspect unauthorized
            access, contact support immediately.
          </p>
        </section>
        <section>
          <h2>5. Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these terms or applicable law.
          </p>
        </section>
        <section>
          <h2>6. Updates</h2>
          <p>
            We may update these terms from time to time. Continued use means you accept
            the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
