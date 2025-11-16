import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Terms of Service Page
 * 遵循 design_system.md: 温暖明亮风格
 */
export function TermsPage() {
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
            Terms of Service
          </h1>
          
          <p className="text-gray-600 mb-8">
            Last updated: November 16, 2025
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Acceptance */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using uniquenames.net ("Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            {/* Description of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                uniquenames.net is an AI-powered naming tool that helps users generate and analyze name candidates 
                for various purposes. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>AI-powered name generation based on user prompts</li>
                <li>"Narrow Down" analysis feature for evaluating name candidates</li>
                <li>Usage history tracking (for registered users)</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use our Service anonymously with limited features, or create an account using Google OAuth 
                for unlimited access.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of your account credentials. 
                You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account if you violate these Terms or engage 
                in abusive behavior.
              </p>
            </section>

            {/* Usage Limits */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Usage Limits and Fair Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Anonymous Users</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Anonymous users are limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>3 name generation requests per day</li>
                <li>2 "Narrow Down" analyses per day</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Registered Users</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Registered users enjoy unlimited access to all features, subject to fair use policy.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Fair Use Policy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to throttle or limit access if we detect automated abuse, 
                excessive usage, or behavior that degrades service quality for other users.
              </p>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Use the Service for illegal purposes</li>
                <li>Attempt to reverse engineer or circumvent usage limits</li>
                <li>Submit harmful, offensive, or inappropriate content</li>
                <li>Use automated scripts or bots without permission</li>
                <li>Resell or redistribute our Service</li>
                <li>Impersonate others or misrepresent your affiliation</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Service Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content, features, and functionality of the Service (excluding user-generated content) 
                are owned by uniquenames.net and protected by copyright, trademark, and other laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 User Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of the content you input into our Service. By using our Service, 
                you grant us a limited license to process your input for the purpose of providing the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 AI-Generated Results</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                AI-generated name suggestions and analyses are provided for your use. We do not claim ownership 
                of these results, but we also do not guarantee their uniqueness or availability for trademark/copyright.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 No Warranty</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 AI Limitations</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                AI-generated suggestions are based on machine learning models and may contain errors, biases, 
                or inappropriate content. We do not guarantee the accuracy, quality, or suitability of AI outputs.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Trademark/Copyright</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not guarantee that suggested names are available for trademark or copyright registration. 
                Users are responsible for conducting their own legal due diligence.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, uniquenames.net SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
                WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE 
                LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            {/* Changes to Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Service and Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify or discontinue the Service (or any part thereof) at any time. 
                We will notify users of significant changes to these Terms by posting a notice on our website.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                in which uniquenames.net operates, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700 leading-relaxed">
                Email: <a href="mailto:support@uniquenames.net" className="text-purple-600 hover:text-purple-700">
                  support@uniquenames.net
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

