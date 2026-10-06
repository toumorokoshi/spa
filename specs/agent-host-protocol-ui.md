# Agent Host Protocol UI Specification

## Overview

The Agent Host Protocol UI is an SPA providing a browser-based client interface for AI agents implementing the [Agent Host Protocol (AHP)](https://github.com/microsoft/agent-host-protocol).

The app is packaged and distributed via `@toumorokoshi/agent-host-protocol-ui` (currently v0.2.0) and published alongside the other single-page applications in this repository under `/spa/src/agent-host-protocol-ui/`.

## Behavior & Capabilities

- **Direct WebSocket Connection**: Interacts with local or remote AHP hosts directly over WebSocket (e.g. `ws://127.0.0.1:63877` or custom host with auth tokens). The default host is derived from `window.location.hostname`, so the app works when served over HTTP on a workstation or over HTTPS via GitHub Pages.
- **Multi-Host Management**: Multiple AHP hosts can be configured and are persisted in an encrypted browser `localStorage` registry. The New Session dialog lets the user select which AHP host to launch the session on (dynamically populating that host's working directories and models) or add a new host inline.
- **URL Parameter Support**: Supports initializing the host directly via query parameters (`?host=...` or `?url=...`).
- **Session Explorer**: List, filter, switch, rename, and dispose sessions. Working directory pickers are populated from existing sessions (sorted by most recent) with a custom "other" fallback, and hovering a session shows its full directory path as a tooltip.
- **Conversational Turns**:
  - High-performance streaming markdown rendering.
  - Collapsible reasoning/thinking output with time and token metrics.
  - Rich tool call status visualization with interactive tool confirmation prompts.
  - Turn cancellation and mid-turn steering.
  - Message queuing for queued follow-up prompts.
- **Client-Side Security**:
  - Ephemeral and encrypted storage via Web Crypto API (AES-GCM-256).
  - **Passphrase-Protected Vault (v0.2.0)**: All application configuration — hosts, tokens, URLs, default directories, models, and session settings — is encrypted together under a single master passphrase (PBKDF2-HMAC-SHA-256, 600,000 iterations, unique salt). When stored configuration is detected on load, an unlock modal prompts for the passphrase before restoring settings.
  - Zero external tracking, analytics, or third-party asset requests.

## Integration Architecture

- **Dependency**: Installed as `@toumorokoshi/agent-host-protocol-ui` in `package.json` (v0.2.0 or later). Upstream releases are picked up by bumping the package version; the Vite plugin consumes the package's `dist` directory, so no code changes are required for upstream asset updates.
- **Vite Integration**:
  - Integrated via `vite-plugins/agent-host-protocol-ui.ts`.
  - In development (`just dev`), the Vite server middleware intercepts `/spa/src/agent-host-protocol-ui/*` and serves the distribution assets from the package.
  - In production builds (`just build` / `vite build`), `closeBundle()` copies the package's `dist` assets into `dist/src/agent-host-protocol-ui/` and rewrites asset URLs to relative paths (`./assets/...`).
- **Landing Page**: Linked from the root index (`/spa/index.html`) as `/spa/src/agent-host-protocol-ui/`.
