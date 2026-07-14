# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Part 1 is the org-wide Wolf's Garage agent manual (same in every repo). Part 2 is specific to THIS repo (`wolfs-garage-community`). Full brand/business/history context lives in `WOLFS_GARAGE_KNOWLEDGE_BASE.md` (project knowledge base).

---

# PART 1 — Wolf's Garage Coding Agent Manual

## WHO / WHAT

Wolf's Garage LLC — Portland OR hot rod brand. Owner: John ("Wolf" in public copy). Mobile-only (Samsung Galaxy, Chrome). Solo, ADHD, time-poor. **Lead with the action, no preamble.**

**Hard separation:** Wolf's Garage ≠ the buy/sell/trade side hustle ("Hustle & Flow"). Never mix code, data, or branding. If a task is side-hustle, stop and say so.

---

## SESSION-START AUDIT (run before any work)

1. Confirm WHICH repo + file is actually live. Never assume from prior context.
2. Vercel `list_deployments` → get the live deployment ID and version.
3. Check the repo HEAD (`raw.githubusercontent.com` reads are more reliable than `api.github.com`).
4. Post a one-line status: what exists, where it's deployed, what version, last change.
5. If a version already exists, work on THAT one. Never start a parallel build without John confirming.

---

## DON'T-BREAK RULES

- **Smallest useful change.** Don't rewrite working pages. Don't rename storage keys, routes, files, or functions unless required.
- **Bump the version every delivery.** Never ship the same version twice.
- **No deploy before visual approval.** John reviews a real `https://` preview on phone Chrome first. Local screenshots don't count.
- **Same task fails twice → stop.** Report what failed + which file/command, suggest the safer next move.
- **Architecture-First (AFR-001):** if a feature needs infrastructure that doesn't exist, or the current architecture is the wrong foundation, stop and say so before writing code.

---

## JS SAFETY (HR-007) — before pushing any HTML

Any file with `<script type="module">`: extract the module body to a `.mjs`, run `node --check`. Unescaped apostrophes in single-quoted JS strings silently abort the whole module. Run `node --check` on classic `<script>` blocks too.

---

## DEPLOY / PUSH

- **Vercel only.** Never suggest Netlify or GitHub Pages.
- `Wolfs-admin` serves via `raw.githack.com` — after a push give a cache-busted URL (`?v=N`) and note ~60s CDN delay.
- Supabase function URLs are NOT reachable from the sandbox — deploy those via a standalone deployer HTML John opens in Chrome.

**Git push pattern (agent pushes; John never touches GitHub):**
```bash
git remote set-url origin https://<PAT>@github.com/wolfsgarage-hub/[REPO].git
git config user.email "claude@anthropic.com" && git config user.name "Claude"
git add -A && git commit -m "vX.X - description" && git push origin main
git remote set-url origin https://github.com/wolfsgarage-hub/[REPO].git   # scrub token
echo "Token scrubbed."
```
`<PAT>` comes from the secrets store at push time. NEVER commit it to any file. (Environments with their own GitHub credentials — e.g. Claude Code remote sessions — push normally and skip the PAT dance.)

---

## BRAND QUICK-REF (full system in knowledge base §4)

- Colors: bg black `#0A0A0A` · red `#CC0000` · bone `#F5F1E8` · copper `#C8922A` (**text/hairlines only**, never fills/badges/backgrounds).
- Forbidden: orange, yellow, teal (except health blocks), sage, gold/light backgrounds.
- Fonts: Bebas Neue / Oswald (headers), Work Sans (body), Special Elite (accents).
- Logo: real wolf reference only, upper RIGHT in headers. Never AI-generate a substitute.
- Pinstriping on every page (under header, between sections, above footer). Black bg → red + white. White bg → red + black.

---

## REPO MAP

| Repo | Serves | Host | Vercel project | Notes |
|---|---|---|---|---|
| `wolfs-garage-site` | wolfsgarage.com | Vercel `wolfsgarage` | `prj_xkSqPioBA9MnFkIOPt9A8ths2379` | Main marketing site. v1.41. |
| `wolfs-garage-community` | Hot Rodder Directory | Vercel `wolfsgarage` | `prj_07ZQNcTf2xB0RmkPoYp1slYrydk6` | Directory live at /directory. v3.21.9. Firebase `wolfs-garage-directory`. |
| `Wolfs-admin` | Admin + Quick Add | raw.githack.com | — | Daily-driver = `main/index.html` (NOT community/admin.html). Quick Add = `main/quick.html`. Post gen = `wg-post-generator-v6.3.html`. |
| `wolfsgarage-growth-engine` | Growth Engine PWA | Vercel `wolfsgaragenw-9926` | `prj_4uKh5iqJeRauAFgPIdyXYbaIUTyO` | Branch `rebuild/growth-engine-core`. v2.13.0. Parallel actor pushes here — fetch HEAD before push, never force-push. |

Stack notes: Firebase (`wolfs-garage-directory` — this repo uses the **modular v10 ESM SDK**, not compat), Cloudinary (cloud `dancaaglf`, preset `wolfs-garage`), Supabase proxy "awarewolf" (`github-proxy` edge function), Shopify Basic (apparel, POD via Printful/Printify — edit variants there first, never in Shopify directly).

---

## BUILD REPORT FORMAT (every build, no exceptions)

One copy/paste block, in order: LIVE VERSION · COMMIT · VERCEL DEPLOYMENT · BRANCH · FILES CHANGED · FEATURES COMPLETED · TESTS PASSED · BUGS FOUND · BUGS FIXED · WHAT WAS PRESERVED · NEEDS ANDROID TAP TESTING · EXACT ANDROID TEST STEPS · KNOWN LIMITS.

Never say "All done," "Should work," or "Looks good." Use evidence: exact preview URL, device, flows clicked, command run.

---

## OUTPUT STYLE (John is on a phone)

URLs = tappable markdown links. Copy/paste text = code blocks. Never swap them. Order: link → copy block → next action. Every reply referencing a versioned file or the live/preview site includes a tappable link to the current URL. Base64-image HTML won't render in Claude's preview iframe — tell John to open in Chrome.

---

# PART 2 — THIS REPO: `wolfs-garage-community` (Hot Rodder Directory)

Current build: **v3.21.9** (check `git log -1` and the BUILD console.log — see "Version bump" below — before trusting this number).

## What's here

Three self-contained static HTML pages. No build system, no package.json, no vercel.json, no tests, no node_modules. Each page carries its own CSS and JS inline; there is no shared code between files — config like the Firebase block is duplicated per file on purpose.

| File | What it is |
|---|---|
| `index.html` (~2,000 lines) | The Hot Rodder Directory app — live at wolfsgarage.com/directory. This is where nearly all work happens. |
| `gallery.html` | Pack Gallery — Wolf's photos + community photo submissions with moderation. |
| `admin.html` | **Legacy** admin panel (listings/photo moderation, backup export, feature-listing picker). The daily-driver admin is `Wolfs-admin/main/index.html`, NOT this file. Its login is a hardcoded client-side password constant (`PASS`) — a convenience gate, not security. |

## Commands

There is no build/lint/test tooling. The only checks are:

```bash
# HR-007 syntax check before any push — extract each <script type="module"> body and:
node --check extracted.mjs

# Serve locally if needed (pages also work opened directly, but Firebase/Maps need network):
python3 -m http.server 8080
```

Real verification is a deployed `https://` preview on John's phone (see Part 1 rules). Vercel auto-deploys pushes to `main` (project `prj_07ZQNcTf2xB0RmkPoYp1slYrydk6`).

## Version bump (every delivery)

The single version marker is the console.log near the top of `index.html`:

```html
<script>console.log('Wolf’s Garage Directory BUILD v3.21.9 ' + new Date().toISOString());</script>
```

Bump it on every delivery and update the version in this file's repo-map row. Dated section comments (e.g. `// ── ... (v3.21.9) ──`) mark when a block was added — leave old ones alone.

## Architecture (index.html)

One `<script type="module">` block holds the entire app. Functions that HTML `onclick=` handlers need are exported by assignment to `window.*` — a function that isn't on `window` is invisible to the markup.

**Services (all client-side; there is no backend of our own):**
- **Firebase modular v10.14.1 ESM SDK** imported from `www.gstatic.com` — Auth (email/password) + Firestore. Project `wolfs-garage-directory`. Note: some later code paths lazy-import extra Firestore functions (`await import(...)`) instead of adding to the top import.
- **Cloudinary** unsigned uploads (cloud `dancaaglf`, preset `wolfs-garage`) for listing photos — Firestore stores the returned `secure_url` strings, never base64, for listings.
- **Google Maps JS API + Places autocomplete**, loaded async with `callback=initMap`. Map init has a fallback path (v3.21.9) in case the callback fires before the module defines it — don't simplify it away.

**Firestore collections:**
- `listings` — directory entries. Fields: `bizName`, `bizType`, `location`, `address`, `contact`, `website`, `specialties`, `ownerName`, `bio`, `sideWork`, `communityOffer`, `rides`, `showEverywhere` (bool: bypass ZIP/radius filter), `bizPhotos[]`, `vehPhotos[]` (Cloudinary URLs), `mainPhotoIdx`/`mainVehIdx`, `lat`/`lng`, `userId`, `userEmail`, `status`, `submittedAt`. **Moderation flow:** submissions are written with `status: 'pending'`; the public grid/map only queries `status == 'approved'`; admin flips the status.
- `pack_photos` — community gallery submissions: client-compressed **base64 `imageData`** stored directly in the doc, plus `status` (same pending→approved flow). Older docs may have `imageUrl` instead — render code falls back (`p.imageData || p.imageUrl`); keep that fallback.
- `wolf_photos` — Wolf's own gallery photos (base64 `imageData`, no moderation).
- `settings/featured` — `{ listingId }` set from admin; index.html renders that listing in the featured panel, failing silently to an empty state.

**Auth/roles:**
- Members: Firebase email/password. Signed-in users get MY PROFILE view and can edit only their own listings (`editingListingId` state drives edit mode on the same form used for new submissions).
- Admins: `ADMIN_EMAILS` allowlist constant in index.html gates the Pack Roster print export button. All client-side role checks are UX only — **Firestore security rules (managed in the Firebase console, not versioned in this repo) are the real enforcement.**

**Rendering conventions:**
- Everything is string-templated `innerHTML` with the local `esc()` helper for user data — always escape user-supplied fields.
- `fmtLoc()` (v3.21.9) normalizes location strings **at display time only** — never rewrite the stored `location` field.
- Auth state changes re-run `renderCards()` + `updateViewMode()`; keep new UI reactive to sign-in/out the same way.

**Feature landmarks** (find via `grep -n "── " index.html` — every block has a `// ── NAME ──` banner): auth modal, edit mode, Places autocomplete, photo previews, detail modal, Cloudinary upload, submit, render listings, typeahead suggestions, MY PROFILE view, photo carousel lightbox + add-photo pipeline, swipe-to-cycle main photo, view mode switch, featured listing, Pack Roster, Google Maps, ZIP/radius filtering. `gallery.html` and `admin.html` use the same banner convention.

## Repo-specific don'ts

- Don't introduce a build step, framework, or split files into modules — single-file HTML is the architecture (AFR-001 if you think that must change).
- Don't rename Firestore fields or collections; live data depends on them.
- Don't remove the `imageData || imageUrl` fallbacks or the map-init fallback.
- Don't put listing photos into Firestore as base64 (Cloudinary only); gallery photos are the opposite (base64 only).
- Don't touch `admin.html` when the task says "admin" — confirm first; the real admin lives in the `Wolfs-admin` repo.
