# Active Context

## Current Task
enhance-swot-analysis (Branch: `feature/enhance-swot-analysis`, gestapelt auf fix-review-findings-clear-thought)
Abgeschlossen: fix-review-findings-clear-thought (in main gemerged: origin/main = 9d66bff).

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

## Offene Punkte
- User: Branch feature/enhance-swot-analysis nach main mergen und deployen
  (inkl. fix-review-findings, falls noch nicht separat gemerged).

