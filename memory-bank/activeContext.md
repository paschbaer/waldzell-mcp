# Active Context

## Current Task
agents_guide-MCP-Tool (Branch: `feature/agents-template-docs`) — Template als MCP-Kommando nutzbar machen.

## Status
Neues Tool `agents_guide` (Einzel-Tool + utility-Toolset, Operation `agents_guide`):
- Full-Mode: komplettes AGENTS.md-Dokument, Platzhalter substituiert, Meta-Präambel entfernt,
  unersetzte Platzhalter werden gemeldet.
- Merge-Mode (existing_agents_md): Guide-Body in bestehenden Inhalt integriert, delimitiert
  durch `<!-- clear-thought:agents-guide:start/end -->`-Marker; Repeat-Calls ersetzen den
  Block in place (idempotent). Korrupte Marker → Append + Warning (kein Data Loss).
- Template als generierte TS-Konstante eingebettet (`agents-guide-template.ts`, Sync-Test) —
  immun gegen .dockerignore (*.md) und Smithery-Bundling.

Commits: d1df88b (Template) + f731bc3 (README-Link) + d01d9aa (Review-Fixes) + 7a5cb51
(agents_guide) + 81ea239 (Review-Fixes: E1/E3 embed, E2 Marker-Sanity, E4, E6, E7, E8).

Review-Runde: 1 HIGH (.dockerignore *.md → ENOENT im Container) + 2 MEDIUM (Marker-Data-Loss,
Smithery-Pfad) — ALLE behoben und gegenbewiesen: Docker-Image `:guide-verify` gebaut,
agents_guide im Container geprüft (merge + toolset dispatch grün).
Verify: tsc exit 0, vitest 36/36, E2E am Wire (full/merge/re-merge), Container-Smoke grün.

## Offene Punkte
- User: Branch feature/agents-template-docs nach main mergen und deployen (Server neu
  starten/damit das Tool im Chat verfügbar ist).
- Nutzung im Chat: Agent bitten, `agents_guide` mit project_name/domain_context aufzurufen
  und das `content`-Feld in die Ziel-AGENTS.md zu schreiben.


