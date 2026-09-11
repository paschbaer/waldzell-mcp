# AGENTS.md Template — Clear Thought MCP Server

> **Template usage:** Copy this file to the root of the project that consumes
> the Clear Thought MCP server, rename it to `AGENTS.md`, and fill in the
> `{{PLACEHOLDER}}` values. Delete this block before committing.
>
> - `{{PROJECT_NAME}}`: name of your project
> - `{{DOMAIN_CONTEXT}}`: 1–3 sentences about your project's domain, so the
>   model can pick fitting examples and mental models
> - `{{CODEBASE_ROOT}}`: path the agent should treat as the working root

---

# Clear Thought — Reasoning Tool Guide for {{PROJECT_NAME}}

Domain context: {{DOMAIN_CONTEXT}}. Codebase root: {{CODEBASE_ROOT}}.

You (the agent) have access to the **Clear Thought** MCP server. It provides
structured reasoning tools. This guide tells you **which tool to use when**,
**how to call it correctly**, and **how to chain tools into workflows**.

## Ground rules

1. **Think before you act.** For any non-trivial task, start with
   `sequentialthinking` to plan before using domain tools.
2. **One reasoning step per tool call.** Feed each tool's output into the next
   call — the tools are designed to chain.
3. **Close what you open.** Iterative tools end with a `next*Needed` flag; set
   it to `false` when done. Never leave a thinking sequence dangling.
4. **State lives server-side per session.** Responses include a
   `sessionContext` block with accumulated stats — read it, don't duplicate it.
5. **Prefer the cheapest sufficient tool.** A `mentalmodel` pass is cheaper
   than a full `decisionframework`; use the heavier tools for heavier stakes.

## Calling conventions

Every tool exists **twice**: as an individual tool (e.g. `mentalmodel`) and as
an operation inside a grouped toolset (e.g. `reasoning` with
`operation: 'mentalmodel'`). Both are equivalent. Use whichever your client
exposes; the parameter names are identical except that toolset calls add:

```
{ "operation": "<operation-name>", ...toolParameters }
```

Toolset routing:

| Toolset | Operations |
|---|---|
| `reasoning` | `sequentialthinking`, `mentalmodel`, `debuggingapproach`, `collaborativereasoning`, `decisionframework`, `metacognitivemonitoring`, `socraticmethod`, `creativethinking`, `systemsthinking`, `scientificmethod`, `structuredargumentation` |
| `visualization` | `mind_map`, `concept_map`, `fishbone_diagram`, `swot_analysis`, `issue_tree` |
| `utility` | `analogical_mapper`, `assumption_xray`, `comparative_advantage`, `drag_point_audit`, `safe_struggle_designer`, `seven_seekers_orchestrator`, `value_of_information`, `existing_tool_example` |
| `session` | `session_info`, `session_export`, `session_import` |

## Tool routing table

| When you need to… | Use | Essential parameters |
|---|---|---|
| Plan or reason step by step | `sequentialthinking` | `thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`; optional: `isRevision` + `revisesThought` to correct, `branchFromThought` + `branchId` to explore alternatives, `needsMoreThoughts` to extend |
| Apply a thinking heuristic | `mentalmodel` | `modelName`: `first_principles` \| `opportunity_cost` \| `error_propagation` \| `rubber_duck` \| `pareto_principle` \| `occams_razor`; plus `problem`, `steps`, `reasoning`, `conclusion` |
| Find a bug's root cause | `debuggingapproach` | `approachName`: `binary_search` \| `reverse_engineering` \| `divide_conquer` \| `backtracking` \| `cause_elimination` \| `program_slicing` \| `log_analysis` \| `static_analysis` |
| Deliberate from multiple personas | `collaborativereasoning` | persona + message + iteration pattern; set `nextContributionNeeded` |
| Make a weighted decision | `decisionframework` | `decisionStatement`, `options[]` (name + description), `analysisType`, `stage`, `nextStageNeeded` |
| Audit your own reasoning quality | `metacognitivemonitoring` | `task`, `stage`, `overallConfidence` (0–1), `uncertaintyAreas[]`, `recommendedApproach`, `nextAssessmentNeeded` |
| Stress-test a claim with questions | `socraticmethod` | `stage`: `clarification` → `assumptions` → `evidence` → `perspectives` → `implications` → `questions`; `argumentType`: `deductive` \| `inductive` \| `abductive` \| `analogical` |
| Generate creative options | `creativethinking` | `prompt`, `ideas[]`, `techniques[]`, `connections[]`, `insights[]`, `nextIdeaNeeded` |
| Model a system's dynamics | `systemsthinking` | components + relationships (type: `positive` \| `negative` feedback), emerging patterns |
| Test a hypothesis empirically | `scientificmethod` | `stage`: `observation` → `question` → `hypothesis` → `experiment` → `analysis` → `conclusion` → `iteration`; variables (independent/dependent/controlled/confounding), status: `proposed`/`testing`/`supported`/`refuted`/`refined` |
| Build or attack an argument | `structuredargumentation` | `claim`, `premises[]`, `conclusion`, `argumentType`, `confidence` (0–1) |
| Sketch a diagram of reasoning | `visualreasoning` | `operation` (`create`/`clear`), `diagramId`, `diagramType`, `iteration` |
| Hierarchical brainstorm | `mind_map` | `topic`, `num_branches` |
| Relate concepts with labels | `concept_map` | concepts + annotated relationships |
| Root-cause analysis (many causes) | `fishbone_diagram` | effect + categorized causes |
| Strategic assessment of one subject | `swot_analysis` | `subject` (required); optional `strengths[]`, `weaknesses[]`, `opportunities[]`, `threats[]` — **see dual-mode note below** |
| Decompose a problem into sub-issues | `issue_tree` | problem + depth |
| Find an analogy for a problem | `analogical_mapper` | `problem`, `seedDomains[]` |
| Surface hidden assumptions | `assumption_xray` | `claim`, `context` |
| Pick the best executor for tasks | `comparative_advantage` | `skills` (map of agent → capability scores), `tasks` (map of task → required skills) |
| Find friction in a process log | `drag_point_audit` | `log`, optional `categories[]` |
| Design deliberate practice | `safe_struggle_designer` | `skill`, `currentLevel`, `targetLevel`, optional `constraints` |
| Orchestrate multi-lens research | `seven_seekers_orchestrator` | `query`, optional `downstreamTools[]` |
| Quantify if research is worth it | `value_of_information` | `decisionOptions[]`, `uncertainties[]`, `payoffs[]` |
| Inspect session state | `session_info` | — |
| Persist / restore state | `session_export` / `session_import` | — |

## swot_analysis dual mode

- **Call with only `subject`** when you have not yet gathered content: you get
  a facilitation scaffold with per-quadrant guiding questions. Answer them,
  then call again **with filled arrays**.
- **Call with filled arrays** to get the structured analysis: your content
  passed through, TOWS strategies (`so`/`wo`/`st`/`wt`, derived from 2×2
  pairings), and `scores` (per-quadrant counts, `balance` 0–1, `riskExposure`
  0–1). Low `balance` = incomplete coverage — fill the empty quadrants before
  deciding.
- Never present the facilitation scaffold as an analysis result.

## Workflow recipes

### 1. Debug a failure

```
sequentialthinking (plan, totalThoughts 3–5)
→ debuggingapproach (pick the approachName matching the symptom class)
→ fishbone_diagram (only if multiple candidate causes)
→ metacognitivemonitoring (confidence check before claiming the root cause)
```

### 2. Architecture / technology decision

```
issue_tree (decompose the decision)
→ swot_analysis per serious option (pass content you already know)
→ value_of_information (is more research worth it? if yes: research, then re-run swot)
→ decisionframework (options + weighted analysis)
→ metacognitivemonitoring (before committing)
```

### 3. Stress-test a conclusion you are about to report

```
structuredargumentation (state claim + premises + confidence)
→ socraticmethod (walk clarification → assumptions → evidence)
→ assumption_xray (on the weakest premise)
→ revise the argument; set confidence honestly
```

### 4. Open-ended ideation

```
creativethinking (diverge, several iterations)
→ analogical_mapper (import solutions from other domains)
→ systemsthinking (check the dynamics of the top ideas)
→ mind_map (structure the surviving ideas)
```

### 5. Multi-agent delegation

```
comparative_advantage (map tasks to the best-suited agent)
→ (delegate)
→ drag_point_audit (on the process log afterwards)
→ safe_struggle_designer (if an agent needs skill-building for next time)
```

### 6. Long research question

```
assumption_xray (on the question itself)
→ seven_seekers_orchestrator (multi-lens sweep; downstreamTools to refine)
→ sequentialthinking (synthesize)
→ session_export (persist findings before the context closes)
```

## Anti-patterns (do not do these)

- **Do not** call `swot_analysis` with only `subject` when you already know
  quadrant content — you would get scaffolding instead of analysis.
- **Do not** claim a root cause or decision without having run
  `metacognitivemonitoring` when stakes are high.
- **Do not** set `totalThoughts: 1` and then issue 15 revisions. Estimate
  honestly; use `needsMoreThoughts` if you underestimated.
- **Do not** interleave two unfinished sequences (e.g. two open
  `sequentialthinking` branches) without distinct `branchId`s.
- **Do not** ignore `sessionContext` stats returned by tools — they tell you
  what has already been tried.
- **Do not** re-derive what a tool already structured (e.g. re-listing SWOT
  quadrants in prose after calling `swot_analysis`). Reference the result.

## Session persistence

All tools share one server-side session. For long tasks:

1. Check state: `session_info`.
2. Before your context ends or gets compacted: `session_export`, store the
   payload in the project (e.g. `memory-bank/`).
3. On resume: `session_import`, then continue where the stats say you left
   off.

## Project-specific conventions

<!-- Customize this section per project. Example: -->

- For trading decisions, always run `value_of_information` before requesting
  additional market data.
- For refactors, `issue_tree` depth must not exceed 3.
- Record the chosen option of every `decisionframework` run in
  `memory-bank/decisions.md`.
