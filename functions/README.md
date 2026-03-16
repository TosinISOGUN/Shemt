# Shemt Backend Development Guidelines

This document outlines the security-first approach for all backend work in the Shemt project.

## 🔒 Security Rules

1. **Strict No-Secrets Policy**: Never hardcode API keys, project IDs, or sensitive strings.
2. **Environment Variables**: Use `Deno.env.get()` for all sensitive configurations.
3. **Git Safety**: Always verify `git status` before committing. Ensure `.env.local` and other sensitive files are ignored.
4. **Logic Isolation**: Keep backend logic (Edge Functions) completely separate from frontend components.

## 🛠 Workflow

- **Local Development**: Use `.env.local` for local secrets. 
- **Deployment**: secrets must be updated in the hosting dashboard (e.g., Supabase, Blink).
- **Audit**: Every new function must undergo a security audit before being merged.

## 📁 Directory Structure

- `functions/`: Contains Deno-based Edge Functions.
- `src/services/`: Frontend services that interface with the backend.

---
*Following these guidelines is mandatory to protect user data and project integrity.*
