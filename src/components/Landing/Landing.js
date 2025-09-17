
// import Header from '../Header/Header';
import './Landing.css';

const Landing = ({ onGetStarted, onLogin, onSignup, onPrivacy, onTerms, onLogoClick }) => {
  const scrollToHowToUse = () => {
    const element = document.getElementById('how-to-use');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">

      <main className="landing-main">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h2>Create Beautiful QR Codes in Seconds</h2>
              <p>Generate, customize, and manage all your QR codes in one place. Perfect for businesses, events, and personal use.</p>
              <div className="hero-buttons">
                <button onClick={onGetStarted} className="primary-cta-btn">
                  Start Creating QR Codes
                </button>
                <button onClick={scrollToHowToUse} className="secondary-btn">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="qr-showcase">
                <div className="qr-card-demo">
                  <div className="qr-code-sample">
                    <div className="qr-pattern"></div>
                  </div>
                  <div className="qr-info-demo">
                    <h4>Website QR</h4>
                    <p>theabhiraj.github.io/th-qr</p>
                  </div>
                </div>
                <div className="floating-elements">
                  <div className="floating-qr floating-qr-1">📱</div>
                  <div className="floating-qr floating-qr-2">🔗</div>
                  <div className="floating-qr floating-qr-3">📧</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <div className="container">
            <div className="features-header">
              <h3>Why Choose QR Master?</h3>
              <p>Everything you need to create, manage, and track your QR codes</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h4>Lightning Fast</h4>
                <p>Generate QR codes instantly with our optimized engine. No waiting, no delays.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💾</div>
                <h4>Save & Organize</h4>
                <p>Keep all your QR codes organized in your personal library with easy search.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h4>Mobile Friendly</h4>
                <p>Works perfectly on all devices and screen sizes. Create QR codes anywhere.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h4>Secure & Private</h4>
                <p>Your data is encrypted and stored securely with enterprise-grade security.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h4>Customizable</h4>
                <p>Create QR codes that match your brand with customization options.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Analytics</h4>
                <p>Track performance and get insights on your QR code usage patterns.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-to-use" className="how-to-use">
          <div className="container">
            <div className="how-to-use-header">
              <h3>How to Use QR Master</h3>
              <p>Get started with QR Master in just a few simple steps</p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Sign Up</h4>
                  <p>Create your free account in seconds. No credit card required.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Enter Your Content</h4>
                  <p>Add your URL, text, or any content you want to encode in the QR code.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Generate & Customize</h4>
                  <p>Click generate and customize your QR code with different styles and colors.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Download & Share</h4>
                  <p>Download your QR code in high quality and share it anywhere you want.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h3>About QR Master</h3>
                <p>QR Master is a passion project created by <strong>Abhiraj</strong>, a solo developer dedicated to building useful tools for everyone.</p>
                <p>This project is completely <strong>free and publicly available</strong>, designed to help individuals and businesses create beautiful QR codes without any cost or limitations.</p>
                <p>Built with modern web technologies and a focus on user experience, QR Master aims to be the simplest yet most powerful QR code generator available.</p>
                <div className="about-links">
                  <a href="https://theabhiraj.github.io/portfolio" target="_blank" rel="noopener noreferrer" className="portfolio-link">
                    View Developer Portfolio
                  </a>
                </div>
              </div>
              <div className="about-visual">
                <div className="developer-card">
                  <div className="developer-avatar">👨‍💻</div>
                  <h4>Abhiraj</h4>
                  <p>Solo Developer</p>
                  <div className="tech-stack">
                    <span>React</span>
                    <span>Flutter</span>
                    <span>Python</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h3>Ready to Get Started?</h3>
              <p>Join thousands of users who trust QR Master for their QR code needs</p>
              <button onClick={onGetStarted} className="final-cta-btn">
                Create Your First QR Code
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">📱</span>
                <h4>QR Master</h4>
              </div>
              <p>The most powerful QR code generator for modern businesses and individuals.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h5>Product</h5>
                <button onClick={onLogin}>Features</button>
                <button onClick={onLogin}>Pricing</button>
                <button onClick={onLogin}>API</button>
              </div>
              <div className="footer-column">
                <h5>Company</h5>
                <button onClick={onLogin}>About</button>
                <button onClick={onLogin}>Contact</button>
                <button onClick={onLogin}>Support</button>
              </div>
              <div className="footer-column">
                <h5>Legal</h5>
                <button onClick={onLogin}>Privacy</button>
                <button onClick={onLogin}>Terms</button>
                <button onClick={onLogin}>Security</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 QR Master. Made with ❤️ for QR code enthusiasts.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Landing;