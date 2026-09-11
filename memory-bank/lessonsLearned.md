# Lessons Learned

## Avoid These Mistakes

### WSL /mnt/c: Edit-Tools und Terminal können unterschiedliche Datei-Versionen sehen
- **Issue**: replace_string_in_file meldete Erfolg, aber terminal-seitiges grep/git sah den
  alten Inhalt (und umgekehrt) — Änderungen schienen zu "verschwinden".
- **Root Cause**: Caching-/Sync-Lag zwischen VS-Code-Dateidienst und WSL-Terminal auf dem
  Windows-Mount (/mnt/c).
- **Prevention**: Bei Diskrepanzen immer terminal-seitig prüfen (grep/sed) und kritische
  Edits terminal-seitig (python3-Replace) + sofort commit in EINEM Befehl ausführen.

### .dockerignore *.md schluckt neue Markdown-Assets — Build grün, Laufzeit kaputt
- **Issue**: Neues Tool las AGENTS.template.md zur Laufzeit; im Docker-Image fehlte die Datei
  (.dockerignore: `*.md`, nur README ausgenommen) → erster Call ENOENT. Lokal alles grün.
- **Root Cause**: COPY . . kann ignorieren, was .dockerignore ausschließt; Build-Success sagt
  nichts über Laufzeit-Assets.
- **Prevention**: Runtime-Assets entweder als Code einbetten (generierte TS-Konstante +
  Sync-Test) oder explizit `!datei` in .dockerignore. Danach IMMER Container-Smoke-Test.

### Repo hat zwei Lockfile-Ebenen — npm install im Server-Ordner aktualisiert das FALSCHE
- **Issue**: `servers/server-clear-thought/` ist Workspace-Mitglied des Root-Workspaces UND hat ein
  eigenes, in Git getracktes `package-lock.json` (für den Docker-Build via `npm ci`).
- **Root Cause**: `npm install` im Server-Ordner lief nach oben zum Workspace-Root und aktualisierte
  nur die Root-Lockfiles; das server-lokale Lockfile blieb auf SDK 1.12.1 → `npm ci`/docker build
  brach (Review-Fund E1, HIGH).
- **Prevention**: Nach Dependency-Manifest-Änderungen IMMER beide Lockfiles prüfen:
  `git status` zeigt beide; server-lokal am saubersten via isolierte Kopie regenerieren
  (`cp package.json package-lock.json /tmp/x && cd /tmp/x && npm install --package-lock-only`),
  dann zurückkopieren. Validieren mit `npm ci --dry-run`.

### MCP SDK: server.tool() nimmt kein z.union — tools/list serialisiert nur Object-Schemas
- **Issue**: Toolset-Schemas advertisierten als leeres `{"type":"object"}` → `operation` nicht
  übergebbar (`Unknown operation: undefined`).
- **Root Cause**: MCP SDK serialisiert in tools/list nur Object-Schemas (`normalizeObjectSchema`
  → sonst `EMPTY_OBJECT_JSON_SCHEMA`); eine `z.union` als `inputSchema` wird verworfen bzw. von
  alten SDKs stillschweigend verschluckt.
- **Prevention**: Toolset-Muster = flaches Object-Schema mit `operation`-ZodEnum + allen
  Operationsfeldern (optional) advertisen; strenge Validierung per Discriminated-Union im
  Dispatcher ausführen. Registrierung über `server.registerTool()` (SDK >= 1.11).

### npm's minimale Lockfile-Upgrades halten alte Toolchains am Leben — bis der Docker-Build
- **Issue**: Lockfile-Regenerierung aus einem Alt-Lock behielt TypeScript 5.8.3 (statt 5.9.3) →
  TS2589 mit SDK-1.30-Generics, aber NUR im Docker-Build; lokal (Root-node_modules, TS 5.9.3) lief alles.
- **Root Cause**: `npm install` aktualisiert bestehende Lock-Einträge nur minimal (Versionen, die die
  Range erfüllen, bleiben). Root- und Server-Umgebung hatten dadurch unterschiedliche Toolchains.
- **Prevention**: Bei Versions-Scherwen Lockfile KOMPLETT frisch generieren (nur package.json ins
  Temp-Dir, Alt-Lock löschen) und die Zielumgebung (Container!) tatsächlich bauen — `npm ci --dry-run`
  beweist nur Manifest-Sync, nicht Kompilierbarkeit.

### Dockerfile-Base-Images altern: node:18 + MCP SDK 1.30 = 'crypto is not defined'
- **Issue**: Image baute sauber, aber jeder MCP-Request lief auf 400 "Parse error: crypto is not defined".
- **Root Cause**: Globales Webcrypto (`crypto.randomUUID()`) ist erst ab Node 20 stabil; node:18 ist
  seit 2025 EOL, das SDK-Deps-Baum nutzt es zur Laufzeit.
- **Prevention**: Base-Images an aktuelle LTS koppeln (node:22-alpine) und `engines` im Manifest
  ehrlich anheben. Ein Build ohne Laufzeit-Smoke-Test (Health + ein echter Tool-Call) ist kein Test.

### Windows-Exes (docker.exe/cmd.exe) aus WSL-CWDs ohne Windows-Pendant starten nicht
- **Issue**: `docker.exe`/`cmd.exe` liefen aus `/tmp/...` heraus lautlos ins Leere (kein Output,
  kein Build), obwohl der Daemon erreichbar war.
- **Prevention**: Vor jedem Aufruf einer Windows-Exe nach `/mnt/c/...` wechseln; Build-Kontexte auf
  Windows-Pfaden (C:\...) über `cmd.exe /c "cd /d ... && ..."` ansprechen.

### Merge-Konflikt-Marker überleben Builds, wenn niemand baut
- **Issue**: `src/tools/index.ts` enthielt `=======` (TS1185) plus fehlende Imports — der Server
  lief weiter, weil die Instanz aus einem älteren Build stammte.
- **Root Cause**: Merge wurde manuell aufgelöst, ohne `tsc` laufen zu lassen; kein CI-Gate.
- **Prevention**: Nach jedem Merge sofort `npm run typecheck` (bzw. Build) ausführen; Funktionstest
  gegen die LAUFENDE Instanz erkennt Drift zwischen Source und Deployment.

### GitNexus: MCP-Tools "No indexed repositories" — CLI mit --repo-Parameter ist der Ausweg
- **Issue**: `mcp_gitnexus_impact` meldete "No indexed repositories", obwohl der Index
  existierte; erster `analyze`-Lauf brach mit shadow-WAL-IO-Exception auf /mnt/c.
- **Root Cause**: Der MCP-GitNexus-Server und die CLI nutzen getrennte Index-Sichten
  (Session-Mismatch); der WSL-/mnt/c-Index-Build kann transient scheitern und beim
  nächsten Lauf durchlaufen.
- **Prevention**: Impact/detect-changes über die CLI ausführen:
  `node .gitnexus/run.cjs impact <symbol> --repo <name>` bzw. `detect-changes --repo <name>`;
  bei analyze-Fehlern einmal retry, bevor man die Pflicht-Checks als blockiert behandelt.

### zod-to-json-schema dedupliziert wiederverwendete Zod-Instanzen als $ref statt anyOf
- **Issue**: Test erwartete `items.anyOf` in ALLEN vier Quadranten-Feldern des
  Toolset-Schemas; tatsächlich nur beim ersten Feld inline, danach
  `$ref: '#/properties/strengths/items'` → "Target cannot be null or undefined".
- **Root Cause**: zod-to-json-schema ersetzt Wiederholungen derselben Zod-Instanz durch
  $ref auf das erste Vorkommen — semantisch äquivalent, aber nicht anyOf-identisch.
- **Prevention**: Schema-Serialisierungstests müssen beide Formen akzeptieren
  (`items.anyOf ?? items.$ref`); Union-Schemas überleben tools/list trotzdem.

### Spec-Beispielwerte können Rechenfehler enthalten — Formel nachrechnen
- **Issue**: SWOT-v2-Spec nannte pairScore 100 (korrekt: 25×16=400) und
  weighted.riskExposure 0.58 (korrekt: 50/68≈0.74). Blindes Testen gegen die Werte
  hätte die Formel-Implementierung "falsch fixiert".
- **Prevention**: Vor dem Schreiben der Tests jeden Spec-Beispielwert aus der
  definierten Formel ableiten; Diskrepanzen dem User melden und die Formel als
  maßgeblich bestätigen lassen.
