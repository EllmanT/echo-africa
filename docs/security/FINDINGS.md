# Security findings register

Audit round 1, 2026-10-18. Method: the repeatable suite in `scripts/security/attack-suite.mjs` (30 checks), run locally against a test database (`eka_test`, separate Atlas cluster) with SMTP, Anthropic and Blob disabled.

| Build | Result |
|---|---|
| Unpatched `main` (Next 14.1.4, self-hosted `next start`) | **16 / 30 passed, 14 failed** |
| `feature/cta-to-form` (all fixes, Next 15.5.28) | **30 / 30 passed** |

Note on the unpatched build: the admin bypass (A1 to A3) was reproduced on a self-hosted server. Vercel strips the exploit header at its edge, so production on Vercel was not reachable that way; the per-route checks remove the dependency on that.

## Confirmed on the unpatched build, now fixed

| ID | Severity | Finding | Evidence on unpatched `main` | Fix |
|---|---|---|---|---|
| F1 | High (self-hosted) / Medium (Vercel) | Admin auth only in middleware; `x-middleware-subrequest` bypass (CVE-2025-29927) | Admin APIs returned 200 to anonymous callers, incl. `POST /api/admin/playbook/generate` (paid) | Next 15.5.28, per-route `requireAdmin`, layout re-check |
| F8 | High | Lead overwrite with a bare lead id (ids appear in email links) | `victim.name=ATTACKER` | Server-signed lead references; bare/forged ids create a new lead |
| F10 | Medium | CSV formula injection in lead export | cell began with `=HYPERLINK(` | Cells starting `= + - @` are prefixed with `'` |
| F4 | Medium | No security headers; `X-Powered-By` exposed | HSTS/XFO/CSP absent | Headers added; CSP in Report-Only |
| F9 | Medium | No global login ceiling; no CSRF origin check; no audit trail | 50 rotating-IP guesses, 0 blocked; cross-site write not rejected | Global ceiling, Origin check (403), `adminAudit` log, 7-day sessions |
| F16 | Medium | Raw `<script>` / `<iframe>` in an article body was served to visitors (JS expressions were already blocked) | `tag=true jsurl=true` | Save-time tag allow-list, render-time neutralising, link scheme check |
| F15 | Medium | Fact-check fetch of cited URLs had no SSRF guard | code review | Public http(s) only, redirects re-checked, size/time limits |
| F-new | Medium | Open redirect after login (`/admin/login?next=https://evil`) | code review | `next` limited to `/admin...` paths |
| F2 | High if misconfigured | Cron accepted `Bearer undefined` when `CRON_SECRET` unset | unit test | Fail closed, constant-time compare, min length |
| F5/F6/F7 | High / Medium | Rate limiter hit Mongo on every request and failed open; email flood risk | design review + suite D1 to D4 | In-memory first gate, login fails closed, body caps, daily email budgets |
| F11 | Low | Unsubscribe changed state on GET | code review | Confirm page + POST |

## Open

| ID | Item | Needs |
|---|---|---|
| F3 | 8 production `npm audit` advisories remain (Sentry v7, PostCSS pinned in Next). `main`'s `package-lock.json` is out of sync with `package.json` (`npm ci` fails) | Sentry upgrade with monitoring re-enable; lockfile now fixed on the Next 15 branch |
| F7b | Turnstile is built and tested (lead form + free review); still needs the two env vars set in Vercel Production | Owner: add env vars, rotate the secret that was pasted in chat |
| F9b | TOTP 2FA, session revocation | Owner decision |
| F12 | `typescript.ignoreBuildErrors` still on (tsc is clean, safe to turn off); Sentry disabled | Phase 4 |
| F13 | Secrets reused between `eka` and `frg` projects; the test Mongo password was shared in chat | Rotate (see SETUP_GUIDE) |
| F17 | Secret scan of full git history | `gitleaks` run |
| CSP | Report-Only, not enforced | A week of clean console |
| Infra | Vercel preview env vars share production values (DB, SMTP, secrets) | Branch-scoped overrides (SETUP_GUIDE) |

## Round 2 additions (2026-10-18)

- Free review endpoint (`/api/review`): 17 attack checks (R1 to R9, T1 to T4) cover oversized bodies, SSRF addresses, bots, per-IP, per-email and global caps, and a missing Turnstile token. All pass. Suite total: **43 / 43**.
- Live model checks: prompt-injection text inside the visitor input did not change the output (no persona change, no prompt leak, no link, no invented price). Thin and unreadable sites get honest answers. Typo addresses are refused before any AI spend.
- Prompt was tightened after review 1 invented a timeline ("these fixes take a day"): no timelines, guarantees or uncited figures.
