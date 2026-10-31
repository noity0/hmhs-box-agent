# HMHS Box Agent — AI Assistant Interface Prototype

[![GitHub stars](https://img.shields.io/github/stars/noity0/hmhs-box-agent?style=flat-square)](https://github.com/noity0/hmhs-box-agent/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/noity0/hmhs-box-agent?style=flat-square)](https://github.com/noity0/hmhs-box-agent/issues)
[![Last commit](https://img.shields.io/github/last-commit/noity0/hmhs-box-agent?style=flat-square)](https://github.com/noity0/hmhs-box-agent/commits/main)

> A React and TypeScript AI assistant prototype with Gemini chat, Firebase Google sign-in, session UI, and experimental tool panels.

**Status:** Early-stage prototype. This repository is useful for exploring the interface and integration direction; it is not a production cloud-computer service.

## What is implemented

- React-based chat interface with locally persisted sessions.
- Express API routes for Gemini-backed chat.
- Prompt-driven normal chat and council-style response modes.
- Firebase Google sign-in integration.
- Experimental terminal/cloud-computer panel.
- Gmail action-center interface and connector catalogue UI.
- Responsive components, message rendering, and error boundary.

Some panels contain demonstration or placeholder state. A connector displayed in the interface does not prove that its external provider API is fully implemented. The council mode is prompt-driven; it does not provision ten independent model agents.

## Important security warning

**Do not expose the current application or terminal functionality to the public internet.** The checked-in implementation has security limitations that must be addressed before any public or production deployment:

- A terminal API path can pass submitted commands to the host shell without a proper authentication boundary or isolated execution sandbox.
- The Vite configuration exposes the Gemini key through a client-side compile-time definition.
- API routes require a full review for authentication, authorization, validation, rate limiting, and audit logging.
- OAuth/Gmail access requires provider-side configuration and may require consent-screen review.
- Hardware telemetry and some terminal output are demonstration values, not verified machine telemetry.

Treat the project as a local prototype. Do not connect it to a machine or account containing sensitive data until the security architecture has been redesigned and reviewed.

## Technology stack

- React 19 and TypeScript
- Vite 8 and Tailwind CSS 4
- Node.js and Express
- Google Gemini SDK (`@google/genai`)
- Firebase Authentication
- Motion, Marked, and Lucide React

## Requirements

- Node.js 22.12.0 or newer (Node.js 22 LTS recommended)
- npm 10 or newer
- Gemini API key for chat
- Firebase project and web-app configuration for Google sign-in

## Windows setup

Clone the repository (PowerShell):

```powershell
New-Item -ItemType Directory -Force -Path D:\HMHS | Out-Null
Set-Location D:\HMHS
git clone https://github.com/noity0/hmhs-box-agent.git
Set-Location D:\HMHS\hmhs-box-agent
```

Or use **Command Prompt (CMD)**:

```cmd
if not exist D:\HMHS mkdir D:\HMHS
cd /d D:\HMHS
git clone https://github.com/noity0/hmhs-box-agent.git
cd /d D:\HMHS\hmhs-box-agent
```

If you already cloned the repository, do not clone it again. Open the existing folder instead:

```powershell
Set-Location D:\hmhs-box-agent
git pull
```

Install dependencies:

```powershell
npm install
```

Create the local environment file (safe to run repeatedly):

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Equivalent CMD commands:

```cmd
if not exist .env copy .env.example .env
notepad .env
```

Set your own Gemini key and local port in `.env` (never commit this file):

```dotenv
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
APP_URL=http://localhost:3000
```

Do not commit `.env` or share API keys. The repository also contains `firebase-applet-config.json`; for your own Firebase project, register a web app, enable Google sign-in, configure authorized domains, and replace the app configuration with your own project values.

If you intend to explore Gmail UI integration, configure the Google Cloud OAuth consent screen and required Gmail API access separately. Sign-in by itself does not guarantee Gmail API authorization.

## Run locally

```powershell
npm run dev
```

Open the local address shown by the server. The repository's development script starts the Express/TypeScript application.

Build the frontend:

```powershell
npm run build
```

Remove generated output on Windows, macOS, or Linux:

```powershell
npm run clean
```

The preview script serves the built frontend; it is not a substitute for the Express API server.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Express/TypeScript application |
| `npm run start` | Start the Express/TypeScript application |
| `npm run build` | Build the Vite frontend |
| `npm run preview` | Preview the built frontend |
| `npm run lint` | Run TypeScript checks |
| `npm run clean` | Remove generated build output |

## Environment configuration

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key used by server-side AI requests |
| `PORT` | Express port; defaults to 3000 |
| `APP_URL` | Application URL for hosted configuration |
| `DISABLE_HMR` | Optional Vite hot-reload/file-watching control |

See `.env.example` for the checked-in template.

## Repository layout

```text
hmhs-box-agent/
├── src/
│   ├── components/
│   └── utils/
├── .env.example
├── firebase-applet-config.json
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

## Contributing

Contributions that improve security, accessibility, tests, documentation, and provider error handling are welcome. Include clear reproduction steps and avoid posting secrets or private user data in issues.

- [Issues](https://github.com/noity0/hmhs-box-agent/issues)
- [Source code](https://github.com/noity0/hmhs-box-agent)

## License

Check the repository for a `LICENSE` file. If none is present, standard copyright restrictions apply.

## Search terms

AI assistant prototype, Gemini chat app, React AI interface, Firebase authentication, Express backend, coding workspace UI, AI agent interface, HMHS Box Agent.

<!-- COMMUNITY-CONTRIBUTORS-SECTION -->
## Contributors & community

[![Contributors](https://img.shields.io/github/contributors/noity0/hmhs-box-agent?style=flat-square)](https://github.com/noity0/hmhs-box-agent/graphs/contributors)
[![Pull requests](https://img.shields.io/github/issues-pr/noity0/hmhs-box-agent?style=flat-square)](https://github.com/noity0/hmhs-box-agent/pulls)
[![Open issues](https://img.shields.io/github/issues/noity0/hmhs-box-agent?style=flat-square)](https://github.com/noity0/hmhs-box-agent/issues)

<a href="https://github.com/noity0/hmhs-box-agent/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=noity0/hmhs-box-agent&max=100&columns=10" alt="GitHub contributors to hmhs-box-agent" />
</a>

This live contributor panel is generated from GitHub's repository contribution data. It shows real contributors when GitHub has qualifying contribution records; it does not imply endorsement by other developers or companies.

### How to contribute

1. Check the [open issues](https://github.com/noity0/hmhs-box-agent/issues) and [pull requests](https://github.com/noity0/hmhs-box-agent/pulls) before starting.
2. Open an issue to discuss substantial changes.
3. Fork the repository and create a focused branch.
4. Keep pull requests small and explain the problem, solution, and testing performed.
5. Update documentation and tests when behavior changes.
6. Never commit API keys, passwords, private data, or other secrets.

### Upstream projects & acknowledgements

This project builds on the open-source tools named in its technology stack. Visit their official documentation and repositories to learn more, and follow each project's license and attribution requirements. Upstream maintainers and well-known developers are not listed as project contributors unless they have verifiable contributions here.

- [GitHub: Contributing to projects](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)
- [GitHub: Project contributors](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors)
