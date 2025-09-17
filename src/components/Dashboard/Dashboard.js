import React from 'react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import QRGenerator from '../QRGenerator/QRGenerator';
import './Dashboard.css';
import CustomizeQRModal from './CustomizeQRModal';

const Dashboard = ({ user }) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customizing, setCustomizing] = useState(null);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'qrcodes'),
        where('userId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const codes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by createdAt descending (newest first) on client side
        const getTimestampMs = (ts) => {
          try {
            if (!ts) return 0;
            if (typeof ts.toDate === 'function') return ts.toDate().getTime();
            if (typeof ts.seconds === 'number') return ts.seconds * 1000;
          } catch (_) {}
          return 0;
        };
        const sortedCodes = codes.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));

        setQrCodes(sortedCodes);
        setLoading(false);
        setError('');
      }, (err) => {
        console.error('Error fetching QR codes:', err);
        setLoading(false);
        if (err.code === 'permission-denied') {
          setError('Permission denied. Please check your Firestore security rules.');
        } else {
          setError('Failed to load QR codes. Please try refreshing the page.');
        }
      });

      return () => unsubscribe();
    }
  }, [user]);



  const handleDeleteQR = async (qrId) => {
    try {
      await deleteDoc(doc(db, 'qrcodes', qrId));
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  const downloadQR = (qrDataUrl, name, createdAt) => {
    const nameText = (name && name.trim()) ? name.trim() : 'QR Code';
    const dateText = formatCreatedAt(createdAt);

    const compose = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = qrDataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const padding = 24;
      const qrSize = Math.max(200, Math.min(360, img.width));
      const width = Math.max(420, qrSize + padding * 2);
      const titleFont = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const metaFont = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      const measure = document.createElement('canvas').getContext('2d');
      measure.font = titleFont;
      const titleWidth = measure.measureText(nameText).width;
      measure.font = metaFont;
      const dateWidth = measure.measureText(dateText).width;
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

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#111111';
      ctx.font = titleFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(nameText, canvas.width / 2, padding);

      ctx.fillStyle = '#666666';
      ctx.font = metaFont;
      ctx.fillText(dateText, canvas.width / 2, padding + titleHeight + gap1);

      const qrX = (canvas.width - qrSize) / 2;
      const qrY = padding + titleHeight + gap1 + dateHeight + gap2;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

      const out = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const fileDate = new Date().toISOString().slice(0, 10);
      link.download = `${nameText}-${fileDate}.png`;
      link.href = out;
      link.click();
    };

    compose().catch((e) => {
      console.error('Failed to compose QR image:', e);
      const link = document.createElement('a');
      const fileDate = new Date().toISOString().slice(0, 10);
      link.download = `${nameText}-${fileDate}.png`;
      link.href = qrDataUrl;
      link.click();
    });
  };

  const formatCreatedAt = (createdAt) => {
    try {
      if (!createdAt) return 'Just now';
      if (typeof createdAt.toDate === 'function') return createdAt.toDate().toLocaleDateString();
      if (typeof createdAt.seconds === 'number') return new Date(createdAt.seconds * 1000).toLocaleDateString();
    } catch (_) {}
    return 'Just now';
  };

  

  if (loading) {
    return <div className="loading">Loading your QR codes...</div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        <main className="dashboard-main">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Unable to load QR codes</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <div className="dashboard-actions" style={{ gap: 12 }}>
          <button 
            onClick={() => setShowGenerator(true)} 
            className="generate-btn"
          >
            + Generate New QR Code
          </button>
        </div>

        <div className={`qr-grid ${qrCodes.length === 1 ? 'single-item' : qrCodes.length === 2 ? 'two-items' : ''}`}>
          {qrCodes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📱</div>
              <h3>No QR codes yet</h3>
              <p>Create your first QR code to get started!</p>
              <button 
                onClick={() => setShowGenerator(true)} 
                className="generate-btn"
              >
                Generate QR Code
              </button>
            </div>
          ) : (
            qrCodes.map((qr) => (
              <div key={qr.id} className="qr-card">
                <div className="qr-image">
                  <img src={qr.qrDataUrl} alt={qr.name} style={{ borderRadius: `${Math.max(0, Math.min(qr?.customization?.rounding ?? 0, 48))}px` }} />
                </div>
                <div className="qr-info">
                  {qr?.customization?.card?.showName !== false ? (
                    <h4 style={{
                      color: qr?.customization?.card?.titleColor || undefined,
                      fontSize: qr?.customization?.card?.titleSize ? `${qr.customization.card.titleSize}px` : undefined,
                      fontWeight: qr?.customization?.card?.titleWeight ? parseInt(qr.customization.card.titleWeight, 10) : undefined,
                      margin: 0,
                      marginBottom: 12,
                    }}>{qr.name}</h4>
                  ) : null}

                  {(() => {
                    const showDate = qr?.customization?.card?.showDate;
                    if (showDate === false) return null;
                    const format = qr?.customization?.card?.dateFormat || 'date';
                    const customText = qr?.customization?.card?.customDateText || '';
                    const style = {
                      color: qr?.customization?.card?.dateColor || '#999',
                      fontSize: qr?.customization?.card?.dateSize ? `${qr.customization.card.dateSize}px` : '13px',
                      fontWeight: qr?.customization?.card?.dateWeight ? parseInt(qr.customization.card.dateWeight, 10) : 500,
                      marginBottom: 20,
                    };
                    let text = '';
                    if (format === 'custom') {
                      text = customText;
                    } else if (format === 'time') {
                      text = formatCreatedAt(qr.createdAt).includes('/') ? new Date(qr.createdAt?.toDate?.() || qr.createdAt?.seconds * 1000 || Date.now()).toLocaleTimeString() : new Date().toLocaleTimeString();
                    } else if (format === 'datetime') {
                      text = new Date(qr.createdAt?.toDate?.() || qr.createdAt?.seconds * 1000 || Date.now()).toLocaleString();
                    } else {
                      text = new Date(qr.createdAt?.toDate?.() || qr.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString();
                    }
                    return <p className="qr-date" style={style}>{text}</p>;
                  })()}

                  <p className="qr-content">{qr.content}</p>
                </div>
                <div className="qr-actions">
                  <button 
                    onClick={() => downloadQR(qr.qrDataUrl, qr.name, qr.createdAt)}
                    className="download-btn"
                  >
                    Download
                  </button>
                  <button 
                    onClick={() => setCustomizing(qr)}
                    className="download-btn"
                  >
                    Customize
                  </button>
                  <button 
                    onClick={() => handleDeleteQR(qr.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showGenerator && (
        <QRGenerator 
          user={user} 
          onClose={() => setShowGenerator(false)} 
        />
      )}

      {customizing && (
        <CustomizeQRModal
          initialName={customizing.name}
          initialContent={customizing.content}
          initialQrDataUrl={customizing.qrDataUrl}
          initialCustomization={customizing.customization}
          docId={customizing.id}
          onClose={() => setCustomizing(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;