import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import './CustomizeQRModal.css';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const ERROR_LEVELS = ['L', 'M', 'Q', 'H'];
const DATE_FORMATS = [
  { value: 'datetime', label: 'Date & time' },
  { value: 'date', label: 'Date only' },
  { value: 'time', label: 'Time only' },
  { value: 'custom', label: 'Custom text' },
];

const THEMES = [
  { key: 'classic', name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { key: 'midnight', name: 'Midnight', fg: '#111827', bg: '#ffffff' },
  { key: 'sunset', name: 'Sunset', fg: '#ff6b35', bg: '#ffffff' },
  { key: 'ocean', name: 'Ocean', fg: '#0ea5e9', bg: '#ffffff' },
  { key: 'forest', name: 'Forest', fg: '#10b981', bg: '#ffffff' },
  // Removed one preset and added Custom option
  { key: 'custom', name: 'Custom', fg: null, bg: null },
];

const CustomizeQRModal = ({ initialName, initialContent, initialQrDataUrl, initialCustomization, docId, onClose }) => {
  const [name, setName] = useState(initialName || '');
  const [content, setContent] = useState(initialContent || '');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(4);
  const [rounding, setRounding] = useState(16);
  const [errorLevel, setErrorLevel] = useState('H');
  const [preview, setPreview] = useState(initialQrDataUrl || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // UI mode
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classic');

  // Card options
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [dateFormat, setDateFormat] = useState('date');
  const [customDateText, setCustomDateText] = useState('');

  // Title/date style options
  const [titleColor, setTitleColor] = useState('#111827');
  const [titleSize, setTitleSize] = useState(20); // px
  const [titleWeight, setTitleWeight] = useState('700');
  const [dateColor, setDateColor] = useState('#6b7280');
  const [dateSize, setDateSize] = useState(14); // px
  const [dateWeight, setDateWeight] = useState('400');

  // Background image (card)
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundImageError, setBackgroundImageError] = useState('');

  const dateText = useMemo(() => {
    const now = new Date();
    switch (dateFormat) {
      case 'date':
        return now.toLocaleDateString();
      case 'time':
        return now.toLocaleTimeString();
      case 'custom':
        return customDateText || '';
      case 'datetime':
      default:
        return now.toLocaleString();
    }
  }, [dateFormat, customDateText]);

  // Apply theme when changed (Simple mode preset)
  const skipNextThemeEffect = useRef(false);
  useEffect(() => {
    const t = THEMES.find(t => t.key === selectedTheme);
    if (!t) return;
    if (t.key === 'custom') return; // don't override custom colors
    if (skipNextThemeEffect.current) { skipNextThemeEffect.current = false; return; }
    setFgColor(t.fg);
    setBgColor(t.bg);
  }, [selectedTheme]);

  // Initialize from saved customization when opening
  useEffect(() => {
    const c = initialCustomization;
    if (!c) return;
    if (typeof c.fgColor === 'string') setFgColor(c.fgColor);
    if (typeof c.bgColor === 'string') setBgColor(c.bgColor);
    if (typeof c.size === 'number') setSize(c.size);
    if (typeof c.margin === 'number') setMargin(c.margin);
    if (typeof c.rounding === 'number') setRounding(c.rounding);
    if (typeof c.errorLevel === 'string') setErrorLevel(c.errorLevel);
    if (typeof c.theme === 'string') { skipNextThemeEffect.current = true; setSelectedTheme(c.theme); }
    if (typeof c.backgroundImage === 'string') setBackgroundImage(c.backgroundImage);
    const card = c.card || {};
    if (typeof card.showName === 'boolean') setShowName(card.showName);
    if (typeof card.showDate === 'boolean') setShowDate(card.showDate);
    if (typeof card.dateFormat === 'string') setDateFormat(card.dateFormat);
    if (typeof card.customDateText === 'string') setCustomDateText(card.customDateText);
    if (typeof card.titleColor === 'string') setTitleColor(card.titleColor);
    if (typeof card.titleSize === 'number') setTitleSize(card.titleSize);
    if (typeof card.titleWeight === 'string') setTitleWeight(card.titleWeight);
    if (typeof card.dateColor === 'string') setDateColor(card.dateColor);
    if (typeof card.dateSize === 'number') setDateSize(card.dateSize);
    if (typeof card.dateWeight === 'string') setDateWeight(card.dateWeight);
    // Preview will regenerate from effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate preview from options
  useEffect(() => {
    let cancelled = false;
    const gen = async () => {
      if (!content) { setPreview(''); return; }
      setLoading(true);
      try {
        const dataUrl = await QRCode.toDataURL(content, {
          errorCorrectionLevel: errorLevel,
          type: 'image/png',
          width: size,
          margin: margin,
          color: { dark: fgColor, light: bgColor },
        });
        if (!cancelled) setPreview(dataUrl);
      } catch (e) {
        try {
          const svgString = await QRCode.toString(content, {
            type: 'svg',
            errorCorrectionLevel: errorLevel,
            margin: margin,
            color: { dark: fgColor, light: bgColor },
          });
          if (!cancelled) setPreview('data:image/svg+xml;utf8,' + encodeURIComponent(svgString));
        } catch (_) {
          if (!cancelled) setPreview('');
        }
      }
      if (!cancelled) setLoading(false);
    };
    gen();
    return () => { cancelled = true; };
  }, [content, fgColor, bgColor, size, margin, errorLevel]);

  const downloadComposite = async () => {
    const nameText = (name && name.trim()) ? name.trim() : 'QR Code';
    const titleEnabled = showName && !!nameText;
    const dateEnabled = showDate && !!dateText;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = preview;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const padding = 24;
      const qrSize = Math.max(160, Math.min(size, 480));
      const titleFont = `${titleWeight === '700' ? 'bold' : 'normal'} ${titleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const metaFont = `${dateWeight === '700' ? 'bold' : 'normal'} ${dateSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

      const measure = document.createElement('canvas').getContext('2d');
      measure.font = titleFont;
      const titleWidth = titleEnabled ? measure.measureText(nameText).width : 0;
      measure.font = metaFont;
      const metaWidth = dateEnabled ? measure.measureText(dateText).width : 0;

      const contentWidth = Math.max(qrSize, titleWidth, metaWidth);
      const canvasWidth = Math.max(420, contentWidth + padding * 2);

      const titleHeight = titleEnabled ? Math.ceil(titleSize * 1.4) : 0;
      const dateHeight = dateEnabled ? Math.ceil(dateSize * 1.3) : 0;
      const gap1 = titleEnabled && dateEnabled ? 10 : 0;
      const gap2 = (titleEnabled || dateEnabled) ? 10 : 0;
      const canvasHeight = padding + titleHeight + gap1 + dateHeight + gap2 + qrSize + padding;

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(canvasWidth);
      canvas.height = Math.ceil(canvasHeight);
      const ctx = canvas.getContext('2d');

      // Background color
      ctx.fillStyle = bgColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Optional background image (cover)
      if (backgroundImage) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.src = backgroundImage;
          await new Promise((res, rej) => { bgImg.onload = res; bgImg.onerror = rej; });
          // cover algorithm
          const canvasRatio = canvas.width / canvas.height;
          const imgRatio = bgImg.width / bgImg.height;
          let drawW, drawH, dx, dy;
          if (imgRatio > canvasRatio) {
            drawH = canvas.height;
            drawW = drawH * imgRatio;
          } else {
            drawW = canvas.width;
            drawH = drawW / imgRatio;
          }
          dx = (canvas.width - drawW) / 2;
          dy = (canvas.height - drawH) / 2;
          ctx.drawImage(bgImg, dx, dy, drawW, drawH);
        } catch (_) {}
      }

      // Title and date
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      let y = padding;
      if (titleEnabled) {
        ctx.fillStyle = titleColor;
        ctx.font = titleFont;
        ctx.fillText(nameText, canvas.width / 2, y);
        y += titleHeight + (dateEnabled ? gap1 : 0);
      }
      if (dateEnabled) {
        ctx.fillStyle = dateColor;
        ctx.font = metaFont;
        ctx.fillText(dateText, canvas.width / 2, y);
        y += dateHeight + gap2;
      }

      // Rounded-rect mask for QR
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = y;
      const r = Math.max(0, Math.min(rounding, Math.floor(qrSize / 4)));

      if (r > 0) {
        ctx.save();
        const x = qrX, h = qrSize, w = qrSize;
        ctx.beginPath();
        ctx.moveTo(x + r, qrY);
        ctx.lineTo(x + w - r, qrY);
        ctx.quadraticCurveTo(x + w, qrY, x + w, qrY + r);
        ctx.lineTo(x + w, qrY + h - r);
        ctx.quadraticCurveTo(x + w, qrY + h, x + w - r, qrY + h);
        ctx.lineTo(x + r, qrY + h);
        ctx.quadraticCurveTo(x, qrY + h, x, qrY + h - r);
        ctx.lineTo(x, qrY + r);
        ctx.quadraticCurveTo(x, qrY, x + r, qrY);
        ctx.closePath();
        ctx.clip();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        ctx.restore();
      } else {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
      }

      // Outer border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

      const out = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      const fileDate = new Date().toISOString().slice(0, 10);
      a.download = `${(nameText || 'QR Code')}-${fileDate}.png`;
      a.href = out;
      a.click();
    } catch (e) {
      console.error('Failed to compose customized QR:', e);
    }
  };

  const saveToFirestore = async () => {
    if (!docId || !content || !name) return;
    setSaveError('');
    setSaving(true);
    try {
      let pngDataUrl = preview;
      if (!pngDataUrl.startsWith('data:image/png')) {
        pngDataUrl = await QRCode.toDataURL(content, {
          errorCorrectionLevel: errorLevel,
          type: 'image/png',
          width: size,
          margin: margin,
          color: { dark: fgColor, light: bgColor },
        });
      }

      await updateDoc(doc(db, 'qrcodes', docId), {
        name: name.trim(),
        content: content.trim(),
        qrDataUrl: pngDataUrl,
        updatedAt: serverTimestamp(),
        customization: {
          fgColor,
          bgColor,
          size,
          margin,
          rounding,
          errorLevel,
          theme: selectedTheme,
          backgroundImage: backgroundImage || '',
          card: {
            showName,
            showDate,
            dateFormat,
            customDateText,
            titleColor,
            titleSize,
            titleWeight,
            dateColor,
            dateSize,
            dateWeight,
          },
        },
      });
      onClose();
    } catch (e) {
      console.error('Failed to save customization:', e);
      setSaveError('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="customizer-overlay" onClick={onClose}>
      <div className="customizer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="customizer-header">
          <h3>Customize QR</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="customizer-content">
          <div className="customizer-left">
            <div className="mode-toggle">
              <button className={!showAdvanced ? 'mode active' : 'mode'} onClick={() => setShowAdvanced(false)}>Simple</button>
              <button className={showAdvanced ? 'mode active' : 'mode'} onClick={() => setShowAdvanced(true)}>Advanced</button>
            </div>

            {!showAdvanced && (
              <>
                <div className="section">
                  <div className="section-title">Text</div>
                  <div className="field">
                    <label>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="QR name" />
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">QR</div>
                  <div className="field">
                    <label>Content</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="URL or text" />
                  </div>
                  <div className="field">
                    <label>Theme</label>
                    <div className="theme-row">
                      {THEMES.map(t => (
                        <button key={t.key} className={`theme ${selectedTheme === t.key ? 'selected' : ''}`} onClick={() => setSelectedTheme(t.key)}>
                          <span className="swatch" style={{ background: t.fg || '#ddd' }} />
                          <span>{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedTheme === 'custom' && (
                    <div className="row">
                      <div className="field">
                        <label>Foreground</label>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Background</label>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <div className="row">
                    <div className="field">
                      <label>Size: {size}px</label>
                      <input type="range" min="200" max="420" step="10" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
                    </div>
                    <div className="field">
                      <label>Rounding: {rounding}px</label>
                      <input type="range" min="0" max="40" step="2" value={rounding} onChange={(e) => setRounding(parseInt(e.target.value, 10))} />
                    </div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Date</div>
                  <div className="row">
                    <div className="field">
                      <label><input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} /> Show Date</label>
                    </div>
                    <div className="field">
                      <label>Date format</label>
                      <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                        {DATE_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {showDate && dateFormat === 'custom' && (
                    <div className="field">
                      <label>Custom date text</label>
                      <input value={customDateText} onChange={(e) => setCustomDateText(e.target.value)} placeholder="Enter any text..." />
                    </div>
                  )}
                </div>

                <div className="section">
                  <div className="section-title">Background</div>
                  <div className="field">
                    <label>Background color</label>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Background image (max 50 KB)</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      setBackgroundImageError('');
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      if (file.size > 50 * 1024) {
                        setBackgroundImage('');
                        setBackgroundImageError('Please choose an image under 50 KB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = typeof reader.result === 'string' ? reader.result : '';
                        setBackgroundImage(result);
                      };
                      reader.readAsDataURL(file);
                    }} />
                    {backgroundImage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <img src={backgroundImage} alt="bg" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }} />
                        <button onClick={() => setBackgroundImage('')}>Remove</button>
                      </div>
                    )}
                    {backgroundImageError && <div style={{ color: '#d00', fontSize: 12, marginTop: 6 }}>{backgroundImageError}</div>}
                  </div>
                </div>
              </>
            )}

            {showAdvanced && (
              <>
                <div className="section">
                  <div className="section-title">QR</div>
                  <div className="row">
                    <div className="field">
                      <label>Foreground</label>
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Background</label>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="field">
                      <label>Size: {size}px</label>
                      <input type="range" min="160" max="480" step="10" value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
                    </div>
                    <div className="field">
                      <label>Margin: {margin}px</label>
                      <input type="range" min="0" max="12" step="1" value={margin} onChange={(e) => setMargin(parseInt(e.target.value, 10))} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="field">
                      <label>Rounding: {rounding}px</label>
                      <input type="range" min="0" max="48" step="2" value={rounding} onChange={(e) => setRounding(parseInt(e.target.value, 10))} />
                    </div>
                    <div className="field">
                      <label>Error Correction</label>
                      <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value)}>
                        {ERROR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Text</div>
                  <div className="field">
                    <label>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="QR name" />
                  </div>
                  <div className="field">
                    <label>Content</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="URL or text" />
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Date</div>
                  <div className="row">
                    <div className="field">
                      <label><input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} /> Show Date on card</label>
                    </div>
                    <div className="field">
                      <label>Date format</label>
                      <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                        {DATE_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {showDate && dateFormat === 'custom' && (
                    <div className="field">
                      <label>Custom date text</label>
                      <input value={customDateText} onChange={(e) => setCustomDateText(e.target.value)} placeholder="Enter any text..." />
                    </div>
                  )}
                  <div className="row">
                    <div className="field">
                      <label>Date color</label>
                      <input type="color" value={dateColor} onChange={(e) => setDateColor(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Date size: {dateSize}px</label>
                      <input type="range" min="10" max="28" step="1" value={dateSize} onChange={(e) => setDateSize(parseInt(e.target.value, 10))} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="field">
                      <label>Date weight</label>
                      <select value={dateWeight} onChange={(e) => setDateWeight(e.target.value)}>
                        <option value="400">Normal</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Title</div>
                  <div className="row">
                    <div className="field">
                      <label>Title color</label>
                      <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Title size: {titleSize}px</label>
                      <input type="range" min="12" max="36" step="1" value={titleSize} onChange={(e) => setTitleSize(parseInt(e.target.value, 10))} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="field">
                      <label>Title weight</label>
                      <select value={titleWeight} onChange={(e) => setTitleWeight(e.target.value)}>
                        <option value="400">Normal</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {saveError && <div style={{ color: '#d00', fontSize: 13 }}>{saveError}</div>}
            <div className="row">
              <button className="primary" disabled={!content || loading || saving} onClick={downloadComposite}>
                {loading ? 'Rendering…' : 'Download Customized PNG'}
              </button>
              <button className="primary" disabled={!content || !name || saving} onClick={saveToFirestore}>
                {saving ? 'Saving…' : 'Save to My QRs'}
              </button>
            </div>
          </div>
          <div className="customizer-right">
            <div className="preview-box">
              <div className="card-preview" style={{ backgroundColor: bgColor || '#ffffff', backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {showName && name && <div className="card-title" style={{ color: titleColor, fontSize: `${titleSize}px`, fontWeight: parseInt(titleWeight, 10) }}>{name}</div>}
                {showDate && dateText && <div className="card-date" style={{ color: dateColor, fontSize: `${dateSize}px`, fontWeight: parseInt(dateWeight, 10) }}>{dateText}</div>}
                {preview ? <img src={preview} alt="Preview" style={{ borderRadius: `${Math.max(0, Math.min(rounding, 48))}px` }} /> : <div className="preview-placeholder">No preview</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeQRModal;
