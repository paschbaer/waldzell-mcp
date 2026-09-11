# Active Context

## Current Task
SWOT v2 für `swot_analysis` (Branch: `feature/enhance-swot-analysis`, aufbauend auf dem
v1-Dual-Mode-Upgrade 094e46a + 2fd7e91) — Gewichte, Priorisierung, topN, Tag-Matching
(Spec: Tradix/Temp/clearthought-swot-v2-spec.md).

## Status
swot_analysis war ein Stub (subject in feste Templates interpoliert). Upgrade auf Dual-Mode:
- Facilitation (default, ohne Inhalte): Vier-Quadranten-Scaffold + Leitfragen pro Quadrant,
  aufrufendes LLM liefert Inhalte und ruft erneut auf.
- Analysis (mind. ein Quadrant gefüllt): Passthrough der Inhalte, TOWS-Strategien
  (SO/WO/ST/WT, 2x2-Pairings pro Familie), Scores (Counts, balance = 1-(max-min)/total,
  riskExposure = (weaknesses+threats)/total), nextSteps mit Verweis auf
  decisionframework/mentalmodel als Kopplung.
- Schema: subject required (trim+min(1)), 4 optionale String-Arrays; Whitespace-Filter.
- Toolset: visualization advertised die neuen optionalen Felder automatisch.

Commits: 094e46a (Feature) + 2fd7e91 (Review-Kommentare: subject-Validierung,
Balance-Semantik dokumentiert/getestet, README-Doku).

Verify: tsc exit 0, vitest 26/26, E2E auf Port 3001 (Wire): advertised fields,
facilitation-Scaffold, Toolset-Dispatch mit TOWS+Scores (z. B. Polars vs. DuckDB).
Review: approve with comments (0 HIGH/CRITICAL), alle Kommentare umgesetzt.

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

Implementierung COMPLETE, committed als d38f1e0 (feat, 3 Dateien):
- `src/tools/swot-analysis.ts`: Entry-Union (string | {text, impact 1-5, likelihood 1-5,
  tags}, Defaults 3/3), Normalisierung, pairScore = entryScore(a)×entryScore(b), stabiles
  Ranking + topN-Cut (0 = unbegrenzt, hebt den v1-firstTwo-Cap auf), matchMode all|tags
  (case-insensitive, sharedTags = Schnittmenge in Schreibweise der ersten Paarseite),
  Output: normalisierte Quadranten (BREAKING), scores.weighted, towsRanked, meta
  (truncatedPerQuadrant, weightedEntries, unpaired). Facilitation-Mode unverändert.
- 2 dokumentierte Breaking Changes: topN Default 5 und normalisierter Quadranten-Output.
- Spec korrigiert: Testfall 3 pairScore 400 (25×16), Testfall 8 riskExposure ≈0.74
  (50/68) — Formeln maßgeblich, Beispielwerte waren Rechenfehler.
- Tests: 27 in tests/swot-analysis.test.ts (alle 17 Spec-Cases + Review-Edge-Cases);
  Suite 46/46 grün, tsc exit 0.
- Review (Subagent, PRE-Commit): 0 HIGH / 0 CRITICAL; 10 Findings — 8 gefixt (Tests,
  Scores-Interface), 2 dokumentiert/akzeptiert (README-Sätze, $ref-Feldordnung).
- detect_changes (GitNexus CLI): 3 Dateien, Risiko LOW, nur erwartete Symbole.
- README-SWOT-Abschnitt aktualisiert (Breaking Changes, Tag-Matching, weightedEntries).


## Offene Punkte
- User: Branch feature/enhance-swot-analysis nach main mergen und deployen
  (inkl. fix-review-findings, falls noch nicht separat gemerged). Beim
  nächsten Docker-Build Container-Smoke für SWOT v2 (tools/list + tags-Mode-Call).
- Alt: Instanz auf Port 3000 neu starten, MCP-Client neu verbinden.
- User: Branch feature/agents-template-docs nach main mergen und deployen (Server neu
  starten/damit das Tool im Chat verfügbar ist).
- Nutzung im Chat: Agent bitten, `agents_guide` mit project_name/domain_context aufzurufen
  und das `content`-Feld in die Ziel-AGENTS.md zu schreiben.


