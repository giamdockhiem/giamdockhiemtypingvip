/**
 * High-Resolution HTML5 Canvas Social Share Card Generator
 * Produces crisp 1200x630px OpenGraph / social media summary cards.
 */

export interface ShareCardData {
  rankTitle: string;
  rankIconName?: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  elapsedSeconds: number;
  mode: string;
  passageTitle: string;
  passageId: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  wpmHistory?: number[];
  theme?: string;
  language?: 'en' | 'vi';
}

/**
 * Renders the high-resolution 1200x630 share card onto an offscreen canvas
 */
export async function renderShareCardCanvas(data: ShareCardData): Promise<HTMLCanvasElement> {
  // Wait for Google Fonts to ensure perfect typography on canvas
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font loading times out
    }
  }

  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 630;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context');
  }

  const isVi = data.language === 'vi';
  const isLegendary = data.wpm >= 90;
  const isProfessional = data.wpm >= 70 && data.wpm < 90;
  const isSkilled = data.wpm >= 50 && data.wpm < 70;

  // Determine accent theme color based on rank
  const accentColor = isLegendary
    ? '#f59e0b' // Amber Gold
    : isProfessional
    ? '#a855f7' // Purple / Violet
    : isSkilled
    ? '#10b981' // Emerald
    : '#38bdf8'; // Sky Blue

  const accentColorRgb = isLegendary
    ? '245, 158, 11'
    : isProfessional
    ? '168, 85, 247'
    : isSkilled
    ? '16, 185, 129'
    : '56, 189, 248';

  // 1. Deep Obsidian Background
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Radial Glow from Top Center
  const topGlow = ctx.createRadialGradient(width / 2, 40, 20, width / 2, 80, 500);
  topGlow.addColorStop(0, `rgba(${accentColorRgb}, 0.22)`);
  topGlow.addColorStop(0.5, `rgba(${accentColorRgb}, 0.05)`);
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height);

  // Bottom secondary glow
  const bottomGlow = ctx.createRadialGradient(180, 560, 10, 180, 560, 360);
  bottomGlow.addColorStop(0, `rgba(${accentColorRgb}, 0.12)`);
  bottomGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Subtle Technical Grid Pattern
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const gridSize = 36;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Outer Metallic Border with Rounded Corners
  ctx.save();
  const cardMargin = 28;
  const cardRadius = 24;
  const cardW = width - cardMargin * 2;
  const cardH = height - cardMargin * 2;

  ctx.beginPath();
  ctx.roundRect(cardMargin, cardMargin, cardW, cardH, cardRadius);
  ctx.strokeStyle = `rgba(${accentColorRgb}, 0.35)`;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Inner subtle highlight border
  ctx.beginPath();
  ctx.roundRect(cardMargin + 2, cardMargin + 2, cardW - 4, cardH - 4, cardRadius - 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 5. Header Brand Bar
  ctx.save();
  // Glowing logo dot
  ctx.beginPath();
  ctx.arc(cardMargin + 44, cardMargin + 48, 7, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AuraType', cardMargin + 60, cardMargin + 55);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    isVi ? '• Luyện Gõ Phím Bảo Vệ Mắt' : '• Eye-Care Speed Typing',
    cardMargin + 168,
    cardMargin + 54
  );

  // Mode badge in top right
  const modeText = `${data.mode.toUpperCase()}`;
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  const modeWidth = ctx.measureText(modeText).width;
  const badgeW = modeWidth + 24;
  const badgeH = 28;
  const badgeX = width - cardMargin - badgeW - 32;
  const badgeY = cardMargin + 34;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(modeText, badgeX + 12, badgeY + 19);
  ctx.restore();

  // 6. Earned Typist Rank Section (Hero Center)
  ctx.save();
  const rankY = 165;
  ctx.textAlign = 'center';

  // Subtitle Pill
  const rankLabel = isVi ? 'DANH HIỆU ĐẠT ĐƯỢC' : 'CERTIFIED TYPIST RANK';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 8;
  ctx.fillText(rankLabel, width / 2, rankY - 26);
  ctx.shadowBlur = 0;

  // Main Rank Title
  ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(data.rankTitle, width / 2, rankY + 22);

  // Decorative laurels / divider line
  const lineWidth = 340;
  const lineGrad = ctx.createLinearGradient(
    width / 2 - lineWidth / 2,
    rankY + 40,
    width / 2 + lineWidth / 2,
    rankY + 40
  );
  lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  lineGrad.addColorStop(0.5, `rgba(${accentColorRgb}, 0.6)`);
  lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - lineWidth / 2, rankY + 42);
  ctx.lineTo(width / 2 + lineWidth / 2, rankY + 42);
  ctx.stroke();
  ctx.restore();

  // 7. Four Prominent Key Metric Cards
  const cardsY = 250;
  const cardGap = 16;
  const metricsCount = 4;
  const availableWidth = width - (cardMargin * 2) - 64;
  const metricCardW = (availableWidth - cardGap * (metricsCount - 1)) / metricsCount;
  const metricCardH = 138;
  const startX = cardMargin + 32;

  const metricCards = [
    {
      label: isVi ? 'TỐC ĐỘ (NET WPM)' : 'NET SPEED',
      sub: isVi ? 'Từ / Phút Chuẩn' : 'Words / Minute',
      value: `${data.wpm}`,
      unit: 'WPM',
      color: accentColor,
      textColor: accentColor,
    },
    {
      label: isVi ? 'ĐỘ CHÍNH XÁC' : 'ACCURACY',
      sub: isVi ? `${data.incorrectChars} ký tự lỗi` : `${data.incorrectChars} typos`,
      value: `${data.accuracy.toFixed(1)}%`,
      unit: '',
      color: '#10b981',
      textColor: '#34d399',
    },
    {
      label: isVi ? 'TỐC ĐỘ THÔ' : 'RAW SPEED',
      sub: isVi ? 'Bao Gồm Phím Sửa' : 'Total Keystroke Rate',
      value: `${data.rawWpm}`,
      unit: 'WPM',
      color: '#e2e8f0',
      textColor: '#f1f5f9',
    },
    {
      label: isVi ? 'THỜI GIAN GÕ' : 'TIME ELAPSED',
      sub: isVi ? `${data.totalChars} ký tự` : `${data.totalChars} total chars`,
      value: `${data.elapsedSeconds}s`,
      unit: '',
      color: '#e2e8f0',
      textColor: '#cbd5e1',
    },
  ];

  metricCards.forEach((card, idx) => {
    const cx = startX + idx * (metricCardW + cardGap);
    const cy = cardsY;

    ctx.save();
    // Card background
    ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cx, cy, metricCardW, metricCardH, 16);
    ctx.fill();

    // Subtle card border
    ctx.strokeStyle = idx === 0 ? `rgba(${accentColorRgb}, 0.4)` : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Metric Header Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(card.label, cx + 18, cy + 30);

    // Value
    ctx.fillStyle = card.textColor;
    ctx.font = 'bold 44px "JetBrains Mono", monospace';
    ctx.fillText(card.value, cx + 18, cy + 82);

    // Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(card.sub, cx + 18, cy + 115);
    ctx.restore();
  });

  // 8. Lower Content Strip: Keystroke Breakdown & Cadence Sparkline
  const lowerY = 412;
  const lowerH = 100;

  // Left side: Detailed Keystrokes Box
  const leftBoxW = 460;
  ctx.save();
  ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
  ctx.beginPath();
  ctx.roundRect(startX, lowerY, leftBoxW, lowerH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Keystrokes bar label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText(isVi ? 'PHÂN TÍCH PHÍM GÕ (KEYSTROKES)' : 'KEYSTROKE COMPOSITION', startX + 18, lowerY + 28);

  // Numbers row
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#34d399';
  ctx.fillText(`${data.correctChars}`, startX + 18, lowerY + 58);
  ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText(isVi ? 'chính xác' : 'correct', startX + 68, lowerY + 57);

  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f87171';
  ctx.fillText(`${data.incorrectChars}`, startX + 148, lowerY + 58);
  ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText(isVi ? 'lỗi sai' : 'errors', startX + 186, lowerY + 57);

  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText(`${data.totalChars}`, startX + 258, lowerY + 58);
  ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText(isVi ? 'tổng phím' : 'total keys', startX + 306, lowerY + 57);

  // Progress Bar for Accuracy visualization
  const barX = startX + 18;
  const barY = lowerY + 74;
  const barW = leftBoxW - 36;
  const barH = 7;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  const correctPct = data.totalChars > 0 ? data.correctChars / data.totalChars : 1;
  const filledW = Math.max(8, barW * correctPct);
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.roundRect(barX, barY, filledW, barH, 4);
  ctx.fill();
  ctx.restore();

  // Right side: Passage reference & Cadence Sparkline
  const rightBoxX = startX + leftBoxW + cardGap;
  const rightBoxW = availableWidth - leftBoxW - cardGap;

  ctx.save();
  ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
  ctx.beginPath();
  ctx.roundRect(rightBoxX, lowerY, rightBoxW, lowerH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Passage title
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText(isVi ? 'BÀI ĐỌC ĐÃ HOÀN THÀNH' : 'COMPLETED PASSAGE', rightBoxX + 18, lowerY + 28);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  const rawTitle = `#${data.passageId}: ${data.passageTitle}`;
  const truncatedTitle = rawTitle.length > 34 ? rawTitle.slice(0, 32) + '...' : rawTitle;
  ctx.fillText(truncatedTitle, rightBoxX + 18, lowerY + 54);

  // Speed Cadence curve preview if history exists
  const history = data.wpmHistory && data.wpmHistory.length > 1 ? data.wpmHistory : [data.wpm, data.wpm];
  if (history.length >= 2) {
    const sparkX = rightBoxX + 18;
    const sparkY = lowerY + 68;
    const sparkW = rightBoxW - 36;
    const sparkH = 22;

    const maxVal = Math.max(...history, data.wpm, 40);
    const minVal = Math.max(0, Math.min(...history) - 5);
    const range = Math.max(1, maxVal - minVal);

    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    history.forEach((val, i) => {
      const px = sparkX + (i / (history.length - 1)) * sparkW;
      const py = sparkY + sparkH - ((val - minVal) / range) * sparkH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // 9. Clean Footer / Watermark
  ctx.save();
  const footerY = height - cardMargin - 20;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    isVi
      ? 'AuraType • Luyện gõ phím chuẩn 10 ngón với chế độ bảo vệ mắt'
      : 'AuraType • Ergonomic typing with eye protection & live certifications',
    cardMargin + 32,
    footerY
  );

  ctx.textAlign = 'right';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillStyle = accentColor;
  ctx.fillText('auratype.app', width - cardMargin - 32, footerY);
  ctx.restore();

  return canvas;
}

/**
 * Exports share card as PNG Blob
 */
export async function generateShareCardBlob(data: ShareCardData): Promise<Blob> {
  const canvas = await renderShareCardCanvas(data);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate PNG blob from canvas'));
      }
    }, 'image/png');
  });
}

/**
 * Exports share card as base64 Data URL (for inline image preview)
 */
export async function generateShareCardDataUrl(data: ShareCardData): Promise<string> {
  const canvas = await renderShareCardCanvas(data);
  return canvas.toDataURL('image/png');
}

/**
 * Triggers instant browser download of the share card PNG file
 */
export async function downloadShareCard(data: ShareCardData, customFilename?: string): Promise<void> {
  const blob = await generateShareCardBlob(data);
  const url = URL.createObjectURL(blob);
  const filename = customFilename || `auratype-${data.wpm}wpm-${data.rankTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Copies high-resolution image directly to the system clipboard
 */
export async function copyShareCardImageToClipboard(data: ShareCardData): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      return false;
    }

    const blob = await generateShareCardBlob(data);
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn('Clipboard image write failed:', err);
    return false;
  }
}
