# NIFTY 100 Executive Dashboard

Premium Bloomberg/Power BI style financial dashboard with full functionality.

## 🚀 Quick Start

```bash
# Open with Live Server (VS Code extension)
# Or use Python
python -m http.server 8080

# Or Node.js
npx serve .
```

Then open `http://localhost:8080`

## 📁 File Structure

```
nifty-dashboard/
├── index.html          # Main HTML (links to separate CSS/JS)
├── style.css           # All styles
├── app.js              # Main application logic
├── data.js             # Financial data
└── README.md           # This file
```

## ✅ Fixed Issues

### 1. **Navigation Working**
- Sidebar links now properly switch between pages (1.1, 1.2, 1.3)
- Active state updates correctly
- Page content shows/hides based on selection

### 2. **Snapshot Working**
- Flattens `backdrop-filter` before capture
- Uses correct background color
- Downloads as PNG successfully

### 3. **PDF Export Working**
- Same flattening approach as snapshot
- Generates proper PDF with jsPDF
- Downloads automatically

### 4. **Per-Chart Downloads Working**
- Each chart card has download button
- Copies canvas to new canvas with solid background
- Downloads individual chart as PNG

### 5. **Screen Recording Working**
- Detects supported codec (vp9/vp8/webm/mp4)
- Proper start/stop flow
- Downloads recording as .webm or .mp4

## 🎯 Features

- ✅ 3 navigable pages (Market Snapshot, Sector Performance, YoY Growth)
- ✅ Animated KPI counters
- ✅ Floating particles background
- ✅ Search/filter functionality
- ✅ Year filter for charts
- ✅ PNG snapshot download
- ✅ PDF report export
- ✅ CSV data export
- ✅ Screen recording
- ✅ Per-chart PNG downloads
- ✅ Theme toggle (dark/light)
- ✅ Toast notifications
- ✅ Responsive mobile layout
- ✅ Loading skeleton

## 🔧 Technologies

- HTML5
- CSS3 (Glassmorphism, animations)
- Vanilla JavaScript (ES6+)
- Chart.js 4.4.0
- html2canvas 1.4.1
- jsPDF 2.5.1
- Bootstrap 5.3.2 (grid only)
- Font Awesome 6.5.0

## 📊 Data Structure

All financial data is in `data.js`:
- `SECTORS` - 7 sector names
- `BAR_DATA` - 5 years of sales data
- `BUBBLE_DATA` - Profitability metrics
- `SECTOR_TABLE` - Comparison metrics
- `TREEMAP_DATA` - Revenue by sector
- `TOP_COMPANIES` - Top 7 companies
- `YOY_DATA` - Year-over-year growth
- `MARKET_SNAPSHOT` - Live market KPIs

## 🎨 Color Palette

- Primary: `#00C2FF` (Neon Blue)
- Secondary: `#19D3A2` (Cyan)
- Accent: `#FFD166` (Yellow)
- Danger: `#FF5C7A` (Red)
- Background: `#050d1f` → `#071428` (Navy gradient)

## 🌐 GitHub Pages Deployment

1. Push to GitHub repository
2. Go to Settings → Pages
3. Set source to `main` branch `/nifty-dashboard` folder
4. Access at `https://username.github.io/repo/nifty-dashboard/`

## 📝 Notes

- All charts are Chart.js instances stored in global `charts` object
- Navigation uses `.page` class with `.active` toggle
- Snapshot/PDF temporarily flatten glassmorphism for html2canvas
- Recording uses MediaRecorder API with codec detection
- Mobile: sidebar slides in/out with hamburger menu

## 🐛 Troubleshooting

**Snapshot blank?**
- Check browser console for CORS errors
- Ensure all CDN resources loaded
- Try disabling browser extensions

**Recording not working?**
- Grant screen share permission
- Check browser supports MediaRecorder
- Try Chrome/Edge (best support)

**Charts not showing?**
- Verify Chart.js CDN loaded
- Check browser console for errors
- Ensure data.js loaded before app.js

## 📄 License

MIT License - Free to use for personal/commercial projects
