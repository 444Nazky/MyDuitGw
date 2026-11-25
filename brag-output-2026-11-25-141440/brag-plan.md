# Brag Plan: My Duit Gw

## What is this app?

A personal finance and peer-to-peer loan tracker for Android: log spending by tapping the balance card itself (no separate form page), watch a year of cashflow in a GitHub-style contribution grid, and keep every loan next to its transfer receipt.

## The angle

Every finance app says it is fast. This one makes a promise you can check in one gesture: **there is no separate page for adding a transaction.** The film is built around that single tap — the balance card opens the sheet, the sheet saves, and the numbers move. Then it walks out of the phone: a year of heatmap, a loan with its proof attached, and the live dashboard behind it. Quiet, dark, premium — the product's own restraint is the flex.

## Hook (first 2-3 seconds)

Black. One expense line appears in the void: `-Rp. 10.000`. Beat. Under it, small and certain: `No separate page to log it.` The punchline is that this is the app's stated core UX rule, not a slogan.

## Key moments (the middle)

- **The tap.** The phone's Total Balance card presses in, the Quick Input sheet rises, the amount `10.000` types itself, the white `Save Transaction` button presses, and the sheet is gone. Balance ticks up, Spending ticks down, a `Food` row slides in.
- **The year.** The heatmap lifts out of the Monthly Cashflow card and becomes the whole screen: 53 weeks of 8px squares, violet for income days, grey for spending, unscrolled to the newest week.
- **The proof.** A debt card — `Lent to Raka` — with a transfer receipt thumbnail, and the `Mark as Paid` state flipping to Paid.

## Outro / punchline

The dashboard sweeps in behind the phone (Net Balance, Cashflow Overview, Transaction History), then the wordmark: **My Duit Gw**, with the project's own line — `Personal finance & peer-to-peer loan tracker` — and `Synced live from the mobile app and Supabase.` Small: `v1.1.12`.

## User flow worth showing

1. **Entry** — Home: Total Balance card, Spending/Income cards, Monthly Cashflow heatmap.
2. **Key action** — tap the balance card → Quick Input sheet → type amount → pick category → `Save Transaction`.
3. **Result** — balance and Spending update, the new `Food` row lands in the list, the day's square lights up in the heatmap.

## Tone

- Preset: `polished`
- Creative direction: quiet premium dark-mode product film, one-tap thesis
- Interpretation: few scenes, long confident holds, no hype copy, motion is small and precise (card press, sheet rise, cell fills). Text lands fast then holds. The only loud moment is the heatmap expanding to full screen.

## Format: landscape — 1920x1080
## Duration: 22.5s

## Visual identity (from the project)

- Background: `#0A0A0A` (app `#000000`, cards `#141414` / dashboard `#161618`)
- Accent: `#7C5CFF` (dashboard `neon`), bright violet `#8B5CF6`, faint violet `rgba(139, 92, 246, 0.22)`
- Text: `#FFFFFF` / `#FAFAFA`, muted `#8E8E96`, faint `#63636B`
- Income green: `#4ADE80` — used only for income amounts, as the app enforces
- Display font: Inter 700/800, tight tracking (-0.02em to -0.04em)
- Body font: Inter 400/500
- Strongest visual element: the Monthly Cashflow year heatmap and the near-black bento cards with 20px radius
- Functional colors from the product: expense coral `#FF5F5F`, debt amber `#FFB020`, dashboard sky `#A9C6F5`

## Share copy (draft)

Logging money should not need a separate page. My Duit Gw: tap the card, the transaction is in — plus a year of cashflow in one grid and every loan next to its transfer receipt.

## Audio direction

- Role: warm bed under precise UI accents
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (109.96 BPM, 117s — first 22.5s used)
- Music treatment: start at 0.00s at low level (~0.28–0.34), hold steady, fade to silence over the final 0.9s under the wordmark; never louder than the UI accents
- Music cue guidance: bundled preset `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; strong cues near `8.74s`, `13.11s`, `17.47s`, `22.37s`, `22.93s`; beat grid ~0.55s apart (use every other beat for readable text reveals)
- Audio-reactive treatment: subtle — music RMS drives a faint violet glow behind the phone and the heatmap cells' presence, never waveform bars
- SFX posture: sparse and motion-matched; a soft press for the tap, a low rise for the sheet, a single dry click for Save, a tick per heatmap column wave, one warm hit on the wordmark
- Audio-coupled moments: the amount typing (`10.000`), the Save press, the heatmap expanding to full screen, the Paid flip, the wordmark landing
- Restraint rule: no whooshes on every cut, no celebratory stings, nothing that competes with the numbers

## Storyboard

### Scene 1 — Cold open: the price — 2.9s
Pure black. `-Rp. 10.000` fades up in Inter 700 at ~110px, letterspacing tight, centered slightly above middle. At ~1.5s a muted line joins underneath: `No separate page to log it.` (Inter 500, 26px, `#8E8E96`). No logo yet, no chrome.
Sequential/interaction: none — two text arrivals, second one held to the end of the scene
Audio intent: quiet, confident, like a title card before a film
Audio-coupled idea: a single soft low hit as the amount appears; the caption arrives dry
Music: bed already playing, low
Transition mood: clean → Scene 2 (amount line crossfades into the balance card's amount)

### Scene 2 — The app, at rest — 3.2s
A phone (390x844 ratio, ~86% of frame height) rises from bottom with a 20px-radius dark body. Inside: the Home screen recreated — `Total Balance` card (`#141414`, violet gradient edge, `Rp 1.245.000`, owner line `Nazky`), the Spending/Income pair (`Spent this month` `-Rp. 445.000`, `This month` `Rp 690.000` in green), the `Monthly Cashflow` card with header row, `+Rp 245.000`, and the 53-week heatmap strip. A caption sits left of the phone: `Your money,` / `clearly in view.` (the dashboard's own headline), muted line below: `Personal finance & peer-to-peer loan tracker.`
Sequential/interaction: the three cards arrive one after another (balance, Spending/Income pair, Monthly Cashflow) — staggered, ~0.25s apart
Audio intent: warm, settled, establishing
Audio-coupled idea: soft card arrivals, one per card, low in the mix
Music: bed continues; first strong cue (~3.82s region) near the card group settling
Transition mood: clean → Scene 3 (match cut on the balance card)

### Scene 3 — One tap — 5.8s
Close on the phone's Total Balance card. A simulated tap ring pulses on the card (no visible cursor needed — press scale 0.97 + violet ring). The Quick Input sheet rises from the bottom edge: `New Transaction`, the Income/Expense segmented control with Expense active, amount field where `10.000` types in character by character, then the category chips with `Food` selecting, then the white `Save Transaction` button presses (it inverts to a violet press state). The sheet slides down. Home returns: `Total Balance` counts up, `Spent this month` recalculates, and a new row `Food · now · -Rp. 10.000` slides into the activity list. Caption at left, entering with the sheet: `Tap the card. That's the form.`
Sequential/interaction: yes — tap → sheet rise → amount typing → category select → Save press → sheet exit → row insert
Audio intent: precise, satisfying, mechanical but soft
Audio-coupled idea: press click on the tap, low rise on the sheet, key ticks on the typed digits, a dry click on Save, one soft tick as the row lands
Music: bed dips slightly (~90%) under the typing, returns on the row insert
Transition mood: clean → Scene 4 (the phone pushes back as the heatmap comes forward)

### Scene 4 — A year at a glance — 4.2s
The Monthly Cashflow heatmap lifts out of the card and fills the frame: 53 columns × 7 rows of 8px squares on black, a subtle month-label row (`Jan` … `Dec`) above. Cells resolve column by column, right to left, until the newest week is bright at the edge. Three legend chips settle at the bottom-left: `Income` (violet `#8B5CF6`), `Spending` (grey `#52525B`), `No spending` (`rgba(139,92,246,0.22)`). Caption top-left: `52 weeks of cashflow.` / muted: `One grid, no charts to read.`
Sequential/interaction: yes — cells sweep in by column (~0.05s per column), legend chips arrive one by one after the sweep
Audio intent: scale and payoff; the biggest musical moment
Audio-coupled idea: a fast tick texture under the sweep; one strong hit as the grid completes
Music: strong cue lock near 13.11s for the full-screen expansion
Transition mood: soft → Scene 5 (grid slides left, debt card slides in)

### Scene 5 — Loans, with the proof — 3.2s
Close on a debt detail sheet on the phone: `Lent to Raka`, `Rp 150.000`, `Reason: bensin + makan`, a transfer-receipt thumbnail (abstracted bank-transfer screenshot, no real names), and the action bar with `Add receipt photo` already satisfied, so the primary button reads `Mark as Paid`. The tap lands, the button settles into `Paid` with a muted white pill, and a second debt card behind it dims to settled. Caption left: `Loans keep their receipts.` muted: `Receipt attached, then Mark as Paid.`
Sequential/interaction: yes — sheet content arrives, receipt thumbnail scales in, Paid tap, status settles
Audio intent: calm, finished, one soft confirmation
Audio-coupled idea: soft paper-ish rustle for the receipt, one dry click on Paid
Music: bed continues; strong cue ~17.47s on the Paid settle
Transition mood: clean → Scene 6

### Scene 6 — The rest of the picture — 2.0s
Pull back through the phone into the web dashboard (recreated, not screenshotted): dark shell, `Net Balance` card in icy blue, `Cashflow Overview` bar chart, `Transaction History` rows, `Pending Debts`, a `Live` realtime chip. The phone settles in front as a smaller object. Then everything fades to black except the wordmark.
Sequential/interaction: dashboard panels fade up in a soft stagger, phone settles in front
Audio intent: widening, then resolved
Audio-coupled idea: a low swell as the dashboard resolves, then music fades
Music: fade out over the last 0.9s

### Scene 7 — Wordmark — 2.4s
Centered: a white rounded square mark with `M`, then `My Duit Gw` in Inter 800 (44px), then the project line `Personal finance & peer-to-peer loan tracker` (muted 18px), then `Synced live from the mobile app and Supabase.` (faint 14px) and `v1.1.12` (faint 12px). Hold, fully settled.
Sequential/interaction: mark → name → line → meta, one at a time
Audio intent: done
Audio-coupled idea: one warm final hit on the mark, silence after
Music: silent by the second beat
Transition mood: fade to black (end)

**Music mood for this video:** clean modern business bed, restrained, no drop
**Audio summary:** low warm bed the whole way, small clicks for the tap/type/save, one fast tick texture for the heatmap sweep, then a final hit under the wordmark and silence.

## Notes on data

All balances, amounts, categories and borrower names on screen are fictional sample data (`Rp 1.245.000`, `-Rp. 445.000`, `Rp 690.000`, `Raka`, `Rp 150.000`). No real user names, emails, receipts or Supabase identifiers appear. Labels and claims are taken verbatim from the project: `Total Balance`, `Monthly Cashflow`, `Net this month`, `Spent this month`, `This month`, `Save Transaction`, `Mark as Paid`, `Add receipt photo`, `Personal finance & peer-to-peer loan tracker`, `Your money, clearly in view.`, `Synced live from the mobile app and Supabase.`
