import { useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const TENORS = [
  { label: "3 महीने", value: 3 },
  { label: "6 महीने", value: 6 },
  { label: "12 महीने", value: 12 },
  { label: "18 महीने", value: 18 },
  { label: "24 महीने", value: 24 },
  { label: "36 महीने", value: 36 },
];

const BANK_TYPE_LABELS = {
  govt: { label: "सरकारी बैंक", color: "bg-blue-100 text-blue-700" },
  private: { label: "प्राइवेट बैंक", color: "bg-purple-100 text-purple-700" },
  small_finance: {
    label: "Small Finance",
    color: "bg-green-100 text-green-700",
  },
};

function formatINR(amount) {
  return new Intl.NumberFormat("hi-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function RateCard({ bank, rank, inputAmount }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = BANK_TYPE_LABELS[bank.bankType];
  const isTop = rank === 1;

  return (
    <div
      className={`card transition-all ${
        isTop ? "border-2 border-primary-400 shadow-md" : ""
      }`}
    >
      {isTop && (
        <div className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-t-xl -mx-4 -mt-4 mb-3 text-center">
          🏆 सबसे अधिक ब्याज
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Rank badge */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isTop ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {rank}
          </div>

          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {bank.bankName}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}
            >
              {typeInfo.label}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-primary-600">{bank.rate}%</p>
          <p className="text-xs text-gray-400">प्रति वर्ष</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-xl p-2 text-center">
          <p className="text-xs text-gray-500">ब्याज मिलेगा</p>
          <p className="font-bold text-green-700 text-sm">
            {formatINR(bank.interestEarned)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-2 text-center">
          <p className="text-xs text-gray-500">परिपक्वता राशि</p>
          <p className="font-bold text-orange-700 text-sm">
            {formatINR(bank.maturityAmount)}
          </p>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 mt-3 text-xs text-gray-400 hover:text-gray-600"
      >
        {expanded ? (
          <>
            कम दिखाएं <ChevronUp size={14} />
          </>
        ) : (
          <>
            और देखें <ChevronDown size={14} />
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>न्यूनतम राशि</span>
            <span className="font-medium">{formatINR(bank.minAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>अवधि</span>
            <span className="font-medium">{bank.tenorMonths} महीने</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>निवेश राशि</span>
            <span className="font-medium">{formatINR(inputAmount)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-lg p-2 mt-2">
            <Shield size={12} />
            DICGC बीमा ₹5 लाख तक
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [amount, setAmount] = useState("100000");
  const [tenorMonths, setTenorMonths] = useState(12);
  const [isSenior, setIsSenior] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compared, setCompared] = useState(false);

  const handleCompare = async () => {
    const amt = Number(amount);
    if (!amt || amt < 1000) {
      toast.error("न्यूनतम राशि ₹1,000 होनी चाहिए");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get("/fd/compare", {
        params: { tenorMonths, amount: amt, isSenior },
      });
      setResults(data.data);
      setCompared(true);
    } catch {
      toast.error("तुलना नहीं हो सकी, फिर कोशिश करें");
    } finally {
      setLoading(false);
    }
  };

  const topBank = results[0];

  return (
    <div className="px-4 py-6 space-y-5 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">FD दरें तुलना करें</h2>
        <p className="text-sm text-gray-500">सभी बैंकों की दरें एक साथ देखें</p>
      </div>

      {/* Input card */}
      <div className="card space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            राशि (₹)
          </label>
          <input
            type="number"
            className="input-base"
            placeholder="जैसे: 100000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {/* Quick amount buttons */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {["50000", "100000", "500000", "1000000"].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
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
            अवधि चुनें
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TENORS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTenorMonths(t.value)}
                className={`py-2 text-sm rounded-xl border transition-colors font-medium ${
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

        {/* Senior citizen toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">वरिष्ठ नागरिक</p>
            <p className="text-xs text-gray-400">
              60+ वर्ष — अतिरिक्त 0.5% ब्याज
            </p>
          </div>
          <div
            onClick={() => setIsSenior(!isSenior)}
            style={{ cursor: "pointer" }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isSenior ? "bg-primary-500" : "bg-gray-200"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isSenior ? "translate-x-6" : "translate-x-0.5"
              }`}
            ></div>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>{"तुलना हो रही है..."}</span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <BarChart2 size={16} />
              <span>{"तुलना करें"}</span>
            </span>
          )}
        </button>
      </div>

      {/* Summary bar — shown after compare */}
      {compared && topBank && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} />
            <p className="text-sm font-medium opacity-90">सबसे अच्छा विकल्प</p>
          </div>
          <p className="font-bold text-lg">{topBank.bankName}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span>
              ब्याज दर: <strong>{topBank.rate}%</strong>
            </span>
            <span>
              कमाई: <strong>{formatINR(topBank.interestEarned)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {compared && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              {results.length} बैंक मिले
            </p>
            <p className="text-xs text-gray-400">
              {isSenior ? "वरिष्ठ नागरिक दरें" : "सामान्य दरें"}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">इस अवधि के लिए कोई बैंक नहीं मिला</p>
              <p className="text-xs text-gray-400 mt-1">दूसरी अवधि चुनें</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((bank, i) => (
                <RateCard
                  key={bank.bankName}
                  bank={bank}
                  rank={i + 1}
                  inputAmount={Number(amount)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results yet — placeholder */}
      {!compared && (
        <div className="card text-center py-10">
          <BarChart2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">राशि और अवधि चुनकर तुलना करें</p>
        </div>
      )}
    </div>
  );
}
