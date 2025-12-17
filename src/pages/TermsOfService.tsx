import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: November 23, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using SwipeMatch, you agree to be bound by these Terms of Service and
              our Privacy Policy. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="mb-4">
              You must be at least 18 years old to use SwipeMatch. By using our service, you represent
              and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these terms</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>All information you provide is accurate and truthful</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              <strong>Account Creation:</strong> You must create an account to use SwipeMatch. You are
              responsible for maintaining the confidentiality of your account credentials.
            </p>
            <p className="mb-4">
              <strong>Account Security:</strong> You agree to notify us immediately of any unauthorized
              access or use of your account.
            </p>
            <p className="mb-4">
              <strong>Account Termination:</strong> We reserve the right to suspend or terminate your
              account for violations of these terms or illegal activity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
            <p className="mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Post false, misleading, or fraudulent information</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Use the service for illegal activities</li>
              <li>Impersonate any person or entity</li>
              <li>Scrape, copy, or distribute content without permission</li>
              <li>Circumvent security measures or platform restrictions</li>
              <li>Use automated systems (bots) without authorization</li>
              <li>Post discriminatory, hateful, or offensive content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Property Listings (Owners)</h2>
            <p className="mb-4">
              Property owners agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate property information and photos</li>
              <li>Comply with local rental laws and regulations</li>
              <li>Have proper authorization to list properties</li>
              <li>Maintain accurate availability and pricing</li>
              <li>Respond promptly to inquiries and match requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Client Responsibilities</h2>
            <p className="mb-4">
              Clients agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide truthful information in their profile</li>
              <li>Communicate respectfully with property owners</li>
              <li>Honor commitments made through the platform</li>
              <li>Comply with property rules and local laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Premium Subscriptions</h2>
            <p className="mb-4">
              <strong>Billing:</strong> Premium subscriptions are billed according to the plan you
              select. Prices are subject to change with notice.
            </p>
            <p className="mb-4">
              <strong>Cancellation:</strong> You may cancel your subscription at any time. No refunds
              will be provided for partial subscription periods.
            </p>
            <p className="mb-4">
              <strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before
              the renewal date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="mb-4">
              All content, features, and functionality of SwipeMatch are owned by us and protected by
              copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mb-4">
              <strong>User Content:</strong> By posting content, you grant us a non-exclusive, worldwide,
              royalty-free license to use, reproduce, and display your content for operating the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers</h2>
            <p className="mb-4">
              SwipeMatch is provided "AS IS" without warranties of any kind. We do not:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Guarantee property availability or accuracy of listings</li>
              <li>Verify the identity or background of all users</li>
              <li>Guarantee matches or successful rental agreements</li>
              <li>Warrant uninterrupted or error-free service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, SwipeMatch and its affiliates shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages arising from
              your use of the service.
            </p>
            <p className="mb-4">
              Our total liability for any claims shall not exceed the amount you paid us in the past
              12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold harmless SwipeMatch from any claims, damages, or expenses
              arising from your use of the service, violation of these terms, or infringement of any
              third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
            <p className="mb-4">
              <strong>Informal Resolution:</strong> We encourage users to contact us first to resolve
              disputes informally.
            </p>
            <p className="mb-4">
              <strong>Arbitration:</strong> Any disputes not resolved informally shall be resolved
              through binding arbitration, except where prohibited by law.
            </p>
            <p className="mb-4">
              <strong>Class Action Waiver:</strong> You agree to resolve disputes individually and
              waive the right to participate in class actions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p className="mb-4">
              These terms are governed by the laws of [Your Jurisdiction], without regard to conflict
              of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
            <p className="mb-4">
              We may modify these terms at any time. We will notify you of significant changes via
              email or platform notification. Continued use after changes constitutes acceptance of
              the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately for violations of these terms,
              illegal activity, or at our discretion. Upon termination, your right to use the service
              ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, contact us at:
            </p>
            <ul className="list-none pl-0 mb-4 space-y-2">
              <li><strong>Email:</strong> legal@tinderent.com</li>
              <li><strong>Support:</strong> support@tinderent.com</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Severability</h2>
            <p className="mb-4">
              If any provision of these terms is found to be invalid or unenforceable, the remaining
              provisions shall remain in full force and effect.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
