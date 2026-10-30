# HMHS Box Agent

HMHS Box Agent is a React + TypeScript AI assistant interface with a Node.js/Express backend. It uses Google's Gemini API for chat responses and Firebase Authentication for Google sign-in. The UI includes chat sessions, a 10-agent council presentation, a cloud-computer/terminal panel, a Gmail action center, and an app-connectors catalogue.

> **Important — current implementation status**
>
> This repository is an early-stage prototype, not a provisioned cloud-computer service. Some hardware telemetry and Windows 11 terminal output are hard-coded demo values. The “10 agents” are represented in the Gemini system prompt and UI; the repository does not provision ten independent AI agents or the advertised 512 GB / 8× H100 / 54 PB infrastructure. The connector catalogue also contains UI/demo state and should not be interpreted as 24+ fully implemented integrations.
>
> **Do not expose the current server publicly.** The terminal endpoint currently passes submitted commands to the host shell without authentication or sandboxing. The Vite config also defines the Gemini key as a client-side compile-time value. Both need to be redesigned before any public or production deployment.

## Technology stack

- React 19 and TypeScript
- Vite 8 with the React and Tailwind CSS plugins
- Tailwind CSS 4
- Node.js and Express
- Google GenAI SDK (`@google/genai`)
- Firebase Authentication (Google sign-in)
- Lucide React icons, Motion, and Marked

## Features in the current codebase

- Chat interface with locally persisted sessions
- Gemini-backed chat API with streaming and non-streaming routes
- Prompt-based normal-chat and “10-agent council” response modes
- Landing screen, sidebar, message bubbles, and council visualizer
- Cloud-computer modal with terminal-style UI
- Demo hardware telemetry and Windows command-response emulation
- Gmail UI and Google sign-in requesting Gmail scopes
- App connector catalogue and local connector state
- React error boundary

Feature labels describe the current UI/code paths; external services still require their own setup and implementation. A visible connector entry does not mean its provider API is already connected.

## Requirements

- Windows 10/11, macOS, or Linux
- Git
- Node.js 22 LTS (22.12+ recommended) and npm
- A Google AI Studio Gemini API key for AI chat
- A Firebase project with Google Authentication enabled for Google sign-in

## Quick start (Windows PowerShell)

### 1. Clone the repository

```powershell
git clone https://github.com/noity0/hmhs-box-agent.git
cd hmhs-box-agent
```

### 2. Install dependencies

```powershell
node --version
npm --version
npm install
```

Use Node.js 22 LTS. If the version command is not recognised, install Node.js and reopen PowerShell.

### 3. Configure environment variables

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set your own Gemini key:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

Do not commit `.env` or share API keys in screenshots, issues, or chat messages. The repository's `.gitignore` excludes `.env*` while allowing `.env.example`.

`APP_URL` is only needed when configuring a hosted deployment; local development can leave the example value unused.

### 4. Configure Firebase Google sign-in

The repository includes `firebase-applet-config.json` for the Firebase web app currently referenced by the source. For your own deployment:

1. Create or select a Firebase project.
2. Register a Web app in Firebase project settings.
3. Enable **Authentication → Sign-in method → Google**.
4. Add your local hostname (normally `localhost`) and production hostname to **Authentication → Settings → Authorized domains**.
5. Replace the values in `firebase-applet-config.json` with your own Firebase web-app configuration.
6. In Google Cloud Console, configure the OAuth consent screen and enable the Gmail API if you intend to test Gmail functionality.
7. Review the requested Gmail scopes and use a test account while the OAuth consent screen is in testing.

The current frontend requests `gmail.send`, `gmail.readonly`, and `gmail.compose`. Google may require OAuth verification for broader/public use. Do not assume Google sign-in alone guarantees Gmail API access.

### 5. Start the application

```powershell
npm run dev
```

The package script starts the Express server through `tsx`. Open:

```text
http://localhost:3000
```

Stop the local server with **Ctrl+C**.

### 6. Create a production build

```powershell
npm run build
```

To preview the generated Vite build:

```powershell
npm run preview
```

The `preview` script is Vite's static preview server; it is not a replacement for the Express API server. The normal app development entry point is `npm run dev`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Express + Vite development server |
| `npm run build` | Build the frontend into `dist/` |
| `npm run start` | Start the Express server |
| `npm run preview` | Preview the built frontend with Vite |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |
| `npm run clean` | Remove build output and generated server.js (Unix-style command) |

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes for Gemini chat | Google Gemini API key read by the Express server |
| `PORT` | No | Express listen port; defaults to `3000` |
| `APP_URL` | Hosting-dependent | Base app URL documented in `.env.example` |
| `DISABLE_HMR` | No | Set to `true` to disable Vite HMR/file watching in the configured environment |

## Project layout

```text
hmhs-box-agent/
├── src/
│   ├── components/       # Landing, chat, sidebar, modals, visualizers
│   ├── utils/            # Auth, storage, chat and API helpers
│   ├── App.tsx           # Main application state and chat UI
│   ├── main.tsx          # React entry point and error boundary
│   └── index.css         # Global styles
├── .env.example          # Environment-variable template
├── firebase-applet-config.json
├── index.html
├── package.json
├── server.ts             # Express API + Vite middleware
├── tsconfig.json
└── vite.config.ts
```

## Troubleshooting

### `GEMINI_API_KEY` is missing or Gemini requests fail

- Confirm `.env` exists in the repository root.
- Check that `GEMINI_API_KEY` contains a valid key and has no extra quotes/spaces.
- Restart `npm run dev` after editing `.env`.
- Check the server terminal for API errors and confirm the key's project/API access.

### Google sign-in popup fails

- Confirm Google is enabled as a Firebase Authentication provider.
- Add `localhost` to Firebase Authorized domains.
- Check the Firebase web configuration in `firebase-applet-config.json`.
- Check browser popup permissions and the OAuth consent-screen test-user configuration.

### Port 3000 is already in use

Set another port in `.env`, for example `PORT=3001`, then restart the server.

### Dependency or Node version errors

Check `node --version` and use Node.js 22 LTS. Then run:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

Do not delete your source files or `.env` when cleaning dependencies.

## Security and production-readiness checklist

The current code should be treated as a local prototype until these items are addressed:

- [ ] Remove the unauthenticated `/api/cloud-computer/terminal/exec` host-shell execution route, or replace it with an isolated, disposable sandbox with strict allowlists, resource limits, and authorization.
- [ ] Never execute arbitrary user-provided shell strings on the web-server host.
- [ ] Remove the Gemini API key from Vite's client-side `define` configuration; keep provider credentials server-side only.
- [ ] Add authentication, authorization, rate limits, request validation, and audit logging to API routes.
- [ ] Store OAuth tokens securely; do not treat a browser-stored token or placeholder token as proof of authorization.
- [ ] Verify each connector against its provider API; clearly label mock/demo connectors.
- [ ] Replace hard-coded hardware/OS telemetry with measured data or label it as simulated.
- [ ] Add automated tests, dependency/security scanning, and a deployment-specific environment configuration.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change and test it locally.
4. Open a pull request with a clear summary and testing notes.

## License

No license file was present in the repository when this README was prepared. Unless a license is added, standard copyright applies and reuse/redistribution permissions are not automatically granted.
