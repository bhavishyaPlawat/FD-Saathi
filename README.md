# Digital Saathi - FD Financial Literacy Assistant 🏦

<div align="center">

<a href="https://fd-saarthi.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-FD%20Saathi-09aeea?style=for-the-badge&logo=vercel&logoColor=white" alt="See Live Demo">
</a>
<br/>

<img src="https://img.shields.io/badge/Digital%20Saathi-Your%20Financial%20Companion-1D9E75?style=for-the-badge" alt="Digital Saathi Banner"/>
<br/>

---

<p><b>Your trusted multilingual AI platform for Fixed Deposits in India 🇮🇳—explaining FDs, comparing rates, and boosting financial literacy (now in 5 Indian languages!).</b></p>

📖 [About](#-about-the-project) • ✨ [Features](#-features) • 🛠 [Tech Stack](#-tech-stack) • 🚀 [Quick Start](#-quick-start) • 🔑 [API Docs](#-api-endpoints)

</div>

---

## 📖 About The Project

**Digital Saathi** (डिजिटल साथी) is an open-source, multilingual, AI-powered financial literacy assistant.  
It empowers everyday Indians to understand Fixed Deposits—breaking down complex terms into simple conversations across Hindi, English, Marathi, Bengali, and Telugu.

---

### 🎯 Problems Solved

- **Language Barriers:** Financial info is mostly in English or complex jargon.
- **Scattered Data:** FD rates are fragmented across bank websites.
- **Decision Paralysis:** Uncertainty when choosing to break an FD or take a loan.
- **Low Awareness:** Limited understanding of terms (TDS, compounding, maturity).

### ✨ Our AI-powered Solution

- **Conversational AI:** Explains FDs, tax rules, and more in 5 languages.
- **FD Rate Comparator:** Rates from 50+ government and private banks.
- **RAG Chat:** Real answers, real-time, with Retrieval-Augmented Generation.
- **Practical Tools:** Emergency fund calculator, voice support, personalized guides.
- **Total Accessibility:** Voice in/out, language-specific clarity, simple flows.

---

## 🚀 Features

### 🤖 AI-Powered Chat Assistant
- **Real-time streaming responses** using Server-Sent Events (SSE)
- **Three-tier RAG system**:
  - Static knowledge base (FD rates, tax rules)
  - Conversational memory (session context)
  - Recent chat history from MongoDB
- **Automatic language detection** from user input
- **Glossary popups** for financial terms
- **Voice input (STT)** and **voice output (TTS)** with Sarvam AI

### 📊 FD Rate Comparison
- Compare rates across **50+ banks** in real-time
- Filter by: Government / Private / Small Finance
- Calculate **interest earnings** and **maturity amount**
- Support for **senior citizen rates** (+0.5% extra)
- Adjustable tenor: 3M, 6M, 12M, 18M, 24M, 36M

### 🚨 Emergency Fund Calculator
- Compare **breaking FD** vs **taking overdraft loan**
- Real-time penalty and interest calculations
- Personalized recommendations based on:
  - FD amount and interest rate
  - Days elapsed and remaining
  - Amount needed urgently

### 📝 FD Opening Guide
- **Online process** with direct bank links (SBI, HDFC, ICICI)
- **Branch visit checklist**: Required documents
- Step-by-step KYC and payment instructions

### 🌐 Multilingual Support
- **5 Languages**: Hindi, English, Marathi, Bengali, Telugu
- Script quality validation for Devanagari responses
- Language-specific jargon simplification
- Persistent user language preference

### 🔐 Authentication & Security
- JWT-based authentication
- Rate limiting (100 req/15min global, 20 req/min for chat)
- Helmet.js security headers
- Password hashing with bcrypt

---

<details>
<summary>🛠️ <b>Tech Stack</b></summary>

- **Frontend:** React 18, Vite, Zustand, React Router, Tailwind CSS, i18next
- **Backend:** Node.js, Express, MongoDB, JWT Auth
- **AI/ML:** Google Gemini AI, Pinecone Vector DB
- **Validation:** Zod

</details>

---

## 🚀 Quick Start

<div align="center">
  <a href="https://fd-saarthi.vercel.app" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/▶️%20TRY%20LIVE%20DEMO-09aeea?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/>
  </a>
</div>

<details>
  <summary><b>Prerequisites</b></summary>
  <ul>
    <li>Node.js 18+</li>
    <li>MongoDB (local or Atlas)</li>
    <li><a href="https://aistudio.google.com/app/apikey">Google Gemini API key</a></li>
    <li><a href="https://www.pinecone.io/">Pinecone account</a></li>
  </ul>
</details>

**1️⃣ Clone the Repository**

```bash
git clone <your-repo-url>
cd digital-saathi
```

**2️⃣ Backend Setup**

```bash
cd server
npm install
```

Create `.env` in `server/`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/digital-saathi
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key-here
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=digital-saathi
PINECONE_ENVIRONMENT=us-east-1
CLIENT_URL_PRODUCTION=https://fd-saarthi.vercel.app
CLIENT_URL_DEVELOPMENT=http://localhost:5173
```

_Seed FD rates after server start:_

```bash
curl -X POST http://localhost:5000/api/fd/seed -H "Authorization: Bearer <your-jwt-token>"
```

_Knowledge Base Ingest:_

```bash
npm run ingest
```

**3️⃣ Frontend Setup**

```bash
cd client
npm install
```

Create `.env` in `client/`:

```env
VITE_API_URL=http://localhost:5000/api
# and for production:
VITE_API_URL=https://your-backend-url.com/api
```

**4️⃣ Run the App**

- _Terminal 1 (Backend):_
    ```bash
    cd server
    npm run dev
    # http://localhost:5000
    ```
- _Terminal 2 (Frontend):_
    ```bash
    cd client
    npm run dev
    # http://localhost:5173
    ```

Go to [http://localhost:5173](http://localhost:5173) 🚀

---

<details>
<summary>🏗 <b>Project Structure</b> (click to expand)</summary>

```
digital-saathi/
├── client/   # React frontend (components, features, i18n, services, state, etc.)
├── server/   # Node.js backend (config, middleware, models, modules, utils, app.js, server.js)
└── README.md
```
</details>

---

## 🔑 API Endpoints

<details><summary>Authentication</summary>

| Method | Endpoint                  | Description   |
|--------|--------------------------|---------------|
| POST   | `/api/auth/register`      | Register      |
| POST   | `/api/auth/login`         | Login         |
| GET    | `/api/auth/me`            | Get user      |

</details>
<details><summary>Chat</summary>

| Method | Endpoint                | Description           |
|--------|-------------------------|-----------------------|
| POST   | `/api/chat/stream`      | AI chat (SSE)         |
| GET    | `/api/chat/sessions`    | All chat sessions     |
| GET    | `/api/chat/sessions/:id`| Single chat session   |
| DELETE | `/api/chat/sessions/:id`| Delete session        |

</details>
<details><summary>FD Rates</summary>

| Method | Endpoint                                               | Description        |
|--------|--------------------------------------------------------|--------------------|
| GET    | `/api/fd/rates`                                        | All FD rates       |
| GET    | `/api/fd/compare` (params tenor,amount,isSenior)       | Compare FD rates   |
| GET    | `/api/fd/featured`                                     | Featured rates     |
| POST   | `/api/fd/seed`                                         | Seed rates (admin) |

</details>
<details><summary>User</summary>

| Method | Endpoint                   | Description      |
|--------|----------------------------|------------------|
| GET    | `/api/users/profile`        | Get profile      |
| PATCH  | `/api/users/profile`        | Update profile   |

</details>
<details><summary>Voice</summary>

| Method | Endpoint            | Description    |
|--------|---------------------|----------------|
| POST   | `/api/voice/tts`    | Text-to-speech |

</details>

---

## 🧪 Try It Out!

- **Register:** [http://localhost:5173/register](http://localhost:5173/register)
- **Chat:** (Multilingual!) Try, e.g.:
  - "FD क्या है?" (“What is FD?”)
  - "Which bank has the best rates?"
  - "TDS क्या होता है?" (“What is TDS?”)
- **Rate Compare:** Use Compare tool for amount/tenure/bank filters.
- **Emergency Calculator:** Compare options in critical moments.

---

## 🌐 Deployment

<details>
<summary><b>Backend (Render Example)</b></summary>

- Create a new [Render](https://render.com/) Web Service
- Build: `cd server && npm install`
- Start: `cd server && npm start`
- Add your environment variables from `.env`
</details>

<details>
<summary><b>Frontend (Vercel Example)</b></summary>

- Import your repo to [Vercel](https://vercel.com/)
- Set root directory as `client`
- Set environment: `VITE_API_URL=https://your-backend-url.com/api`
- Deploy
</details>

---

## 🤝 Contributing

We 💚 contributions!

1. **Fork** the repository
2. **Create a branch:**  
   `git checkout -b feature/AmazingFeature`
3. **Commit:**  
   `git commit -m 'Add some AmazingFeature'`
4. **Push:**  
   `git push origin feature/AmazingFeature`
5. **Open a Pull Request**


## 🙏 Acknowledgments

- Google Gemini AI
- Pinecone Vector DB
- All contributors and users of Digital Saathi

---

<p align="center"><b>Built with ❤️ for India</b></p>
