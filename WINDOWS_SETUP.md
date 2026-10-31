# Windows 11 Complete Setup Guide
### HMHS Box Agent on Localhost:3000

This document provides step-by-step instructions specifically formatted for **Windows 11** users using either **PowerShell** or **Command Prompt (CMD)**.

---

## 1. System Requirements

- **Operating System:** Windows 11 (64-bit) Home, Pro, or Enterprise
- **Node.js:** `v22.x LTS` (Download from [nodejs.org](https://nodejs.org/))
- **Terminal:** Windows Terminal with PowerShell 7 or Windows PowerShell 5.1, or Command Prompt (cmd.exe)
- **Git:** Git for Windows (Download from [git-scm.com](https://git-scm.com/))

Verify your installations:

```powershell
node --version
# Expected: v22.x.x

npm --version
# Expected: 10.x.x or higher

git --version
# Expected: git version 2.x.x
```

---

## 2. Windows Execution Policy (PowerShell Only)

If you encounter an error like `cannot be loaded because running scripts is disabled on this system`, run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Press `Y` to confirm.

---

## 3. Clone and Environment Setup

### In PowerShell:

```powershell
# 1. Clone repository
git clone https://github.com/noity0/hmhs-box-agent.git
cd hmhs-box-agent

# 2. Copy environment file
Copy-Item .env.example .env

# 3. Open in Notepad to add your Gemini API Key
notepad .env
```

### In Command Prompt (CMD):

```cmd
:: 1. Clone repository
git clone https://github.com/noity0/hmhs-box-agent.git
cd hmhs-box-agent

:: 2. Copy environment file
copy .env.example .env

:: 3. Open in Notepad
notepad .env
```

In `.env`, configure:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 4. Install Dependencies

In either PowerShell or CMD:

```powershell
npm install
```

All dependencies (`pptxgenjs`, `xlsx`, `docx`, `jspdf`, `file-saver`, `@google/genai`, `lucide-react`, etc.) will install cleanly.

---

## 5. Run Development Server on Port 3000

```powershell
npm run dev
```

You should see:

```
[HMHS Box Cloud Computer] Server running on port 3000
  ➜  Local:   http://localhost:3000/
```

Open your browser to:
👉 `http://localhost:3000`

---

## 6. Windows Port 3000 Conflict Resolution

If port 3000 is occupied by another process on Windows:

```cmd
:: In CMD or PowerShell: Find process ID using port 3000
netstat -ano | findstr :3000

:: Kill the process (replace <PID> with the number from the last column)
taskkill /PID <PID> /F
```

Then rerun `npm run dev`.

---

## 7. Windows Clean and Build Commands

The clean script is cross-platform and will not crash on Windows:

```powershell
# Clean build artifacts:
npm run clean

# Compile production build:
npm run build

# Start production server:
npm start
```
