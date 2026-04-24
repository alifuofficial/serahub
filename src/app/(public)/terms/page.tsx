import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service for SeraHub. By using our platform, you agree to these terms governing your use of our job and bid aggregator services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
        <p className="text-slate-500">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      <div className="space-y-10 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using SeraHub (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
          <p>SeraHub is a job and bid aggregation platform that collects and displays opportunities from various publicly available sources. We provide listings of jobs, bids, and tenders for informational purposes. SeraHub does not employ, endorse, or guarantee the accuracy of any listing or employer. We act solely as an aggregator and are not a party to any transaction between users and third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Accounts</h2>
          <p>You may be required to create an account to access certain features of the Service. You are responsible for safeguarding your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate your account at our sole discretion if we suspect any violation of these Terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Use of the Service</h2>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3 text-slate-600">
            <li>Use the Service in any way that violates applicable laws or regulations</li>
            <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service without express written permission</li>
            <li>Use any automated system, including robots, spiders, or scrapers, to access the Service</li>
            <li>Transmit any viruses, worms, or other malicious code</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
            <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Content Accuracy</h2>
          <p>While we strive to provide accurate and up-to-date information, SeraHub does not warrant that the content on the Service is free from errors or omissions. Job listings, bid details, and other information are sourced from third parties and may change without notice. We encourage users to verify all information independently before relying on it.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of SeraHub and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of SeraHub.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Limitation of Liability</h2>
          <p>SeraHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. This includes, without limitation, damages for loss of profits, goodwill, data, or other intangible losses. In no event shall our total liability exceed the amount paid by you, if any, for accessing the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Disclaimer</h2>
          <p>The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. SeraHub makes no warranties, expressed or implied, regarding the Service&apos;s reliability, accuracy, availability, or fitness for any particular purpose. To the fullest extent permitted by law, we disclaim all warranties, express or implied.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">9. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. Your continued use of the Service after any changes constitutes acceptance of the new Terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Us</h2>
          <p>If you have any questions about these Terms of Service, please contact us through our <a href="/contact" className="text-primary font-medium hover:underline">contact page</a>.</p>
        </section>
      </div>
    </div>
  );
}