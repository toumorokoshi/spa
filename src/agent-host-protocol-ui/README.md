# Agent Host Protocol UI

A fully client-side web interface for services implementing the [Agent Host Protocol (AHP)](https://github.com/microsoft/agent-host-protocol), inspired by the VS Code Agents view.

This SPA is pulled in from the npm package [`@toumorokoshi/agent-host-protocol-ui`](https://www.npmjs.com/package/@toumorokoshi/agent-host-protocol-ui) (upstream repo: [toumorokoshi/agent-host-protocol-ui](https://github.com/toumorokoshi/agent-host-protocol-ui)), currently v0.2.0.

Recent additions in v0.2.0:

- **Multi-host support**: configure multiple AHP hosts; the New Session dialog selects which host to launch a session on (working directories and models populate per host).
- **Passphrase-protected vault**: the entire configuration (hosts, tokens, directories, models, session settings) is encrypted at rest with AES-256-GCM under a master passphrase; an unlock modal appears on load when saved configuration is detected.
- **Session explorer improvements**: working directory dropdowns populated from existing sessions, full directory path tooltip on session hover.
- **HTTP-served fixes**: default WebSocket host derived from `window.location.hostname`, and Web Crypto/vault flows that work when the UI is served over plain HTTP.

## Integration Details

- Sourced from the `@toumorokoshi/agent-host-protocol-ui` npm package.
- Built and integrated via the Vite plugin at `vite-plugins/agent-host-protocol-ui.ts`.
- In development (`just dev`), requests to `/spa/src/agent-host-protocol-ui/` are served by Vite middleware.
- In production (`just build`), static assets and `index.html` are copied to `dist/src/agent-host-protocol-ui/` and served via GitHub Pages.
