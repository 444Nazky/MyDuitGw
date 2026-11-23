Role & Objective:
Act as a Senior React Native & UI/UX Engineer. Build the complete frontend mobile application "My Duit Gw" using React Native (Expo), TypeScript, and NativeWind (Tailwind CSS). Focus 100% on pixel-perfect UI, smooth animations, and local interactive state using realistic mock data (do NOT integrate any backend or database yet).

Design Reference & UI Consistency:

Read and follow the exact UI/UX design system, layout, color palette (#0A0A0A obsidian background, #161618 bento cards with 20px border radius, neon purple/coral red/amber accents), typography, and components located in: ~/figcraft-designs/MyDuitGw.figcraft.

Language: All UI text, labels, buttons, categories, and placeholders inside the app must be strictly in English.

Navigation: Implement a custom floating bottom pill navigation bar with 4 tabs: Home, History, Debt, and Setting.

Tech Stack & Local State:

Framework: Expo (React Native) with Expo Router (app/(tabs)/...) & TypeScript.

Styling: NativeWind (tailwindcss) + lucide-react-native for minimalist outline icons.

Image Picker: expo-image-picker for selecting transfer receipt images locally.

State Management: React Context (FinanceContext.tsx) pre-populated with realistic initial mock data so that adding a new transaction or debt immediately updates all screens in real time during the session.

Core Screens & Functional Requirements:

1. Home Screen (app/(tabs)/index.tsx):

Top Header: User avatar, search bar, and notification icon matching the Figcraft design.

Hero Balance Card (Top Interactive Card): Displays current calculated balance (Total Income - Total Expense). CRITICAL UX RULE: There is NO separate input screen/tab. Tapping this top Hero Card directly opens a sleek Quick Input Bottom Sheet Modal.

Bento Stats Cards:

Spending Card: Shows total expenses for the current month with multi-colored pill progress indicators by category.

Income Card: Shows total monthly income summary.

Cashflow Summary Card: Displays recent activity highlight.

2. Quick Input Bottom Sheet Modal (components/TransactionModal.tsx):

Triggered by tapping the top Hero Balance Card on the Home screen.

Segmented toggle at the top: Income vs Expense.

Numeric amount input formatted cleanly.

Strict Category Selector Pills (ONLY include these 7 exact categories):

Kuota

Shopping

Food

Salary

Bills

Game

Etc

Optional short note input, date selector (defaults to today), and a "Save Transaction" button that updates the local app state and recalculates the Home screen balance immediately.

3. History Screen (app/(tabs)/history.tsx):

Displays combined financial history (Income, Expense, and Debt records).

Top Horizontal Filter Cards: Interactive cards to filter the list by:

All

Income

Expense

Debt List

Grouped chronologically by date (Today, Yesterday, Earlier) with category icons, timestamps, and color-coded amounts.

4. Debt Screen (app/(tabs)/debt.tsx):

Ultra-Simple UI: Displays a clean vertical list of people who owe money (borrower_name and amount owed), plus a top summary of total money lent out and an "+ Add Debt" button.

Add New Debt Modal (components/AddDebtModal.tsx): Opens when tapping "+ Add Debt" and contains a clean 4-field form:

Borrower Name (Text input)

Amount & Time (Numeric amount + Date/Time picker)

Reason (Text input for why they borrowed money)

Transfer Receipt (Image upload button using expo-image-picker to pick and preview a local photo)

Allow tapping any debt item to view a clean detail modal (showing the reason and transfer receipt preview) or toggle its status as Paid.

5. Setting Screen (app/(tabs)/setting.tsx):

Clean dark bento cards for Profile info, Currency display preference (IDR / USD), Reset Mock Data button, and App Info.

Execution Steps:

Inspect ~/figcraft-designs/MyDuitGw.figcraft first to extract exact colors, spacing, and visual hierarchy.

Build a clean modular structure (context/FinanceContext.tsx, types/finance.ts, components/, and app/(tabs)/).

Ensure smooth transitions, keyboard-avoiding behavior on modals, and responsive mobile layout.