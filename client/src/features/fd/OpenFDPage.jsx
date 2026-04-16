import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Globe, FileCheck, ArrowRight, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OpenFDPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("online"); // online | branch
  
  return (
    <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-xl font-bold text-gray-800">
          {t("openFd.title", "नयी FD खोलें")}
        </h2>
        <p className="text-sm text-gray-500">
          {t("openFd.subtitle", "ऑनलाइन या ब्रांच जाकर FD खोलने की प्रक्रिया")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("online")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === "online" ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Globe size={18} /> {t("openFd.onlineTab", "ऑनलाइन")}
        </button>
        <button
          onClick={() => setActiveTab("branch")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === "branch" ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Building2 size={18} /> {t("openFd.branchTab", "ब्रांच विजिट")}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 min-h-[400px]">
        {activeTab === "online" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">
                {t("openFd.onlineSteps", "ऑनलाइन FD कैसे खोलें?")}
              </h3>
              <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                {t("openFd.comingSoon", "Coming Soon")}
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  1
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                  <h4 className="font-semibold text-gray-800 text-sm">{t("openFd.step1", "बैंक चुनें")}</h4>
                  <p className="text-xs text-gray-500 mt-1">{t("openFd.step1Desc", "अपनी पसंद का बैंक चुनें जहां आपको सबसे अच्छी दरें मिल रही हों।")}</p>
                  <Link to="/compare" className="text-primary-600 text-xs font-medium mt-2 flex items-center gap-1 hover:underline">
                    {t("openFd.goCompare", "दरें देखें")} <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-200 text-primary-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  2
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm opacity-70">
                  <h4 className="font-semibold text-gray-800 text-sm">{t("openFd.step2", "KYC पूरा करें")}</h4>
                  <p className="text-xs text-gray-500 mt-1">{t("openFd.step2Desc", "आधार और पैन कार्ड की जानकारी दें।")}</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-200 text-primary-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  3
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm opacity-70">
                  <h4 className="font-semibold text-gray-800 text-sm">{t("openFd.step3", "पेमेंट करें")}</h4>
                  <p className="text-xs text-gray-500 mt-1">{t("openFd.step3Desc", "UPI या NetBanking से पेमेंट करके FD रसीद प्राप्त करें।")}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-5">
              <h4 className="font-medium text-gray-700 text-sm mb-3">{t("openFd.quickLinks", "बैंकों के डायरेक्ट लिंक")}</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                 <a href="https://retail.onlinesbi.sbi/retail/login.htm" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors">
                   <span className="text-sm font-semibold text-blue-800">SBI</span>
                   <ExternalLink size={14} className="text-gray-400" />
                 </a>
                 <a href="https://netbanking.hdfcbank.com/netbanking/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors">
                   <span className="text-sm font-semibold text-blue-900">HDFC</span>
                   <ExternalLink size={14} className="text-gray-400" />
                 </a>
                 <a href="https://www.icicibank.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors">
                   <span className="text-sm font-semibold text-orange-600">ICICI</span>
                   <ExternalLink size={14} className="text-gray-400" />
                 </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "branch" && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-bold text-gray-800 text-lg">
              {t("openFd.docChecklist", "ब्रांच जाने से पहले दस्तावेज़")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("openFd.docDesc", "बैंक ब्रांच में FD खोलने के लिए निम्नलिखित दस्तावेज़ अपने साथ रखें:")}
            </p>

            <ul className="space-y-3 mt-4">
              {[
                t("openFd.doc1", "आधार कार्ड (Aadhar Card) की ओरिजिनल और फोटोकॉपी"),
                t("openFd.doc2", "पैन कार्ड (PAN Card)"),
                t("openFd.doc3", "2 पासपोर्ट साइज़ फोटो"),
                t("openFd.doc4", "पासबुक या कैंसिल चेक"),
                t("openFd.doc5", "पते का प्रमाण (जैसे बिजली बिल, यदि आवश्यक हो)")
              ].map((doc, i) => (
                <li key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <FileCheck size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm font-medium">{doc}</span>
                </li>
              ))}
            </ul>

            <div className="bg-secondary-50 p-4 rounded-xl mt-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-200 flex flex-shrink-0 items-center justify-center">
                <span className="text-secondary-800 font-bold">💡</span>
              </div>
              <div>
                <p className="text-sm font-bold text-secondary-800 mb-1">{t("home.adviceTitle", "साथी की सलाह")}</p>
                <p className="text-xs text-secondary-700 leading-relaxed">
                  {t("openFd.branchTip", "ब्रांच जाने से पहले हमारी ऐप से यह देख लें कि कौन सा बैंक सबसे ज्यादा ब्याज दे रहा है, ताकि आपको सबसे अच्छा रिटर्न मिल सके।")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
