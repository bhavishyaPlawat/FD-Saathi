import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// Glossary term definitions in multiple languages
const GLOSSARY_DATA = {
  FD: {
    hi: {
      term: "FD (Fixed Deposit)",
      simple:
        "एक तरीका जहाँ आप बैंक में पैसे रखते हो और निश्चित समय में निश्चित ब्याज पाते हो",
      example: "उदाहरण: ₹1 लाख, 1 साल के लिए 7% पर = ₹7,000 ब्याज मिलेगा",
    },
    en: {
      term: "FD (Fixed Deposit)",
      simple:
        "You give bank money for a fixed time period and get guaranteed interest",
      example: "Example: ₹1 lakh at 7% for 1 year = ₹7,000 interest",
    },
  },
  TDS: {
    hi: {
      term: "TDS (Tax Deducted at Source)",
      simple: "बैंक खुद आपके ब्याज में से कर (tax) काट लेता है",
      example: "उदाहरण: अगर ₹50,000 ब्याज है तो बैंक ₹5,000 (10%) काट लेगा",
    },
    en: {
      term: "TDS (Tax Deducted at Source)",
      simple: "Bank automatically deducts tax from your interest",
      example: "Example: If ₹50,000 interest, bank deducts ₹5,000 (10%)",
    },
  },
  Maturity: {
    hi: {
      term: "Maturity (परिपक्वता)",
      simple: "वो तारीख जब आपकी FD खत्म होती है और पैसे वापस मिलते हैं",
      example: "उदाहरण: अगर 1 साल की FD है तो 1 साल बाद maturity होगी",
    },
    en: {
      term: "Maturity",
      simple: "The date when your FD ends and you get money back",
      example: "Example: If 1-year FD, maturity is after 1 year",
    },
  },
  "Premature Withdrawal": {
    hi: {
      term: "Premature Withdrawal (समय से पहले निकालना)",
      simple: "FD को समय पूरा होने से पहले तोड़ना",
      example:
        "उदाहरण: 1 साल की FD को 6 महीने में तोड़ देना। बैंक पेनल्टी लेगा।",
    },
    en: {
      term: "Premature Withdrawal",
      simple: "Breaking the FD before the maturity date",
      example:
        "Example: Breaking a 1-year FD after 6 months. Bank will charge penalty.",
    },
  },
  "Senior Citizen": {
    hi: {
      term: "Senior Citizen (वरिष्ठ नागरिक)",
      simple:
        "60 साल या उससे ज़्यादा उम्र के लोग - इन्हें ज़्यादा ब्याज मिलता है",
      example: "उदाहरण: सामान्य 7% की जगह senior citizen को 7.5% मिलता है",
    },
    en: {
      term: "Senior Citizen",
      simple: "People aged 60+ years - they get higher interest rates",
      example: "Example: Instead of 7%, senior citizens get 7.5%",
    },
  },
  Compounding: {
    hi: {
      term: "Compounding (चक्रवृद्धि)",
      simple: "ब्याज पर ब्याज - जब आपका ब्याज भी ब्याज कमाता है",
      example: "उदाहरण: पहले ₹7,000 ब्याज मिला, अगली बार ₹1,07,000 पर ब्याज",
    },
    en: {
      term: "Compounding",
      simple: "Interest on interest - your interest also earns interest",
      example:
        "Example: First ₹7,000 interest, next time interest on ₹1,07,000",
    },
  },
  Tenure: {
    hi: {
      term: "Tenure (अवधि)",
      simple: "कितने समय के लिए FD करनी है (जैसे 6 महीने, 1 साल, 5 साल)",
      example: "उदाहरण: 1 साल की FD का tenure = 12 महीने",
    },
    en: {
      term: "Tenure",
      simple:
        "How long you want to keep the FD (like 6 months, 1 year, 5 years)",
      example: "Example: Tenure of 1-year FD = 12 months",
    },
  },
  "Form 15G": {
    hi: {
      term: "Form 15G / 15H",
      simple: "एक फॉर्म जो बैंक को देते हो ताकि वो TDS न काटे",
      example: "उदाहरण: अगर आपकी कुल income tax-free है तो यह फॉर्म भरें",
    },
    en: {
      term: "Form 15G / 15H",
      simple: "A form you submit to bank so they don't deduct TDS",
      example: "Example: Submit if your total income is below tax limit",
    },
  },
  DICGC: {
    hi: {
      term: "DICGC बीमा",
      simple: "सरकारी बीमा जो आपकी FD को ₹5 लाख तक सुरक्षित रखता है",
      example: "उदाहरण: अगर बैंक डूब जाए तो भी आपको ₹5 लाख वापस मिलेगा",
    },
    en: {
      term: "DICGC Insurance",
      simple: "Government insurance that protects your FD up to ₹5 lakh",
      example: "Example: Even if bank fails, you get ₹5 lakh back",
    },
  },
  Overdraft: {
    hi: {
      term: "Overdraft (FD पर लोन)",
      simple: "आप अपनी FD को गिरवी (pledge) रखकर लोन ले सकते हो",
      example: "उदाहरण: ₹1 लाख की FD पर ₹90,000 तक loan मिल सकता है",
    },
    en: {
      term: "Overdraft (Loan against FD)",
      simple: "You can take a loan by pledging your FD as security",
      example: "Example: On ₹1 lakh FD, you can get loan up to ₹90,000",
    },
  },
};

export default function GlossaryPopup({ term, onClose }) {
  const { i18n } = useTranslation();
  const language = i18n.language === "en" ? "en" : "hi";

  const termData = GLOSSARY_DATA[term]?.[language];

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!termData) {
    return (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center animate-fade-in"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Term Not Found</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            We don't have an explanation for "{term}" yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📖</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base leading-tight">
                {termData.term}
              </h3>
              <p className="text-xs text-primary-600 mt-0.5">Financial Term</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Simple Explanation */}
        <div className="bg-primary-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
            {language === "hi" ? "सरल भाषा में" : "In Simple Words"}
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {termData.simple}
          </p>
        </div>

        {/* Example */}
        <div className="bg-secondary-50 rounded-2xl p-4 border border-secondary-200">
          <p className="text-xs font-semibold text-secondary-700 uppercase tracking-wide mb-2">
            💡 {language === "hi" ? "उदाहरण" : "Example"}
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {termData.example}
          </p>
        </div>

        {/* Close button */}
        <button onClick={onClose} className="btn-primary w-full mt-5">
          {language === "hi" ? "समझ गया! ✓" : "Got it! ✓"}
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (min-width: 768px) {
          .animate-slide-up {
            animation: fade-in 0.3s ease-out;
          }
        }
      `}</style>
    </div>
  );
}
