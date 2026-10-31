# Security Policy & Audit Report
### HMHS Box Agent & Super Cloud Computer

---

## 1. Security Architecture Summary

The HMHS Box Agent platform prioritizes security across client and server boundaries:

### A. Zero Client-Side Secret Leakage
- **Audit Findings:** Previously, `vite.config.ts` baked `process.env.GEMINI_API_KEY` into client build outputs.
- **Resolution:** All secret injection was removed from `vite.config.ts`. Production API keys remain strictly on the backend or in serverless environment variables.
- **Client Storage:** Optional user-provided keys are saved exclusively in the user's private browser `localStorage` and never transmitted to external services other than the direct Google Gemini endpoint.

### B. Remote Code Execution (RCE) Defense & Terminal Sandboxing
- **Audit Findings:** Unauthenticated execution of arbitrary shell commands (`execAsync(cleanCmd)`) posed a critical vulnerability.
- **Resolution:** Implemented a multi-tier command validator in `server.ts` that enforces a strict sandbox policy:
  - Destructive filesystem commands (`rm`, `unlink`, `shred`, `wipe`, `dd`, `mkfs`) are rejected with exit code 126.
  - Privilege escalation (`sudo`, `su`, `chmod`, `chown`, `passwd`) is blocked.
  - Process destruction (`kill`, `pkill`, `reboot`, `shutdown`, `systemctl`) is prohibited.
  - Secrets and system files (`.env`, `/etc/shadow`, `/etc/passwd`, SSH keys) are inaccessible.
  - Uncontrolled chaining (`&&`, `||`, `;`) and reverse shells (`nc`, `/dev/tcp`, `bash -i`) are blocked.

### C. Google Workspace OAuth 2.0 Security
- **OAuth Implementation:** Client-side only with transient in-memory access tokens.
- **Scopes:** Restricted to explicit user permissions (`gmail.send`, `gmail.readonly`, `gmail.compose`).
- **No Client Secrets:** Uses OAuth 2.0 PKCE / Implicit User Consent flows without embedding client secrets in JavaScript.

### D. Cross-Platform Windows 11 Safety
- Replaced Unix-only shell execution (`rm -rf`) in `package.json` with cross-platform native Node.js filesystem operations, preventing command execution failures on Windows systems.

---

## 2. Reporting Security Vulnerabilities

If you identify a security issue, please contact the maintainers via GitHub repository issues or private advisory.
