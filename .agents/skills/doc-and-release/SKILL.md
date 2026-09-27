---
name: doc-and-release
description: >-
  Audits project progress against docs/PROJECT_PLAN.md, intakes new proposed features,
  and compiles human-readable release notes and version bumps in docs/CHANGELOG.md.
  Use when the user asks "where are we up to?", "what's on the schedule?", "add a feature to the roadmap",
  or "prep a release".
---

# Documentation & Release Management Skill

This skill acts as the project's autonomous Technical Writer and Release Manager. It guarantees that `docs/PROJECT_PLAN.md`, `docs/CHANGELOG.md`, and version numbers stay synchronized with actual Git commits while keeping communications focused on user experience rather than code jargon.

## 🛡️ Core Rules & Safety Gates
1. **Explicit Consent Gate:** Never execute a real merge to `main`, push to remote, or deploy without explicit user confirmation.
2. **Quality Gate:** A release draft or promotion proposal MUST NOT proceed if `npm run typecheck` or `npm run build` fails.
3. **Product-First Communication:** Speak as a Lead Engineer to a non-technical Product Owner. Do not dump raw commit hashes or technical diffs; explain changes in terms of workshop features, UI behavior, and accuracy improvements.
4. **Structure Integrity:** Strictly adhere to the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format in `docs/CHANGELOG.md` and the Markdown table format in `docs/PROJECT_PLAN.md`.

---

## 🛠️ Execution Modes

Determine which mode applies based on user intent:

### Mode A: Status & Progress Audit ("Where are we up to?")

Use when the user asks for a project status update, roadmap review, or progress catch-up.

1. **Inspect Git History:**
   - Run `git log -n 15 --oneline` on the current branch (`dev`).
   - Check if working tree has unstaged or uncommitted changes via `git status`.
2. **Inspect Documentation:**
   - Read `docs/PROJECT_PLAN.md` (Active Job Schedule & Backlog table).
   - Read the top entry in `docs/CHANGELOG.md`.
3. **Reconcile Discrepancies:**
   - Check if any `[IN PROGRESS]` or `[READY]` jobs have actually been completed in code.
   - If verified, update their status to `[COMPLETED]` in `docs/PROJECT_PLAN.md` and record the change in the Decision Log.
4. **Report to Product Owner:**
   Provide a concise 3-part briefing:
   - **Recently Shipped:** Key user-facing features or polish completed.
   - **Currently In Progress / Active:** What is on the workbench right now.
   - **Recommended Next Step:** Highest priority item from the roadmap ready to tackle.

---

### Mode B: Feature & Idea Intake ("Add to roadmap")

Use when the user proposes a new idea, feature, or architectural change that won't be implemented immediately.

1. **Find Next Job ID:**
   - Read `docs/PROJECT_PLAN.md` and find the highest existing `JOB-XXX` number (e.g. `JOB-033` -> next is `JOB-034`).
2. **Formulate the Specification:**
   - Assign appropriate Priority: `HIGH`, `MEDIUM`, or `LOW`.
   - Set Status to `[PROPOSED]`.
   - Write a plain-English description emphasizing the problem it solves for the woodworker/sharpener.
3. **Update Roadmap:**
   - Insert the new row into the **Active Job Schedule & Backlog** table in `docs/PROJECT_PLAN.md`.
   - Place it under the appropriate milestone phase in the Roadmap section if applicable.
4. **Confirm with User:**
   - Briefly present the logged job ID and summary back to the user.

---

### Mode C: Release Preparation & Changelog ("Prep a release")

Use when preparing a version milestone to merge from `dev` to `main`.

1. **Run Quality Prechecks:**
   - Execute `npm run typecheck`.
   - Execute `npm run lint`.
   - Execute `npm run build`.
   - *If any command fails, halt immediately and report the error to the user.*
2. **Analyze Branch Diff:**
   - Run `git log main..dev --oneline` to inspect all commits on `dev` that are not yet in `main`.
3. **Draft Changelog Section:**
   - In `docs/CHANGELOG.md`, create a new version block under `## [X.Y.Z] - YYYY-MM-DD`.
   - Group changes logically:
     - `### Added` (New user features, screens, settings)
     - `### Changed / Ergonomics` (UX updates, touch improvements, layout shifts)
     - `### Fixed` (Bugs or precision formula edge cases resolved)
4. **Propose Version Bump:**
   - Inspect current `version` in `package.json`.
   - Recommend next SemVer increment (patch for fixes/polish, minor for new features).
5. **Present Release Plan (Wait for Approval):**
   - Present the changelog draft and proposed version to the Product Owner.
   - **DO NOT execute the git merge or push until the user explicitly responds "Proceed" or "Yes".**

