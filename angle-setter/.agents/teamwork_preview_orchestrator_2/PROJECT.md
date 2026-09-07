# Project: Universal Wet Grinder Angle Setter (UWGAS) Architecture Audit & Verification

## Mission Scope
Comprehensive architectural audit of UWGAS, verification of the proposed Zustand refactoring plan (`.agents/implementation_plan.md`), design of strict math engine isolation (`src/math/tormek.ts`), critique of storage/persistence architecture (`src/state/storage.ts`), component modularization strategy, and actionable next steps for the user.

## Constraints
- NO CODE MODIFICATIONS to the codebase. Audit, verification, and recommendations only.
- SACRED MATH ENGINE ISOLATION: Structural guarantee protecting `src/math/tormek.ts` from UI state and side effects.
- Workshop ergonomics compliance (AGENTS.md: touch targets >=44px, viewport 360px/390px, safari scroll spacer rules).

## Feature / Requirement Inventory
| # | Requirement | Description | Milestone | Source |
|---|-------------|-------------|-----------|--------|
| R1 | Codebase Audit ("The Roast") | Critically analyze `App.tsx` and state management; detail >=3 distinct architectural flaws/anti-patterns, performance bottlenecks, maintainability impact | M1 | ORIGINAL_REQUEST |
| R2 | Refactoring Plan Verification | Review `.agents/implementation_plan.md` (Zustand refactor); evaluate strengths/gaps; provide definitive verdict (proceed / modify / reject) | M1, M2 | ORIGINAL_REQUEST |
| R3 | User Data Storage Audit | Review `src/state/storage.ts`; critique design; recommend schema migrations, versioning, serialization safety, Zustand persist middleware | M1, M2 | ORIGINAL_REQUEST |
| R4 | Component Structure & Scalability | Analyze `src/` directory and component hierarchy; recommend scalable organizational pattern for new calculators and tools | M1, M3 | ORIGINAL_REQUEST |
| R5 | Strict Math Engine Isolation | Structural boundary strategy permanently protecting `src/math/` from UI state bleed or inadvertent mutation | M1, M3 | ORIGINAL_REQUEST |
| R6 | Actionable Approval Steps | Clear list of specific, actionable steps the user must approve before implementation begins | M2, M3 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Survey & Deep Audits | Parallel explorer investigations across Codebase/Storage, Plan/Math, Components/Scalability | none | IN_PROGRESS |
| 2 | Plan Verification & Synthesis | Reconcile explorer findings, evaluate implementation plan, formulate definitive verdict | M1 | PLANNED |
| 3 | Final Comprehensive Report | Compile holistic architecture audit report with actionable decision matrix for user | M2 | PLANNED |

## Subagent Working Directories
- `.agents/teamwork_preview_explorer_r1_storage/` (Explorer 1: Codebase Roast & Storage Audit)
- `.agents/teamwork_preview_explorer_plan_math/` (Explorer 2: Refactoring Plan Verification & Math Isolation)
- `.agents/teamwork_preview_explorer_components_arch/` (Explorer 3: Component Architecture & Scalability)
