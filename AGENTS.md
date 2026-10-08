<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Antigravity LifeOS Agent Rules

## CRITICAL DATABASE DATA RULE
**ABSOLUTE PROHIBITION ON DIRECT CODE INSERTS / SEEDING DATA:**
You must NEVER insert or seed dummy, mock, test, or synthetic data directly into the database using code, scripts, migrations, or database queries.
**ONLY data entered directly by the USER through the UI forms and modals is permitted in the database.**
When designing UI or APIs, always account for empty states gracefully without synthesizing fake fallback rows in the database.
