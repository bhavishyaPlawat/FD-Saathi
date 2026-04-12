const mongoose = require("mongoose");

const fdRateSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true, trim: true },
    bankType: {
      type: String,
      enum: ["govt", "private", "small_finance"],
      required: true,
    },
    logoUrl: { type: String },
    tenorMonths: { type: Number, required: true },
    rateGeneral: { type: Number, required: true }, // % p.a.
    rateSenior: { type: Number, required: true },
    minAmount: { type: Number, default: 1000 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

fdRateSchema.index({ bankType: 1, tenorMonths: 1, rateGeneral: -1 });

const FDRate = mongoose.model("FDRate", fdRateSchema);
module.exports = { FDRate };
