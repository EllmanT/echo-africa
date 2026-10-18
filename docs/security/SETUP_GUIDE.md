# Setup guide: test deployment, Cloudflare, CSP, production safety

## 1. Production always comes from `main`

Verified 2026-10-18 from the Vercel deployment log:
- Vercel's Production Branch is `main` (every Git deployment of `main` is Production, every other branch is Preview).
- The "production = development" you saw came from **CLI deploys**: `npm run deploy` runs `vercel --prod`, which ships whatever branch is checked out locally. Several of those ran from `development`.

Safeguards, in order of strength:
1. **Done in code:** `npm run deploy` now refuses unless you are on a clean `main` that matches `origin/main` (`scripts/deploy-guard.mjs`).
2. Release = merge into `main`, push. Vercel deploys Production from Git by itself. Do not run `vercel --prod` by hand.
3. Vercel: Project > Settings > Git > confirm **Production Branch = main**.
4. GitHub: Settings > Branches > add a rule for `main` (require a pull request). Branch protection availability depends on your GitHub plan for private repos.
5. To ship `development` on purpose: Vercel > Deployments > pick the deployment > "Promote to Production".

## 2. The preview URL that keeps changing

Every deployment gets its own hash URL (`echo-africa-5giatabd2-...`). Each branch also gets a **stable alias**:
`https://echo-africa-git-<branch>-tapiwa-ellmans-projects.vercel.app`
For the test mirror: `https://echo-africa-git-security-baseline-tapiwa-ellmans-projects.vercel.app`

## 3. Make the test deployment safe (do before any remote testing)

Today every Preview deployment uses the **production** database, email and secrets. Fix for the mirror branch only:
1. Vercel > Project > Settings > Environment Variables.
2. For each line in `.env.preview.local` (gitignored, in the repo folder): Add New, Name/Value, Environment = **Preview**, then choose the branch `security-baseline`.
3. Atlas (test project) > Network Access > allow `0.0.0.0/0` for the test cluster only (Vercel IPs vary).
4. Settings > Deployment Protection > Protection Bypass for Automation > Add: copy the secret into `VERCEL_BYPASS_TOKEN=` in `.env.preview.local`.
5. Redeploy `security-baseline` (Deployments > ... > Redeploy), since env changes only apply to new builds.

## 4. Cloudflare for eka.dev (free plan)

Current state: DNS at Namecheap (`dns1/dns2.registrar-servers.com`), `A eka.dev -> 216.198.79.1`, `CNAME www -> a2493ec66025a4f0.vercel-dns-017.com`, one Google verification TXT, no mail records.

1. Cloudflare > Add a domain > `eka.dev` > Free plan.
2. Review the imported records. Must exist: `A @ 216.198.79.1`, `CNAME www a2493ec66025a4f0.vercel-dns-017.com`, the `google-site-verification` TXT. Keep both web records **Proxied** (orange cloud).
3. Namecheap > Domain List > Manage `eka.dev` > Nameservers > Custom DNS > enter the two Cloudflare nameservers. If DNSSEC is on at Namecheap, turn it off first.
4. Wait for Cloudflare's "active" email (minutes to a few hours). The site stays up throughout.
5. SSL/TLS > Overview: set **Full** (not Flexible: redirect loops; Vercel's docs say Full). Edge Certificates: Always Use HTTPS = on, Minimum TLS = 1.2.
6. Speed > Optimization: Rocket Loader **off**. Scrape Shield: Email Address Obfuscation **off**.
7. Security > Bots: Bot Fight Mode **on**, but only after the Vercel domain shows valid (it can block certificate checks during setup).
8. Security > WAF: enable the free managed ruleset. Add one rate-limit rule: requests to a path starting `/api/` with method POST, more than 15 per 10 seconds from one IP, action Block.
9. Turnstile > Add widget: hostnames `eka.dev`, `www.eka.dev`, mode Managed. Give the **site key** (public) to Claude; put the **secret key** straight into Vercel env as `TURNSTILE_SECRET_KEY`.
10. Check: `curl -I https://www.eka.dev` shows `server: cloudflare` and a `cf-ray` header.

Code already prepared: `clientIp()` believes `cf-connecting-ip` only when the connection came from Cloudflare's published ranges (re-check https://www.cloudflare.com/ips-v4 and /ips-v6 quarterly).
Rollback: set the two web records to DNS only (grey cloud), or point Namecheap back to its default nameservers.

## 5. Checking the CSP (Content-Security-Policy) in Report-Only mode

The CSP is deliberately not enforced yet. The browser only reports what it *would* have blocked.
1. Open https://www.eka.dev in Chrome, press F12, open the **Console** tab.
2. Visit Home, Contact (click through the form to the end), a Work page, a Playbook article, Services.
3. Look for red/yellow lines starting `[Report Only] Refused to load ...`. Each names the blocked source.
4. Silence = ready to enforce. Any line = a legitimate service (analytics, fonts, booking widget) that needs adding to the allow-list in `next.config.mjs`. Send Claude the lines.
5. Do this for about a week of real use, then rename the header from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

## 6. Rotate after testing
- Atlas: delete or change the password of the test DB user (it was shared in chat) and scope any new user to `eka_test` only.
- Reused credentials between `eka` and `frg` (Gmail app password, Anthropic key, Mongo cluster): give each project its own.
