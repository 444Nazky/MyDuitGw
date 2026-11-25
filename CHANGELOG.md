# Changelog

All notable changes to My Duit Gw. Versions match `versionName` in
`android/app/build.gradle` and the APK published to the release channel.

## [1.1.11] - 2026-11-25

### Changed

- The Monthly Cashflow card is rebuilt into three stacked rows: title and
  "Net this month" share a header row, the net amount sits directly under the
  title, and the contribution heatmap spreads the full card width below it
  (3×10 cells, 4px gap, squares that flex with the card).
- The Spending card now lists its top three categories as tracked bars
  (violet, coral, amber) scaled against the largest category, and the amount is
  shown in bold white. Income shows its top two sources as violet pills and any
  third as a neutral pill.

## [1.1.10] - 2026-11-25

### Changed

- Violet is now the only accent: green is reserved for income amounts. Green
  buttons and badges moved to the accent colour — the "latest version" chip,
  the Paid badge in debt details, the income category icon, the dashboard
  "Mark as Paid" button, the Paid action and status in the debts table, the
  Supabase "Live" indicator, the scan-history INSERT/200 OK labels and the
  positive change pill.
- The Home "Monthly Cashflow" card swaps its SVG sparkline for a 7×4
  contribution heatmap (10px cells, 3.5px gap) driven by the current month's
  transactions: faint violet for days with no spending, grey for spending,
  solid violet for income. Days 29–31 fold into the last cell.
- The About screen reads its version from `app.json` instead of hardcoded text,
  so it can no longer drift from the installed build.

### Fixed

- The myduitgw AI input bar was hidden behind the Android keyboard. The layout
  is set to resize (`softwareKeyboardLayoutMode`) and the input bar is lifted by
  the keyboard height the window did not already lose, then the thread scrolls
  to the newest message once the keyboard settles.
- The Settings title collided with the status bar; it now clears the safe-area
  inset. Sign out gained 16px of space above and 24px below, with 100px of
  scroll padding at the end of the page.

## [1.1.9] - 2026-11-25

### Changed

- The AI chat drops its quick-prompt chips, so the conversation runs the full
  height between the header and the input bar. The input bar sits on black with
  a `#181818` hairline and 12/16 padding.
- New Transaction: the selected Income segment is white with black text, and
  the "Money coming in / going out" caption is gone.
- Debts can attach or replace a transfer receipt from the detail sheet
  (`setDebtReceipt` uploads to the `receipts` bucket and writes `receipt_path`).
  An empty state offers "Add receipt photo", an existing one "Change receipt".

### Fixed

- The dashboard only loaded the profile once at sign-in, so name and avatar
  changes made in mobile Settings never appeared. It now subscribes to the
  user's `profiles` row and refetches on window focus.
