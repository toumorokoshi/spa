# Agent Host Protocol UI

Single-page app published under `/spa/src/agent-host-protocol-ui/`: provides a client-side web interface for interacting with and driving agents running the [Agent Host Protocol (AHP)](https://github.com/microsoft/agent-host-protocol).

The SPA is sourced from the npm package [`@toumorokoshi/agent-host-protocol-ui`](https://www.npmjs.com/package/@toumorokoshi/agent-host-protocol-ui) (upstream repo: [toumorokoshi/agent-host-protocol-ui](https://github.com/toumorokoshi/agent-host-protocol-ui)).

## Usage

1. Open `/spa/src/agent-host-protocol-ui/`.
2. Connect to an AHP-compliant host via WebSocket (e.g. `ws://127.0.0.1:63877` or with connection token query parameter `?host=ws://...`).
3. Manage sessions in the left sidebar (create, switch, archive, or delete sessions).
4. Send prompts, steer turns mid-flight, or enqueue follow-up turns.
5. Review streaming assistant responses, collapsible reasoning traces, and interactive tool call approval cards.

## Offline and Local-Only Characteristics

- Completely client-side: all communication is strictly between the browser and the target WebSocket host configured by the user.
- Zero external CDNs or analytics tracking.
- Pre-built static bundle integrated into the Vite build and served via GitHub Pages under `/spa/src/agent-host-protocol-ui/`.

See `specs/agent-host-protocol-ui.md` for architectural and behavioral specifications.
