# Active Context

## Current Task
functional-tool-upgrades (Branch: `feature/functional-tool-upgrades`)
Vorher (alle in main): agents-template-docs (43780d2/2c26c71 inkl. agents_guide-Tool),
enhance-swot-analysis (inkl. swot v2 d38f1e0 aus Tradix-Session: weighted/ranked TOWS,
topN, tags; 16852be).

## Status
AUDIT: 8 Tools waren Template-Stubs (assumption_xray, drag_point_audit, seven_seekers,
analogical_mapper, mind_map, concept_map, fishbone, issue_tree), 3 teils fake (voi,
comparative_advantage, safe_struggle). ALLE 11 umgebaut auf das swot-Pattern:
- Analysis-Mode aus Caller-Inhalten (echte Berechnung) + mode-Feld
- Facilitation-Scaffold mit Leitfragen ohne Inhalte — NIE Fabrication
- Highlights: drag_point_audit parst Logs wirklich (Keyword-Counts, Repeats, Density);
  assumption_xray Heuristiken (universal/causal/necessity/comparative) mit Evidence +
  falsification_test; comparative_advantage echtes Per-Skill-Matching (BREAKING:
  skills = record<agent, {skill: level}>); voi = EVPI-Stil mit Ranking

Commits: 29d0b0b (Feature) + b89f9d6 (Review-Fixes).
Review: approve with comments (0 HIGH/CRITICAL). M1 = False Positive (Datei-Cache des
Reviewers). M2 (swot-v1-Doku auf v2 aktualisiert), L1/L2 (min(1)), L3 (leere categories
→ Defaults), L4 (sessionContext-Beispiel) — behoben. L5 (Testlücken-Doku) akzeptiert.
AGENTS.template.md: Routing-Tabelle + Dual-Mode-Abschnitt + swot-v2-Kontrakt; Konstante
regeneriert (Sync-Test grün).

Verify: tsc exit 0, vitest 68/68, E2E am Wire (drag-scan, Heuristiken, Per-Skill-Matching,
mind_map beide Modi, issue_tree, voi, seven_seekers), detect-changes risk low.

## Offene Punkte
- User: Branch feature/functional-tool-upgrades nach main mergen + deployen.
- L5 (akzeptiert): Extra-Tests (seven_seekers-Defaults, Tie-Breaks, biweekly-Grenze,
  issue_tree-Depth-Grenzen) nur falls die Tools produktiv kritisch werden.


## v2-Erweiterungen (f16cc06 + Nit-Fix, 2026-09-11)
Alle drei Kategorie-2-Tools erweitert:
- value_of_information: probabilities[] (gewichtet statt worst-case), option_payoffs
  (per-Option-VoI-Ranking), sampled_uncertainties (partial VoI + share_of_total),
  Facilitation-Scaffold bei leeren Unsicherheiten
- comparative_advantage: capacity (greedy Multi-Task-Assignment, Erschoepfung ->
  assignee null + Warning), costs (effective = skill/cost), assignment_mode-Feld
- safe_struggle_designer: typed time fields (hours_per_week, session_minutes,
  deadline_weeks) statt totem constraints-Record; success_criteria +
  prerequisite_chain je Step; estimated_weeks + Deadline-Overrun-Warnings
Review: approve (0 HIGH/CRITICAL). MEDIUM "Tests fehlen" = False Positive
(Datei-Cache; Tests sind auf Disk, 78/78 gruen). Nits behoben:
Probability-Warning-Dedup (hoisted). verify: tsc 0, vitest 78/78.
Offen: Branch merge + deploy;LOW-Notes (localeCompare ICU, breakdown statisch im
Capacity-Fall) dokumentiert und akzeptiert.