import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowRight, ShieldCheck, Info } from "lucide-react";
import toast from "react-hot-toast";

function formatINR(n) {
  return new Intl.NumberFormat("hi-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function EmergencyPage() {
  const { t } = useTranslation();
  const [fdAmount, setFdAmount] = useState("500000");
  const [fdRate, setFdRate] = useState("7.0");
  const [daysElapsed, setDaysElapsed] = useState("180");
  const [daysRemaining, setDaysRemaining] = useState("185");
  const [needAmount, setNeedAmount] = useState("100000");

  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const P = Number(fdAmount);
    const R = Number(fdRate);
    const D_elapsed = Number(daysElapsed);
    const D_remain = Number(daysRemaining);
    const N = Number(needAmount);

    if (!P || !R || !D_elapsed || !D_remain || !N) {
      toast.error(t("errors.generic", "Enter all fields correctly"));
      return;
    }

    if (N > P * 0.9) {
      toast.error(t("emergency.odLimit", "OD usually up to 90% of FD amount. Break FD instead."));
      return;
    }

    // Cost of Breaking FD: 1% penalty on interest earned so far
    const breakPenalty = P * 0.01 * (D_elapsed / 365);
    // You also lose FD interest for the remaining days on the WHOLE amount because you broke it.
    // Wait, if you break it, you only needed N. You could put (P - N) in savings at say 3%.
    // But let's keep it simple: Just look at the direct penalty vs OD interest.
    const breakCost = breakPenalty + (P * (R / 100) * (D_remain / 365)) - ((P - N) * 0.03 * (D_remain / 365));

    // Cost of OD: Pay R+2% interest on N for remaining days. BUT you keep earning R% on P.
    const odInterestToPay = N * ((R + 2) / 100) * (D_remain / 365);
    const fdInterestEarned = P * (R / 100) * (D_remain / 365);
    const odNetCost = odInterestToPay - fdInterestEarned;

    // To make it easy to understand for the user:
    // Loss due to breaking = Penalty (approx) + Difference in future earnings
    // Actually, simple Cost comparison:
    // Real OD cost: You pay (R+2)% on N.
    // So Cost = N * (R+2)% * D_remain/365.
    // Real Break cost: You lose 1% on P for D_elapsed. Plus you lose (R-3)% on P-N for D_remain (assuming 3% savings rate). Plus you lose R% on N for D_remain.
    const simpleBreakCost = (P * 0.01 * (D_elapsed / 365)) + (N * (R / 100) * (D_remain / 365));
    const simpleOdCost = N * ((R + 2) / 100) * (D_remain / 365);

    setResult({
      breakCost: simpleBreakCost,
      odCost: simpleOdCost,
      recommendOD: simpleOdCost < simpleBreakCost,
      odLimit: P * 0.9
    });
  };

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3 text-red-500">
        <AlertCircle size={28} />
        <div>
          <h2 className="font-headline text-xl font-bold text-gray-800">
            {t("emergency.title", "आपातकालीन फंड (Emergency)")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("emergency.subtitle", "FD तोड़ें या Overdraft लें? जानिए क्या है सही")}
          </p>
        </div>
      </div>

      <div className="card space-y-4 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
        <p className="font-semibold text-gray-700">
          {t("emergency.inputsLabel", "FD और ज़रूरत की जानकारी दें")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t("emergency.needAmount", "कितने पैसों की ज़रूरत है? (₹)")}
            </label>
            <input
              type="number"
              className="input-base"
              value={needAmount}
              onChange={(e) => setNeedAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t("emergency.fdAmount", "FD की मूल राशि (₹)")}
            </label>
            <input
              type="number"
              className="input-base"
              value={fdAmount}
              onChange={(e) => setFdAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t("emergency.fdRate", "FD ब्याज दर (%)")}
            </label>
            <input
              type="number"
              className="input-base"
              value={fdRate}
              onChange={(e) => setFdRate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t("emergency.daysElapsed", "FD को कितने दिन हो गए?")}
            </label>
            <input
              type="number"
              className="input-base"
              value={daysElapsed}
              onChange={(e) => setDaysElapsed(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t("emergency.daysRemaining", "FD में कितने दिन बचे हैं?")}
            </label>
            <input
              type="number"
              className="input-base"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="btn-primary w-full mt-2"
        >
          {t("emergency.calculate", "कैलकुलेट करें")} <ArrowRight size={16} />
        </button>
      </div>

      {result && (
        <div className={`card border-2 ${result.recommendOD ? "border-green-400 bg-green-50" : "border-amber-400 bg-amber-50"}`}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={20} className={result.recommendOD ? "text-green-600" : "text-amber-600"} />
            <h3 className={`font-bold ${result.recommendOD ? "text-green-800" : "text-amber-800"}`}>
              {result.recommendOD 
                ? t("emergency.recOD", "सुझाव: FD Overdraft (Loan) लेना बेहतर है")
                : t("emergency.recBreak", "सुझाव: FD तोड़ देना बेहतर है")}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{t("emergency.costBreak", "FD तोड़ने का अंदाज़न नुकसान")}</p>
              <p className="font-bold text-red-500 text-lg">{formatINR(result.breakCost)}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {t("emergency.breakInfo", "पेनल्टी + ब्याज़ का नुकसान")}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{t("emergency.costOD", "FD पर लोन का अनुमानित खर्च")}</p>
              <p className="font-bold text-red-500 text-lg">{formatINR(result.odCost)}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {t("emergency.odInfo", "लोन पर दिया जाने वाला ब्याज़")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/60 p-3 rounded-xl">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              {result.recommendOD 
                ? t("emergency.descOD", "आपके मामले में लोन लेने से आपको कम नुकसान होगा क्योंकि आपकी FD का एक बड़ा हिस्सा अभी भी ब्याज़ कमा रहा है।")
                : t("emergency.descBreak", "आपके मामले में लोन का ब्याज़ FD तोड़ने की पेनल्टी से ज़्यादा है। इसलिए FD तोड़ना सही रहेगा।")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
