# Eka.dev Security Audit and Hardening Plan

Status (2026-10-18): **Implementation started.** Branches: `security-hardening` (Phases 1 and 3 code) and `next15-upgrade` (on top of it: Next 15.5.28 + React 19). Not pushed, not deployed.

| Finding | State |
|---|---|
| F1 middleware bypass | Fixed: Next upgrade + per-route and layout session checks + Origin check on writes. Verified against a production build. |
| F2 cron `Bearer undefined` | Fixed + unit tested |
| F3 npm audit | 28 -> 8 production advisories, 0 critical. Left: Sentry v7 (Phase 4), PostCSS pinned inside Next (build-time) |
| F4 headers | Done; CSP is **Report-Only** (enforce after a week of clean console) |
| F5 rate limiter | Done: in-memory gate before Mongo, login fails closed, body size caps |
| F6 client IP | Done: platform headers trusted first |
| F7 email abuse | Partly: daily and per-address email budgets. Turnstile + verified-address flow still open |
| F8 lead overwrite | Fixed: server-signed lead reference |
| F9 admin auth | Partly: 7-day session, global login ceiling, audit trail, key separation. TOTP 2FA and revocation still open |
| F10 CSV injection | Fixed + tested |
| F11 unsubscribe GET | Fixed (confirm + POST) |
| F12 ignoreBuildErrors / Sentry | Open (Phase 4). `tsc` is now clean, so `ignoreBuildErrors` can be switched off |
| F13 to F17 | Open: need the mirror environment and owner actions (secret rotation, history scan, SSRF/MDX tests) |

Original draft status: DRAFT for owner review.
Date: 2026-10-18 · Stack: Next.js 14.1.4 on Vercel Hobby, MongoDB Atlas M0, Gmail SMTP, GitHub Actions cron, Anthropic API, Sentry free.

## 1. Goals

1. **Availability**: target 99.9% (about 8.7 h downtime per year). Most of this comes from Vercel's platform. What we control: the database, email, cron and not breaking things on deploy.
2. **Abuse resistance**: nobody can deny service to real visitors or leads, spam through our forms, drain our email quota or run up our Anthropic bill.
3. **Confidentiality**: lead data (names, emails, WhatsApp numbers) and admin access stay private.
4. **Zero cost**: everything below uses free tiers only. Where a free tier cannot do something, the plan says so and gives the free workaround.

## 2. Ground rules

- **Never attack production.** All active testing runs against a mirror:
  - Branch `security-audit` cut from `main`, deployed as a **Vercel Preview** (same code as production).
  - A **separate Atlas database** for it. Preferred: a second Atlas *project* with its own free M0 (full isolation, separate credentials). Fallback: a differently named database on the existing cluster with a DB user scoped to only that database.
  - **Separate secrets** for preview (own `SESSION_SECRET`, `CRON_SECRET`, admin password, SMTP set to a throwaway/sink inbox, Anthropic key with a low spend limit, or the generator disabled). Preview must never email real people or touch the production Blob store.
- Production only gets **read-only checks** (headers, TLS, exposed files, `robots`/`sitemap` review).
- Flood and load tests are capped and run only on preview. Vercel's terms and the M0 limits mean we prove behaviour at small scale rather than hammering.
- Every change lands as its own commit on `development` (or a branch off it), reviewed by the owner before it goes to `main`.

## 3. Free-tier constraints that shape the design

| Platform | Constraint (verified by search, 2026-10-18) | Consequence |
|---|---|---|
| Vercel Hobby | Firewall is free on all plans; custom rules allowed, **only 1 rate-limit rule per project**. Platform DDoS protection is on for all plans. Denied/challenged traffic is not billed. [Rate limiting docs](https://vercel.com/docs/security/vercel-waf/rate-limiting), [Firewall changelog](https://vercel.com/changelog/web-application-firewall-mitigated-traffic-is-free-on-vercel) | Use the one rate-limit rule on `/api/*` write routes; the rest of the abuse control lives in code. Exact custom-rule count to be confirmed in the dashboard. |
| Vercel Hobby | Hobby is intended for **non-commercial** use. | Eka is a business site. Risk of account action; flag to owner as a decision (see section 9). |
| Atlas M0 | ~100 connections and **~100 ops/second** cap, no backups, 512 MB, weekly data-transfer cap. [Atlas limits](https://mongodb.com/docs/atlas/reference/free-shared-limitations/) | The current rate limiter does one DB write per request, so a flood can exhaust the DB's op budget and take the whole site down. Rate limiting must move off Mongo for the hot path. Backups must be manual (`mongodump`). |
| Sentry free | Small monthly error quota. | Re-enable with sampling, filter noise, never log secrets/PII. |
| Gmail SMTP | Daily send cap (about 500 per day for personal accounts). | A form flood can lock out our own lead notifications. Needs a daily email budget and a priority lane for owner alerts. |
| GitHub Actions | Free minutes, public-repo-safe secrets handling. | Cron is only as available as GitHub schedules; add a failure alert (partly done in round 3). |

## 4. Findings so far (preliminary, from code reading plus `npm audit`)

Severity here is a first estimate. The audit phase confirms or downgrades each one with a real test.

| ID | Finding | Est. severity | Verify by |
|---|---|---|---|
| F1 | **Next.js 14.1.4** is below 14.2.25, the fix for the middleware auth bypass CVE-2025-29927 (CVSS 9.1; header `x-middleware-subrequest`). Admin auth is *only* in `middleware.ts`; no admin route re-checks the session. Vercel-hosted apps are reported as automatically protected, so real exposure on production is likely lower, but previews, local `next start` and any future move off Vercel are exposed. Many other Next 14.1.x advisories apply (cache poisoning, DoS in image optimizer and server actions). | High until proven otherwise | Send the header to `/api/admin/*` on a local `next start` build and on preview |
| F2 | **Cron auth accepts `Bearer undefined`** when `CRON_SECRET` is unset, and compares with `!==` (not constant time). Affects `/api/cron/nurture` and `/api/cron/playbook`. | High (config-dependent) | Unit test with env unset |
| F3 | `npm audit`: 47 findings (2 critical, 25 high). Many come from `vercel` being a *runtime* dependency (it pulls in `tar`, `uuid`, etc.). | Medium to High | Triage which reach runtime/bundle; move `vercel` to devDependencies |
| F4 | **No security headers**: no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. | Medium | Header scan of preview and production |
| F5 | **Rate limiter is a DB-amplification risk**: one Mongo write per request, and it **fails open** if Mongo errors. On M0 (~100 ops/s) a modest flood degrades or kills the site. | High | Controlled burst test on preview with op counter |
| F6 | `clientIp()` trusts the first `x-forwarded-for` value; spoofable anywhere the platform doesn't overwrite it. Per-IP limits can be bypassed or used to lock out a victim IP. | Medium | Spoof test on preview |
| F7 | **Email abuse**: `/api/leads` sends a confirmation to any typed address (email bombing, sender-reputation damage), and a flood can exhaust the Gmail daily cap so owner alerts stop. | High | Count emails sent per N submissions on preview (sink inbox) |
| F8 | **Partial-lead overwrite**: `upsertLead` accepts a client-supplied `leadId` and `$set`s fields on it. IDs appear in email links, so anyone holding one can edit that lead (`status`, `tier`, `score`, etc. are not allow-listed on the partial stage but spread from validated data; mass-assignment surface needs checking). | Medium | Replay with another lead's ID on preview |
| F9 | Admin auth: single shared password, no 2FA, 30-day JWT with no revocation or rotation, login rate limit is IP-based and fails open, no login audit log. `SESSION_SECRET` is also used as the unsubscribe HMAC key (key reuse). | Medium | Brute-force and session-replay tests |
| F10 | **CSV export** (`leadsToCsv`) may not neutralise cells beginning with `= + - @` (formula injection when opened in Excel). Lead fields are attacker-controlled. | Medium | Submit `=HYPERLINK(...)` lead on preview, export, inspect |
| F11 | `unsubscribe` is a GET that mutates state. Mail scanners that prefetch links can unsubscribe people. | Low | Read code/behaviour |
| F12 | `typescript.ignoreBuildErrors: true` hides type errors that can mask security bugs. Sentry is commented out in `next.config.mjs`, so there is no alerting. | Medium | Run `tsc --noEmit`, count errors |
| F13 | Credentials were reused from the sibling `frg` project (Gmail app password, Anthropic key, Mongo cluster). One leak compromises both projects. | Medium | Inventory + rotation plan |
| F14 | Admin "Generate now" and article cron spend Anthropic money; if admin is bypassed or the cron secret is guessable, an attacker can burn the budget. Monthly budget guard exists in `lib/playbook/budget.ts`; its robustness is untested. | Medium | Read + test budget guard |
| F15 | Article generator fetches URLs returned by web research to confirm claims: potential **SSRF** (internal/metadata addresses, redirects). | Medium | Code review + test with internal URLs |
| F16 | MDX/markdown from Mongo is rendered on the public site. Safe if the tag allow-list is enforced; needs confirming that a poisoned post cannot inject script. | Low to Medium | Render hostile MDX on preview |
| F17 | `.admin-password.local.txt` and `.env.local` sit in the working tree (gitignored, good). Need to confirm they never appeared in git history, build output (`.next`, `out`) or Vercel logs. | Low to Medium | `git log -S`, secret scanner over history |

## 5. How the big players do it (anchor frameworks)

This section is the reference frame; the Phase 0 research pass will add citations.

- **Amazon / AWS**: Well-Architected *Security* pillar and *Reliability* pillar: least privilege, defence in depth, traceability (log everything security-relevant), automate security, protect data in transit and at rest, prepare for incidents with runbooks and game days.
- **Google**: SRE model for uptime: define SLOs and an error budget, alert on symptoms, blameless postmortems, canary/rollback deploys. BeyondCorp-style zero trust for admin access.
- **Meta**: continuous bug-bounty and responsible-disclosure culture, strong automated code scanning in CI, abuse/integrity systems that rate-limit by behaviour not just IP.
- **Large enterprises (for example Toyota group companies)**: governance-led: ISO 27001 style asset inventory, risk register, vendor/supplier review, patch SLAs, incident response plan, regular third-party pentests.
- **Standards we will measure against**: OWASP Top 10 (2021), OWASP ASVS Level 1 (Level 2 for admin), OWASP API Security Top 10, NIST CSF (Identify, Protect, Detect, Respond, Recover), CIS Controls (IG1).

What a one-person agency can realistically copy from these: an asset inventory, a threat model, patch SLAs, automated scanning in CI, alerting, tested backups, an incident runbook, and a `security.txt` for responsible disclosure.

## 6. Phases

### Phase 0: Scope, baseline and threat model (no code changes)
- Create the mirror: branch `security-audit` from `main`, Vercel Preview deployment, separate Atlas project/DB, throwaway secrets, sink inbox (steps in section 8).
- Asset and data-flow inventory: public pages, 8 public/cron APIs, 17 admin APIs, Mongo collections (`leads`, `events`, `rateLimits`, `jobRuns`, posts, projects, faqs, settings), third parties (Vercel, Atlas, Gmail, Anthropic, Sentry, GitHub, Blob, Cal.com, GA4).
- STRIDE threat model for: lead form, admin login, cron endpoints, article generator, email pipeline.
- Define SLOs: availability 99.9% monthly for home, `/contact` and `/api/leads`; lead-form success rate; email delivery rate.
- Research pass with citations for section 5.
- **Exit**: baseline report and the mirror environment working.

### Phase 1: Quick wins on the mirror, then reviewed for `development`
Low-risk, high-value, mostly config:
1. Upgrade Next.js to the latest **14.2.x** patch (smaller jump than 15; revisit 15 later). Run tests and build.
2. Fix cron auth: fail closed when `CRON_SECRET` unset; constant-time compare (F2).
3. Add per-route admin session check as a shared helper called by every `/api/admin/*` handler and admin pages (defence in depth for F1).
4. Security headers in `next.config.mjs`: HSTS, X-Content-Type-Options, X-Frame-Options/`frame-ancestors`, Referrer-Policy, Permissions-Policy, and a **Report-Only CSP first** (GA4, Cal.com, Sentry and image hosts need allow-listing), then enforce (F4).
5. Move `vercel` to devDependencies; triage `npm audit` (F3). Turn on GitHub Dependabot (free).
6. Separate the unsubscribe HMAC key from `SESSION_SECRET` (F9).
7. CSV export: prefix dangerous cells (F10).
- **Exit**: all quick wins pass build and tests on the mirror; owner reviews the diff.

### Phase 2: Audit (active tests on the mirror only)
Test plan, each with pass/fail evidence saved in `docs/security/evidence/`:
- **Authentication/session**: middleware bypass header; brute force against `/api/admin/login` (confirm lockout); cookie flags; JWT tampering, expiry, replay after logout.
- **Authorisation/IDOR**: every `/api/admin/*` route called unauthenticated; lead update with another lead's ID (F8); mass-assignment on lead/project/post payloads.
- **Input handling**: NoSQL operator injection in JSON bodies and query strings (`{"$ne":...}`), oversized bodies, unicode and null bytes, MDX/XSS payloads in lead, post and project fields, CSV injection (F10), header injection in email fields.
- **Abuse and DoS** (small, capped): burst test against `/api/leads`, `/api/events`, `/api/admin/login`; measure Mongo ops, email count, response times, behaviour when Mongo is slow/down (F5, F6, F7).
- **SSRF and outbound**: article research/refetch with internal URLs and redirects (F15).
- **Secrets**: scan full git history, `.next`, `out`, public folder (use `gitleaks` / `trufflehog`, both free); confirm nothing sensitive in client bundles.
- **Config/infra review**: Vercel env scoping and Preview Protection, Atlas user privileges and IP access list, GitHub repo/secret/branch protection settings, Gmail account security (2FA, app-password scope), DNS (SPF, DKIM, DMARC for the sending domain), TLS grade, `security.txt`.
- **Dependencies**: full `npm audit` triage; licence check.
- **Static analysis**: ESLint security rules, `tsc --noEmit` (F12), Semgrep (free) with Next.js/TypeScript rulesets.
- **Output**: findings register (ID, severity via CVSS-style rating, evidence, fix, owner approval).

### Phase 3: Abuse and DoS resistance (free-tier-aware)
- **Replace Mongo-per-request rate limiting** with a layered approach (F5):
  1. Vercel Firewall: use the single rate-limit rule on write APIs, plus a custom rule to block obvious bad traffic. Keep Attack Challenge Mode as a documented emergency switch.
  2. In-memory per-instance token bucket as a cheap first gate (no DB cost).
  3. Mongo-backed limits only for *expensive* actions (lead submit, login) and **fail closed** for login, fail open only for analytics.
- **Lead form bot defence**: add Cloudflare Turnstile (free) in addition to the honeypot and timing check; validate token server-side.
- **Email protection** (F7): never email an unverified typed address on first submit (send owner alert only, confirm lead by link or send only after Turnstile + dedupe); per-address cooldown; daily send budget with an alert at 70%; owner notifications on a priority path; consider a free transactional tier (for example Brevo/Resend free quotas) as a second sender so Gmail's cap isn't a single point of failure.
- **Payload limits**: reject bodies over a few KB on public APIs, bound array and string sizes (schema already helps), cap events per session.
- **Spend guards**: Anthropic key with a hard monthly limit in the console; budget guard test; kill switch setting in admin.
- **Lead integrity**: stop trusting client `leadId` for overwrites: sign it (HMAC) or return an opaque token, and allow-list fields on partial updates (F8).
- **Admin hardening** (F9): longer random password plus TOTP 2FA (free, `otplib`), shorter session (for example 12 hours sliding), session version for revocation, login audit log, lockout after N failures per account not just per IP.
- **Unsubscribe** (F11): GET shows a confirm button; POST performs the change.

### Phase 4: Resilience and 99.9%
- **Monitoring**: free uptime monitor (UptimeRobot or Better Stack free) on `/`, `/contact`, and a lightweight `/api/health` (no DB write) with alerts to email and WhatsApp/Telegram.
- **Sentry**: re-enable with sampling; scrub PII; alert rules for 5xx spikes and cron failures.
- **Degraded mode**: confirm that if Mongo is down, pages still render from static seed data (design intent) and a submitted lead still reaches the owner by email.
- **Backups**: Atlas M0 has none, so schedule `mongodump` via GitHub Actions weekly to an encrypted artifact or private storage; **test a restore** once.
- **Deploy safety**: protect `main` (PR required), use Vercel instant rollback, run `npm test` and `tsc` in CI, drop `ignoreBuildErrors`.
- **Cron reliability**: alert if no successful nurture run in 3 hours or Playbook run missed.
- **Runbooks** (`docs/security/`): site down, DB down, credentials leaked (rotation steps per secret), email quota exhausted, under attack (enable Challenge Mode, tighten rate rule), account compromise.
- **Secret hygiene**: rotate every credential that was reused from `frg`; separate keys per project; add `security.txt` and a rotation calendar (F13, F17).

### Phase 5: Remediate, retest, sustain
- Fix by severity (Critical, High first), one commit per finding, each with a regression test where practical.
- Re-run the full Phase 2 test list against the fixed mirror; close findings only with evidence.
- Owner review, then merge to `main` and deploy.
- Ongoing: Dependabot, monthly `npm audit`, quarterly secret rotation, quarterly re-test, review of Firewall logs.

## 7. Deliverables

- `SECURITY_PLAN.md` (this file, kept up to date)
- `docs/security/findings.md` (the register), `docs/security/threat-model.md`, `docs/security/runbooks.md`, `docs/security/evidence/`
- Fixes as small reviewable commits; a final retest report

## 8. Mirror environment setup (Phase 0 steps)

1. `git checkout main && git checkout -b security-audit` (never push test secrets).
2. Atlas: create a second *project* with a free M0 cluster (or a separate DB plus a scoped DB user). Allow only needed IPs, or 0.0.0.0/0 for preview only because Vercel IPs vary, with a long random DB password.
3. Vercel: connect the branch, set **Preview-only** env vars (separate values from production), turn on Deployment Protection for the preview URL except for the test runs, which use a bypass token.
4. Seed the test DB with `npm run seed`, then add synthetic leads.
5. Point SMTP at a sink inbox, and set `LEAD_NOTIFY_EMAIL` to the sink.

## 9. Decisions and risks for the owner

1. **Vercel Hobby non-commercial terms**: running a lead-gen agency site on Hobby may breach the terms. Options: accept the risk, move the static public pages to a free host with commercial use (for example Cloudflare Pages), or upgrade later. Not blocking the audit.
2. **Cloudflare in front of the site** (free plan, needs DNS on Cloudflare): gives much stronger free DDoS/bot protection and more rate-limit rules than Vercel Hobby. Recommended, but it changes DNS and needs your OK.
3. **2FA for admin** adds a login step; it is the single biggest admin-hardening win.
4. **Second email sender** (free tier) to remove the Gmail single point of failure.
5. Whether to enforce the CSP immediately or run Report-Only for a week first (recommended: Report-Only).
6. Atlas M0 has no backups; a weekly dump to a private location is the free answer.

## 10. Honest limits

- This is an internal audit by the same team that built the code. It finds many issues but is not a substitute for an independent pentest. We can add a free bug-bounty style `security.txt` and a later paid test if the business grows.
- 99.9% is a target, not a guarantee. Free tiers have no SLA, so the plan reduces the chance and blast radius of failures and speeds up recovery.
- Findings in section 4 are from reading code and `npm audit`; none has been exploited or confirmed by a test yet.

## 11. Sources checked

- [Vercel WAF rate limiting](https://vercel.com/docs/security/vercel-waf/rate-limiting)
- [Vercel: WAF-mitigated traffic is free](https://vercel.com/changelog/web-application-firewall-mitigated-traffic-is-free-on-vercel)
- [CVE-2025-29927 (OSV)](https://osv.dev/vulnerability/CVE-2025-29927)
- [Atlas free/shared cluster limitations](https://mongodb.com/docs/atlas/reference/free-shared-limitations/)
