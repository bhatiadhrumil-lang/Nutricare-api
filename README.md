# NutriHealth (NutriCare) — AI-Powered Blood Report & Health Engine

> **Empowering personal wellness through AI-driven biomarker analysis, tailored nutrition, and actionable lifestyle recommendations.**

NutriHealth is a full-stack web application designed to simplify medical lab reports. Users can upload blood reports (PDF or image format), receive instant plain-language explanations of their health parameters, detect disease risk indicators (focusing on **Diabetes**), and get personalized diet and lifestyle suggestions. It also includes an interactive AI Assistant for follow-up medical and nutritional guidance based directly on the uploaded report.

---

## Features

- **Multi-Format Report Upload**: Supports both PDF documents and direct image uploads (PNG, JPG, WebP) up to 15 MB.
- **Biomarker Extraction & Explanation**: Automatically scans blood values (e.g., HbA1c, Fasting Glucose, LDL, Hemoglobin) and explains what they mean in simple, patient-friendly terms.
- **Medical Analysis Pipeline**: Multi-stage pipeline with extraction, normalization, severity scoring, risk assessment, consistency checking, and critical value detection across 15 lab panels.
- **Disease Indicator Detection**: Specifically flags Diabetes indicators (pre-diabetic or diabetic ranges) with confidence metrics.
- **Personalized Diet Plan**: Recommends key nutrients required, foods to eat, and foods to avoid based on identified abnormalities.
- **Lifestyle & Wellness Guidance**: Provides actionable habits for sleep, exercise, hydration, and stress management.
- **NutriHealth AI Assistant**: Interactive chat interface powered by LLM memory that answers follow-up questions tailored specifically to the patient's report context.
- **User Accounts**: Profile management, health goals, medical information, dietary preferences, and AI personalization — all persisted via AWS Cognito + PostgreSQL.
- **Secure Architecture**: All AI processing happens server-side via Node.js/Express. API keys are strictly kept on the backend and never exposed to the client. Auth handled by AWS Cognito with JWT verification.

---

## Tech Stack

### Frontend
- **Framework**: React 19 (Vite 8)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Auth**: AWS Amplify v6 (Cognito)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Auth**: AWS Cognito JWT verification (`aws-jwt-verify`)
- **Database**: PostgreSQL (Neon) with JSON file fallback
- **File Upload**: Multer v2
- **PDF Parser**: `pdf-parse`
- **OCR**: Tesseract.js
- **Security**: Helmet, compression, CORS, rate limiting

### AI & LLM Engine
- **Provider**: AWS Bedrock (Anthropic Claude)
- **Medical Pipeline**: Modular ESM-based extraction, normalization, severity, risk, and consistency engines
- **Fallback**: Deterministic local analysis when Bedrock is unavailable

---

## Project Architecture

```
Nutricare-api/
├── README.md
├── .gitignore
├── amplify_outputs.json            ← AWS Cognito configuration
│
├── config/
│   └── conversions/units.json      ← Unit conversion factors for lab panels
│
├── server/                         ← Express.js Backend (CommonJS)
│   ├── .env.example                ← Environment variable template
│   ├── index.js                    ← Entry point & middleware setup
│   ├── routes/
│   │   ├── report.routes.js        ← POST /api/analyze-report
│   │   ├── chat.routes.js          ← POST /api/chat
│   │   ├── account.routes.js       ← GET/PUT /api/profile, preferences, health-goals, etc.
│   │   └── agent.routes.js         ← POST /api/agent/analyze
│   ├── controllers/
│   │   ├── report.controller.js    ← Report parsing & analysis coordinator
│   │   ├── chat.controller.js      ← Assistant chat logic
│   │   └── account.controller.js   ← User profile & settings CRUD
│   ├── services/
│   │   ├── ai.service.js           ← AWS Bedrock (Claude) integration
│   │   ├── ai-agent.service.js     ← AI agent for contextual analysis
│   │   ├── db.service.js           ← PostgreSQL (Neon) + JSON fallback store
│   │   └── ocr.service.js          ← Tesseract OCR pipeline
│   ├── middleware/
│   │   ├── authMiddleware.js       ← Cognito JWT verification
│   │   └── uploadValidation.js     ← File type & size validation
│   ├── utils/
│   │   ├── fileValidator.js        ← Upload size & MIME-type validation
│   │   └── promptBuilder.js        ← Disease-specific prompt templates
│   ├── medical/                    ← Medical Analysis Pipeline (ESM)
│   │   ├── pipeline/               ← Orchestrates the full analysis flow
│   │   ├── extractor/              ← Line parsing, parameter matching, unit parsing
│   │   ├── normalization/          ← Unit alias resolution, canonical units
│   │   ├── resolver/               ← Alias resolver, fuzzy matching
│   │   ├── reference/              ← Reference range parsing & extraction
│   │   ├── status/                 ← Status calculation, comparison engine
│   │   ├── severity/               ← Severity scoring & rules
│   │   ├── risk/                   ← Risk assessment & domain scoring
│   │   ├── critical/               ← Critical value detection & emergency rules
│   │   ├── consistency/            ← Consistency checking & contradiction detection
│   │   ├── formatter/              ← Output formatting
│   │   ├── ai/                     ← AI context building & report summarization
│   │   ├── catalog/                ← 15 parameter catalogs (CBC, lipid, diabetes, etc.)
│   │   ├── parameterCatalog.js     ← Catalog registry with validation
│   │   └── categories.js           ← Lab panel categories
│   ├── data/                       ← JSON file store (fallback)
│   └── tests/
│       ├── account.test.js
│       ├── medical/                ← Unit tests for pipeline modules
│       └── probe-live-bedrock.js
│
├── tests/
│   └── ai-agent.service.test.js
│
└── NutriHealth-main/               ← React + Vite Frontend
    ├── vite.config.js              ← Dev proxy (/api → :5000)
    └── src/
        ├── main.jsx                ← Amplify init, entry point
        ├── App.jsx                 ← Routes & layout wrapper
        ├── Layout.jsx              ← Sidebar shell with auto-logout
        ├── Login.jsx / Signup.jsx / VerifyEmail.jsx / ForgotPassword.jsx / ResetPassword.jsx
        ├── Dashboard.jsx           ← Upload page
        ├── Processing.jsx          ← Real-time processing indicator
        ├── Results.jsx             ← Health summary & recommendations
        ├── Assistant.jsx           ← AI Assistant chat interface
        ├── HealthTips.jsx          ← Health tips page
        ├── Account.jsx             ← Account settings
        ├── api/
        │   └── apiClient.js        ← Central API client with token injection
        ├── context/
        │   ├── AuthContext.jsx      ← Auth state (login/signup/logout)
        │   └── ReportContext.jsx    ← Global report & assistant state
        ├── components/
        │   ├── account/            ← Profile, Preferences, HealthGoals, MedicalInfo, etc.
        │   └── consultation/       ← AIConsultationFlow, BiomarkersGrid, MealPlanCard, PDFExport
        ├── services/
        │   └── authService.ts      ← Amplify auth wrapper
        └── pages/
            └── auth/               ← Additional auth pages
```

---

## Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`
- AWS account with Bedrock access (for AI analysis)
- AWS Cognito User Pool (for authentication)
- (Optional) Neon Postgres database for persistent storage

---

### 1. Clone the Repository
```bash
git clone https://github.com/bhatiadhrumil-lang/Nutricare-api.git
cd Nutricare-api
```

---

### 2. Backend Setup (`server`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```env
   # AWS Bedrock credentials (required for AI analysis)
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   BEDROCK_REGION=us-east-2

   # Neon Postgres (optional — falls back to JSON file store if omitted)
   PGHOST=your-neon-host
   PGDATABASE=neondb
   PGUSER=neondb_owner
   PGPASSWORD=your_neon_password
   PGSSLMODE=require
   PGPORT=5432

   # Server config
   PORT=5000
   NODE_ENV=development
   DEV_AUTH_ENABLED=false
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run at `http://localhost:5000`.*

---

### 3. Frontend Setup (`NutriHealth-main`)

1. Open a new terminal tab and navigate to the frontend folder:
   ```bash
   cd NutriHealth-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

## API Endpoints

### Report Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/analyze-report` | Yes | Upload a blood report for AI extraction and analysis |

**Request**: `multipart/form-data` with `report` field (PDF, PNG, JPG, or WebP up to 15 MB)

**Response**:
```json
{
  "disease": "Diabetes",
  "confidence": "High",
  "summary": "Blood sugar levels and long-term averages show elevation...",
  "bloodParameters": [
    {
      "name": "HbA1c",
      "value": "7.8%",
      "normalRange": "4.0 - 5.6%",
      "status": "high",
      "explanation": "Indicates elevated average blood sugar over the last 3 months."
    }
  ],
  "nutrients": ["Chromium", "Magnesium", "Fiber"],
  "foodsToEat": ["Oats", "Spinach", "Almonds"],
  "foodsToAvoid": ["Refined sugar", "White bread", "Sweetened beverages"],
  "lifestyle": ["30 minutes of aerobic exercise daily", "Maintain regular sleep schedule"],
  "disclaimer": "This is not medical advice. Please consult a qualified healthcare professional."
}
```

### Chat Assistant
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/chat` | No | Send queries to the assistant with report context |

**Request**:
```json
{
  "message": "Why is my HbA1c level high?",
  "reportContext": { ... },
  "history": [
    { "role": "user", "text": "Hello" },
    { "role": "model", "text": "Hi! How can I help you with your report today?" }
  ]
}
```

**Response**:
```json
{
  "reply": "Your HbA1c is 7.8%, which is above the standard reference range..."
}
```

### AI Agent
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/agent/analyze` | Yes | Deep contextual analysis with conversation history |

### User Account
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/profile` | Yes | Get user profile |
| `PUT` | `/api/profile` | Yes | Update user profile |
| `GET` | `/api/preferences` | Yes | Get dietary preferences |
| `PUT` | `/api/preferences` | Yes | Update dietary preferences |
| `GET` | `/api/health-goals` | Yes | Get health goals |
| `PUT` | `/api/health-goals` | Yes | Update health goals |
| `GET` | `/api/medical-information` | Yes | Get medical information |
| `PUT` | `/api/medical-information` | Yes | Update medical information |
| `GET` | `/api/reports/summary` | Yes | Get reports summary |
| `GET` | `/api/ai-personalization` | Yes | Get AI personalization data |

### Health Check
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Server status monitoring |

**Response**: `{ "status": "ok", "message": "NutriHealth server is running" }`

---

## Medical Analysis Pipeline

The backend includes a modular medical analysis pipeline (`server/medical/`) that processes blood reports through multiple stages:

1. **Extraction** — Parses raw text from PDFs/images, identifies lab parameters and values
2. **Normalization** — Resolves unit aliases and converts to canonical units
3. **Reference Matching** — Matches parameters against reference ranges
4. **Status Calculation** — Determines if values are normal, high, low, etc.
5. **Severity Scoring** — Assigns severity levels to abnormal values
6. **Risk Assessment** — Evaluates disease risk based on parameter combinations
7. **Critical Detection** — Flags critical values requiring immediate attention
8. **Consistency Checking** — Detects contradictions between related parameters
9. **AI Context Building** — Formats structured context for the LLM
10. **Claude Analysis** — Sends context to AWS Bedrock for natural language analysis

The pipeline supports 15 lab panel types including CBC, lipid panel, diabetes panel, thyroid, liver function, kidney function, and more.

---

## Disclaimer

NutriHealth provides informational analysis generated by artificial intelligence. **It is not a substitute for professional medical advice, diagnosis, or treatment.** Always seek the guidance of a qualified physician or healthcare provider regarding any medical condition.

---

## License

This project is licensed under the MIT License.
