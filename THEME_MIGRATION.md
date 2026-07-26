# Dark → Light Theme Migration — What Changed & How to Test

Full plan this implements: `C:\Users\Ropafadzo Muridzi\.claude\plans\staged-finding-karp.md`

## Why

The site was dark-by-default (`next-themes` `defaultTheme="dark"`) with ~21 component
files hardcoding dark colors directly (near-black card backgrounds, white glow effects,
dark button pills) that bypassed the shadcn CSS-variable system entirely. This migrates
the whole site to a single light theme: white base, brand purple leading as the primary
accent, blue as a secondary/gradient partner, decorative effects recolored (not removed)
to work on a light background.

## Before you look at it: get the dev server running

`npm install` failed during this session because the C: drive had 0 bytes free. Free up
space first, then:

```
npm install
npm run dev
```

Open `http://localhost:3000`.

## New palette (`app/globals.css` / `tailwind.config.ts`)

| Token | Old (dark) | New (light) | Used for |
|---|---|---|---|
| `--background` | near-black `#0A0A0F`-ish | `#FAFBFC` | page base |
| `--foreground` | near-white | `#0F111A` | body text |
| `--card` | near-black | `#FFFFFF` | card/panel surfaces |
| `--primary` | near-white | `#7C3AED` (purple) | buttons, links, focus ring |
| `--secondary` | dark gray | `#E4ECFF` (original blue tint) | badges, pale washes |
| `--muted` | dark gray | `#F1F2F6` | subtle fills |
| `--muted-foreground` | light gray | `#5A5E72` | captions/secondary text |
| `--border` / `--input` | dark gray | `#E0E2EB` | hairlines |
| `purple` (custom token) | `#CBACF9` | `#7C3AED` | brand accent (`text-purple`, `bg-purple`) |
| `purple-tint` (new token) | — | `#CBACF9` | kept for pale washes/glows |
| `blue.500` (new token) | — | `#245FEB` | gradient partner to purple |
| `blue.100` | `#E4ECFF` | unchanged | pale blue wash |

## File-by-file changes

**`app/layout.tsx`** — `ThemeProvider` now `defaultTheme="light" forcedTheme="light"` (was `defaultTheme="dark"`). This is the master switch: it guarantees the `.dark` class is never applied, so every `dark:` Tailwind variant in the codebase is now permanently inert and falls back to its default (light) class.

**`app/globals.css`** — `:root` CSS variables replaced with the new palette; the now-unreachable `.dark` block was deleted.

**`tailwind.config.ts`** — `purple` token repointed to `#7C3AED`; added `purple-tint` (`#CBACF9`, the old value) and `blue.500` (`#245FEB`).

**`app/page.tsx`** — `<main>` background: `bg-black-100` → `bg-background`.

**`components/Hero.tsx`** — the 3 `<Spotlight>` glow fills changed from `white`/`purple`/`blue` (CSS keyword colors) to `#7C3AED`/`#CBACF9`/`#245FEB`; fixed a malformed `<b className="text-purple"n>` typo. (The grid-pattern and radial-mask background divs already had correct light-mode default classes baked in — no change needed there.)

**`components/ui/Spotlight.tsx`** — default fill `white` → `#7C3AED`, opacity `0.21` → `0.08` (a white glow is invisible on white; this is now a soft visible purple wash).

**`components/Experience.tsx`** *(currently commented out in `page.tsx`, not live, fixed for consistency)* — removed dead random-gradient code; card surface `rgb(4,7,29)` + broken gradient → white + soft shadow; `text-white-100` → `text-muted-foreground`.

**`components/ui/MovingBorders.tsx`** — `Button` inner face: `bg-slate-900/[0.]` (malformed opacity, was a bug) → `bg-white`, `border-slate-800` → `border-neutral-200`, `text-white` → `text-black`.

**`components/ui/BentoGrid.tsx`** — tile border `border-white/[0.1]` → `border-black/[0.06]`; tile background `rgb(4,7,29)` → `#FFFFFF`; description text → `text-muted-foreground`; the 4 tech-stack pill backgrounds `bg-[#10132E]` → `bg-muted`; removed a now-redundant `!bg-[#161A31]` override on the copy-email button.

**`components/MagicButton.tsx`** — pill face `bg-slate-950 text-white` → `bg-white text-purple` (conic-gradient spinning border kept as-is, already colorful).

**`components/Approach.tsx`** — card wrapper: `rgb(4,7,29)` background → white + soft shadow, `dark:border-white` removed; the 4 corner `Icon`s and heading/description text: dropped dead `dark:` classes, description now `text-muted-foreground` instead of inline `#E4ECFF`; `AceternityIcon` pill `bg-slate-950` → `bg-white`; the 4 `CanvasRevealEffect` card wrappers lightened: `bg-emerald-900`→`bg-emerald-100`, `bg-pink-900`→`bg-pink-100`, `bg-sky-600`→`bg-sky-100`, `bg-purple`→`bg-violet-100`.

**`components/ui/CanvasRevealEffect.tsx`** — the hover-reveal fade overlay: `from-gray-950` → `from-white` (dot-matrix shader now fades into white instead of a dark smudge).

**`components/RecentProjects.tsx`** — placeholder background `#13162D` → `bg-muted`; description text inline `#BEC1DD` → `text-muted-foreground`; arrow icon color `#CBACF9` → `#7C3AED`.

**`components/ui/Pin.tsx`** — pin-card border `border-white/[0.1]` → `border-black/[0.08]`, shadow lightened; floating title pill `bg-zinc-950 text-white ring-white/10` → `bg-white text-black ring-black/10` + `shadow-sm`.

**`components/Footer.tsx`** — description text → `text-muted-foreground`; social-icon glass chip `bg-black-200`/`border-black-300` (dark frosted glass) → `bg-white/70`/`border-black/5` (light frosted glass); footer grid decoration image opacity `50%` → `20%` (since it's no longer a subtle dark-on-dark texture).

**`public/footer-grid.svg`** — all gradient stop colors changed from `white`/`#05041F` (built for a dark page) to `#7C3AED` at low opacity (visible faint purple texture on white).

**`components/Clients.tsx`** — testimonial captions `text-white-200` → `text-muted-foreground` (×2); screenshot border `border-white/10` → `border-black/10`.

**`components/ui/FloatingNavbar.tsx`** — fixed malformed `border-black/.1` → `border-black/10`; navbar glass background `rgba(17,25,40,.75)` (dark) → `rgba(255,255,255,.7)` (light), border `rgba(255,255,255,.125)` → `rgba(0,0,0,.06)`.

**`components/ui/HoverBorder.tsx`** *(defined but not currently used anywhere on the site — fixed for consistency)* — the white-on-black "shimmer" sweep recolored to purple/blue radial gradients on a white pill instead of a black one.

**`components/ui/InfiniteCards.tsx`** *(not currently rendered on the page — fixed for consistency)* — card border `border-slate-800` → `border-neutral-200`; card background `rgb(4,7,29)` → white + shadow; quote/name text `text-white` → `text-black`; role text `text-white-200` → `text-muted-foreground`.

**`components/ui/LayoutGrid.tsx`** *(unused component — fixed for consistency)* — removed a leftover bright-yellow debug border (`border-yellow-500` → `border-neutral-200`).

**`components/ui/GradientBg.tsx`** — the animated blob background behind the "Ready to work with us?" bento tile: all 8 default colors lightened to pastel purple/blue/pink/cyan tones, base gradient changed from saturated purple→navy to near-white→pale-lavender, and the CSS blend mode changed from `hard-light` (which washes out on a light background) to `multiply` (which keeps colors visible against white). **This is the one effect most likely to need a manual tweak once you see it live** — multiply blending with these particular values is a reasonable starting point but wasn't visually verified.

**Left unchanged, on purpose**: `components/ui/Globe.tsx` / `GridGlobe.tsx` — the 3D globe keeps its dark navy material with white country outlines. It's a self-contained sphere (not a full-bleed background), so it should read fine as a "night globe" floating on the light page — but worth a look since this was a judgment call, not a tested one.

## Visual testing checklist

Walk through each section at both desktop and mobile widths:

1. **Nav bar** (`FloatingNavbar`) — should look like white frosted glass with a soft shadow, not a dark bar.
2. **Hero** — page background white, faint grid-dot texture visible, 3 soft pastel glow blobs (purple/lilac/blue) behind the logo — not invisible, not overpowering. "Start for Free" / "See Our Work" buttons: white pill, purple text, visible spinning gradient border.
3. **Grid / BentoGrid** ("about" section) — all tiles white with a subtle shadow and hairline border; tech-stack pills light gray; the animated gradient blob tile ("Ready to work with us?") — **check this one closely**, it's the least-tested effect.
4. **Recent Projects** — pin cards white/glassy, title pill white with dark text, placeholder behind screenshots is light gray (not a dark flash before images load).
5. **Clients / testimonials** — logo strip on light gray background, screenshot cards with light hairline borders, captions in muted gray (not invisible pale-blue-on-white).
6. **Approach cards** — 4 cards white with a soft shadow at rest; on hover, each reveals a pastel color-matrix (emerald/pink/sky/violet tint) fading to white at the edges, with dark heading/description text.
7. **Footer** — purple-tinted faint grid texture in the background, social icon chips as light frosted-glass squares, not dark tiles.
8. **Globe** (inside BentoGrid) — dark sphere should look intentional/self-contained against the white tile, not like a broken dark hole.

If anything still shows a dark/near-black surface or invisible white-on-white text, that's a spot this pass missed — flag it and we'll patch it directly.
