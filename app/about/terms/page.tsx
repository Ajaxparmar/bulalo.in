import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | Bulalo.in",
  description: "Terms and conditions for using Bulalo.in.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <p className="eyebrow">Legal information</p>
        <h1>Terms and Conditions</h1>
        <p>Effective date: June 14, 2026</p>
      </header>

      <article className="legal-content">
        <p>
          These Terms and Conditions govern your access to and use of Bulalo.in, including its
          business directory, registration, subscription, and related services. By using the
          website or creating an account, you agree to these terms.
        </p>

        <section>
          <h2>1. About Bulalo.in</h2>
          <p>
            Bulalo.in is an online directory that helps visitors discover local businesses and
            service providers. Business listings are submitted by business owners and may be
            reviewed before publication.
          </p>
        </section>

        <section>
          <h2>2. Account registration</h2>
          <p>
            You must provide accurate, current, and complete information when creating an account
            or business listing. You are responsible for protecting your login details and for all
            activity performed through your account.
          </p>
          <p>
            Registration details may be saved before payment is completed. If you leave the payment
            process, you may log in later to continue your pending registration.
          </p>
        </section>

        <section>
          <h2>3. Business listings</h2>
          <p>
            You confirm that you are authorized to submit and manage the listed business. Listing
            information must not be false, misleading, unlawful, infringing, or harmful. We may
            review, reject, suspend, edit, or remove listings that violate these terms.
          </p>
        </section>

        <section>
          <h2>4. Plans, payments, and expiry</h2>
          <p>
            Available plans, durations, and fees are shown before payment. Payments are processed
            through Razorpay or another displayed payment provider. A subscription begins after
            successful payment verification and expires at the end of its selected duration.
          </p>
          <p>
            Expired subscriptions may require renewal before the related listing continues to
            receive paid-plan benefits. Payment provider terms may also apply.
          </p>
        </section>

        <section>
          <h2>5. Acceptable use</h2>
          <p>
            You must not misuse the website, attempt unauthorized access, disrupt its operation,
            scrape data without permission, submit malicious content, impersonate another person,
            or use the service for unlawful activities.
          </p>
        </section>

        <section>
          <h2>6. Third-party businesses and links</h2>
          <p>
            Bulalo.in provides directory information and does not guarantee the quality, safety,
            availability, pricing, or conduct of listed businesses. Any transaction or interaction
            between visitors and a listed business is between those parties.
          </p>
        </section>

        <section>
          <h2>7. Intellectual property</h2>
          <p>
            The Bulalo.in name, website design, and original platform content belong to Bulalo.in
            or its licensors. Business owners retain responsibility for content they submit and
            grant us permission to display it for operating and promoting the directory.
          </p>
        </section>

        <section>
          <h2>8. Service availability and liability</h2>
          <p>
            We aim to keep the service available and accurate, but cannot guarantee uninterrupted
            access or error-free information. To the extent permitted by law, Bulalo.in is not
            liable for indirect losses arising from use of the website or dealings with listed
            businesses.
          </p>
        </section>

        <section>
          <h2>9. Changes to these terms</h2>
          <p>
            We may update these terms when our services or legal requirements change. The revised
            effective date will be displayed on this page. Continued use after an update means you
            accept the revised terms.
          </p>
        </section>

        <section>
          <h2>10. Contact us</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href="mailto:help@bulalo.in">help@bulalo.in</a> or discussed by calling{" "}
            <a href="tel:+919812866228">+91 98128 66228</a>.
          </p>
        </section>

        <div className="legal-links">
          <Link href="/about/privacy">Read our Privacy Policy</Link>
          <Link href="/">Return to home</Link>
        </div>
      </article>
    </main>
  );
}
