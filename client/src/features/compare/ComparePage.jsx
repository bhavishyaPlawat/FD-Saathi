import { useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const TENORS = [
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "12M", value: 12 },
  { label: "18M", value: 18 },
  { label: "24M", value: 24 },
  { label: "36M", value: 36 },
];

const BANK_FILTERS = [
  { labelKey: "compare.filters.all", defaultLabel: "सभी", value: "" },
  { labelKey: "compare.filters.govt", defaultLabel: "सरकारी बैंक", value: "govt" },
  { labelKey: "compare.filters.private", defaultLabel: "प्राइवेट", value: "private" },
  { labelKey: "compare.filters.sf", defaultLabel: "स्मॉल फाइनेंस", value: "small_finance" },
];

function formatINR(n) {
  return new Intl.NumberFormat("hi-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function BankCard({ bank, rank, inputAmount }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isTop = rank === 1;

  const badgeCls =
    bank.bankType === "govt"
      ? "badge-govt"
      : bank.bankType === "small_finance"
        ? "badge-sf"
        : "badge-private";

  const badgeLabel =
    bank.bankType === "govt"
      ? "GOVT"
      : bank.bankType === "small_finance"
        ? "SF"
        : "PRIVATE";

  return (
    <div
      className={`card ${isTop ? "border-2 border-primary-400 shadow-md" : ""}`}
    >
      {isTop && (
        <div
          className="bg-primary-500 text-white text-xs font-bold px-3 py-1
                        rounded-t-xl -mx-4 -mt-4 mb-3 text-center flex items-center justify-center gap-1"
        >
          <Star size={11} fill="white" /> {t("compare.highestInterest", "सबसे अधिक ब्याज")}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
            ${isTop ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"}`}
          >
            {rank}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {bank.bankName}
            </p>
            <span className={badgeCls}>{badgeLabel}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{bank.rate}%</p>
          <p className="text-xs text-gray-400">{t("compare.perYear", "प्रति वर्ष")}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-3 text-xs text-gray-500">
        <span className="bg-gray-50 rounded-lg px-2 py-1">
          {t("compare.minAmount", "न्यूनतम")} {formatINR(bank.minAmount)}
        </span>
        <span className="bg-gray-50 rounded-lg px-2 py-1">
          {bank.tenorMonths} {t("compare.months", "महीने")}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-gray-500">{t("compare.interestEarned", "ब्याज मिलेगा")}</p>
          <p className="font-bold text-green-700 text-sm">
            {formatINR(bank.interestEarned)}
          </p>
        </div>
        <div className="bg-secondary-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-gray-500">{t("compare.maturityAmount", "परिपक्वता राशि")}</p>
          <p className="font-bold text-secondary-700 text-sm">
            {formatINR(bank.maturityAmount)}
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 mt-3 text-xs text-gray-400 hover:text-gray-600"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} /> {t("compare.showLess", "कम दिखाएं")}
          </>
        ) : (
          <>
            <ChevronDown size={14} /> {t("compare.viewDetails", "विवरण देखें")}
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{t("compare.investAmount", "निवेश राशि")}</span>
            <span className="font-medium">{formatINR(inputAmount)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-lg p-2">
            <Shield size={12} />
            {t("compare.dicgc", "DICGC बीमा ₹5 लाख तक")}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("100000");
  const [tenorMonths, setTenorMonths] = useState(12);
  const [isSenior, setIsSenior] = useState(false);
  const [bankFilter, setBankFilter] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compared, setCompared] = useState(false);

  const handleCompare = async () => {
    const amt = Number(amount);
    if (!amt || amt < 1000) {
      toast.error(t("compare.errorMinAmount", "न्यूनतम राशि ₹1,000 होनी चाहिए"));
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/fd/compare", {
        params: { tenorMonths, amount: amt, isSenior },
      });
      let res = data.data || [];
      if (bankFilter) res = res.filter((b) => b.bankType === bankFilter);
      setResults(res);
      setCompared(true);
    } catch {
      toast.error(t("compare.errorCompare", "तुलना नहीं हो सकी, फिर कोशिश करें"));
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = bankFilter
    ? results.filter((b) => b.bankType === bankFilter)
    : results;

  return (
    <div className="px-4 md:px-8 py-5 md:py-6 pb-6">
      <div className="mb-5">
        <h2 className="font-headline text-lg md:text-xl font-bold text-gray-800">
          {t("compare.title", "FD दरें तुलना करें")}
        </h2>
        <p className="text-sm text-gray-500">{t("compare.subtitle", "सभी बैंकों की दरें एक साथ देखें")}</p>
      </div>

      {/* ── Desktop: side-by-side layout ────────────────────────── */}
      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-6 lg:items-start max-w-5xl">
        {/* ── Left: Input card (sticky on desktop) ──────────────── */}
        <div className="card space-y-4 lg:sticky lg:top-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("compare.amountLabel", "राशि (₹)")}
            </label>
            <input
              type="number"
              className="input-base"
              placeholder={t("compare.amountPlaceholder", "जैसे: 100000")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {["50000", "100000", "500000", "1000000"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors
                    ${
                      amount === a
                        ? "bg-primary-500 text-white border-primary-500"
                        : "border-gray-200 text-gray-600 hover:border-primary-300"
                    }`}
                >
                  {Number(a) >= 100000
                    ? `₹${Number(a) / 100000} लाख`
                    : `₹${Number(a) / 1000}K`}
                </button>
              ))}
            </div>
          </div>

          {/* Tenor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("compare.tenorLabel", "अवधि चुनें")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TENORS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTenorMonths(t.value)}
                  className={`py-2 text-sm rounded-xl border transition-colors font-medium
                    ${
                      tenorMonths === t.value
                        ? "bg-primary-500 text-white border-primary-500"
                        : "border-gray-200 text-gray-600 hover:border-primary-300"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Senior toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-700">{t("compare.seniorToggle", "वरिष्ठ नागरिक")}</p>
              <p className="text-xs text-gray-400">{t("compare.seniorDesc", "60+ वर्ष — अतिरिक्त ब्याज")}</p>
            </div>
            <div
              onClick={() => setIsSenior(!isSenior)}
              className="cursor-pointer w-12 h-6 rounded-full relative transition-colors duration-200"
              style={{ background: isSenior ? "#1D9E75" : "#E5E7EB" }}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                ${isSenior ? "translate-x-6" : "translate-x-0.5"}`}
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              t("compare.comparingBtn", "तुलना हो रही है...")
            ) : (
              <>
                <BarChart2 size={16} /> {t("compare.compareBtn", "तुलना करें")}
              </>
            )}
          </button>
        </div>

        {/* ── Right: Results ────────────────────────────────────── */}
        <div className="mt-5 lg:mt-0 space-y-4">
          {/* Bank type filter tabs */}
          {compared && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {BANK_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setBankFilter(f.value)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors font-medium
                    ${
                      bankFilter === f.value
                        ? "bg-tertiary-500 text-white border-tertiary-500"
                        : "border-gray-200 text-gray-600 bg-white hover:border-gray-400"
                    }`}
                >
                  {t(f.labelKey, f.defaultLabel)}
                </button>
              ))}
            </div>
          )}

          {/* Summary bar */}
          {compared && filteredResults[0] && (
            <div className="bg-tertiary-500 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} />
                <p className="text-xs font-medium opacity-80">{t("home.adviceTitle", "साथी की सलाह")}</p>
              </div>
              <p className="font-headline font-bold">
                {filteredResults[0].bankName}
              </p>
              <div className="flex gap-4 mt-1.5 text-sm">
                <span>
                  {t("compare.interestLbl", "ब्याज: ")}
                  <strong className="text-primary-300">
                    {filteredResults[0].rate}%
                  </strong>
                </span>
                <span>
                  {t("compare.earningsLbl", "कमाई: ")}
                  <strong>
                    {formatINR(filteredResults[0].interestEarned)}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Results grid: 1 col mobile, 2 cols on lg */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-4 space-y-4">
                   <div className="flex justify-between items-start">
                     <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                       <div className="space-y-2">
                         <div className="h-4 w-24 bg-gray-200 rounded"></div>
                         <div className="h-3 w-16 bg-gray-200 rounded"></div>
                       </div>
                     </div>
                     <div className="space-y-2 text-right">
                       <div className="h-6 w-12 bg-gray-200 rounded inline-block"></div>
                       <div className="h-3 w-10 bg-gray-200 rounded ml-auto"></div>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <div className="h-6 w-20 bg-gray-200 rounded-lg"></div>
                     <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 mt-2">
                     <div className="h-12 bg-gray-200 rounded-xl"></div>
                     <div className="h-12 bg-gray-200 rounded-xl"></div>
                   </div>
                </div>
              ))}
            </div>
          ) : compared ? (
            filteredResults.length === 0 ? (
              <div className="card text-center py-8 text-gray-500">
                {t("compare.noBankFound", "इस फ़िल्टर के लिए कोई बैंक नहीं मिला")}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredResults.map((bank, i) => (
                  <BankCard
                    key={bank.bankName + i}
                    bank={bank}
                    rank={i + 1}
                    inputAmount={Number(amount)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="card text-center py-12">
              <BarChart2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {t("compare.selectToCompare", "राशि और अवधि चुनकर तुलना करें")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
