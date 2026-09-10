# Remaining Work Plan

| Finding / Item | Trigger Point | Status / Aktion |
|---|---|---|
| E1 (HIGH): server-lokales package-lock.json pinnte SDK 1.12.1 trotz Manifest ^1.30.0; bricht `npm ci`/docker build | Docker-Build oder `npm ci` im Server-Verzeichnis | **BEHOBEN** (Commit 82a97b9, `npm ci --dry-run` exit 0). Nur noch prüfen, falls Docker-Image gebaut wird. |
| Docker-Build selbst nicht ausgeführt (kein Docker in WSL-Umgebung) | Beim nächsten Image-Build (`npm run docker:build`) | Akzeptierte Beobachtung: Lockfile-Konsistenz ist per `npm ci --dry-run` bewiesen; Image-Build als Smoke-Test nachholen. |
| E6 (LOW): bei Union-Validierungsfehlern ist `issues[0]` generisch (`invalid_union`) | Wenn präzisere Fehlermeldungen pro Feld benötigt werden | Akzeptiert; Meldung enthält Operation + Toolset. Bei Bedarf: erste Abweichung pro Operation gezielt extrahieren. |
| E4 (LOW): advertised-Schema bei Feldnamen-Kollisionen: erste Operation gewinnt | Wenn zwei Operationen eines Toolsets denselben Feldnamen mit differentem Typ einführen | Akzeptiert (im Code kommentiert). Vor dem Einführen kollidierender Felder Schema-Struktur überdenken. |
| Neustart der Produktiv-Instanz auf Port 3000 + MCP-Client-Reconnect | Nächste Nutzung der Clear-Thought-Tools aus VS Code | Offen (User-Aktion). |
| Merge des Feature-Branch nach `main` (Squash) | Wenn User den Abschluss bestätigt | Offen (User-Entscheidung). |
