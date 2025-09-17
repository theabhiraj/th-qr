import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import QRCode from 'qrcode';
import './QRGenerator.css';

const QRGenerator = ({ user, onClose }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [genError, setGenError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const generateQR = async () => {
    if (!content.trim() || !name.trim()) return;

    setGenError('');
    setLoading(true);
    try {
      // Try PNG first
      const pngDataUrl = await QRCode.toDataURL(content.trim(), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 320,
        margin: 4,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(pngDataUrl);
      requestAnimationFrame(() => {
        const el = document.querySelector('.qr-preview');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      if (user && user.uid) {
        await addDoc(collection(db, 'qrcodes'), {
          userId: user.uid,
          name: name.trim(),
          content: content.trim(),
          qrDataUrl: pngDataUrl,
          createdAt: serverTimestamp(),
        });
      }
    } catch (pngErr) {
      try {
        // Fallback to SVG
        const svgString = await QRCode.toString(content.trim(), {
          type: 'svg',
          errorCorrectionLevel: 'H',
          margin: 4,
          color: { dark: '#000000', light: '#ffffff' },
        });
        const svgDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
        setQrDataUrl(svgDataUrl);
        requestAnimationFrame(() => {
          const el = document.querySelector('.qr-preview');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        if (user && user.uid) {
          await addDoc(collection(db, 'qrcodes'), {
            userId: user.uid,
            name: name.trim(),
            content: content.trim(),
            qrDataUrl: svgDataUrl,
            createdAt: serverTimestamp(),
          });
        }
      } catch (svgErr) {
        console.error('QR generation failed (png, svg):', pngErr, svgErr);
        setGenError('Failed to generate QR. Please try again with shorter content.');
      }
    }
    setLoading(false);
  };



  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  const downloadQR = async () => {
    if (!qrDataUrl) return;

    const nameText = name && name.trim() ? name.trim() : 'Untitled QR Code';
    const dateText = new Date().toLocaleString();

    // Build a composite image: title, date, QR
    try {
      const img = new Image();
      img.src = qrDataUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const padding = 24;
      const qrSize = Math.max(200, Math.min(360, img.width));
      const width = Math.max(420, qrSize + padding * 2);
      const titleFont = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const metaFont = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Measure text widths
      const canvasMeasure = document.createElement('canvas');
      const ctxMeasure = canvasMeasure.getContext('2d');
      ctxMeasure.font = titleFont;
      const titleWidth = ctxMeasure.measureText(nameText).width;
      ctxMeasure.font = metaFont;
      const dateWidth = ctxMeasure.measureText(dateText).width;

      const contentWidth = Math.max(qrSize, titleWidth, dateWidth);
      const finalWidth = Math.max(width, contentWidth + padding * 2);

      const titleHeight = 28;
      const dateHeight = 20;
      const gap1 = 12;
      const gap2 = 8;
      const totalHeight = padding + titleHeight + gap1 + dateHeight + gap2 + qrSize + padding;

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(finalWidth);
      canvas.height = Math.ceil(totalHeight);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#111111';
      ctx.font = titleFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(nameText, canvas.width / 2, padding);

      // Date
      ctx.fillStyle = '#666666';
      ctx.font = metaFont;
      ctx.fillText(dateText, canvas.width / 2, padding + titleHeight + gap1);

      // QR centered
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = padding + titleHeight + gap1 + dateHeight + gap2;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Border box around content
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

      const out = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const fileDate = new Date().toISOString().slice(0, 10);
      link.download = `${nameText || 'qr-code'}-${fileDate}.png`;
      link.href = out;
      link.click();
    } catch (e) {
      console.error('Failed to compose QR image:', e);
      // Fallback: download raw QR only
      const link = document.createElement('a');
      link.download = `${nameText || 'qr-code'}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  return (
    <div className="qr-generator-overlay" onClick={handleClose}>
      <div className={`qr-generator-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Generate QR Code</h2>
          <button onClick={handleClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-content">
          <div className="form-section">
            <div className="form-group">
              <label>QR Code Name</label>
              <input
                type="text"
                placeholder="Enter a name for your QR code"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Content (URL or Text)</label>
              <textarea
                placeholder="Enter URL or text to encode"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
            
            <button
              onClick={generateQR}
              className="generate-btn"
              disabled={!content.trim() || !name.trim() || loading}
            >
              {loading ? (user ? 'Generating & Saving...' : 'Generating...') : (user ? 'Generate & Save QR Code' : 'Generate QR Code')}
            </button>
          </div>
          
          {qrDataUrl && (
            <div className="qr-preview-section">
              <div className="qr-preview">
                <img src={qrDataUrl} alt="Generated QR Code" />
                <p className="qr-name">{name || 'Untitled QR Code'}</p>
              </div>
              
              <div className="qr-actions">
                <button
                  onClick={downloadQR}
                  className="download-btn"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          )}
          {!qrDataUrl && genError && (
            <div className="qr-preview-section">
              <div className="qr-preview">
                <p style={{ color: '#d00', margin: 0 }}>{genError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;