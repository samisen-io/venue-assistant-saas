import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | VenueManager",
  description: "Privacy Policy for VenueManager - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "January 30, 2025";

  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {lastUpdated}</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to VenueManager (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting
          your personal information and your right to privacy. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use our venue management
          platform and services.
        </p>
        <p>
          Please read this privacy policy carefully. If you do not agree with the terms of this
          privacy policy, please do not access our services.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>

        <h3>2.1 Personal Information You Provide</h3>
        <p>We collect information that you voluntarily provide to us, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, password, and profile details</li>
          <li><strong>Venue Information:</strong> Venue name, address, capacity, contact details</li>
          <li><strong>Event Information:</strong> Event details, dates, budgets, guest counts</li>
          <li><strong>Vendor Information:</strong> Vendor contacts, pricing, performance data</li>
          <li><strong>Client Information:</strong> Client names, contact details, communication history</li>
          <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely through our payment processor)</li>
        </ul>

        <h3>2.2 Information Automatically Collected</h3>
        <p>When you access our services, we automatically collect:</p>
        <ul>
          <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
          <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
          <li><strong>Cookies:</strong> Session cookies and preferences (see Cookie Policy below)</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send administrative messages, updates, and security alerts</li>
          <li>Respond to your comments, questions, and support requests</li>
          <li>Analyze usage patterns to improve user experience</li>
          <li>Detect, prevent, and address technical issues and fraud</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>4. AI-Powered Features</h2>
        <p>
          Our platform includes AI-powered features for event creation and vendor communication.
          When you use these features:
        </p>
        <ul>
          <li>Your input text is processed by our AI systems to extract event details or draft communications</li>
          <li>We do not use your data to train AI models</li>
          <li>AI-generated content is always presented for your review before any action is taken</li>
          <li>You maintain full control over what information is sent to vendors</li>
        </ul>
      </section>

      <section>
        <h2>5. Information Sharing and Disclosure</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul>
          <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (hosting, payment processing, email delivery)</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
          <li><strong>With Your Consent:</strong> When you have given us explicit permission</li>
        </ul>
        <p>
          <strong>We do not sell your personal information to third parties.</strong>
        </p>
      </section>

      <section>
        <h2>6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your
          personal information, including:
        </p>
        <ul>
          <li>Encryption of data in transit (TLS/SSL) and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication requirements</li>
          <li>Secure data centers with physical security measures</li>
        </ul>
        <p>
          However, no method of transmission over the Internet is 100% secure. We cannot guarantee
          absolute security of your data.
        </p>
      </section>

      <section>
        <h2>7. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is active or as needed to
          provide you services. We will retain and use your information as necessary to:
        </p>
        <ul>
          <li>Comply with our legal obligations</li>
          <li>Resolve disputes</li>
          <li>Enforce our agreements</li>
        </ul>
        <p>
          You may request deletion of your account and associated data at any time by contacting us.
        </p>
      </section>

      <section>
        <h2>8. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Request correction of inaccurate data</li>
          <li><strong>Deletion:</strong> Request deletion of your data</li>
          <li><strong>Portability:</strong> Request transfer of your data</li>
          <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
          <li><strong>Restriction:</strong> Request restriction of processing</li>
        </ul>
        <p>
          To exercise these rights, please contact us at{" "}
          <a href="mailto:privacy@venuemanager.com">privacy@venuemanager.com</a>.
        </p>
      </section>

      <section>
        <h2>9. Cookie Policy</h2>
        <p>We use cookies and similar tracking technologies to:</p>
        <ul>
          <li>Keep you signed in</li>
          <li>Remember your preferences</li>
          <li>Understand how you use our services</li>
          <li>Improve our platform</li>
        </ul>
        <p>
          You can control cookies through your browser settings. Note that disabling cookies may
          affect the functionality of our services.
        </p>
      </section>

      <section>
        <h2>10. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own.
          We ensure appropriate safeguards are in place for such transfers in compliance with
          applicable data protection laws.
        </p>
      </section>

      <section>
        <h2>11. Children&apos;s Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 18. We do not knowingly
          collect personal information from children. If we learn we have collected personal
          information from a child, we will delete it promptly.
        </p>
      </section>

      <section>
        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes
          by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date.
          We encourage you to review this policy periodically.
        </p>
      </section>

      <section>
        <h2>13. Contact Us</h2>
        <p>
          If you have questions or concerns about this privacy policy or our data practices,
          please contact us at:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:privacy@venuemanager.com">privacy@venuemanager.com</a></li>
          <li><strong>Support:</strong> <a href="mailto:support@venuemanager.com">support@venuemanager.com</a></li>
        </ul>
      </section>
    </article>
  );
}
