// Date & Time Formatters
export function formatDate(dateStr, format = 'medium') {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (format === 'monthYear') {
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  if (format === 'full') {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getVaccineStatusInfo(vaccine) {
  const days = getDaysUntil(vaccine.nextDueDate);
  if (days === null) {
    return { status: 'uptodate', label: 'Up to Date', badgeClass: 'badge-uptodate' };
  }
  if (days < 0) {
    return { status: 'overdue', label: `Overdue by ${Math.abs(days)}d`, badgeClass: 'badge-overdue' };
  }
  if (days <= 30) {
    return { status: 'duesoon', label: `Due in ${days}d`, badgeClass: 'badge-duesoon' };
  }
  return { status: 'uptodate', label: 'Up to Date', badgeClass: 'badge-uptodate' };
}

// Calculate Age from Date of Birth
export function calculateAge(dobStr) {
  if (!dobStr) return 'Unknown';
  const birth = new Date(dobStr);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0) {
    return `${months} mos`;
  }
  return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
}

// Canvas Smooth Bezier Curve Weight Graph Renderer
export function renderWeightChart(canvas, historyData = [], theme = 'light') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 340;
  const height = rect.height || 180;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  if (!historyData || historyData.length === 0) {
    ctx.font = '12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('No weight records yet', width / 2, height / 2);
    return;
  }

  const padding = { top: 25, right: 25, bottom: 35, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const weights = historyData.map(d => d.weight);
  const minW = Math.max(0, Math.floor(Math.min(...weights) - 1));
  const maxW = Math.ceil(Math.max(...weights) + 1);

  const getX = (index) => padding.left + (chartW / (historyData.length - 1 || 1)) * index;
  const getY = (w) => padding.top + chartH - ((w - minW) / (maxW - minW || 1)) * chartH;

  // Grid Lines
  ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(148, 163, 184, 0.18)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  const gridSteps = 3;
  for (let i = 0; i <= gridSteps; i++) {
    const val = minW + (maxW - minW) * (i / gridSteps);
    const y = getY(val);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Y Axis Label
    ctx.fillStyle = theme === 'dark' ? '#64748b' : '#94a3b8';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.setLineDash([]);
    ctx.fillText(`${val.toFixed(1)}kg`, padding.left - 6, y + 3);
    ctx.setLineDash([3, 3]);
  }
  ctx.setLineDash([]);

  // Plot Line Points Coordinates
  const points = historyData.map((d, idx) => ({
    x: getX(idx),
    y: getY(d.weight),
    data: d
  }));

  // Gradient Fill under curve
  if (points.length > 1) {
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Smooth Line Curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Draw Point Circles & X Labels
  points.forEach((p, idx) => {
    // Outer white glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Date Label on X Axis
    if (idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2)) {
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
      ctx.textAlign = 'center';
      const shortDate = formatDate(p.data.date, 'short');
      ctx.fillText(shortDate, p.x, height - 10);
    }
  });
}

// Dynamic SVG QR Code generator representation
export function generateQRCodeSVG(text = 'PawPulse-Pet-ID') {
  // Generates a crisp high-contrast QR Matrix SVG pattern
  return `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- QR Position Markers -->
      <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a"/>
      <rect x="10" y="10" width="16" height="16" fill="#ffffff"/>
      <rect x="13" y="13" width="10" height="10" rx="2" fill="#10b981"/>

      <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a"/>
      <rect x="74" y="10" width="16" height="16" fill="#ffffff"/>
      <rect x="77" y="13" width="10" height="10" rx="2" fill="#10b981"/>

      <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a"/>
      <rect x="10" y="74" width="16" height="16" fill="#ffffff"/>
      <rect x="13" y="77" width="10" height="10" rx="2" fill="#10b981"/>

      <!-- QR Data Matrix Blocks -->
      <rect x="36" y="8" width="8" height="6" fill="#0f172a"/>
      <rect x="48" y="8" width="14" height="6" fill="#0f172a"/>
      <rect x="36" y="18" width="6" height="14" fill="#0f172a"/>
      <rect x="46" y="20" width="16" height="6" fill="#0f172a"/>
      <rect x="52" y="30" width="10" height="10" rx="2" fill="#10b981"/>

      <rect x="8" y="36" width="6" height="12" fill="#0f172a"/>
      <rect x="18" y="40" width="14" height="6" fill="#0f172a"/>
      <rect x="8" y="52" width="16" height="8" fill="#0f172a"/>

      <rect x="36" y="38" width="8" height="8" rx="2" fill="#10b981"/>
      <rect x="48" y="44" width="6" height="16" fill="#0f172a"/>
      <rect x="58" y="40" width="12" height="6" fill="#0f172a"/>
      <rect x="74" y="38" width="18" height="8" fill="#0f172a"/>
      <rect x="68" y="50" width="10" height="12" fill="#0f172a"/>
      <rect x="84" y="52" width="8" height="10" fill="#0f172a"/>

      <rect x="36" y="66" width="12" height="6" fill="#0f172a"/>
      <rect x="36" y="76" width="6" height="16" fill="#0f172a"/>
      <rect x="46" y="72" width="16" height="8" fill="#0f172a"/>
      <rect x="52" y="84" width="12" height="8" fill="#0f172a"/>
      <rect x="68" y="70" width="24" height="6" fill="#0f172a"/>
      <rect x="72" y="80" width="8" height="12" fill="#0f172a"/>
      <rect x="84" y="80" width="8" height="12" rx="2" fill="#10b981"/>
    </svg>
  `;
}
