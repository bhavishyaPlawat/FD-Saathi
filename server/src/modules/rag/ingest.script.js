require("dotenv").config();
const { getPineconeIndex } = require("../../config/pinecone");
const { embeddingProvider } = require("../../services/embedding");
const { logger } = require("../../utils/logger");

// ─── Knowledge Base ───────────────────────────────────────────────────────
// Add more documents here to improve RAG quality
const documents = [
  // ── Hindi — FD Basics ──
  {
    id: "fd-basics-hi-1",
    namespace: "hi",
    source: "fd-guide",
    text: "FD यानी Fixed Deposit एक सुरक्षित निवेश विकल्प है जहाँ आप बैंक में एक निश्चित समय के लिए पैसे जमा करते हैं और एक निश्चित ब्याज दर पाते हैं।",
  },
  {
    id: "fd-tenor-hi-1",
    namespace: "hi",
    source: "fd-guide",
    text: "Tenor वह समय अवधि है जिसके लिए आप FD करते हैं। यह 7 दिन से लेकर 10 साल तक हो सकता है। आमतौर पर 1 साल की FD पर सबसे अच्छा ब्याज मिलता है।",
  },
  {
    id: "fd-pa-hi-1",
    namespace: "hi",
    source: "fd-guide",
    text: "p.a. का मतलब है Per Annum — यानी सालाना। जब बैंक 7.5% p.a. कहता है तो इसका मतलब है कि आपको साल में 7.5% ब्याज मिलेगा।",
  },
  {
    id: "fd-safety-hi-1",
    namespace: "hi",
    source: "fd-guide",
    text: "DICGC बीमा के तहत आपकी FD ₹5 लाख तक सुरक्षित है। अगर बैंक डूब भी जाए तो सरकार आपको ₹5 लाख तक वापस देती है।",
  },
  {
    id: "fd-premature-hi-1",
    namespace: "hi",
    source: "fd-guide",
    text: "Premature withdrawal यानी FD को समय से पहले तोड़ना। इसमें बैंक आमतौर पर 0.5% से 1% का penalty लगाता है। इसलिए FD बनाने से पहले सोच लें।",
  },

  // ── Hindi — Emergency & Loan against FD ──
  {
    id: "fd-loan-hi-1",
    namespace: "hi",
    source: "emergency-guide",
    text: "FD पर ओवरड्राफ्ट (Loan) लेने पर आपको आमतौर पर FD की ब्याज दर से 1-2% ज्यादा ब्याज देना होता है। यह FD तोड़ने से बेहतर होता है क्योंकि आपकी मूल राशि पर ब्याज मिलता रहता है।",
  },
  {
    id: "fd-break-hi-1",
    namespace: "hi",
    source: "emergency-guide",
    text: "FD तोड़ने पर बैंक 1% तक की पेनल्टी लगाते हैं और जो ब्याज मिलता है वो पुराने समय के लिए कम दर पर मिलता है। इसलिए अगर आपको FD राशि के 90% से कम की ज़रुरत है तो लोन (Overdraft) लेना ज़्यादा फायदेमंद है।",
  },

  // ── Hindi — Tax ──
  {
    id: "tds-hi-1",
    namespace: "hi",
    source: "tax-guide",
    text: "TDS यानी Tax Deducted at Source। अगर आपकी FD ब्याज एक साल में ₹40,000 से ज़्यादा है तो बैंक 10% TDS काट लेता है। Senior citizens के लिए यह सीमा ₹50,000 है।",
  },
  {
    id: "form15g-hi-1",
    namespace: "hi",
    source: "tax-guide",
    text: "Form 15G और 15H भरकर TDS से बचा जा सकता है। 15G सामान्य नागरिकों के लिए है और 15H senior citizens के लिए। यह तभी भर सकते हैं जब आपकी कुल income tax-free हो।",
  },

  // ── English — Bank Rates ──
  {
    id: "sbi-rates-en-1",
    namespace: "en",
    source: "bank-rates",
    text: "State Bank of India (SBI) offers FD rates of 7.10% for 12 months. Minimum deposit is ₹1,000. It is a government bank, DICGC insured up to ₹5 lakh.",
  },
  {
    id: "hdfc-rates-en-1",
    namespace: "en",
    source: "bank-rates",
    text: "HDFC Bank offers FD rates of 7.25% for 18 months. Minimum deposit is ₹5,000. It is a private sector bank, DICGC insured.",
  },
  {
    id: "sfe-rates-en-1",
    namespace: "en",
    source: "bank-rates",
    text: "Small Finance Banks like Suryoday and Unity offer FD rates between 8.5% to 9.5%. They are higher risk than big banks but still DICGC insured up to ₹5 lakh.",
  },

  // ── English — Emergency & Loan against FD ──
  {
    id: "fd-loan-en-1",
    namespace: "en",
    source: "emergency-guide",
    text: "Taking a loan or Overdraft (OD) against an FD usually costs 1-2% higher than the FD interest rate. This is often better than breaking the FD because your principal continues to earn interest.",
  },
  {
    id: "fd-break-en-1",
    namespace: "en",
    source: "emergency-guide",
    text: "Breaking an FD early incurs a penalty of up to 1%, and the interest earned is calculated at a lower rate for the duration it was actually held. If you need less than 90% of the FD amount, an Overdraft is usually cheaper.",
  },

  // ── English — FD Basics ──
  {
    id: "fd-compound-en-1",
    namespace: "en",
    source: "fd-guide",
    text: "FD interest can be paid monthly, quarterly, or at maturity. Cumulative FDs reinvest the interest and give higher returns at maturity. Non-cumulative FDs pay interest regularly.",
  },
  {
    id: "fd-senior-en-1",
    namespace: "en",
    source: "fd-guide",
    text: "Senior citizens (age 60+) get an extra 0.25% to 0.75% interest on FDs in most banks. This makes FDs especially attractive for retired individuals.",
  },
  {
    id: "fd-vs-rd-en-1",
    namespace: "en",
    source: "fd-guide",
    text: "FD (Fixed Deposit) requires a lump sum investment while RD (Recurring Deposit) allows monthly installments. FDs give better interest rates but RDs are better for monthly savers.",
  },
];

// ─── Ingest Function ──────────────────────────────────────────────────────
async function ingest() {
  const index = getPineconeIndex();
  logger.info(`Starting ingestion of ${documents.length} documents...`);

  const CONCURRENCY = 5;

  for (let i = 0; i < documents.length; i += CONCURRENCY) {
    const batch = documents.slice(i, i + CONCURRENCY);

    // Embed all texts in this batch in parallel
    const embeddings = await Promise.all(
      batch.map((doc) => embeddingProvider.embed(doc.text)),
    );

    // Group by namespace and upsert
    const namespaces = [...new Set(batch.map((d) => d.namespace))];

    for (const ns of namespaces) {
      const nsVectors = batch
        .map((doc, idx) => ({ doc, embedding: embeddings[idx] }))
        .filter(({ doc }) => doc.namespace === ns)
        .map(({ doc, embedding }) => ({
          id: doc.id,
          values: embedding,
          metadata: {
            text: doc.text,
            source: doc.source,
            language: doc.namespace,
          },
        }));

      await index.namespace(ns).upsert(nsVectors);
      logger.info(
        `Upserted ${nsVectors.length} vectors into namespace '${ns}'`,
      );
    }

    logger.info(`Batch ${Math.floor(i / CONCURRENCY) + 1} done`);
  }

  logger.info("✅ Ingestion complete!");
  process.exit(0);
}

ingest().catch((err) => {
  logger.error("❌ Ingestion failed:", err);
  process.exit(1);
});
