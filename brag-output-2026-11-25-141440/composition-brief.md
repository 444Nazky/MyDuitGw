# Hyperframes Composition Brief: My Duit Gw

## Objective
Create a short launch-style brag video for **My Duit Gw**, a personal finance and peer-to-peer loan tracker (Expo/React Native app + React dashboard).

## Output
- Composition directory: `brag-output-2026-11-25-141440/composition/`
- Rendered video: `brag-output-2026-11-25-141440/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 22.5 seconds

## Source Material
- Project root: `/home/nazky/RPL/MyDuitGw`
- Primary files read: `PRD.md`, `CHANGELOG.md`, `app.json`, `dashboard/index.html`, `dashboard/src/pages/Dashboard.tsx`, `dashboard/src/pages/Login.tsx`, `dashboard/tailwind.config.js`, `dashboard/src/lib/colors.ts`, `app/(tabs)/index.tsx`, `components/BalanceCard.tsx`, `components/CashflowHeatmap.tsx`, `components/TransactionModal.tsx`, `components/DebtDetailModal.tsx`
- Product name: My Duit Gw
- Tagline / strongest claim: "Personal finance & peer-to-peer loan tracker" and the core UX rule from the PRD — no separate page for adding a transaction; you tap the balance card.
- Key UI or visual moment to recreate:
  - Home screen: Total Balance card, Spending/Income cards, Monthly Cashflow 53-week heatmap strip
  - Quick Input bottom sheet with Income/Expense toggle, amount, 7 category chips, white `Save Transaction`
  - Debt detail sheet with receipt thumbnail and `Mark as Paid`
  - Web dashboard: Net Balance card, Cashflow Overview, Transaction History, Pending Debts, `Live` chip
- Copy that must appear verbatim:
  - `No separate page to log it.`
  - `Your money, clearly in view.`
  - `Personal finance & peer-to-peer loan tracker`
  - `Total Balance`, `Monthly Cashflow`, `Net this month`, `Spent this month`, `This month`
  - `Save Transaction`, `Mark as Paid`, `Add receipt photo`, `Lent to Raka`
  - `Synced live from the mobile app and Supabase.`
  - `-Rp. 10.000`

## Creative Direction
- Tone preset: `polished`
- Creative direction: quiet premium dark-mode product film, one-tap thesis
- Interpretation: few scenes, confident holds, small precise motion (card press, sheet rise, cell fills), no hype language, exactly one loud moment (the heatmap expanding full screen).
- Angle: every finance app claims speed; this one makes it checkable in one gesture — tap the card, the transaction is in. The film then walks out of the phone into a year of heatmap and a loan with its receipt, then the live dashboard.
- Hook: black frame, `-Rp. 10.000` fades up, then `No separate page to log it.`
- Outro / punchline: dashboard resolves behind the phone, then the wordmark with the project's own line and `v1.1.12`.
- Avoid:
  - Generic SaaS language ("streamline your workflow", "take control of your finances")
  - Abstract filler visuals, stock chart screenshots, waveforms
  - Redesigning the brand: stay on black + violet, income green only for income amounts
  - Animated cursors, mouse pointers, or any chrome that is not part of the product

## Visual Identity
- Background: `#0A0A0A` (app body `#000000`)
- Card surface: `#141414` (app) / `#161618` (dashboard)
- Text: `#FFFFFF`, `#FAFAFA`; muted `#8E8E96`; faint `#63636B`
- Accent: `#7C5CFF`; bright violet `#8B5CF6`; faint violet `rgba(139,92,246,0.22)`
- Functional: income green `#4ADE80`, expense coral `#FF5F5F`, debt amber `#FFB020`, dashboard sky `#A9C6F5`
- Display font: Inter 700/800, tracking -0.02em to -0.04em
- Body font: Inter 400/500
- Visual references: 20px card radius, near-black bento layout, 8px heatmap squares with 2px radius and 3px gap, floating bottom nav pill, white primary buttons with black text

## Storyboard
Use the storyboard in `brag-output-2026-11-25-141440/brag-plan.md` as the creative contract.

Scene summary:
1. Cold open — 2.6s — `-Rp. 10.000` then `No separate page to log it.`
2. The app at rest — 3.4s — phone rises with Home: Total Balance, Spending/Income, Monthly Cashflow heatmap; caption `Your money, clearly in view.`
3. One tap — 6.2s — tap card → Quick Input sheet → amount types `10.000` → `Food` selected → `Save Transaction` → sheet closes, balance updates, `Food` row lands
4. A year at a glance — 4.3s — heatmap lifts to full screen, 53×7 cells sweep in, legend chips settle
5. Loans with proof — 3.5s — debt sheet `Lent to Raka`, receipt thumbnail, `Mark as Paid` → `Paid`
6. The rest of the picture — 3.0s — dashboard resolves behind the phone
7. Wordmark — 1.6s — mark, name, project line, `v1.1.12`

## Audio
- Audio role: warm bed with precise UI accents
- Audio arc: steady low bed → dip under the typing → fast tick texture for the heatmap sweep → one final hit on the wordmark → silence
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (already copied into the composition)
- Music treatment: start 0.00s at ~0.28–0.34 volume, dip to ~0.24 during typing, fade out over the last 0.9s; never louder than UI accents
- Music cue guidance: bundled preset `brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json` — strong cues near 8.74s, 13.11s, 17.47s, 22.37s; beat grid ~0.55s apart (use every other beat for readable text)
- Audio-reactive treatment: subtle — music RMS softly drives the violet glow behind the phone and the brightness of the heatmap block, no waveform graphics
- Audio-coupled moments:
  - Scene 1 — soft low hit under `-Rp. 10.000`
  - Scene 3 — press click, sheet rise, key ticks per digit, Save click, row tick
  - Scene 4 — tick texture under the column sweep, one strong hit as the grid completes
  - Scene 5 — receipt rustle, Paid click
  - Scene 7 — one warm hit under the mark
- SFX selection guidance: interface/UI folder (`brag/assets/sfx/interface`, `ui`, `keyboard`, `impact`); prefer low high-frequency-risk files for repeated ticks; keep everything under the music
- SFX analysis guidance: `/home/nazky/.agents/skills/brag/assets/sfx/sfx-analysis.md` and `sfx-analysis.json`
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, volume from the implemented animation
- Audio files: copy any chosen SFX into `composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes skills — `hyperframes` (composition contract + `data-*` timing, `references/format.md`; motion and seek-safe keyframes in `references/motion.md`; look in `references/look.md`), `hyperframes-registry`, `media-use` (music, SFX, audio-reactive), `hyperframes-cli` (lint/check/render). /brag is its own workflow: skip the `hyperframes` storyline step — no `references/types/*`, no `references/story.md`, no `SPEC.md`, no `usage`/`history`/`feedback`/REVIEW.md steps. The plan and this brief replace them, including the LOOK line. `hyperframes check` is the gate.

Requirements:
- Recreate UI in HTML/CSS (no screenshots of the real app, no live URL captures).
- Show at least one real UI element and the verbatim copy listed above.
- Keep all text readable in the final render.
- 22.5s total, within 15–25s.
- Include the music and a sparse SFX layer.
- At least one subtle audio-reactive element and 1–3 beat-locked major moments, marked in the code.
- Run `hyperframes check` before render.
