const { FDRate } = require("../../models/FDRate.model");

class FDService {
  async getRates(filters = {}) {
    const query = { isActive: true };

    if (filters.bankType) query.bankType = filters.bankType;
    if (filters.tenorMonths) query.tenorMonths = Number(filters.tenorMonths);
    if (filters.isFeatured) query.isFeatured = true;

    return FDRate.find(query)
      .sort({ rateGeneral: -1 }) // highest rate first
      .lean();
  }

  async compareRates(tenorMonths, amount, isSenior = false) {
    const rates = await FDRate.find({
      isActive: true,
      tenorMonths: Number(tenorMonths),
    })
      .sort({ rateGeneral: -1 })
      .lean();

    return rates.map((bank) => {
      const rate = isSenior ? bank.rateSenior : bank.rateGeneral;
      // Compound Interest (Quarterly)
      const tYears = tenorMonths / 12;
      const rDecimal = rate / 100;
      const n = 4; // Quarterly
      const maturity = amount * Math.pow(1 + rDecimal / n, n * tYears);
      const interest = maturity - amount;

      return {
        bankName: bank.bankName,
        bankType: bank.bankType,
        logoUrl: bank.logoUrl,
        rate,
        minAmount: bank.minAmount,
        interestEarned: Math.round(interest),
        maturityAmount: Math.round(maturity),
        tenorMonths: bank.tenorMonths,
      };
    });
  }

  async getFeatured() {
    return FDRate.find({ isActive: true, isFeatured: true })
      .sort({ rateGeneral: -1 })
      .limit(6)
      .lean();
  }

  async seedRates() {
    const existing = await FDRate.countDocuments();
    if (existing > 0)
      return { message: "Rates already seeded", count: existing };

    const sampleRates = [
      // Government Banks
      {
        bankName: "State Bank of India",
        bankType: "govt",
        tenorMonths: 12,
        rateGeneral: 7.1,
        rateSenior: 7.6,
        minAmount: 1000,
        isFeatured: true,
      },
      {
        bankName: "State Bank of India",
        bankType: "govt",
        tenorMonths: 24,
        rateGeneral: 7.0,
        rateSenior: 7.5,
        minAmount: 1000,
        isFeatured: false,
      },
      {
        bankName: "Punjab National Bank",
        bankType: "govt",
        tenorMonths: 12,
        rateGeneral: 7.25,
        rateSenior: 7.75,
        minAmount: 1000,
        isFeatured: true,
      },
      {
        bankName: "Bank of Baroda",
        bankType: "govt",
        tenorMonths: 12,
        rateGeneral: 7.15,
        rateSenior: 7.65,
        minAmount: 1000,
        isFeatured: false,
      },

      // Private Banks
      {
        bankName: "HDFC Bank",
        bankType: "private",
        tenorMonths: 12,
        rateGeneral: 7.25,
        rateSenior: 7.75,
        minAmount: 5000,
        isFeatured: true,
      },
      {
        bankName: "HDFC Bank",
        bankType: "private",
        tenorMonths: 18,
        rateGeneral: 7.4,
        rateSenior: 7.9,
        minAmount: 5000,
        isFeatured: false,
      },
      {
        bankName: "ICICI Bank",
        bankType: "private",
        tenorMonths: 12,
        rateGeneral: 7.2,
        rateSenior: 7.7,
        minAmount: 10000,
        isFeatured: true,
      },
      {
        bankName: "Axis Bank",
        bankType: "private",
        tenorMonths: 12,
        rateGeneral: 7.1,
        rateSenior: 7.85,
        minAmount: 5000,
        isFeatured: false,
      },

      // Small Finance Banks
      {
        bankName: "Suryoday Small Finance Bank",
        bankType: "small_finance",
        tenorMonths: 12,
        rateGeneral: 9.1,
        rateSenior: 9.6,
        minAmount: 1000,
        isFeatured: true,
      },
      {
        bankName: "Unity Small Finance Bank",
        bankType: "small_finance",
        tenorMonths: 12,
        rateGeneral: 9.0,
        rateSenior: 9.5,
        minAmount: 1000,
        isFeatured: true,
      },
      {
        bankName: "Jana Small Finance Bank",
        bankType: "small_finance",
        tenorMonths: 12,
        rateGeneral: 8.75,
        rateSenior: 9.25,
        minAmount: 1000,
        isFeatured: false,
      },
    ];

    await FDRate.insertMany(sampleRates);
    return { message: "Rates seeded successfully", count: sampleRates.length };
  }
}

const fdService = new FDService();
module.exports = { fdService };
