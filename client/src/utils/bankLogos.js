export const getBankLogoUrl = (bankName) => {
  const normalized = bankName.toLowerCase();
  
  const domainMap = {
    sbi: "sbi.co.in",
    hdfc: "hdfcbank.com",
    icici: "icicibank.com",
    axis: "axisbank.com",
    pnb: "pnbindia.in",
    kotak: "kotak.com",
    "bank of baroda": "bankofbaroda.in",
    canara: "canarabank.com",
    "unity sf": "theunitybank.com",
    "au small finance": "aubank.in",
    "equitas": "equitasbank.com"
  };

  const matchedKey = Object.keys(domainMap).find((key) => normalized.includes(key));
  const domain = matchedKey ? domainMap[matchedKey] : null;

  return domain 
    ? `https://logo.clearbit.com/${domain}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(bankName)}&background=1D9E75&color=fff`; // Fallback placeholder
};