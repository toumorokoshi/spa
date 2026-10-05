# Agent Host Protocol UI

A fully client-side web interface for services implementing the [Agent Host Protocol (AHP)](https://github.com/microsoft/agent-host-protocol), inspired by the VS Code Agents view.

This SPA is pulled in from the npm package [`@toumorokoshi/agent-host-protocol-ui`](https://www.npmjs.com/package/@toumorokoshi/agent-host-protocol-ui) (upstream repo: [toumorokoshi/agent-host-protocol-ui](https://github.com/toumorokoshi/agent-host-protocol-ui)).

## Integration Details

- Sourced from the `@toumorokoshi/agent-host-protocol-ui` npm package.
- Built and integrated via the Vite plugin at `vite-plugins/agent-host-protocol-ui.ts`.
- In development (`just dev`), requests to `/spa/src/agent-host-protocol-ui/` are served by Vite middleware.
- In production (`just build`), static assets and `index.html` are copied to `dist/src/agent-host-protocol-ui/` and served via GitHub Pages.
