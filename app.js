// ============================================================
// app.js — Vision IQ Executive Dashboard
// ============================================================
'use strict';

// ── Chart instances (kept for destroy/rebuild on filter) ──
const charts = {};

// ── Recording state ──
let mediaRec = null, recChunks = [], isRec = false;

// ── Theme state ──
let lightMode = false;

// ============================================================
// CHART.JS GLOBAL DEFAULTS
// ============================================================
Chart.defaults.color = '#7ba7cc';
Chart.defaults.borderColor = 'rgba(0,194,255,0.08)';
Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(5,13,31,0.97)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(0,194,255,0.3)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.titleColor = '#00C2FF';
Chart.defaults.plugins.tooltip.bodyColor = '#e8f4ff';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

// ============================================================
// PARTICLES
// ============================================================
function initParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H;
  const pts = [];

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 55; i++) {
    pts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,194,255,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// NAVIGATION — switch between pages
// ============================================================
function navigateTo(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target page
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.nav-link-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
    el.classList.toggle('glow-anim', el.dataset.page === pageId);
  });

  // Update header title
  const titles = {
    'page-snapshot': { num: '1.1', title: 'Market Snapshot',   sub: 'Live Vision IQ market overview and index performance' },
    'page-sector':      { num: '1.2', title: 'Sector Performance',    sub: 'Analyze sector-wise performance across key financial and health metrics' },
    'page-yoy':         { num: '1.3', title: 'YoY Growth Tracker',    sub: 'Year-over-year revenue and profitability growth by sector' }
  };
  const t = titles[pageId];
  if (t) {
    document.getElementById('headerNum').textContent   = t.num;
    document.getElementById('headerTitle').textContent = t.title;
    document.getElementById('headerSub').textContent   = t.sub;
  }

  // Build charts for the page if not yet built
  if (pageId === 'page-sector' && !charts.bar)   { buildBarChart(); buildBubbleChart(); }
  if (pageId === 'page-yoy'    && !charts.yoyLine){ buildYoYCharts(); }
  if (pageId === 'page-snapshot') buildSnapshotPage();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// ============================================================
// SKELETON DISMISS + INIT
// ============================================================
window.addEventListener('load', () => {
  initParticles();
  setTimeout(() => {
    document.getElementById('skeletonOverlay').classList.add('hidden');
    // Build default page (1.2)
    buildBarChart();
    buildBubbleChart();
    buildSectorTable();
    buildTreemap();
    buildTopTable();
    animateKPIs();
    injectLiveDates();
  }, 1800);
});

// ============================================================
// KPI ANIMATED COUNTERS
// ============================================================
function animateKPIs() {
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const unit = el.querySelector('.kpi-unit') ? el.querySelector('.kpi-unit').outerHTML : '';
    const dur = 1400;
    let startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const prog = Math.min((ts - startTime) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      el.innerHTML = (target * ease).toFixed(1) + unit;
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ============================================================
// PAGE 1.1 — MARKET SNAPSHOT
// ============================================================
function buildSnapshotPage() {
  const ticker = document.getElementById('tickerStrip');
  if (!ticker || ticker.dataset.built) return;
  ticker.dataset.built = '1';
  MARKET_SNAPSHOT.forEach(item => {
    const d = document.createElement('div');
    d.className = 'ticker-card';
    d.innerHTML = `
      <div class="ticker-name">${item.label}</div>
      <div class="ticker-value">${item.value}</div>
      <div class="ticker-change ${item.up ? 'up' : 'down'}">
        <i class="fa-solid fa-arrow-trend-${item.up ? 'up' : 'down'}"></i> ${item.change}
      </div>`;
    ticker.appendChild(d);
  });

  // Build a line chart for NIFTY 100 trend
  if (!charts.niftyLine) {
    const ctx = document.getElementById('niftyLineChart');
    if (!ctx) return;
    charts.niftyLine = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Vision IQ',
          data: [21400,21800,22100,21600,22400,22900,23100,22700,23400,23600,23200,23847],
          borderColor: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.08)',
          borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, fill: true, tension: 0.4
        }, {
          label: 'SENSEX',
          data: [70200,71400,72600,71000,73400,75200,76100,74800,76900,77600,76200,78553],
          borderColor: '#19D3A2', backgroundColor: 'rgba(25,211,162,0.06)',
          borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, fill: true, tension: 0.4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { boxWidth: 10, padding: 14, font: { size: 11 } } } },
        scales: {
          x: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 } } },
          y: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 }, callback: v => v.toLocaleString() } }
        },
        animation: { duration: 800 }
      }
    });
  }
}

// ============================================================
// PAGE 1.2 — SECTOR PERFORMANCE CHARTS
// ============================================================
function buildBarChart(yearFilter) {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;
  if (charts.bar) charts.bar.destroy();

  const short = SECTORS.map(s =>
    s.replace('Financial Services','Fin. Svcs')
     .replace('Information Technology','IT')
     .replace('Oil, Gas & Consumables','Oil & Gas')
     .replace('Automobile','Auto')
     .replace('Healthcare','Health')
  );
  const years = (yearFilter && yearFilter !== 'all') ? [yearFilter] : Object.keys(BAR_DATA);

  charts.bar = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: short,
      datasets: years.map(y => ({
        label: y,
        data: BAR_DATA[y].map(v => +(v / 1000).toFixed(1)),
        backgroundColor: YEAR_COLORS[y].bg,
        borderColor: YEAR_COLORS[y].border,
        borderWidth: 1, borderRadius: 5, borderSkipped: false
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 10, padding: 14, font: { size: 11 } } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ₹${c.raw}K Cr` } }
      },
      scales: {
        x: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 } } },
        y: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 }, callback: v => '₹' + v + 'K' } }
      },
      animation: { duration: 800 }
    }
  });
}

function buildBubbleChart() {
  const ctx = document.getElementById('bubbleChart');
  if (!ctx) return;
  if (charts.bubble) charts.bubble.destroy();
  const maxRev = Math.max(...BUBBLE_DATA.map(d => d.revenue));

  charts.bubble = new Chart(ctx.getContext('2d'), {
    type: 'bubble',
    data: {
      datasets: BUBBLE_DATA.map(d => ({
        label: d.sector,
        data: [{ x: d.cagr, y: d.roe, r: Math.max(8, (d.revenue / maxRev) * 42) }],
        backgroundColor: d.color + 'aa', borderColor: d.color, borderWidth: 1.5
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, padding: 10, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: c => {
              const d = BUBBLE_DATA[c.datasetIndex];
              return [` ${d.sector}`, ` CAGR: ${d.cagr}%`, ` ROE: ${d.roe}%`, ` Revenue: ₹${(d.revenue/1000).toFixed(0)}K Cr`];
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Avg 3Y Sales CAGR %', color: '#7ba7cc', font: { size: 11 } }, grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 }, callback: v => v + '%' } },
        y: { title: { display: true, text: 'Avg 3Y ROE %', color: '#7ba7cc', font: { size: 11 } }, grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 }, callback: v => v + '%' } }
      },
      animation: { duration: 800 }
    }
  });
}

function buildSectorTable(filter) {
  const tbody = document.getElementById('sectorTableBody');
  if (!tbody) return;
  const data = filter ? SECTOR_TABLE.filter(r => r.sector.toLowerCase().includes(filter.toLowerCase())) : SECTOR_TABLE;
  tbody.innerHTML = '';
  data.forEach(row => {
    const oC = row.opm >= 20 ? 'val-green' : row.opm >= 12 ? 'val-yellow' : 'val-red';
    const dC = row.de  <= 0.5 ? 'val-green' : row.de  <= 1.5 ? 'val-yellow' : 'val-red';
    const rC = row.roe >= 20 ? 'val-green' : row.roe >= 12 ? 'val-yellow' : 'val-red';
    const hC = row.health >= 80 ? 'val-green' : row.health >= 65 ? 'val-yellow' : 'val-red';
    const fc = row.health >= 80 ? '#19D3A2' : row.health >= 65 ? '#FFD166' : '#FF5C7A';
    tbody.innerHTML += `<tr>
      <td><span class="sector-pill">${row.sector}</span></td>
      <td class="${oC}">${row.opm}%</td>
      <td class="${dC}">${row.de}</td>
      <td class="${rC}">${row.roe}%</td>
      <td><div class="score-bar-wrap"><div class="score-bar-track"><div class="score-bar-fill" style="width:${row.health}%;background:${fc}"></div></div><span class="${hC}">${row.health}</span></div></td>
      <td class="val-white">${row.cos}</td>
    </tr>`;
  });
}

function buildTreemap() {
  const grid = document.getElementById('treemapGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const hColor = h => {
    if (h >= 85) return { bg: 'linear-gradient(135deg,#0a6b3a,#0d8a4e)', border: '#19D3A2' };
    if (h >= 70) return { bg: 'linear-gradient(135deg,#0a4a8a,#0d62b5)', border: '#00C2FF' };
    if (h >= 60) return { bg: 'linear-gradient(135deg,#5a4a00,#7a6400)', border: '#FFD166' };
    return           { bg: 'linear-gradient(135deg,#6b1a2a,#8a2236)', border: '#FF5C7A' };
  };
  TREEMAP_DATA.forEach(b => {
    const c = hColor(b.health);
    const d = document.createElement('div');
    d.className = 'treemap-block';
    d.style.cssText = `background:${c.bg};border:1px solid ${c.border}44;box-shadow:0 4px 20px rgba(0,0,0,0.3),0 0 12px ${c.border}22`;
    d.title = `${b.sector} — Revenue: ${b.revenue} | Health: ${b.health}`;
    d.innerHTML = `<div class="treemap-sector">${b.sector}</div><div><div class="treemap-revenue">${b.revenue}</div><div class="treemap-score-label">Health Score</div><div class="treemap-score-val">${b.health}</div></div>`;
    grid.appendChild(d);
  });
}

function buildTopTable(filter) {
  const tbody = document.getElementById('topTableBody');
  if (!tbody) return;
  const data = filter ? TOP_COMPANIES.filter(r => r.company.toLowerCase().includes(filter.toLowerCase()) || r.sector.toLowerCase().includes(filter.toLowerCase())) : TOP_COMPANIES;
  tbody.innerHTML = '';
  data.forEach((row, i) => {
    const hC = row.health >= 85 ? 'val-green' : row.health >= 70 ? 'val-yellow' : 'val-red';
    const rC = row.roe >= 30 ? 'val-green' : row.roe >= 15 ? 'val-yellow' : 'val-red';
    const cC = row.cagr >= 15 ? 'val-green' : row.cagr >= 10 ? 'val-yellow' : 'val-red';
    const oC = row.opm >= 20 ? 'val-green' : row.opm >= 12 ? 'val-yellow' : 'val-red';
    const dC = row.de  <= 0.5 ? 'val-green' : row.de  <= 1.5 ? 'val-yellow' : 'val-red';
    const fc = row.health >= 85 ? '#19D3A2' : row.health >= 70 ? '#FFD166' : '#FF5C7A';
    tbody.innerHTML += `<tr>
      <td class="val-neon" style="font-weight:800">${i + 1}</td>
      <td><span class="sector-pill">${row.sector}</span></td>
      <td class="company-name">${row.company}</td>
      <td><div class="score-bar-wrap"><div class="score-bar-track"><div class="score-bar-fill" style="width:${row.health}%;background:${fc}"></div></div><span class="${hC}">${row.health}</span></div></td>
      <td class="${rC}">${row.roe}%</td>
      <td class="${cC}">${row.cagr}%</td>
      <td class="${oC}">${row.opm}%</td>
      <td class="${dC}">${row.de}</td>
      <td class="val-white">${row.revenue}</td>
    </tr>`;
  });
}

// ============================================================
// PAGE 1.3 — YOY GROWTH TRACKER
// ============================================================
function buildYoYCharts() {
  // Line chart — YoY growth %
  const ctx1 = document.getElementById('yoyLineChart');
  if (ctx1 && !charts.yoyLine) {
    charts.yoyLine = new Chart(ctx1.getContext('2d'), {
      type: 'line',
      data: {
        labels: YOY_DATA.labels,
        datasets: YOY_DATA.datasets.map(ds => ({
          label: ds.label, data: ds.data,
          borderColor: ds.color, backgroundColor: ds.color + '18',
          borderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
          fill: false, tension: 0.4
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12, font: { size: 10 } } } },
        scales: {
          x: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 } } },
          y: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 }, callback: v => v + '%' } }
        },
        animation: { duration: 800 }
      }
    });
  }

  // Bar chart — 2025 YoY growth comparison
  const ctx2 = document.getElementById('yoyBarChart');
  if (ctx2 && !charts.yoyBar) {
    const latest = YOY_DATA.datasets.map(ds => ({ label: ds.label, val: ds.data[ds.data.length - 1], color: ds.color }));
    charts.yoyBar = new Chart(ctx2.getContext('2d'), {
      type: 'bar',
      data: {
        labels: latest.map(d => d.label.replace('Financial Services','Fin. Svcs').replace('Information Technology','IT').replace('Oil, Gas & Consumables','Oil & Gas').replace('Automobile','Auto').replace('Healthcare','Health')),
        datasets: [{
          label: '2025 YoY Growth %',
          data: latest.map(d => d.val),
          backgroundColor: latest.map(d => d.color + 'cc'),
          borderColor: latest.map(d => d.color),
          borderWidth: 1, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 } } },
          y: { grid: { color: 'rgba(0,194,255,0.05)' }, ticks: { font: { size: 10 }, callback: v => v + '%' } }
        },
        animation: { duration: 800 }
      }
    });
  }
}

// ============================================================
// FILTERS
// ============================================================
function applyFilters() {
  const year = document.getElementById('yearFilter').value;
  buildBarChart(year);
  showToast('Year filter applied: ' + year, 'info', 2000);
}

function handleSearch(q) {
  buildSectorTable(q);
  buildTopTable(q);
}

// ============================================================
// LIVE DATE/TIME — inject everywhere, update every minute
// ============================================================
function injectLiveDates() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  const sd = document.getElementById('sidebarDate');
  const sr = document.getElementById('sidebarRefresh');
  if (sd) sd.textContent = dateStr;
  if (sr) sr.textContent = `${dateStr} ${timeStr}`;
  document.querySelectorAll('.live-date').forEach(el => { el.textContent = dateStr; });
  setTimeout(injectLiveDates, 60000);
}

// ============================================================
// SNAPSHOT — native canvas composite, no html2canvas needed
// ============================================================
async function takeSnapshot() {
  showToast('Building snapshot…', 'info', 4000);
  try {
    const dataUrl = await buildDashboardCanvas(2);
    const a = document.createElement('a');
    a.download = `visioniq-snapshot-${new Date().toISOString().slice(0,10)}.png`;
    a.href = dataUrl;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('Snapshot saved!', 'success');
  } catch(e) { showToast('Snapshot failed: ' + e.message, 'error'); console.error(e); }
}

// ============================================================
// PDF EXPORT — same canvas → jsPDF
// ============================================================
async function exportPDF() {
  showToast('Generating PDF…', 'info', 4000);
  try {
    const dataUrl = await buildDashboardCanvas(1.5);
    const img = new Image();
    img.onload = () => {
      const { jsPDF } = window.jspdf;
      const W = img.width, H = img.height;
      const pdf = new jsPDF({ orientation: W > H ? 'landscape' : 'portrait', unit: 'px', format: [W, H] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, W, H);
      pdf.save(`visioniq-report-${new Date().toISOString().slice(0,10)}.pdf`);
      showToast('PDF exported!', 'success');
    };
    img.src = dataUrl;
  } catch(e) { showToast('PDF failed: ' + e.message, 'error'); console.error(e); }
}

// ============================================================
// buildDashboardCanvas — draws active page onto a fresh canvas
// by reading Chart.js <canvas> pixels directly (always works)
// ============================================================
async function buildDashboardCanvas(scale = 2) {
  const BG = '#050d1f', CARD = '#0d1f3c', BORDER = 'rgba(0,194,255,0.18)';
  const T1 = '#e8f4ff', T2 = '#7ba7cc', MUT = '#3d6080', NEON = '#00C2FF';
  const PAD = 22, GAP = 16, R = 14, W = 1440;
  const pageId = (document.querySelector('.page.active') || {}).id || 'page-sector';

  // Heights per section
  const KPI_H = 100, CHART_H = 300, TABLE_H = 320, TICKER_H = 80;
  let totalH = PAD + 56 + GAP;
  if (pageId === 'page-sector')   totalH += KPI_H+GAP + CHART_H+GAP + TABLE_H+GAP + TABLE_H+GAP;
  else if (pageId === 'page-yoy') totalH += KPI_H+GAP + CHART_H+GAP + CHART_H+GAP;
  else                            totalH += TICKER_H+GAP + CHART_H+GAP + TABLE_H+GAP;
  totalH += 40 + PAD;

  const canvas = document.createElement('canvas');
  canvas.width = W * scale; canvas.height = totalH * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // ── helpers ──
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
  function card(x,y,w,h){rr(x,y,w,h,R);ctx.fillStyle=CARD;ctx.fill();ctx.strokeStyle=BORDER;ctx.lineWidth=1;ctx.stroke();const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'transparent');g.addColorStop(.5,'rgba(0,194,255,0.22)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x,y,w,1);}
  function t(text,x,y,size,color,align='left',weight='500'){ctx.font=`${weight} ${size}px 'Segoe UI',sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(text,x,y);ctx.textAlign='left';}
  function copyChart(id,x,y,w,h){const s=document.getElementById(id);if(s&&s.width)ctx.drawImage(s,x,y,w,h);}

  // ── background ──
  ctx.fillStyle=BG; ctx.fillRect(0,0,W,totalH);
  ctx.strokeStyle='rgba(0,194,255,0.03)'; ctx.lineWidth=1;
  for(let gx=0;gx<W;gx+=40){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,totalH);ctx.stroke();}
  for(let gy=0;gy<totalH;gy+=40){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}

  // ── header ──
  ctx.fillStyle='rgba(7,20,40,0.98)'; ctx.fillRect(0,0,W,56);
  ctx.strokeStyle='rgba(0,194,255,0.12)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,56); ctx.lineTo(W,56); ctx.stroke();
  const labels={'page-snapshot':'1.1  Market Snapshot','page-sector':'1.2  Sector Performance','page-yoy':'1.3  YoY Growth Tracker'};
  t('Vision IQ  ·  Executive Market Overview',PAD,22,10,MUT,'left','600');
  t(labels[pageId]||'1.2  Sector Performance',PAD,44,16,T1,'left','800');
  const now=new Date();
  const ds=now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  const ts=now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}).toUpperCase();
  t(`Generated: ${ds} ${ts}`,W-PAD,34,10,MUT,'right','400');

  let curY = 56 + GAP;

  // ── page content ──
  const half = Math.floor((W - PAD*2 - GAP) / 2);
  const bx = PAD + half + GAP;

  if (pageId === 'page-sector') {
    // KPI strip
    const kpis=[{l:'TOTAL MARKET REVENUE',v:'₹1,496.9K Cr',c:'+12.4% YoY',u:true},{l:'AVG SECTOR ROE',v:'19.1%',c:'+2.1 pts',u:true},{l:'AVG HEALTH SCORE',v:'74.9 / 100',c:'+3.2 pts',u:true},{l:'TOP SECTOR CAGR',v:'16.2%',c:'Healthcare',u:true}];
    const kw=Math.floor((W-PAD*2-GAP*3)/4);
    kpis.forEach((k,i)=>{const x=PAD+i*(kw+GAP);card(x,curY,kw,KPI_H);t(k.l,x+14,curY+20,9,MUT,'left','600');t(k.v,x+14,curY+52,20,T1,'left','800');ctx.fillStyle=k.u?'#19D3A2':'#FF5C7A';ctx.font='600 11px Segoe UI,sans-serif';ctx.fillText((k.u?'▲ ':'▼ ')+k.c,x+14,curY+76);});
    curY += KPI_H + GAP;
    // Row 1: bar + bubble
    card(PAD,curY,half,CHART_H); t('Total Sales by Sector by Year',PAD+14,curY+22,12,T1,'left','700'); copyChart('barChart',PAD+8,curY+32,half-16,CHART_H-42);
    card(bx,curY,half,CHART_H);  t('Sector Profitability: Sales Growth vs ROE',bx+14,curY+22,12,T1,'left','700'); copyChart('bubbleChart',bx+8,curY+32,half-16,CHART_H-42);
    curY += CHART_H + GAP;
    // Row 2: table + treemap
    card(PAD,curY,half,TABLE_H); t('Sector Comparison Metrics',PAD+14,curY+22,12,T1,'left','700'); drawSectorTbl(ctx,PAD+8,curY+34,half-16,TABLE_H-44,T1,T2,MUT);
    card(bx,curY,half,TABLE_H);  t('Revenue by Sector & Health Score',bx+14,curY+22,12,T1,'left','700'); drawTreemapC(ctx,bx+8,curY+34,half-16,TABLE_H-44);
    curY += TABLE_H + GAP;
    // Row 3: top companies
    card(PAD,curY,W-PAD*2,TABLE_H); t('Top Ranked Companies — Vision IQ',PAD+14,curY+22,12,T1,'left','700'); drawTopTbl(ctx,PAD+8,curY+34,W-PAD*2-16,TABLE_H-44,T1,T2,MUT,NEON);
    curY += TABLE_H + GAP;

  } else if (pageId === 'page-yoy') {
    const kpis=[{l:'HIGHEST CAGR SECTOR',v:'Healthcare',c:'16.2% avg CAGR',u:true},{l:'FASTEST GROWING 2025',v:'IT',c:'13.0% YoY',u:true},{l:'SLOWEST GROWTH 2025',v:'Oil & Gas',c:'3.9% YoY',u:false},{l:'AVG MARKET GROWTH',v:'10.9%',c:'2025 YoY',u:true}];
    const kw=Math.floor((W-PAD*2-GAP*3)/4);
    kpis.forEach((k,i)=>{const x=PAD+i*(kw+GAP);card(x,curY,kw,KPI_H);t(k.l,x+14,curY+20,9,MUT,'left','600');t(k.v,x+14,curY+52,18,T1,'left','800');ctx.fillStyle=k.u?'#19D3A2':'#FF5C7A';ctx.font='600 11px Segoe UI,sans-serif';ctx.fillText((k.u?'▲ ':'▼ ')+k.c,x+14,curY+76);});
    curY += KPI_H + GAP;
    card(PAD,curY,W-PAD*2,CHART_H); t('Sector YoY Revenue Growth % (2021–2025)',PAD+14,curY+22,12,T1,'left','700'); copyChart('yoyLineChart',PAD+8,curY+32,W-PAD*2-16,CHART_H-42);
    curY += CHART_H + GAP;
    card(PAD,curY,W-PAD*2,CHART_H); t('2025 YoY Growth by Sector',PAD+14,curY+22,12,T1,'left','700'); copyChart('yoyBarChart',PAD+8,curY+32,W-PAD*2-16,CHART_H-42);
    curY += CHART_H + GAP;

  } else { // page-snapshot
    const tw=Math.floor((W-PAD*2-GAP*(MARKET_SNAPSHOT.length-1))/MARKET_SNAPSHOT.length);
    MARKET_SNAPSHOT.forEach((tk,i)=>{const x=PAD+i*(tw+GAP);card(x,curY,tw,TICKER_H);t(tk.label,x+12,curY+20,9,MUT,'left','600');t(tk.value,x+12,curY+48,18,T1,'left','800');ctx.fillStyle=tk.up?'#19D3A2':'#FF5C7A';ctx.font='600 11px Segoe UI,sans-serif';ctx.fillText((tk.up?'▲ ':'▼ ')+tk.change,x+12,curY+68);});
    curY += TICKER_H + GAP;
    card(PAD,curY,W-PAD*2,CHART_H); t('Vision IQ & SENSEX — 2025 Performance',PAD+14,curY+22,12,T1,'left','700'); copyChart('niftyLineChart',PAD+8,curY+32,W-PAD*2-16,CHART_H-42);
    curY += CHART_H + GAP;
    card(PAD,curY,W-PAD*2,TABLE_H); t('Sector Health Overview',PAD+14,curY+22,12,T1,'left','700'); drawSectorTbl(ctx,PAD+8,curY+34,W-PAD*2-16,TABLE_H-44,T1,T2,MUT);
    curY += TABLE_H + GAP;
  }

  // ── footer ──
  ctx.fillStyle='rgba(0,194,255,0.06)'; ctx.fillRect(0,totalH-36,W,36);
  t(`Vision IQ Executive Dashboard  ·  ${ds}  ·  Confidential`,W/2,totalH-14,10,MUT,'center','400');

  return canvas.toDataURL('image/png');
}

// ── Table/treemap canvas renderers ────────────────────────

function drawSectorTbl(ctx,x,y,w,h,T1,T2,MUT){
  const cols=['Sector','OPM %','D/E','ROE %','Health','Cos'];
  const cx=[0,.32,.46,.58,.70,.90].map(p=>x+p*w);
  const RH=Math.min(32,(h-28)/SECTOR_TABLE.length);
  ctx.fillStyle='rgba(0,194,255,0.07)'; ctx.fillRect(x,y,w,24);
  cols.forEach((c,i)=>{ctx.font='600 9px Segoe UI,sans-serif';ctx.fillStyle=MUT;ctx.textAlign='left';ctx.fillText(c.toUpperCase(),cx[i],y+16);});
  SECTOR_TABLE.forEach((row,ri)=>{
    const ry=y+28+ri*RH;
    if(ri%2===0){ctx.fillStyle='rgba(0,194,255,0.03)';ctx.fillRect(x,ry,w,RH);}
    const oC=row.opm>=20?'#19D3A2':row.opm>=12?'#FFD166':'#FF5C7A';
    const dC=row.de<=0.5?'#19D3A2':row.de<=1.5?'#FFD166':'#FF5C7A';
    const rC=row.roe>=20?'#19D3A2':row.roe>=12?'#FFD166':'#FF5C7A';
    const hC=row.health>=80?'#19D3A2':row.health>=65?'#FFD166':'#FF5C7A';
    const ty=ry+RH/2+4;
    ctx.font='500 10px Segoe UI,sans-serif';
    ctx.fillStyle='#00C2FF';ctx.textAlign='left';ctx.fillText(row.sector,cx[0],ty);
    ctx.fillStyle=oC;ctx.fillText(row.opm+'%',cx[1],ty);
    ctx.fillStyle=dC;ctx.fillText(String(row.de),cx[2],ty);
    ctx.fillStyle=rC;ctx.fillText(row.roe+'%',cx[3],ty);
    ctx.fillStyle=hC;ctx.fillText(String(row.health),cx[4],ty);
    ctx.fillStyle=T2;ctx.fillText(String(row.cos),cx[5],ty);
    ctx.strokeStyle='rgba(0,194,255,0.05)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x,ry+RH);ctx.lineTo(x+w,ry+RH);ctx.stroke();
  });
}

function drawTopTbl(ctx,x,y,w,h,T1,T2,MUT,NEON){
  const cols=['#','Sector','Company','Health','ROE','CAGR','OPM','D/E','Revenue'];
  const cx=[0,.04,.16,.42,.52,.61,.70,.79,.88].map(p=>x+p*w);
  const RH=Math.min(30,(h-28)/TOP_COMPANIES.length);
  ctx.fillStyle='rgba(0,194,255,0.07)'; ctx.fillRect(x,y,w,24);
  cols.forEach((c,i)=>{ctx.font='600 9px Segoe UI,sans-serif';ctx.fillStyle=MUT;ctx.textAlign='left';ctx.fillText(c.toUpperCase(),cx[i],y+16);});
  TOP_COMPANIES.forEach((row,ri)=>{
    const ry=y+28+ri*RH;
    if(ri%2===0){ctx.fillStyle='rgba(0,194,255,0.03)';ctx.fillRect(x,ry,w,RH);}
    const hC=row.health>=85?'#19D3A2':row.health>=70?'#FFD166':'#FF5C7A';
    const rC=row.roe>=30?'#19D3A2':row.roe>=15?'#FFD166':'#FF5C7A';
    const cC=row.cagr>=15?'#19D3A2':row.cagr>=10?'#FFD166':'#FF5C7A';
    const oC=row.opm>=20?'#19D3A2':row.opm>=12?'#FFD166':'#FF5C7A';
    const dC=row.de<=0.5?'#19D3A2':row.de<=1.5?'#FFD166':'#FF5C7A';
    const ty=ry+RH/2+4;
    ctx.font='700 10px monospace';ctx.fillStyle=NEON;ctx.textAlign='left';ctx.fillText(String(ri+1),cx[0],ty);
    ctx.font='500 9px Segoe UI,sans-serif';
    ctx.fillStyle='#00C2FF';ctx.fillText(row.sector.replace('Financial Services','Fin.Svcs').replace('Information Technology','IT').replace('Oil, Gas & Consumables','Oil&Gas'),cx[1],ty);
    ctx.fillStyle=T1;ctx.fillText(row.company.length>22?row.company.slice(0,22)+'…':row.company,cx[2],ty);
    ctx.fillStyle=hC;ctx.fillText(String(row.health),cx[3],ty);
    ctx.fillStyle=rC;ctx.fillText(row.roe+'%',cx[4],ty);
    ctx.fillStyle=cC;ctx.fillText(row.cagr+'%',cx[5],ty);
    ctx.fillStyle=oC;ctx.fillText(row.opm+'%',cx[6],ty);
    ctx.fillStyle=dC;ctx.fillText(String(row.de),cx[7],ty);
    ctx.fillStyle=T2;ctx.fillText(row.revenue,cx[8],ty);
    ctx.strokeStyle='rgba(0,194,255,0.05)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x,ry+RH);ctx.lineTo(x+w,ry+RH);ctx.stroke();
  });
}

function drawTreemapC(ctx,x,y,w,h){
  const cw=Math.floor((w-6*4)/7);
  TREEMAP_DATA.forEach((b,i)=>{
    const cx=x+i*(cw+4);
    const hC=b.health>=85?['#0a6b3a','#0d8a4e']:b.health>=70?['#0a4a8a','#0d62b5']:b.health>=60?['#5a4a00','#7a6400']:['#6b1a2a','#8a2236'];
    const g=ctx.createLinearGradient(cx,y,cx,y+h);g.addColorStop(0,hC[0]);g.addColorStop(1,hC[1]);
    ctx.beginPath();ctx.roundRect(cx,y,cw,h,6);ctx.fillStyle=g;ctx.fill();
    ctx.font='700 9px Segoe UI,sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';
    const lbl=b.sector.replace('Financial Services','Fin.Svcs').replace('Information Technology','IT').replace('Oil, Gas & Consumables','Oil&Gas');
    ctx.fillText(lbl,cx+cw/2,y+18);
    ctx.font='800 11px Segoe UI,sans-serif';ctx.fillText(b.revenue,cx+cw/2,y+h/2+4);
    ctx.font='600 9px Segoe UI,sans-serif';ctx.fillText('Score: '+b.health,cx+cw/2,y+h-10);
  });
}

// ── dummy placeholder so old code path is gone ──
const _oldSnap = null;
const _oldPDF  = null;

// ── KEEP: PER-CHART DOWNLOAD (unchanged, works fine) ──

// ============================================================
// PER-CHART DOWNLOAD — copies Chart.js canvas directly
// ============================================================
function downloadChart(canvasId, filename) {
  const src = document.getElementById(canvasId);
  if (!src) { showToast('Chart not found', 'error'); return; }
  const out = document.createElement('canvas');
  out.width = src.width; out.height = src.height;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#071428';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(src, 0, 0);
  const a = document.createElement('a');
  a.download = `${filename}-${new Date().toISOString().slice(0,10)}.png`;
  a.href = out.toDataURL('image/png');
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  showToast(`${filename}.png saved!`, 'success', 2000);
}

// ============================================================
// CSV EXPORT
// ============================================================
function exportCSV() {
  const rows = [['#','Sector','Company','Health Score','ROE 3Y Avg','3Y Sales CAGR','OPM %','D/E','Total Revenue']];
  TOP_COMPANIES.forEach((r, i) => rows.push([i+1, r.sector, r.company, r.health, r.roe+'%', r.cagr+'%', r.opm+'%', r.de, r.revenue]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `visioniq-data-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('CSV exported!', 'success');
}

// ============================================================
// SCREEN RECORDING
// ============================================================
function getSupportedMime() {
  const types = ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4',''];
  for (const t of types) if (!t || MediaRecorder.isTypeSupported(t)) return t;
  return '';
}

async function toggleRecording() {
  if (isRec) stopRec(); else await startRec();
}

async function startRec() {
  if (!navigator.mediaDevices?.getDisplayMedia) { showToast('Screen recording not supported', 'error'); return; }
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30 } }, audio: false });
    recChunks = [];
    const mime = getSupportedMime();
    try { mediaRec = new MediaRecorder(stream, mime ? { mimeType: mime } : {}); }
    catch { mediaRec = new MediaRecorder(stream); }
    mediaRec.ondataavailable = e => { if (e.data && e.data.size > 0) recChunks.push(e.data); };
    mediaRec.onstop = () => setTimeout(saveRec, 100);
    mediaRec.start(200);
    isRec = true;
    const btn = document.getElementById('recBtn');
    btn.classList.add('rec-active');
    btn.innerHTML = '<span class="rec-dot"></span> Stop';
    showToast('Recording started — click Stop to save', 'info', 3000);
    stream.getVideoTracks()[0].addEventListener('ended', () => { if (isRec) stopRec(); });
  } catch (e) {
    showToast(e.name === 'NotAllowedError' ? 'Permission denied' : 'Recording failed: ' + e.message, 'error');
  }
}

function stopRec() {
  if (!mediaRec || !isRec) return;
  isRec = false;
  const btn = document.getElementById('recBtn');
  btn.classList.remove('rec-active');
  btn.innerHTML = '<i class="fa-solid fa-circle-dot"></i> Record';
  if (mediaRec.stream) mediaRec.stream.getTracks().forEach(t => t.stop());
  if (mediaRec.state !== 'inactive') mediaRec.stop();
}

function saveRec() {
  if (!recChunks.length) { showToast('No recording data', 'error'); return; }
  const mime = mediaRec?.mimeType || 'video/webm';
  const ext = mime.includes('mp4') ? 'mp4' : 'webm';
  const blob = new Blob(recChunks, { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `visioniq-recording-${new Date().toISOString().slice(0, 10)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  showToast(`Recording saved (${(blob.size/1024/1024).toFixed(1)} MB)`, 'success');
  recChunks = [];
}

// ============================================================
// THEME TOGGLE
// ============================================================
function toggleTheme() {
  lightMode = !lightMode;
  const r = document.documentElement.style;
  r.setProperty('--navy-900', lightMode ? '#f0f4ff' : '#050d1f');
  r.setProperty('--navy-800', lightMode ? '#e8edf8' : '#071428');
  r.setProperty('--card-bg',  lightMode ? 'rgba(255,255,255,0.88)' : 'rgba(7,20,40,0.88)');
  r.setProperty('--text-primary',   lightMode ? '#0f172a' : '#e8f4ff');
  r.setProperty('--text-secondary', lightMode ? '#475569' : '#7ba7cc');
  r.setProperty('--text-muted',     lightMode ? '#94a3b8' : '#3d6080');
  document.body.style.background = lightMode ? '#f0f4ff' : '#050d1f';
  showToast(`Switched to ${lightMode ? 'light' : 'dark'} theme`, 'info', 1500);
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'info', dur = 3000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast-item ${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 300);
  }, dur);
}
