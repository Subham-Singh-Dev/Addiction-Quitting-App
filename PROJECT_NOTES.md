# PROJECT_NOTES.md

> Paste this at the start of every new Claude chat. Update **Section 8 (Status)** and **Section 9 (Decision Log)** after every work session.
> Last updated: 2026-10-09

## 1. Project Summary

* **Working name:** TBD (use a neutral name/icon, e.g. "Streak", "Reboot", "Forge"). Repo/app slug is currently `streak-app`.
* **What:** A modern habit/addiction-quitting streak app (Android first), with XP, levels, journaling, "skills I gained" tags, and a global leaderboard.
* **Builder:** Solo, **complete beginner in mobile development**, 2026 grad. Goal is to LEARN app development, not just ship.
* **Principles:** Privacy first. Local-first. Gentle relapse flow. Ship small, then iterate.

## 2. Tech Stack (v1 = lean)

| Area | Choice | Notes |
|-|-|-|
| Framework | React Native + Expo (Expo Router, TypeScript) | Run on phone via Expo Go first |
| Versions in use | Expo SDK 57, expo-router 57, React Native 0.86.3, React 19.2.3, TypeScript 6 | Expo ships breaking changes every SDK: check docs, don't trust memory |
| Styling | NativeWind v4.2.7 + Tailwind 3.4.19 | Two themes later: Gen Z / Millennial |
| Local DB | Expo SQLite (+ Drizzle ORM optional) | Journals + check-ins stay on device |
| State | Zustand | Simple, beginner friendly |
| Animations | react-native-reanimated, lottie-react-native | Reanimated is installed; Lottie added in polish phase |
| Privacy | expo-local-authentication, expo-secure-store | App lock, secure storage (installed, not used yet) |
| Notifications | expo-notifications (LOCAL daily reminders) | No backend needed for v1 (installed, not used yet) |
| Backend (v2) | Supabase (Auth, Postgres, RLS) | Leaderboard only |
| Testing | Jest + `jest-expo` preset, `@types/jest` (SDK-matched) | Pure logic tests live next to the code, never inside `src/app/` |

**Deferred (do NOT add yet):** PowerSync, WatermelonDB, Skia, push notifications, EAS production builds.

## 3. Key Design Decisions

1. **Store `streak_start_date`, never a streak counter.** Compute days from the date. Counters drift and are easy to fake.
2. **Streak = elapsed 24-hour periods, not calendar days.** Day 0 until a full 24 hours pass.
3. **Only a tiny record goes to the cloud:** anonymous username, streak start (server timestamp), XP, generation tag. Journals/check-ins never leave the device.
4. **RLS on all Supabase tables.** Users can only write their own row. Leaderboard reads via a view.
5. **Relapse = "reset with reflection"**, not a shaming screen. Keep best streak and total effort days.
6. **Leaderboards rank more than current streak:** best streak, total clean days, XP.
7. **Store/branding:** non-explicit wording everywhere (self-improvement, habit tracking).
8. **Code separation:** `src/features/**/*.ts` files are **pure logic only** (no React, no hooks). Hooks, state and UI live in `src/app/` screens and `src/components/`.

## 4. Folder Structure (actual, as of 2026-10-08)

Routes live in `src/app/` (not `app/`). `@/` is a shortcut for `src/`.

```
src/
  app/                       # Expo Router screens (every file = a screen)
    _layout.tsx              # Root: ThemeProvider, splash overlay, SQLiteProvider (streak.db) wrapping <AppTabs />, imports global.css
    index.tsx                # Home: live counter, Best streak, "I slipped" reset (loads from SQLite)  <-- working
    explore.tsx              # Starter-template screen (to be removed/replaced later)
  components/
    app-tabs.tsx             # NativeTabs (Home, Explore) for Android/iOS
    app-tabs.web.tsx         # Web version of tabs
    themed-text.tsx, themed-view.tsx, animated-icon*.tsx, ...   # Starter-template pieces
    ui/collapsible.tsx
  constants/theme.ts         # Colors, Fonts, Spacing (starter template)
  hooks/                     # use-theme, use-color-scheme (starter template)
  db/
    migrations.ts            # migrateDbIfNeeded (PRAGMA user_version), creates trackers table  <-- done
    trackers.ts              # getDefaultTracker, createTracker, getOrCreateDefaultTracker, resetTracker  <-- done
  features/
    streak/
      calculateStreak.ts     # getStreakDays, getStreakBreakdown (pure logic)  <-- done
      calculateStreak.test.ts  # Jest tests for streak functions
    journal/                 # (empty)
    xp/                      # (empty)
  lib/                       # (empty) helpers (dates, security)
  store/                     # (empty) Zustand stores
  theme/                     # (empty) theme tokens (Gen Z / Millennial later)
  global.css                 # Tailwind directives for NativeWind
assets/
AGENTS.md                    # Expo/EAS rules for AI assistants
PROJECT_NOTES.md
```

**Planned later:** move to a `(tabs)` group (Home, Journal, Progress, Settings) and replace the starter-template screens/components.

## 5. Setup Checklist (Day 0)

* [x] Install Node.js LTS
* [x] Install Git, GitHub account
* [x] Install VS Code (+ ESLint, Prettier, Tailwind CSS IntelliSense)
* [x] Install **Expo Go** on Android phone
* [x] Create project: `create-expo-app` (project: `streak-app`)
* [x] `npx expo start`, scan QR with Expo Go
* [x] `git init`, push to a PRIVATE GitHub repo
* [x] Install core deps: expo-sqlite, expo-secure-store, expo-local-authentication, expo-notifications
* [x] `npm install zustand`
* [x] Set up NativeWind v4 (babel, metro, tailwind config, global.css all in place)
* [x] Confirm a styled "Hello" screen renders on phone
* [x] Create folders from section 4
* [x] Commit: "chore: project setup"
* [x] Verify NativeWind `className` works on a re-rendering screen

## 6. Roadmap (revised)

**Phase 1: Local core (Weeks 1-2)**

* [x] Streak calculation function
* [x] Home screen live counter
* [x] Home screen styled with NativeWind `className`
* [x] Commit: "feat: live streak counter on home screen"
* [x] SQLite schema + migrations (trackers table)
* [x] Streak start/reset using SQLite (Home loads from DB, "I slipped" resets, best streak saved)
* [x] Jest setup (jest-expo)
* [x] Unit tests for streak functions (real tests)
* [ ] Reset with reflection (relapses table, migration v2)
* [ ] Daily check-in + journal
* [ ] XP, levels, basic milestones
* [ ] App lock + local reminder notification

**Phase 2: Basic theme + test with friends (Week 3)**

* NativeWind theme tokens (Gen Z / Millennial toggle)
* Give APK/Expo build to 3-5 friends, collect feedback

**Phase 3: Supabase + leaderboard (Weeks 4-5)**

* Supabase project, tables, RLS
* Anonymous auth/sign-in, username picking, basic moderation
* Leaderboard view + screen

**Phase 4: Polish (Weeks 6+)**

* Reanimated micro-interactions, Lottie rewards
* Skills-learned tags and insights
* Dev build, Play Store prep

## 7. Initial DB Schema Idea (SQLite)

* `settings(id, theme, generation, lock_enabled, reminder_time)`
* `trackers(id, name, streak_start_date, best_streak_days, created_at)`
* `checkins(id, tracker_id, date, mood, note)`
* `journal_entries(id, date, text, skill_tags)`
* `relapses(id, tracker_id, date, reflection, trigger)`
* `xp_events(id, type, amount, created_at)`

## 8. Status

* **Today (2026-10-09):** SQLite + reset flow + Jest setup and streak unit tests done and committed.
* **Done:** environment, deps, NativeWind v4, streak calculation, Home live counter, SQLite `trackers` table with `PRAGMA user_version` migrations, Home loads start date from DB (persistence verified across app restarts), "I slipped" reset with confirm dialog, best streak saved and shown (verified with a faked 3-day streak), Jest + jest-expo installed, 16 streak unit tests passing, `tsc` and lint clean.
* **Release testing:** First EAS preview APK built and tested on a real phone; counter, persistence, reset, and best streak all work in a release build.
* **Install tip:** A 113 MB phone download failed with "package appears to be invalid"; USB transfer fixed it.
* **Config note:** `reactCompiler` is `true`.
* **Next:**
  1. Reset with reflection: migration v2 adds `relapses` table, reflection + trigger form.
  2. Daily check-in + journal.
* **Blocked / Questions:** (none)
* **Known cleanup later:** starter-template leftovers (`explore.tsx`, `animated-icon`, `hint-row`, `web-badge`, Expo logo splash, "Expo Starter" label in `app-tabs.web.tsx`).

## 9. Decision Log

| Date | Decision | Why |
|-|-|-|
| 2026-10-03 | Dropped PowerSync for v1 | Too complex; leaderboard only needs a tiny record |
| 2026-10-03 | Expo SQLite only | Avoid WatermelonDB setup pain |
| 2026-10-03 | Local notifications first | No backend needed |
| 2026-10-06 | Stayed on NativeWind v4 | NativeWind v4 is the stable, widely documented version, and it pairs with tailwindcss@3.4.19 |
| 2026-10-06 | Routes in `src/app/`, not `app/` | Matches the current Expo template (AGENTS.md: routes live in `src/app/`) |
| 2026-10-06 | Streak = elapsed 24h periods, not calendar days. Day 0 until a full 24 hours pass | Will matter later for the leaderboard and relapse logic |
| 2026-10-08 | Keep `src/features/**/*.ts` free of React/hooks | Hook code (`useState`/`useEffect`) accidentally ended up in `calculateStreak.ts` and crashed the app on load ("Invalid hook call" / "Rendered fewer hooks than expected") |
| 2026-10-08 | Home counter keeps only `now` in state and derives the breakdown from `streak_start_date` each render | Follows design decision #1: cannot drift |
| 2026-10-08 | Leave `babel.config.js` as is (`babel-preset-expo` with `jsxImportSource: "nativewind"` + `nativewind/babel`) | Tests showed it was not the cause of the crash |
| 2026-10-08 | Set `reactCompiler` back to `true` in `app.json` | Was never the cause of the crash; Home works with it on |
| 2026-10-09 | SQLite stores the streak start as ISO text; migrations use `PRAGMA user_version`; DB helpers in `src/db/` take `db` as a parameter with no hooks | Matches Decision #1, keeps later schema changes additive, and keeps helpers testable while `features/` stays pure |
| 2026-10-09 | Reset keeps `best_streak_days` (max of old best and current) | Relapse is "reset with reflection", not a wipe |
| 2026-10-09 | Jest via `jest-expo` preset; tests sit next to logic files, use relative imports | Files in `src/app/` become routes; `@/` not configured for Jest |
| 2026-10-09 | Added `"types": ["jest"]` to `tsconfig.json` | TS 6 doesn't auto-load `@types/*` |
| 2026-10-09 | Distribute via GitHub Releases + EAS free-tier APK. Play Store deferred | Zero budget. Play needs a paid account, plus a 14-day closed test for new personal accounts |
| 2026-10-09 | Android package ID `com.<name>.streak`, EAS manages the keystore | The ID is permanent. The same key on every build lets updates install over old versions |

## 10. Debugging Lessons

* The first lines of an error show the real file/line. Read the top of the log first (the crash was in `calculateStreak.ts` line 29, not in the screen).
* When an error is in library code (Expo Router, React), suspect something in **your own files** that loads at startup before blaming config.
* Debug by elimination: shrink the screen to the simplest version that works, then add one piece at a time (plain counter, then streak import, then `className`).
* Useful checks: `npx expo-doctor`, `npx expo install --check`, `npm ls react react-dom react-native` (should show one React copy), `npx expo start -c` (clear cache).

* note: that eslint and eslint-config-expo are dev dependencies, and that the eslint-disable comment in use-color-scheme.web.ts is intentional.
* Lots of "Cannot find module" errors across files = `node_modules` is broken, not your code. Check `git status`, restore a deleted `package-lock.json` with `git restore`, delete `node_modules`, then `npm ci`.
* `ECONNRESET` / "Exit handler never called" = network problem, not an npm bug. Set `npm config set fetch-retries 5`, rerun the same command (the cache keeps progress), or switch to a phone hotspot.
* Big APK downloads on a phone can corrupt. Transfer by USB, and `adb install` shows the real error.

## 11. Workflow Rules (for me)

1. One small task per Claude chat. Paste this file first.
2. Paste full error text (top to bottom) + relevant code + Expo SDK version (57).
3. Ask Claude for **full files with exact file paths and run steps**, not loose snippets (I'm a beginner). Type/paste code myself and ask Claude to explain it.
4. Commit after every working step.
5. Check official Expo / NativeWind / Supabase docs for setup commands.
6. Update Section 8 and 9 at the end of every session.
7. Run `npx expo lint` and `npx tsc --noEmit` before calling a task done (per AGENTS.md).
8. Never delete `package-lock.json`. Install one thing at a time and run `npx expo install --check` after.
