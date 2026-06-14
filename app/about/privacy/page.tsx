import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Bulalo.in",
  description: "Privacy policy explaining how Bulalo.in handles personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <p className="eyebrow">Legal information</p>
        <h1>Privacy Policy</h1>
        <p>Effective date: June 14, 2026</p>
      </header>

      <article className="legal-content">
        <p>
          This Privacy Policy explains how Bulalo.in collects, uses, stores, and shares information
          when you browse the website, create an account, register a business, or make a payment.
        </p>

        <section>
          <h2>1. Information we collect</h2>
          <p>
            We may collect account details such as your name, phone number, email address, and
            encrypted password. For business listings, we may collect the business name, contact
            details, address, categories, images, description, and other information you submit.
          </p>
          <p>
            We also store subscription and payment records, including amounts, payment status, and
            identifiers received from our payment provider. We do not store complete card or bank
            account details.
          </p>
        </section>

        <section>
          <h2>2. Information saved before payment</h2>
          <p>
            When you submit the registration form, your account, business details, selected plan,
            and pending payment record are saved before checkout begins. This allows you to return
            later and continue payment without entering all information again.
          </p>
        </section>

        <section>
          <h2>3. How we use information</h2>
          <p>
            We use information to operate the directory, authenticate accounts, review and publish
            listings, process and verify payments, manage subscriptions, provide support, prevent
            fraud, improve the service, and comply with legal obligations.
          </p>
        </section>

        <section>
          <h2>4. Public listing information</h2>
          <p>
            Approved business information may be publicly visible on Bulalo.in so visitors can
            discover and contact the business. Do not submit personal information that you do not
            want displayed as part of a public listing.
          </p>
        </section>

        <section>
          <h2>5. Payments and service providers</h2>
          <p>
            Payments are processed by Razorpay or another displayed payment provider. We may share
            the information necessary to create, verify, and support a payment. We may also use
            hosting, database, analytics, security, and communication providers that process data
            only to deliver their services to us.
          </p>
        </section>

        <section>
          <h2>6. Cookies and sessions</h2>
          <p>
            We use essential cookies or similar technologies to keep you logged in, maintain
            security, and support core website functionality. Your browser settings may allow you
            to control cookies, but disabling essential cookies can prevent account features from
            working.
          </p>
        </section>

        <section>
          <h2>7. Data retention and security</h2>
          <p>
            We retain information for as long as needed to provide the service, maintain payment
            and subscription records, resolve disputes, and meet legal requirements. We use
            reasonable technical and organizational safeguards, but no online system can guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2>8. Your choices and rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information,
            subject to legal and operational retention requirements. You may also ask us to update
            or remove inaccurate business listing information.
          </p>
        </section>

        <section>
          <h2>9. Children&apos;s privacy</h2>
          <p>
            Bulalo.in is not intended for children under 18, and we do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section>
          <h2>10. Policy updates</h2>
          <p>
            We may update this policy when our practices, services, or legal requirements change.
            The revised effective date will be displayed on this page.
          </p>
        </section>

        <section>
          <h2>11. Contact us</h2>
          <p>
            For privacy questions or requests, email{" "}
            <a href="mailto:help@bulalo.in">help@bulalo.in</a> or call{" "}
            <a href="tel:+919812866228">+91 98128 66228</a>.
          </p>
        </section>

        <div className="legal-links">
          <Link href="/about/terms">Read our Terms and Conditions</Link>
          <Link href="/">Return to home</Link>
        </div>
      </article>
    </main>
  );
}
