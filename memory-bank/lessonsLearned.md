# Lessons Learned

## Avoid These Mistakes

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

### Merge-Konflikt-Marker überleben Builds, wenn niemand baut
- **Issue**: `src/tools/index.ts` enthielt `=======` (TS1185) plus fehlende Imports — der Server
  lief weiter, weil die Instanz aus einem älteren Build stammte.
- **Root Cause**: Merge wurde manuell aufgelöst, ohne `tsc` laufen zu lassen; kein CI-Gate.
- **Prevention**: Nach jedem Merge sofort `npm run typecheck` (bzw. Build) ausführen; Funktionstest
  gegen die LAUFENDE Instanz erkennt Drift zwischen Source und Deployment.
