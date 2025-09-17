import './Pages.css';

const TermsConditions = () => {
  return (
    <div className="page-section">
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using QR Master, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>Service Description</h2>
          <p>
            QR Master is a free web application that allows users to generate, customize, and manage QR codes. The service is provided "as is" without any warranties.
          </p>

          <h2>User Responsibilities</h2>
          <ul>
            <li>You are responsible for the content you encode in QR codes</li>
            <li>You must not use the service for illegal or harmful purposes</li>
            <li>You must not attempt to compromise the security of the service</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
          </ul>

          <h2>Prohibited Uses</h2>
          <p>You may not use QR Master to:</p>
          <ul>
            <li>Create QR codes containing malicious links or content</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Distribute spam or unsolicited content</li>
            <li>Attempt to reverse engineer or hack the service</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The QR Master application and its original content are the property of the developer. QR codes you generate belong to you, and you retain all rights to the content you encode.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            QR Master is provided free of charge. The developer shall not be liable for any damages arising from the use or inability to use the service.
          </p>

          <h2>Service Availability</h2>
          <p>
            While we strive to maintain high availability, we do not guarantee uninterrupted service. The service may be temporarily unavailable for maintenance or updates.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the application.
          </p>

          <h2>Contact Information</h2>
          <p>
            For questions about these Terms and Conditions, please contact us through: 
            <a href="https://theabhiraj.github.io/portfolio" target="_blank" rel="noopener noreferrer">
              theabhiraj.github.io/portfolio
            </a>
          </p>
    </div>
  );
};

export default TermsConditions;
