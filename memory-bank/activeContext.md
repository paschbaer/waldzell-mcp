# Active Context

## Current Task
agents-template-docs (Branch: `feature/agents-template-docs`, gestapelt auf enhance-swot-analysis)
Abgeschlossen: enhance-swot-analysis (094e46a, 2fd7e91) — vom User nach main gemerged.

## Status
AGENTS.md-Template erstellt: `servers/server-clear-thought/AGENTS.template.md` — englischer
Usage-Guide für LLM-Agents, die den Clear-Thought-Server konsumieren:
- Routing-Tabelle für alle 28 Einzel-Tools + 4 Toolset-Dispatch-Tabellen
- 6 Workflow-Rezepte (Debug, Entscheidung, Argument-Stresstest, Ideation, Delegation, Research)
- swot-Dual-Mode-Regeln, Anti-Patterns, Session-Persistenz, Projekt-Anpassungssektion
- Platzhalter {{PROJECT_NAME}} / {{DOMAIN_CONTEXT}} / {{CODEBASE_ROOT}}

Commits: d1df88b (Template) + f731bc3 (README-Verweis) + d01d9aa (Review-Fixes).
Review Runde 1: automatisierte Abdeckungsprüfung (32/32 Namen, alle Enums) + Subagent-Review
fand HIGH #8 (camelCase-Parameternamen — hätten echte Calls gebrochen), MEDIUM #9
(visualreasoning-Enum), MEDIUM #4 (Debugging-Liste unvollständig) — ALLE behoben in d01d9aa.
Verify: grep 0 falsche Namen, alle 12 Debugging-Approaches, vitest 26/26, tsc exit 0.

## Offene Punkte
- User: Branch feature/agents-template-docs nach main mergen.
- Achtung (Lesson): Edit-Tool-Änderungen an README.md auf /mnt/c wurden twice still reverts —
  kritische Edits auf diesem Mount terminal-seitig machen + sofort committen.

