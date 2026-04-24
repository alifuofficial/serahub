import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Privacy Policy for SeraHub. Learn how we collect, use, and protect your personal information on our job and bid aggregator platform.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      <div className="space-y-10 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
          <p>SeraHub (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. By using SeraHub, you agree to the collection and use of information in accordance with this policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
          <h3 className="font-semibold text-slate-800 mb-2">Personal Information</h3>
          <p className="mb-4">When you register for an account, we may collect your name, email address, and password. We use this information to provide and improve our services, communicate with you, and personalize your experience.</p>
          <h3 className="font-semibold text-slate-800 mb-2">Usage Data</h3>
          <p className="mb-4">We automatically collect certain information when you access the Service, including your IP address, browser type, operating system, referring URLs, and information about how you interact with the Service. This data is used for analytics and to improve user experience.</p>
          <h3 className="font-semibold text-slate-800 mb-2">Cookies and Tracking</h3>
          <p>We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some features of our Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3 text-slate-600">
            <li>To provide, maintain, and improve the Service</li>
            <li>To create and manage your account and provide customer support</li>
            <li>To send you updates, marketing communications, and notifications (with your consent)</li>
            <li>To detect, prevent, and address technical issues and security threats</li>
            <li>To monitor and analyze usage patterns and trends to improve the Service</li>
            <li>To comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Sharing of Information</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3 text-slate-600">
            <li><strong className="text-slate-800">With Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, such as hosting, analytics, and email delivery.</li>
            <li><strong className="text-slate-800">For Legal Requirements:</strong> We may disclose your information where required by law or subpoena or if we believe that such action is necessary to comply with the law.</li>
            <li><strong className="text-slate-800">Business Transfers:</strong> We may share or transfer your information in connection with any merger, acquisition, or sale of company assets.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Advertising</h2>
          <p>SeraHub may display advertisements provided by third-party advertising partners, including Google AdSense. These partners may use cookies, web beacons, and similar technologies to collect information about your visits to our and other websites to provide targeted advertisements. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary font-medium hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3 text-slate-600">
            <li>Access and receive a copy of your personal information</li>
            <li>Correct inaccurate or incomplete personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to the processing of your personal information</li>
            <li>Withdraw consent at any time where we rely on consent to process your information</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, please contact us through our <a href="/contact" className="text-primary font-medium hover:underline">contact page</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Data Retention</h2>
          <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">9. Children&apos;s Privacy</h2>
          <p>Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete such information immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through our <a href="/contact" className="text-primary font-medium hover:underline">contact page</a>.</p>
        </section>
      </div>
    </div>
  );
}