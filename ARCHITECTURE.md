# Architecture & System Design
### HMHS Box Agent & Super Cloud Computer

This document outlines the software architecture, data flow, component boundaries, and security model of the **HMHS Box Agent** platform.

---

## 1. High-Level Architecture Overview

```
                                    +-----------------------------------------------+
                                    |                Client Browser                 |
                                    |  (React 19, Tailwind CSS v4, Lucide Icons)   |
                                    +-----------------------+-----------------------+
                                                            |
                     +--------------------------------------+--------------------------------------+
                     |                                      |                                      |
                     v                                      v                                      v
       +----------------------------+         +----------------------------+         +----------------------------+
       |   100+ File Agents Matrix  |         |   Google Identity Services |         |    Full-Stack / Serverless |
       |     (Native Browser Binary |         |   (OAuth 2.0 Client-Side)  |         |   (/api/* Routes & Netlify)|
       |   PPTX, XLSX, DOCX, PDF)   |         |    Real Gmail REST API     |         |   Gemini Fusion & Specs    |
       +----------------------------+         +----------------------------+         +----------------------------+
                     |                                                                             |
                     |                                                                             |
                     +--------------------------------------+--------------------------------------+
                                                            |
                                                            v
                                            +-------------------------------+
                                            |     Google Gemini 3.8 / 2.5   |
                                            |      Multi-Model Pipeline     |
                                            +-------------------------------+
```

---

## 2. Key Subsystems

### A. 100+ AI File Agents Matrix & Real Binary Compilers
- **Location:** `src/utils/fileGenerators.ts`, `src/utils/fileAgentsData.ts`, `src/components/FileAgentsStudioModal.tsx`.
- **Functionality:** Compiles genuine binary files in-memory without server bottlenecks:
  - **`pptxgenjs`**: Generates real Microsoft PowerPoint `.pptx` presentations with multi-slide structures, custom color palettes, and data tables.
  - **`xlsx`**: Generates real Microsoft Excel `.xlsx` multi-sheet workbooks with column styling and formulas.
  - **`docx`**: Generates real Microsoft Word `.docx` whitepapers with headers, sections, and tables.
  - **`jspdf`**: Generates real vector `.pdf` documents with headers, footers, and multi-page flows.
  - **`file-saver`**: Handles cross-browser binary blob downloads via `saveAs`.

### B. Dual-OS Cloud Computer Telemetry & Terminal Sandbox
- **Location:** `server.ts`, `src/components/CloudComputerModal.tsx`.
- **Telemetry:** Reflects 512 GB RAM, 8x NVIDIA H100 SXM5 GPUs, 54 PB ZFS Matrix, and 256-Core AMD EPYC CPU.
- **Dual OS:** Simulates Kali Linux Rolling 2026.1 and Windows 11 Enterprise environments.
- **Security Sandbox:** Commands are strictly validated through a security filter that rejects destructive actions (`rm`, `kill`, `sudo`, `dd`, secret file access).

### C. Real Google Workspace Gmail Integration
- **Location:** `src/components/GmailActionModal.tsx`.
- **Authentication:** OAuth 2.0 via Google Identity Services (`google.accounts.oauth2.initTokenClient`) with scopes:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.compose`
- **Dispatch:** Direct RFC 2822 base64url encoded payload sent to Google's REST API endpoint.

### D. Zero-404 Netlify Serverless Architecture
- **Location:** `netlify/functions/`, `netlify.toml`.
- **Functions:**
  - `chat.ts`: Serverless Gemini chat and dynamic reasoning endpoint.
  - `connectors.ts`: Universal 24+ app connectors API.
  - `specs.ts`: Hardware telemetry endpoint.
- **Redirects:** Explicit `force = true` rewrites for all `/api/*` routes guarantee status `200 OK` on serverless deployments.

---

## 3. Data Flow & Fallback Pipeline

1. **User Query Input** (`src/App.tsx`).
2. **Intent Classification**: Evaluates if the query involves file compilation, Gmail dispatch, 24+ app connections, or science research.
3. **Execution**:
   - If server is available: Dispatches request to `/api/chat` or `/api/chat/stream`.
   - If on static/serverless deployment: `clientChat.ts` verifies user-configured key in `safeStorage` or applies context-aware dynamic synthesis.
   - If file generation is requested: Launches real binary compiler via `fileGenerators.ts`.
4. **Rendering**: `ChatMessageBubble` displays parsed Markdown, LaTeX-free tables, action cards for email dispatch, connector links, and 1-click file downloads.
