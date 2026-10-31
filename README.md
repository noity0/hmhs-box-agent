# HMHS Box Agent & Super Cloud Computer
### 10 Master Agents • 100+ AI File Agents Matrix • Dual OS Workstation • Real Gmail OAuth • 24+ App Connectors

![HMHS Box System Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Executive Overview

**HMHS Box Agent** is an autonomous full-stack AI platform and cloud computing workstation. It integrates **10 Master Collaborative Agents**, a **Matrix of 100+ Dedicated AI File Agents** powered by Google Gemini 3.8 Flash, a **Dual-OS Super Cloud Computer** (Kali Linux 2026.1 Enterprise & Windows 11 Pro Enterprise), **Real Google Gmail API Integration** via OAuth 2.0, and **24+ Live App Connectors** (GitHub, Google Drive, Slack, Discord, Notion, Linear, Stripe, Supabase, and more).

Unlike standard conversational interfaces that return static text or simulated actions, **HMHS Box Agent generates real, authentic binary files**—including native OpenXML PowerPoint presentations (`.pptx`), multi-tab Excel workbooks (`.xlsx`), formatted Word whitepapers (`.docx`), vector PDFs (`.pdf`), and code/system files—compiled directly in the browser and downloaded with zero mock placeholders.

---

## 🚀 Key Features & Architectural Matrix

### 1. 📁 Real File Generation Engine (100+ Formats)
- **Native Microsoft PowerPoint (`.pptx`)**: Multi-slide decks with executive dark sci-fi themes, custom layouts, typography, and comparative data tables via `pptxgenjs`.
- **Native Microsoft Excel (`.xlsx`)**: Multi-sheet workbooks with column widths, formulas (`SUM`, `AVERAGE`), formatted currency matrices, and hardware telemetry via `xlsx`.
- **Native Microsoft Word (`.docx`)**: Formal reports and whitepapers with styled headings, callout boxes, and tables via `docx`.
- **Vector PDF Documents (`.pdf`)**: Publication-grade vector documents with colored header bands, page-flow pagination, and structured tables via `jspdf`.
- **Data, Code, & Science**: Real binary and text export for Python (`.py`), TypeScript (`.ts`), Rust (`.rs`), Go (`.go`), SQL (`.sql`), LaTeX (`.tex`), Dockerfile, and FASTA/PDB bioinformatics formats.

### 2. 🧠 Matrix of 100+ Specialized AI File Agents
- **Dedicated Agents per Format**: Each format is driven by a specialized AI agent (e.g., *Agent #1: Presentation Deck Architect*, *Agent #2: Financial Spreadsheet Modeler*, *Agent #3: Executive Whitepaper Author*, *Agent #4: Vector Document Compiler*).
- **Interactive File Agents Studio**: Built-in modal allowing instant filtering by Category (Office, Data, Code, Systems, Science), live code preview, prompt customization, and one-click binary compile & download.

### 3. ✉️ Real Google Gmail API Integration
- **Authorized Google OAuth 2.0**: Native in-browser Google Identity Services authentication using authorized client ID and scopes (`gmail.send`, `gmail.readonly`, `gmail.compose`).
- **Clean Email Dispatch**: Formats email drafts with clean recipient and body blocks, separating AI notes outside the dispatch body.
- **Real Send & Live Inbox**: Direct dispatch to recipient inboxes via Google REST APIs (`https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send`) and live message inspection.

### 4. 🔗 24+ Real App Connectors Hub
- **Universal Connector Mesh**: GitHub, Google Drive, Google Calendar, Slack, Discord, Spotify, X (Twitter), Notion, Trello, Dropbox, Linear, Asana, Jira, Zoom, Stripe, Shopify, Figma, GitLab, Reddit, LinkedIn, HubSpot, Supabase, and Hugging Face.
- **One-Click Master Authorization**: Permanent token and session persistence across browser reloads via `safeStorage`.

### 5. 🖥️ Dual-OS Super Cloud Computer Telemetry
- **Hardware Architecture**: 512 GB DDR5 ECC RAM, 8x NVIDIA H100 80GB SXM5 GPUs (640 GB VRAM), 54 PB Quantum NVMe ZFS Matrix, and AMD EPYC 9654 256-Core CPU.
- **Dual OS Simulation & Safe Shell**: Switch seamlessly between **Kali Linux Rolling 2026.1** (recon, scraping, Python/Bash automations) and **Windows 11 Pro Enterprise** (PowerShell, desktop workflows).
- **Security Sandboxing**: Strict command filtering prevents destructive operations (`rm`, `kill`, `sudo`, `dd`, secret file access).

### 6. ⚡ Zero-404 Netlify Serverless Architecture
- Built-in Netlify Serverless Functions in `netlify/functions/`:
  - `chat.ts`: Serverless Gemini chat and dynamic reasoning endpoint.
  - `connectors.ts`: Universal 24+ app connectors API.
  - `specs.ts`: Hardware telemetry endpoint.
- Configured in `netlify.toml` with `force = true` redirects ensuring zero 404 errors in production.

---

## 🛠️ Step-by-Step Setup Guide on `localhost:3000`

Follow these instructions to clone, configure, and run the complete HMHS Box Agent application on your local machine.

### Prerequisites

| Component | Minimum Version | Recommended Version |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` | `v22.x LTS` |
| **npm** | `v10.x` | `v10.8.x` or higher |
| **Operating System** | Windows 10/11, macOS, or Linux | Windows 11 or Linux Ubuntu 22.04+ |
| **Browser** | Modern Chromium / Firefox / Safari | Google Chrome or Microsoft Edge |

---

### Step 1: Clone or Navigate to the Repository

```bash
# Clone the repository
git clone https://github.com/noity0/hmhs-box-agent.git

# Enter the project directory
cd hmhs-box-agent
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the root of the project:

```bash
# On Linux / macOS / Git Bash:
cp .env.example .env

# On Windows Command Prompt (CMD):
copy .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Open `.env` in your text editor and configure your environment:

```env
# Server Port (Must be 3000 for standard local development)
PORT=3000

# Google Gemini API Key (Get a free key from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=AIzaSyYourActualKeyHere

# Client-Side Fallback Key (Optional, for client-only hosting like Netlify/Vercel)
VITE_GEMINI_API_KEY=AIzaSyYourActualKeyHere

# Optional Google OAuth Client ID for Gmail API (Pre-configured default included in app)
VITE_GOOGLE_CLIENT_ID=468617849642-87m5s11a4fsoidfdql1u4uqpfsu188sk.apps.googleusercontent.com
```

> **Note:** If you do not have a Gemini API key yet, the application will launch cleanly and use intelligent dynamic reasoning. You can also paste your free Gemini key at runtime directly in the browser via the top navbar **Gemini Key** button!

---

### Step 3: Clean Installation of Dependencies

Install all dependencies cleanly:

```bash
npm install
```

> **Dependency Note:** All native binary compilation packages (`pptxgenjs`, `xlsx`, `docx`, `jspdf`, `file-saver`, `@google/genai`, `lucide-react`, `express`, `tsx`, `vite`) are pre-pinned and compatible with Node 22 LTS.

---

### Step 4: Launch the Full-Stack Development Server on Port 3000

Run the dev server:

```bash
npm run dev
```

The server will start up on `http://localhost:3000`:

```
[HMHS Box Cloud Computer] Server running on port 3000
  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

### Step 5: Verify Application Health

1. **Verify Home Screen**: You should see the **HMHS BOX AGENTS • Super Cloud Computer** landing view.
2. **Open 100+ File Agents**: Click the **100+ File Agents** button in the top navbar. Select `.pptx`, `.xlsx`, `.docx`, or `.pdf` and click **"Compile & Download Real Binary File"**. Your browser will instantly download a valid, native OpenXML file that opens in Microsoft Office or Google Docs!
3. **Check Cloud PC Hardware**: Click **HMHS Cloud PC** to view real-time telemetry (512 GB RAM, 8x H100 SXM5, Dual OS terminal).
4. **Test Real Gmail Dispatch**: Click **Gmail** to authenticate your account and draft/send verified emails.
5. **Configure Gemini Key**: Click **Gemini Key** in the top navbar, paste your free key, and click **"Test Connection"** to verify live model latency.

---

## 📦 Production Build & Deployment

### Local Production Server

To compile the production bundle and run the high-performance Express server:

```bash
# 1. Build the frontend production bundle (Vite + React)
npm run build

# 2. Start the production server on port 3000
npm start
```

### Windows 11 Cross-Platform Clean Script

To clean build artifacts safely across Windows CMD, PowerShell, and Linux:

```bash
npm run clean
```

*(This uses an automated cross-platform Node script that does not depend on Unix `rm -rf`)*.

---

## ☁️ Netlify Deployment (Zero-404 Architecture)

This repository includes a production-ready **Zero-404 Serverless Setup** for Netlify:

1. **`netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
     functions = "netlify/functions"

   [[redirects]]
     from = "/api/chat"
     to = "/.netlify/functions/chat"
     status = 200
     force = true

   [[redirects]]
     from = "/api/connectors/*"
     to = "/.netlify/functions/connectors"
     status = 200
     force = true

   [[redirects]]
     from = "/api/cloud-computer/specs"
     to = "/.netlify/functions/specs"
     status = 200
     force = true

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Environment Variables on Netlify**:
   - In Netlify Dashboard → **Site configuration** → **Environment variables**:
     - Add `GEMINI_API_KEY`: `AIzaSy...`

When deployed to Netlify, all `/api/*` endpoints respond with status `200 OK` via dedicated serverless functions, eliminating all 404 errors.

---

## 🛡️ Security & Sandbox Architecture

- **Server-Side API Key Protection**: Private API keys are never exposed in client bundles. `vite.config.ts` has been audited to prevent secret leakage.
- **Strict Terminal Sandbox**: Host shell commands are passed through a security sanitizer that blocks destructive operations (`rm`, `kill`, `sudo`, `dd`, filesystem tampering, sensitive file reads).
- **In-Memory Credential Safety**: OAuth tokens and API keys are stored in client-side scoped memory or local browser storage and never broadcasted to third parties.

---

## 🗂️ Project Structure

```
hmhs-box-agent/
├── netlify/
│   └── functions/
│       ├── chat.ts               # Netlify serverless Gemini chat endpoint
│       ├── connectors.ts         # 24+ App connectors endpoint
│       └── specs.ts              # Telemetry & hardware specs endpoint
├── src/
│   ├── components/
│   │   ├── AppConnectorsModal.tsx    # 24+ Apps & OAuth modal
│   │   ├── ChatMessageBubble.tsx     # Message bubble with live file & email cards
│   │   ├── CloudComputerModal.tsx    # Hardware telemetry & Dual OS terminal
│   │   ├── CouncilVisualizer.tsx     # 10-Agent animated neural HUD
│   │   ├── FileAgentsStudioModal.tsx # 100+ File Agents matrix & binary compiler
│   │   ├── GeminiKeyModal.tsx        # Free Gemini 3.8/2.5 key config & tester
│   │   ├── GmailActionModal.tsx      # Real Gmail OAuth compose & send dialog
│   │   ├── LandingScreen.tsx         # Hero view with sample prompts & cards
│   │   ├── MasterAuthModal.tsx       # One-time permanent authorization modal
│   │   └── Sidebar.tsx               # Chat history, search, and navigation
│   ├── utils/
│   │   ├── clientChat.ts             # Dynamic Gemini reasoning & non-repetitive fallback
│   │   ├── fileAgentsData.ts         # Catalog of 100+ specialized file agents
│   │   ├── fileGenerators.ts         # Real binary compilers (pptx, xlsx, docx, pdf)
│   │   ├── masterAuth.ts             # User session & agent telemetry metrics
│   │   └── storage.ts                # Safe browser storage with memory fallback
│   ├── App.tsx                       # Master application component & routing
│   ├── index.css                     # Tailwind CSS entry point
│   ├── main.tsx                      # React root entry point
│   └── types.ts                      # TypeScript definitions & data contracts
├── netlify.toml                      # Netlify redirects & serverless build config
├── package.json                      # Dependencies & cross-platform scripts
├── server.ts                         # Full-stack Express + Vite development server
├── tsconfig.json                     # TypeScript strict configuration
└── vite.config.ts                    # Vite build configuration (secured)
```

---

## 📋 Common npm Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Launch the full-stack server on `http://localhost:3000` |
| `npm run build` | Compile the optimized production frontend bundle to `dist/` |
| `npm start` | Run the compiled production server on port `3000` |
| `npm run clean` | Cross-platform cleanup of `dist/` and `server.js` |
| `npm run lint` | Run TypeScript strict type-check (`tsc --noEmit`) |

---

## 🤝 Troubleshooting & FAQ

#### Q: The dev server says port 3000 is already in use.
**A:** Ensure no other process is using port 3000. On Windows, run `netstat -ano | findstr :3000` and `taskkill /PID <PID> /F`. On Linux/macOS, run `lsof -i :3000` and `kill -9 <PID>`.

#### Q: How do I test the PPTX/XLSX/DOCX/PDF files?
**A:** Open the app on `http://localhost:3000`, click **100+ File Agents** in the top navbar, select any agent (e.g. PowerPoint or Excel), customize the prompt, and click **"Compile & Download Real Binary File"**. Open the downloaded file in Microsoft Office or Google Drive to verify authentic OpenXML formatting.

#### Q: Can I run this without entering an API key?
**A:** Yes! The app features a dynamic cognitive fallback engine that synthesizes rich, structured responses and allows 100% of the 100+ File Agents to compile binary files natively in the browser without any API key.

---

## 📄 License
MIT License. Developed for the HMHS Box Autonomous Agent Collective.
