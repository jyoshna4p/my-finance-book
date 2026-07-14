// Deterministic seeded market data (hookable to Alpha Vantage later)

const seedRand = (seed) => {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xfffffff) / 0xfffffff;
  };
};

export const priceFor = (symbol, base) => {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 6)); // updates each 6h
  const rand = seedRand(symbol + ":" + day);
  const drift = (rand() - 0.5) * 0.06; // +/- 6%
  return +(base * (1 + drift)).toFixed(2);
};

export const seriesFor = (symbol, base, days = 30) => {
  const rand = seedRand(symbol);
  const arr = [];
  let p = base * 0.92;
  for (let i = 0; i < days; i++) {
    p = p * (1 + (rand() - 0.48) * 0.04);
    arr.push({ day: i + 1, price: +p.toFixed(2) });
  }
  return arr;
};

export const STOCKS = [
  { s: "RELIANCE", n: "Reliance Industries", market: "NSE", base: 2950, sector: "Energy", currency: "INR" },
  { s: "TCS", n: "Tata Consultancy Services", market: "NSE", base: 3980, sector: "IT", currency: "INR" },
  { s: "HDFCBANK", n: "HDFC Bank", market: "NSE", base: 1690, sector: "Banking", currency: "INR" },
  { s: "INFY", n: "Infosys", market: "NSE", base: 1820, sector: "IT", currency: "INR" },
  { s: "ICICIBANK", n: "ICICI Bank", market: "NSE", base: 1240, sector: "Banking", currency: "INR" },
  { s: "SBIN", n: "State Bank of India", market: "NSE", base: 815, sector: "Banking", currency: "INR" },
  { s: "ITC", n: "ITC Limited", market: "NSE", base: 465, sector: "FMCG", currency: "INR" },
  { s: "LT", n: "Larsen & Toubro", market: "NSE", base: 3650, sector: "Infra", currency: "INR" },
  { s: "HINDUNILVR", n: "Hindustan Unilever", market: "NSE", base: 2560, sector: "FMCG", currency: "INR" },
  { s: "BAJFINANCE", n: "Bajaj Finance", market: "NSE", base: 7280, sector: "NBFC", currency: "INR" },
  { s: "MARUTI", n: "Maruti Suzuki", market: "NSE", base: 12450, sector: "Auto", currency: "INR" },
  { s: "AXISBANK", n: "Axis Bank", market: "NSE", base: 1130, sector: "Banking", currency: "INR" },
  { s: "KOTAKBANK", n: "Kotak Mahindra Bank", market: "NSE", base: 1780, sector: "Banking", currency: "INR" },
  { s: "ASIANPAINT", n: "Asian Paints", market: "NSE", base: 2340, sector: "Consumer", currency: "INR" },
  { s: "TITAN", n: "Titan Company", market: "NSE", base: 3450, sector: "Consumer", currency: "INR" },
  { s: "SUNPHARMA", n: "Sun Pharma", market: "NSE", base: 1720, sector: "Pharma", currency: "INR" },
  { s: "WIPRO", n: "Wipro", market: "NSE", base: 545, sector: "IT", currency: "INR" },
  { s: "ADANIENT", n: "Adani Enterprises", market: "NSE", base: 3120, sector: "Conglomerate", currency: "INR" },
  { s: "ONGC", n: "ONGC", market: "NSE", base: 275, sector: "Energy", currency: "INR" },
  { s: "NTPC", n: "NTPC", market: "NSE", base: 385, sector: "Power", currency: "INR" },
  { s: "AAPL", n: "Apple Inc.", market: "NASDAQ", base: 232.5, sector: "Tech", currency: "USD" },
  { s: "MSFT", n: "Microsoft", market: "NASDAQ", base: 428.3, sector: "Tech", currency: "USD" },
  { s: "GOOGL", n: "Alphabet", market: "NASDAQ", base: 195.4, sector: "Tech", currency: "USD" },
  { s: "AMZN", n: "Amazon", market: "NASDAQ", base: 218.6, sector: "Retail", currency: "USD" },
  { s: "META", n: "Meta Platforms", market: "NASDAQ", base: 612.7, sector: "Tech", currency: "USD" },
  { s: "TSLA", n: "Tesla", market: "NASDAQ", base: 356.1, sector: "Auto", currency: "USD" },
  { s: "NVDA", n: "NVIDIA", market: "NASDAQ", base: 148.2, sector: "Semi", currency: "USD" },
  { s: "NFLX", n: "Netflix", market: "NASDAQ", base: 892.5, sector: "Media", currency: "USD" },
  { s: "JPM", n: "JPMorgan Chase", market: "NYSE", base: 245.8, sector: "Banking", currency: "USD" },
  { s: "V", n: "Visa", market: "NYSE", base: 314.6, sector: "Payments", currency: "USD" },
  { s: "MA", n: "Mastercard", market: "NYSE", base: 528.9, sector: "Payments", currency: "USD" },
  { s: "BRK.B", n: "Berkshire Hathaway", market: "NYSE", base: 462.3, sector: "Diversified", currency: "USD" },
  { s: "WMT", n: "Walmart", market: "NYSE", base: 92.5, sector: "Retail", currency: "USD" },
  { s: "PG", n: "Procter & Gamble", market: "NYSE", base: 172.4, sector: "Consumer", currency: "USD" },
  { s: "JNJ", n: "Johnson & Johnson", market: "NYSE", base: 156.9, sector: "Healthcare", currency: "USD" },
  { s: "XOM", n: "ExxonMobil", market: "NYSE", base: 112.7, sector: "Energy", currency: "USD" },
  { s: "KO", n: "Coca-Cola", market: "NYSE", base: 68.3, sector: "FMCG", currency: "USD" },
  { s: "PEP", n: "PepsiCo", market: "NYSE", base: 158.6, sector: "FMCG", currency: "USD" },
  { s: "DIS", n: "Walt Disney", market: "NYSE", base: 108.9, sector: "Media", currency: "USD" },
  { s: "BA", n: "Boeing", market: "NYSE", base: 178.2, sector: "Aerospace", currency: "USD" },
];

export const INDICES = [
  { s: "NIFTY 50", base: 24850 },
  { s: "SENSEX", base: 81420 },
  { s: "BANK NIFTY", base: 52310 },
  { s: "NIFTY IT", base: 42150 },
  { s: "S&P 500", base: 5880 },
  { s: "NASDAQ", base: 19240 },
  { s: "DOW JONES", base: 43120 },
  { s: "FTSE 100", base: 8210 },
];

export const FNO = Array.from({ length: 14 }, (_, i) => {
  const base = STOCKS[i];
  const strike = Math.round(base.base * (0.95 + i * 0.01));
  return {
    id: `${base.s}-${strike}`,
    underlying: base.s,
    type: i % 2 === 0 ? "CE" : "PE",
    strike,
    iv: +(18 + (i % 7) * 1.6).toFixed(2),
    ltp: +(base.base * 0.03 + (i % 5) * 4).toFixed(2),
    oi: 12000 + i * 4500,
  };
});

export const MUTUAL_FUNDS = [
  { s: "AXIS-BLUECHIP", n: "Axis Bluechip Fund", cat: "Large Cap", nav: 62.4, r3y: 15.2, r5y: 14.1 },
  { s: "MIRAE-LARGECAP", n: "Mirae Asset Large Cap", cat: "Large Cap", nav: 108.6, r3y: 14.8, r5y: 13.9 },
  { s: "ICICI-BLUECHIP", n: "ICICI Prudential Bluechip", cat: "Large Cap", nav: 96.7, r3y: 15.8, r5y: 14.6 },
  { s: "KOTAK-EMERGING", n: "Kotak Emerging Equity", cat: "Mid Cap", nav: 128.9, r3y: 22.4, r5y: 19.8 },
  { s: "HDFC-MIDCAP", n: "HDFC Mid-Cap Opportunities", cat: "Mid Cap", nav: 168.3, r3y: 24.1, r5y: 20.9 },
  { s: "NIPPON-SMALL", n: "Nippon India Small Cap", cat: "Small Cap", nav: 176.2, r3y: 28.6, r5y: 25.3 },
  { s: "SBI-SMALLCAP", n: "SBI Small Cap Fund", cat: "Small Cap", nav: 156.9, r3y: 26.1, r5y: 23.8 },
  { s: "PARAG-FLEXI", n: "Parag Parikh Flexi Cap", cat: "Flexi Cap", nav: 82.1, r3y: 20.4, r5y: 22.1 },
  { s: "UTI-NIFTY50", n: "UTI Nifty 50 Index Fund", cat: "Index", nav: 148.6, r3y: 14.2, r5y: 13.5 },
  { s: "HDFC-INDEX-500", n: "HDFC Index Fund Nifty 500", cat: "Index", nav: 62.9, r3y: 15.6, r5y: 14.2 },
  { s: "ICICI-DEBT", n: "ICICI Prudential Corporate Bond", cat: "Debt", nav: 28.4, r3y: 7.2, r5y: 7.4 },
  { s: "HDFC-CORP-BOND", n: "HDFC Corporate Bond Fund", cat: "Debt", nav: 30.6, r3y: 7.6, r5y: 7.8 },
  { s: "SBI-BALANCED", n: "SBI Balanced Advantage", cat: "Hybrid", nav: 15.2, r3y: 12.8, r5y: 11.9 },
  { s: "ICICI-BALANCED", n: "ICICI Prudential Balanced", cat: "Hybrid", nav: 68.4, r3y: 13.9, r5y: 12.4 },
  { s: "TATA-DIGITAL", n: "Tata Digital India", cat: "Sectoral", nav: 46.2, r3y: 18.6, r5y: 21.8 },
  { s: "ICICI-INFRA", n: "ICICI Infra Fund", cat: "Sectoral", nav: 158.9, r3y: 32.4, r5y: 24.6 },
  { s: "AXIS-ELSS", n: "Axis Long Term Equity (ELSS)", cat: "ELSS", nav: 92.4, r3y: 12.1, r5y: 13.6 },
  { s: "MIRAE-ELSS", n: "Mirae Asset Tax Saver", cat: "ELSS", nav: 46.8, r3y: 17.6, r5y: 18.2 },
];

export const ALTERNATIVES = [
  { s: "PPF", n: "Public Provident Fund", cat: "Small Savings", rate: "7.10%", tax: "EEE", lock: "15 yrs" },
  { s: "NPS-T1", n: "National Pension System Tier 1", cat: "Retirement", rate: "9-12% (mkt)", tax: "80CCD(1B)", lock: "Till 60" },
  { s: "SGB-2026", n: "Sovereign Gold Bond 2026-27", cat: "Gold", rate: "2.5% + gold", tax: "No LTCG on maturity", lock: "8 yrs" },
  { s: "SSY", n: "Sukanya Samriddhi Yojana", cat: "Girl Child", rate: "8.20%", tax: "EEE", lock: "21 yrs" },
  { s: "SCSS", n: "Senior Citizens Savings Scheme", cat: "Senior", rate: "8.20%", tax: "80C", lock: "5 yrs" },
  { s: "KVP", n: "Kisan Vikas Patra", cat: "Small Savings", rate: "7.50%", tax: "Taxable", lock: "115 mo" },
  { s: "NSC", n: "National Savings Certificate", cat: "Small Savings", rate: "7.70%", tax: "80C", lock: "5 yrs" },
  { s: "POMIS", n: "Post Office Monthly Income", cat: "Fixed Income", rate: "7.40%", tax: "Taxable", lock: "5 yrs" },
  { s: "RBI-BOND", n: "RBI Floating Rate Savings Bonds", cat: "Fixed Income", rate: "8.05%", tax: "Taxable", lock: "7 yrs" },
  { s: "EPF", n: "Employees Provident Fund", cat: "Retirement", rate: "8.25%", tax: "EEE", lock: "Retirement" },
  { s: "VPF", n: "Voluntary Provident Fund", cat: "Retirement", rate: "8.25%", tax: "EEE", lock: "Retirement" },
  { s: "BANK-FD", n: "Bank Fixed Deposit (5Y)", cat: "Fixed Income", rate: "7.25%", tax: "Taxable", lock: "5 yrs" },
  { s: "TAX-FD", n: "Tax-Saver FD", cat: "Fixed Income", rate: "7.00%", tax: "80C", lock: "5 yrs" },
  { s: "REIT", n: "Embassy REIT (BSE listed)", cat: "REIT", rate: "6.5% yield", tax: "Mixed", lock: "None" },
  { s: "INVIT", n: "Powergrid InvIT", cat: "InvIT", rate: "8% yield", tax: "Mixed", lock: "None" },
  { s: "GOLDBEES", n: "GoldBeES ETF", cat: "Gold", rate: "Gold price", tax: "20% LTCG", lock: "None" },
  { s: "USTBILL", n: "US Treasury Bill 3M", cat: "US Fixed", rate: "5.10%", tax: "US 30% W/H", lock: "3 mo" },
  { s: "USTBOND", n: "US Treasury Bond 10Y", cat: "US Fixed", rate: "4.60%", tax: "US 30% W/H", lock: "10 yrs" },
  { s: "HYSA-US", n: "US High-Yield Savings", cat: "US Fixed", rate: "4.30%", tax: "Taxable", lock: "None" },
  { s: "CORP-BOND", n: "AAA Corporate Bond", cat: "Fixed Income", rate: "8.10%", tax: "Taxable", lock: "3-5 yrs" },
  { s: "TAX-FREE-BOND", n: "PFC Tax-Free Bond", cat: "Fixed Income", rate: "6.30%", tax: "Tax-free", lock: "10 yrs" },
  { s: "PMS", n: "Portfolio Mgmt Service (min 50L)", cat: "PMS", rate: "12-18%", tax: "Taxable", lock: "None" },
  { s: "AIF-3", n: "Alternative Investment Fund CAT-III", cat: "AIF", rate: "15-22%", tax: "Complex", lock: "3-5 yrs" },
  { s: "CRYPTO-BTC", n: "Bitcoin (VDA)", cat: "Crypto", rate: "Volatile", tax: "30% flat + 1% TDS", lock: "None" },
];

export const NEWS = [
  { s: "RELIANCE", t: "Reliance Retail expands Q-commerce; new dark stores across Tier-2 cities.", sentiment: "positive", age: "12m" },
  { s: "TCS", t: "TCS wins multi-year deal from BFSI major; margin outlook stable.", sentiment: "positive", age: "38m" },
  { s: "NIFTY", t: "Nifty ends flat as IT stocks weigh; FIIs turn net buyers.", sentiment: "neutral", age: "1h" },
  { s: "HDFCBANK", t: "HDFC Bank NIM compression concerns after Q3 update.", sentiment: "negative", age: "2h" },
  { s: "AAPL", t: "Apple Vision Pro 2 rumored for Q4; supply chain ramp begins.", sentiment: "positive", age: "3h" },
  { s: "NVDA", t: "NVIDIA earnings crush expectations; data center revenue up 62% YoY.", sentiment: "positive", age: "5h" },
  { s: "SBIN", t: "SBI board approves ₹25,000 Cr QIP; dilution concerns emerge.", sentiment: "negative", age: "6h" },
  { s: "ADANIENT", t: "Adani group announces new port acquisition in Vizhinjam.", sentiment: "positive", age: "8h" },
];
