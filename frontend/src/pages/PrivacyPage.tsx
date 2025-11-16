import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Privacy Policy Page
 * 遵循 design_system.md: 温暖明亮风格
 */
export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          className="bg-white rounded-xl shadow-md p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 
                         bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          
          <p className="text-gray-600 mb-8">
            Last updated: November 16, 2025
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to uniquenames.net ("we," "our," or "us"). We respect your privacy and are committed to 
                protecting your personal data. This privacy policy explains how we collect, use, and safeguard 
                your information when you use our AI-powered naming tool service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Account Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you sign up using Google OAuth, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Your email address</li>
                <li>Your name (if provided by Google)</li>
                <li>Your Google profile picture (if provided)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Usage Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We automatically collect information about how you use our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Name generation requests and inputs</li>
                <li>AI analysis results (Narrow Down feature)</li>
                <li>Usage timestamps and frequency</li>
                <li>Browser type and device information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Anonymous Usage</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                For anonymous users, we generate a temporary user ID stored locally in your browser. 
                This allows us to track usage limits without requiring an account.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide and improve our AI naming service</li>
                <li>Manage your account and authentication</li>
                <li>Track usage limits for free and registered users</li>
                <li>Analyze service performance and user behavior</li>
                <li>Communicate important service updates</li>
                <li>Prevent abuse and ensure fair usage</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Authentication is managed by Supabase (a SOC 2 Type II certified provider)</li>
                <li>Data is encrypted in transit using HTTPS/TLS</li>
                <li>Database access is restricted and monitored</li>
                <li>We do not store your Google password</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Supabase:</strong> Authentication and database hosting</li>
                <li><strong>OpenRouter:</strong> AI model API for name generation and analysis</li>
                <li><strong>Google OAuth:</strong> Authentication service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                These services have their own privacy policies and terms of service.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Access your personal data</li>
                <li>Request data deletion (by logging out and clearing your browser data)</li>
                <li>Withdraw consent (by deleting your account)</li>
                <li>Export your usage history</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your data for as long as your account is active. When you delete your account 
                or request data deletion, we will remove your personal information within 30 days, except 
                where required by law to retain it longer.
              </p>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Local Storage</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use browser local storage to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Store authentication tokens (via Supabase)</li>
                <li>Track anonymous usage limits</li>
                <li>Save user preferences</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our service is not directed to children under 13. We do not knowingly collect personal 
                information from children under 13. If you believe we have collected such information, 
                please contact us.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this privacy policy from time to time. We will notify you of significant 
                changes by posting a notice on our website or sending you an email.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this privacy policy or your personal data, please contact us at:
              </p>
              <p className="text-gray-700 leading-relaxed">
                Email: <a href="mailto:privacy@uniquenames.net" className="text-purple-600 hover:text-purple-700">
                  privacy@uniquenames.net
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

