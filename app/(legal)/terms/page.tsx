import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | VenueManager",
  description: "Terms of Service for VenueManager - Read our terms and conditions for using our venue management platform.",
};

export default function TermsOfService() {
  const lastUpdated = "January 30, 2025";

  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {lastUpdated}</p>

      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using VenueManager (&quot;Service&quot;), you agree to be bound by these Terms of
          Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the
          Service.
        </p>
        <p>
          These Terms apply to all visitors, users, and others who access or use the Service. By
          using our Service, you represent that you are at least 18 years old and have the legal
          capacity to enter into these Terms.
        </p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>
          VenueManager is a software-as-a-service (SaaS) platform that provides venue management
          tools including:
        </p>
        <ul>
          <li>Venue and space management</li>
          <li>Event planning and tracking</li>
          <li>Vendor database and performance tracking</li>
          <li>Budget management and reporting</li>
          <li>Client relationship management</li>
          <li>AI-powered event creation and vendor communication</li>
        </ul>
      </section>

      <section>
        <h2>3. Account Registration</h2>
        <p>To use our Service, you must:</p>
        <ul>
          <li>Create an account with accurate and complete information</li>
          <li>Maintain the security of your password and account</li>
          <li>Promptly update any information to keep it accurate</li>
          <li>Accept all risks of unauthorized access to your account</li>
        </ul>
        <p>
          You are responsible for all activities that occur under your account. Notify us
          immediately of any unauthorized use at{" "}
          <a href="mailto:security@venuemanager.com">security@venuemanager.com</a>.
        </p>
      </section>

      <section>
        <h2>4. Subscription and Payment</h2>

        <h3>4.1 Subscription Plans</h3>
        <p>
          Access to certain features requires a paid subscription. Subscription details, including
          pricing and features, are available on our pricing page.
        </p>

        <h3>4.2 Billing</h3>
        <ul>
          <li>Subscriptions are billed in advance on a monthly or annual basis</li>
          <li>All fees are non-refundable except as required by law or as explicitly stated</li>
          <li>You authorize us to charge your payment method for all fees incurred</li>
        </ul>

        <h3>4.3 Free Trial</h3>
        <p>
          We may offer a free trial period. At the end of the trial, your account will be charged
          unless you cancel before the trial ends.
        </p>

        <h3>4.4 Cancellation</h3>
        <p>
          You may cancel your subscription at any time. Cancellation takes effect at the end of
          the current billing period. You will retain access until then.
        </p>
      </section>

      <section>
        <h2>5. Acceptable Use</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Transmit viruses, malware, or malicious code</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Use automated systems to access the Service without permission</li>
          <li>Collect user information without consent</li>
          <li>Send spam or unsolicited communications through the Service</li>
          <li>Impersonate any person or entity</li>
          <li>Use the Service to compete with VenueManager</li>
        </ul>
      </section>

      <section>
        <h2>6. User Content</h2>

        <h3>6.1 Your Content</h3>
        <p>
          You retain ownership of all content you submit to the Service (&quot;User Content&quot;). By
          submitting content, you grant us a license to use, store, and process it to provide
          the Service.
        </p>

        <h3>6.2 Responsibility</h3>
        <p>
          You are solely responsible for your User Content. You represent that you have all
          necessary rights to submit content and that it does not violate any laws or third-party
          rights.
        </p>

        <h3>6.3 Data Privacy</h3>
        <p>
          Our use of your data is governed by our Privacy Policy, which is incorporated into
          these Terms by reference.
        </p>
      </section>

      <section>
        <h2>7. AI Features</h2>
        <p>Our Service includes AI-powered features. By using these features, you acknowledge:</p>
        <ul>
          <li>AI-generated content may contain errors or inaccuracies</li>
          <li>You are responsible for reviewing and verifying all AI-generated content</li>
          <li>We do not guarantee the accuracy, completeness, or suitability of AI outputs</li>
          <li>You should not rely solely on AI suggestions for critical decisions</li>
          <li>AI features are provided &quot;as is&quot; without warranties</li>
        </ul>
      </section>

      <section>
        <h2>8. Intellectual Property</h2>

        <h3>8.1 Our Property</h3>
        <p>
          The Service, including its original content, features, and functionality, is owned by
          VenueManager and protected by copyright, trademark, and other intellectual property laws.
        </p>

        <h3>8.2 License</h3>
        <p>
          We grant you a limited, non-exclusive, non-transferable license to access and use the
          Service for your internal business purposes, subject to these Terms.
        </p>

        <h3>8.3 Restrictions</h3>
        <p>You may not:</p>
        <ul>
          <li>Copy, modify, or distribute the Service</li>
          <li>Reverse engineer or decompile the Service</li>
          <li>Remove any proprietary notices</li>
          <li>Create derivative works based on the Service</li>
        </ul>
      </section>

      <section>
        <h2>9. Third-Party Services</h2>
        <p>
          The Service may integrate with third-party services (payment processors, email
          providers, etc.). Your use of these services is subject to their terms and policies.
          We are not responsible for third-party services.
        </p>
      </section>

      <section>
        <h2>10. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul>
          <li>MERCHANTABILITY</li>
          <li>FITNESS FOR A PARTICULAR PURPOSE</li>
          <li>NON-INFRINGEMENT</li>
          <li>ACCURACY OR RELIABILITY OF ANY CONTENT</li>
        </ul>
        <p>
          WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
        </p>
      </section>

      <section>
        <h2>11. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, VENUEMANAGER SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING:
        </p>
        <ul>
          <li>Loss of profits, data, or business opportunities</li>
          <li>Cost of substitute services</li>
          <li>Any damages arising from your use of the Service</li>
        </ul>
        <p>
          OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS
          PRECEDING THE CLAIM.
        </p>
      </section>

      <section>
        <h2>12. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless VenueManager and its officers,
          directors, employees, and agents from any claims, damages, losses, liabilities, and
          expenses (including legal fees) arising from:
        </p>
        <ul>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Your User Content</li>
        </ul>
      </section>

      <section>
        <h2>13. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice, for any
          reason, including breach of these Terms. Upon termination:
        </p>
        <ul>
          <li>Your right to use the Service ceases immediately</li>
          <li>We may delete your account and data</li>
          <li>Provisions that should survive termination will remain in effect</li>
        </ul>
      </section>

      <section>
        <h2>14. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will provide notice of
          material changes by posting the updated Terms and updating the &quot;Last updated&quot; date.
          Continued use of the Service after changes constitutes acceptance of the new Terms.
        </p>
      </section>

      <section>
        <h2>15. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the
          United States, without regard to conflict of law provisions.
        </p>
      </section>

      <section>
        <h2>16. Dispute Resolution</h2>
        <p>
          Any disputes arising from these Terms or the Service shall be resolved through binding
          arbitration, except for claims that qualify for small claims court. You waive any right
          to participate in class actions.
        </p>
      </section>

      <section>
        <h2>17. Severability</h2>
        <p>
          If any provision of these Terms is found unenforceable, the remaining provisions will
          continue in effect, and the unenforceable provision will be modified to the minimum
          extent necessary.
        </p>
      </section>

      <section>
        <h2>18. Entire Agreement</h2>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire agreement between
          you and VenueManager regarding the Service and supersede all prior agreements.
        </p>
      </section>

      <section>
        <h2>19. Contact Us</h2>
        <p>For questions about these Terms, please contact us at:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@venuemanager.com">legal@venuemanager.com</a></li>
          <li><strong>Support:</strong> <a href="mailto:support@venuemanager.com">support@venuemanager.com</a></li>
        </ul>
      </section>
    </article>
  );
}
