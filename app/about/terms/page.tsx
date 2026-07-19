import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Condition | Bulalo.in",
  description: "Terms of service for using Bulalo.in.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <p className="eyebrow">Legal information</p>
        <h1>Terms & Condition</h1>
      </header>

      <article className="legal-content">
        <p>
          We value the trust you place in us. That&apos;s why we insist upon the highest standards for
          secure transactions and customer information privacy. Please read the following statement
          to learn about our information gathering and dissemination practices. These Terms of
          Service apply to all users of the Bulalo.in Service.
        </p>

        <section>
          <h2>Third Party Website&apos;s Practices</h2>
          <p>
            Bulalo.in has no control over, and assumes no responsibility for, the content, privacy
            policies, or practices of any third party websites. Also, Bulalo.in does not assume any
            liability for any mistakes, misstatements of law, defamation, omissions, falsehood,
            obscenity, pornography or profanity in the statements, opinions, representations or any
            other form of third party content on the Site.
          </p>
          <p>
            In addition, we will not and cannot censor or edit the content of any third-party site.
            By using the Service, you expressly acknowledge and agree that Bulalo.in shall not be
            responsible for any damages, claims or other liability arising from or related to your
            use of any third-party website. You understand that the information and opinions in the
            third party content represent solely the thoughts of the author and are neither endorsed
            by nor do they necessarily reflect Bulalo.in&apos;s belief.
          </p>
        </section>

        <section>
          <h2>Disclaimer and Service Modifications for Bulalo.in</h2>
          <p>
            We cannot guarantee that the Bulalo.in site will be free from errors, viruses, or other
            harmful components, or that any defects will be corrected. We do not guarantee the
            accuracy, timeliness, or reliability of the information available on or through the
            Bulalo.in site.
          </p>
          <p>
            We reserve the right to make changes to the features, functionality, or content of the
            Bulalo.in site at any time. We also have the right to edit or delete any documents,
            information, or other content appearing on the site at our sole discretion. Bulalo.in
            reserves the right to modify or discontinue the services and/or sites, or any part
            thereof, temporarily or permanently, with or without notice. Bulalo.in shall not be held
            liable to you or any third party for any modifications, suspensions, or discontinuances
            of the service or any sites.
          </p>
        </section>

        <section>
          <h2>Application Availability and Limitations</h2>
          <p>
            <strong>Availability Efforts:</strong> Bulalo.in will make reasonable efforts to ensure
            the availability of the application at all times. However, please note that the
            application relies on internet and mobile networks, which may be subject to factors
            beyond Bulalo.in control. These external factors may impact the quality and availability
            of the application.
          </p>
          <p>
            <strong>Unavailability Disclaimer:</strong> Bulalo.in does not accept responsibility
            for any unavailability of the application. In case of any difficulty or inability to
            download or access content, or any communication system failure that renders the
            application unavailable, Bulalo.in cannot be held accountable for such issues.
          </p>
          <p>
            <strong>Support and Maintenance:</strong> Please be aware that Bulalo.in will not
            provide support or maintenance for the application. Users are responsible for managing
            any technical issues or troubleshooting that may arise while using the application.
          </p>
        </section>

        <section>
          <h2>Intellectual Property Rights and Usage for Bulalo.in</h2>
          <p>
            <strong>1. Ownership and License:</strong> The Intellectual Property associated with
            Bulalo.in, including company names, logos, product and service names, design marks,
            slogans, trademarks, service marks, copyright, database rights, and underlying software
            code in the website, is owned by Bulalo.in or its subsidiaries or affiliate companies
            and is used under license. Any other Intellectual Properties mentioned herein belong to
            their respective owners.
          </p>
          <p>
            <strong>2. Copyright Notice:</strong> When making copies of the materials found on any
            of the media platforms, you must include any copyright, trademark, or other proprietary
            notice associated with the material being copied. This ensures that appropriate credit
            is given for the materials used.
          </p>
          <p>
            <strong>3. Restrictions on Usage:</strong> You are not authorized to use Bulalo.in
            Intellectual Property in any form of advertising, publicity, or any other commercial
            manner without explicit permission. Mention of any products, services, processes, or
            other information by trade name, trademark, manufacturer, supplier, or otherwise does
            not imply endorsement, sponsorship, or recommendation by Bulalo.in.
          </p>
          <p>
            <strong>4. Grant of Rights:</strong> By accepting these terms, you agree to waive and
            grant Bulalo.in all rights, including intellectual property rights and moral rights, in
            the reviews, ratings, and comments posted by you on Bulalo.in through any medium.
            Bulalo.in is free to use and utilize such reviews, ratings, and comments as per its
            requirements from time to time.
          </p>
        </section>

        <section>
          <h2>Eligibility and User Representation</h2>
          <p>
            To use the Bulalo.in service, you must be at least eighteen (18) years of age and
            considered an adult. This requirement applies whether you are using the service for
            personal purposes or on behalf of a business. As an individual user, it is crucial that
            you possess full competence to enter into these Terms of Use and comply with all the
            associated terms, conditions, obligations, representations, and warranties.
          </p>
          <p>
            By utilizing the Bulalo.in service, you explicitly represent and warrant that you have
            the necessary right, authority, and capacity to enter into these Terms of Use and that
            you can fully abide by all the terms and conditions specified therein.
          </p>
        </section>

        <section>
          <h2>Cookies Policy</h2>
          <p>
            A &quot;cookie&quot; is a small piece of information stored by a web server on a web
            browser so it can be later read back from that browser. Cookies are useful for enabling
            the browser to remember information specific to a given user. We place both permanent
            and temporary cookies in your computer&apos;s hard drive. The cookies do not contain any of
            your personally identifiable information.
          </p>
          <p>Please contact us regarding any questions regarding this statement.</p>
        </section>
      </article>
    </main>
  );
}
