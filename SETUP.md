# HMHS Box Agent — Local Setup Tutorial

This guide explains how to run the current repository locally on Windows using PowerShell. It documents the code that exists today; it does not provision a real cloud VM or physical GPU infrastructure.

## 1. Install prerequisites

Install:

- Git for Windows
- Node.js 22 LTS (22.12 or newer)
- npm (included with Node.js)
- A code editor such as Visual Studio Code

Open a new PowerShell window and verify:

```powershell
git --version
node --version
npm --version
```

## 2. Download the source

Choose a development folder, then run:

```powershell
Set-Location D:\
git clone https://github.com/noity0/hmhs-box-agent.git
Set-Location .\hmhs-box-agent
```

If you already cloned it, update the checkout:

```powershell
git pull origin main
```

## 3. Install Node dependencies

```powershell
npm install
```

This installs the dependencies declared in `package.json`, including React, Vite, Express, the Google GenAI SDK, Firebase, and Tailwind CSS.

## 4. Add your Gemini API key

Copy the example file and open it:

```powershell
Copy-Item .env.example .env
notepad .env
```

Edit the file so it contains your own key:

```dotenv
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=3000
```

Create a key in Google AI Studio. Keep it private. Do not paste it into frontend source code, Git commits, public issues, or screenshots.

## 5. Set up Google / Firebase authentication (optional for basic local launch)

The source imports Firebase settings from `firebase-applet-config.json`.

For a separate Firebase project:

1. Create a Firebase project and register a Web app.
2. Enable Google under Firebase Authentication providers.
3. Add `localhost` to the authorized domains list.
4. Replace the web-app configuration values in `firebase-applet-config.json`.
5. If testing Gmail actions, enable Gmail API in the linked Google Cloud project and configure the OAuth consent screen.
6. Add a test Google account to the consent screen's test users if the app is still in testing.

The app asks for Gmail send, read-only, and compose scopes. These scopes grant meaningful access, so only use an account you control and understand the permission prompt. Google verification may be required before broad public distribution.

## 6. Run the app

```powershell
npm run dev
```

Open `http://localhost:3000` in your browser. Keep the terminal window open while using the app. Press Ctrl+C in that window to stop it.

## 7. Build and type-check

Run the production frontend build:

```powershell
npm run build
```

Run the TypeScript check:

```powershell
npm run lint
```

The project also has `npm run preview` for previewing the built frontend. The Express API is started by `npm run dev` / `npm run start`.

## 8. What is real and what is currently a demo?

Before relying on the interface, be aware:

- Gemini chat is wired through the Express backend when a valid API key is configured.
- The “10 agents” are a prompt/UI orchestration concept in the current implementation, not ten separately deployed agent services.
- Some CPU, RAM, GPU, and storage values are hard-coded display output.
- Windows 11 terminal responses are emulated; they do not start a separate Windows VM.
- The Linux terminal execution path invokes shell commands on the machine hosting the Express process. It is not a secure cloud sandbox.
- Several app connector entries are catalogue/demo state, not completed provider integrations.

**Security warning:** Do not deploy this version to a public server or expose it to other users. The terminal execution API currently accepts commands without authentication or sandbox isolation. A user who can reach that endpoint may be able to execute commands as the server process. The Vite configuration also injects the Gemini key into a client-side compile-time variable; remove that behavior before treating the project as production-safe.

## 9. Common fixes

**Port conflict:** Set `PORT=3001` in `.env` and restart.

**Gemini API error:** Check the key, API access, and server logs. Restart after changing `.env`.

**Firebase popup error:** Verify the Firebase config, Google provider, authorized domain, and browser popup settings.

**Broken dependency install:** From the project root:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

This removes only installed dependencies; it does not remove project source files.
