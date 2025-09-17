import './Pages.css';

const PrivacyPolicy = () => {
  return (
    <div className="page-section">
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>Introduction</h2>
          <p>
            QR Master ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our QR code generation service.
          </p>

          <h2>Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Email address (when you create an account)</li>
            <li>Display name (optional)</li>
            <li>Authentication information through Firebase</li>
          </ul>

          <h3>QR Code Data</h3>
          <ul>
            <li>Content you encode in QR codes (URLs, text, etc.)</li>
            <li>QR code names and creation dates</li>
            <li>Generated QR code images</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our QR code generation service</li>
            <li>To save and organize your QR codes in your personal library</li>
            <li>To authenticate your account and ensure security</li>
            <li>To improve our service and user experience</li>
          </ul>

          <h2>Data Storage and Security</h2>
          <p>
            Your data is stored securely using Google Firebase services with enterprise-grade security measures. We implement appropriate technical and organizational measures to protect your personal information.
          </p>

          <h2>Data Sharing</h2>
          <p>
            We do not sell, trade, or share your personal information with third parties. Your QR code data remains private and is only accessible to you through your account.
          </p>

          <h2>Your Rights</h2>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your QR code data</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our developer's portfolio: 
            <a href="https://theabhiraj.github.io/portfolio" target="_blank" rel="noopener noreferrer">
              theabhiraj.github.io/portfolio
            </a>
          </p>
    </div>
  );
};

export default PrivacyPolicy;
