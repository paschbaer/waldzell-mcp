# Progress

## What works
- Clear-Thought-MCP-Server baut wieder (`tsc` exit 0) — vorher TS1185 durch Merge-Konflikt in `src/tools/index.ts`.
- Alle 4 Toolsets (`reasoning`, `visualization`, `utility`, `session`) advertisen korrekte Schemas
  (`operation`-Enum + Felder) und dispatchen funktionierend — vorher `Unknown operation: undefined`.
- Hybrides Tool-Angebot: 26 Einzel-Tools + 4 Toolset-Tools (32 sichtbar in tools/list).
- Testsuite: 15/15 grün (4 Dateien), inkl. neuer Regressionstests (`tests/toolset-registry.test.ts`).
- Lockfiles konsistent: Root (Workspace) und server-lokal (Docker `npm ci`), SDK 1.30.0.

## What's left
- User: Instanz auf Port 3000 neu bauen/starten, VS-Code-MCP-Client neu verbinden.
- User: Feature-Branch `feature/fix-clear-thought-toolset-schemas` nach `main` mergen (Squash).
- User: Branch feature/enhance-swot-analysis nach main mergen (Squash) + Deploy; beim
  nächsten Docker-Build Container-Smoke für SWOT v2.

## Current State
Commits auf Feature-Branch: `0995706` (Haupt-Fix: registry.ts, tools/index.ts, Tests, README,
Dependency-Range) + `82a97b9` (Review-Follow-up: server-lokales Lockfile synchronisiert) +
`c27a860` (Docker-Smoke: Lockfile frisch generiert, Base-Image node:22-alpine, engines >=20).
Dazwischen liegt der User-Commit `cdce73d` (GitNexus-Skills).
Review-Ergebnis: alle HIGH-Funde behoben; Docker-Image testweise gebaut und funktionstüchtig
verifiziert (`:fix-verify`), `latest` unangetastet.

## Abgeschlossene Vorgänge (Historie, Stand 2026-09-10)

### Review-Findings-Branch (gemerged nach main: origin/main = 9d66bff)
- Runde 2 (`1c51f1b`): E4-Kollisionstest, E6-präzise Fehlermeldungen, E9-README-Naming-Notiz,
  E15-Root-SDK-Range ^1.30.0 + Lockfile-Sync. tsc exit 0, vitest 19/19.
- Runde 3 (`5dbb3a3`): Guard in addOperation gegen reserviertes 'operation'-Feld. Der Guard
  deckte den latenten visualreasoning-Dispatch-Bug auf → aus dem visualization-Toolset entfernt
  (Einzel-Tool bleibt), visualization = 5 Operationen. Optionsliste bei unbekannter Operation,
  README-Wording korrigiert, Kollisions-Symmetrie-Test. vitest 19/19, E2E auf Port 3001 grün.

### SWOT-Upgrade (Branch feature/enhance-swot-analysis: 094e46a + 2fd7e91)
- swot_analysis vom Stub zum Dual-Mode: Facilitation-Scaffold (Leitfragen) ohne Inhalte,
  Analysis mit Passthrough + TOWS (SO/WO/ST/WT) + Scores (Counts, balance, riskExposure)
  + Kopplungshinweise (decisionframework/mentalmodel).
- Review: approve with comments (0 HIGH/CRITICAL); Kommentare umgesetzt (subject trim+min(1),
  Balance-Semantik dokumentiert/getestet, README-Doku). tsc exit 0, vitest 26/26,
  E2E-Wire-Verifikation auf Port 3001 grün.

### AGENTS.md-Template (Branch feature/agents-template-docs: d1df88b + f731bc3 + d01d9aa, offen)
- servers/server-clear-thought/AGENTS.template.md: englischer LLM-Usage-Guide (Routing-Tabelle
  28 Tools + 4 Toolsets, 6 Workflow-Rezepte, SWOT-Dual-Mode-Regeln, Anti-Patterns, Session-Guide,
  {{PLATZHALTER}}-Sektion). README verlinkt das Template.
- Review fand HIGH #8 (camelCase-Parameternamen), MEDIUM #9 (visualreasoning-Enum),
  MEDIUM #4 (Debugging-Liste) — alle in d01d9aa behoben; 0 falsche Namen per grep verifiziert.
  vitest 26/26, tsc exit 0.

### SWOT v2 (Commit d38f1e0, 2026-09-11)
- swot_analysis v2 nach Spec (Tradix/Temp/clearthought-swot-v2-spec.md): Entry-Union
  (string | Objekt mit impact/likelihood 1-5, tags), Normalisierung (Defaults 3/3),
  pairScore-Ranking mit stabilem Tiebreaker, topN (Default 5, 0 = unbegrenzt; hebt den
  alten firstTwo-Cap auf), matchMode all|tags (case-insensitive, unpaired-Tracking),
  scores.weighted, meta. Quadranten-Output normalisiert (BREAKING, User-Entscheidung).
- Spec-Korrekturen: Testfall 3 pairScore 400 statt 100, Testfall 8 riskExposure ≈0.74
  statt 0.58 (Formeln maßgeblich; Beispielwerte waren Rechenfehler).
- Tests 27 in swot-analysis.test.ts (17 Spec-Cases + Review-Edge-Cases), Suite 46/46,
  tsc 0. Review: 0 HIGH/CRITICAL; 8 Findings gefixt, 2 dokumentiert/akzeptiert.
- GitNexus: MCP-Tools meldeten "No indexed repositories" — CLI
  (`node .gitnexus/run.cjs impact <symbol> --repo waldzell-mcp`) funktionierte nach
  Index-Build; detect-changes ergab Risiko LOW mit exakt den 3 erwarteten Dateien.
