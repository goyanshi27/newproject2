// ============================================================
// data.js — All financial data for Vision IQ Dashboard
// ============================================================

const SECTORS = [
  'Financial Services',
  'Information Technology',
  'Oil, Gas & Consumables',
  'Automobile',
  'FMCG',
  'Healthcare',
  'Others'
];

const BAR_DATA = {
  2021: [312400, 185600, 428700, 142300, 98400,  76200,  64800],
  2022: [348200, 214800, 512300, 168700, 108900, 89400,  74200],
  2023: [389600, 248300, 574800, 196400, 121300, 104700, 86500],
  2024: [432100, 287600, 618200, 224800, 134700, 122300, 98700],
  2025: [478900, 324700, 642600, 251300, 148200, 138600, 112400]
};

const YEAR_COLORS = {
  2021: { bg: 'rgba(0,194,255,0.55)',   border: '#00C2FF' },
  2022: { bg: 'rgba(25,211,162,0.55)',  border: '#19D3A2' },
  2023: { bg: 'rgba(255,209,102,0.55)', border: '#FFD166' },
  2024: { bg: 'rgba(255,92,122,0.55)',  border: '#FF5C7A' },
  2025: { bg: 'rgba(180,100,255,0.55)', border: '#b464ff' }
};

const BUBBLE_DATA = [
  { sector: 'Financial Services',       cagr: 11.2, roe: 14.8, revenue: 478900, color: '#00C2FF' },
  { sector: 'Information Technology',   cagr: 15.4, roe: 28.6, revenue: 324700, color: '#19D3A2' },
  { sector: 'Oil, Gas & Consumables',   cagr:  8.6, roe: 12.1, revenue: 642600, color: '#FFD166' },
  { sector: 'Automobile',               cagr: 14.1, roe: 16.4, revenue: 251300, color: '#FF5C7A' },
  { sector: 'FMCG',                     cagr:  9.8, roe: 32.7, revenue: 148200, color: '#b464ff' },
  { sector: 'Healthcare',               cagr: 16.2, roe: 18.9, revenue: 138600, color: '#ff9f43' },
  { sector: 'Others',                   cagr:  7.4, roe: 10.2, revenue: 112400, color: '#54a0ff' }
];

const SECTOR_TABLE = [
  { sector: 'Financial Services',     opm: 28.4, de: 6.80, roe: 14.8, health: 72, cos: 18 },
  { sector: 'Information Technology', opm: 24.6, de: 0.10, roe: 28.6, health: 88, cos: 12 },
  { sector: 'Oil, Gas & Consumables', opm: 12.1, de: 0.80, roe: 12.1, health: 61, cos:  9 },
  { sector: 'Automobile',             opm: 10.8, de: 0.40, roe: 16.4, health: 74, cos: 14 },
  { sector: 'FMCG',                   opm: 18.3, de: 0.05, roe: 32.7, health: 91, cos: 11 },
  { sector: 'Healthcare',             opm: 20.7, de: 0.30, roe: 18.9, health: 83, cos:  8 },
  { sector: 'Others',                 opm:  9.4, de: 1.20, roe: 10.2, health: 55, cos: 28 }
];

const TREEMAP_DATA = [
  { sector: 'Financial Services',     revenue: '₹4.79L Cr', health: 72 },
  { sector: 'Information Technology', revenue: '₹3.25L Cr', health: 88 },
  { sector: 'Oil, Gas & Consumables', revenue: '₹6.43L Cr', health: 61 },
  { sector: 'Automobile',             revenue: '₹2.51L Cr', health: 74 },
  { sector: 'FMCG',                   revenue: '₹1.48L Cr', health: 91 },
  { sector: 'Healthcare',             revenue: '₹1.39L Cr', health: 83 },
  { sector: 'Others',                 revenue: '₹1.12L Cr', health: 55 }
];

const TOP_COMPANIES = [
  { sector: 'Financial Services',     company: 'HDFC Bank Ltd.',               health: 78, roe: 16.2, cagr: 12.4, opm: 30.1, de: 7.20, revenue: '₹2.14L Cr' },
  { sector: 'Information Technology', company: 'Tata Consultancy Services Ltd.',health: 92, roe: 42.8, cagr: 14.8, opm: 26.4, de: 0.00, revenue: '₹2.41L Cr' },
  { sector: 'Oil, Gas & Consumables', company: 'Reliance Industries Ltd.',      health: 68, roe: 10.6, cagr:  9.2, opm: 14.8, de: 0.40, revenue: '₹9.74L Cr' },
  { sector: 'Automobile',             company: 'Maruti Suzuki India Ltd.',      health: 81, roe: 18.4, cagr: 16.2, opm: 12.1, de: 0.01, revenue: '₹1.42L Cr' },
  { sector: 'FMCG',                   company: 'Hindustan Unilever Ltd.',       health: 94, roe: 48.6, cagr:  8.4, opm: 24.2, de: 0.00, revenue: '₹0.62L Cr' },
  { sector: 'Healthcare',             company: 'Sun Pharmaceutical Ind. Ltd.', health: 86, roe: 14.8, cagr: 18.6, opm: 22.4, de: 0.10, revenue: '₹0.48L Cr' },
  { sector: 'Others',                 company: 'Adani Enterprises Ltd.',        health: 62, roe:  8.4, cagr: 22.1, opm:  6.8, de: 2.40, revenue: '₹0.88L Cr' }
];

// YoY Growth data for page 1.3
const YOY_DATA = {
  labels: ['2021', '2022', '2023', '2024', '2025'],
  datasets: [
    { label: 'Financial Services', data: [8.2, 11.4, 11.9, 10.9, 10.8], color: '#00C2FF' },
    { label: 'Information Technology', data: [12.1, 15.8, 15.6, 16.0, 13.0], color: '#19D3A2' },
    { label: 'Oil, Gas & Consumables', data: [5.4,  19.5, 12.1,  7.5,  3.9], color: '#FFD166' },
    { label: 'Automobile',             data: [6.8,  18.5, 16.3, 14.5, 11.8], color: '#FF5C7A' },
    { label: 'FMCG',                   data: [7.2,  10.6, 11.4,  11.0, 10.0], color: '#b464ff' },
    { label: 'Healthcare',             data: [14.2, 17.4, 16.8, 16.8, 13.4], color: '#ff9f43' },
    { label: 'Others',                 data: [5.1,  14.5, 16.6, 14.1, 13.9], color: '#54a0ff' }
  ]
};

// Market Snapshot KPIs for page 1.1
const MARKET_SNAPSHOT = [
  { label: 'Vision IQ',     value: '23,847',  change: '+1.24%', up: true  },
  { label: 'SENSEX',         value: '78,553',  change: '+1.18%', up: true  },
  { label: 'NIFTY Bank',     value: '51,204',  change: '+0.87%', up: true  },
  { label: 'India VIX',      value: '13.42',   change: '-4.21%', up: false },
  { label: 'USD/INR',        value: '83.62',   change: '+0.12%', up: false },
  { label: 'Crude Oil (WTI)','value': '$78.4', change: '-0.64%', up: false }
];
