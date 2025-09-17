import './Pages.css';

const AboutUs = () => {
  return (
    <div className="page-section">
          
          <div className="about-hero">
            <div className="developer-profile">
              <div className="developer-avatar-large">👨‍💻</div>
              <h2>Abhiraj</h2>
              <p className="developer-title">Solo Developer & Creator</p>
              <a 
                href="https://theabhiraj.github.io/portfolio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="portfolio-button"
              >
                View Portfolio
              </a>
            </div>
          </div>

          <h2>About QR Master</h2>
          <p>
            QR Master is a passion project created by <strong>Abhiraj</strong>, a dedicated solo developer who believes in building useful tools that are accessible to everyone.
          </p>

          <h2>Our Mission</h2>
          <p>
            To provide a simple, powerful, and completely free QR code generation service that helps individuals and businesses create beautiful QR codes without any limitations or costs.
          </p>

          <h2>Why QR Master?</h2>
          <ul>
            <li><strong>Completely Free:</strong> No hidden costs, no premium features, no limitations</li>
            <li><strong>Privacy Focused:</strong> Your data belongs to you and stays secure</li>
            <li><strong>Open & Accessible:</strong> Available to everyone, everywhere</li>
            <li><strong>Modern Technology:</strong> Built with the latest web technologies</li>
            <li><strong>User-Centric Design:</strong> Designed with simplicity and usability in mind</li>
          </ul>

          <h2>Technology Stack</h2>
          <div className="tech-showcase">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <span>React</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🔥</span>
              <span>Flutter</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">📱</span>
              <span>QR Code Generation</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🎨</span>
              <span>Modern CSS</span>
            </div>
          </div>

          <h2>Open Source Philosophy</h2>
          <p>
            QR Master is built with the philosophy of making useful tools freely available to everyone. This project represents the belief that technology should serve people, not profit margins.
          </p>

          <h2>Future Plans</h2>
          <ul>
            <li>Enhanced customization options</li>
            <li>Batch QR code generation</li>
            <li>Analytics and tracking features</li>
            <li>API access for developers</li>
            <li>Mobile application</li>
          </ul>

          <h2>Get in Touch</h2>
          <p>
            Have suggestions, feedback, or just want to say hello? Feel free to reach out through my portfolio website:
          </p>
          <div className="contact-section">
            <a 
              href="https://theabhiraj.github.io/portfolio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
            >
              🌐 theabhiraj.github.io/portfolio
            </a>
          </div>

          <div className="thank-you">
            <h3>Thank You</h3>
            <p>
              Thank you for using QR Master and being part of this journey. Your support and feedback help make this project better every day.
            </p>
          </div>
    </div>
  );
};

export default AboutUs;
