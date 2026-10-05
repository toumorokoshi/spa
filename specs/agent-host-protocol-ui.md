# Agent Host Protocol UI Specification

## Overview

The Agent Host Protocol UI is an SPA providing a browser-based client interface for AI agents implementing the [Agent Host Protocol (AHP)](https://github.com/microsoft/agent-host-protocol).

The app is packaged and distributed via `@toumorokoshi/agent-host-protocol-ui` and published alongside the other single-page applications in this repository under `/spa/src/agent-host-protocol-ui/`.

## Behavior & Capabilities

- **Direct WebSocket Connection**: Interacts with local or remote AHP hosts directly over WebSocket (e.g. `ws://127.0.0.1:63877` or custom host with auth tokens).
- **URL Parameter Support**: Supports initializing the host directly via query parameters (`?host=...` or `?url=...`).
- **Session Explorer**: List, filter, switch, rename, and dispose sessions.
- **Conversational Turns**:
  - High-performance streaming markdown rendering.
  - Collapsible reasoning/thinking output with time and token metrics.
  - Rich tool call status visualization with interactive tool confirmation prompts.
  - Turn cancellation and mid-turn steering.
  - Message queuing for queued follow-up prompts.
- **Client-Side Security**:
  - Ephemeral and encrypted storage via Web Crypto API.
  - Zero external tracking, analytics, or third-party asset requests.

## Integration Architecture

- **Dependency**: Installed as `@toumorokoshi/agent-host-protocol-ui` in `package.json`.
- **Vite Integration**:
  - Integrated via `vite-plugins/agent-host-protocol-ui.ts`.
  - In development (`just dev`), the Vite server middleware intercepts `/spa/src/agent-host-protocol-ui/*` and serves the distribution assets from the package.
  - In production builds (`just build` / `vite build`), `closeBundle()` copies the package's `dist` assets into `dist/src/agent-host-protocol-ui/` and rewrites asset URLs to relative paths (`./assets/...`).
- **Landing Page**: Linked from the root index (`/spa/index.html`) as `/spa/src/agent-host-protocol-ui/`.
