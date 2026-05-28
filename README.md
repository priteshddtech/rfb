# RFB (Form Builder)

Monorepo for a drag-and-drop form builder + renderer SDK (TypeScript/React) and supporting apps (playground, docs site, SaaS, WordPress).

## Workspace

This repo uses **pnpm workspaces** + **Turborepo**.

### Common commands

```bash
pnpm install
pnpm dev
pnpm build
```

## Packages (planned)

- `@rfb-ddt/schema` — JSON form schema + types
- `@rfb-ddt/core` — engine + plugin model (framework-agnostic)
- `@rfb-ddt/builder-react` — drag-and-drop builder UI
- `@rfb-ddt/renderer-react` — form renderer runtime
