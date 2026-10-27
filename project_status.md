# Pokéva — Project Status

## 1. Project Overview

- **Project:** Pokéva
- **Description:** Web-based Pokémon Pokédex and companion application.
- **Primary data source:** PokéAPI v2 — `https://pokeapi.co/api/v2`
- **Intended stack:** React, Vite, TypeScript, Bun, Tailwind CSS, and the existing UI component system.
- **State and data fetching:** Follow the libraries actually configured in the repository.
- **Persistence:** Client-side storage for favorites and preferences where appropriate.
- **Backend:** Not required for the current planned scope.
- **Current development focus:** Verify implementation progress and complete Type Effectiveness Calculator.

> Status accuracy rule: This file must reflect the actual repository. A phase is not complete merely because a prompt was written or work was planned.

## 2. Current Status

- **Repository audit:** Pending verification.
- **Latest requested phase:** Phase 8 — Type Effectiveness Calculator.
- **Latest planned deliverable:** Type effectiveness calculation for single-type and dual-type defenders, a dedicated calculator page, and integration with Pokémon detail pages.
- **Last verified quality gates:** Not recorded.
- **Known blockers:** Not yet verified.
- **Next action:** Inspect the repository, verify Phases 1–7, then implement or continue Phase 8 according to the actual codebase.

Update this section whenever meaningful progress is made.

## 3. Development Roadmap

The following roadmap describes intended scope. Update each status based on code, tests, and available verification.

| Phase | Scope | Status |
|---|---|---|
| 1 | Project foundation, design system, responsive application shell | Needs verification |
| 2 | PokéAPI client, TypeScript types, caching, error handling | Needs verification |
| 3 | Live Pokédex listing, search, filters, and pagination | Needs verification |
| 4 | Pokémon detail, stats, species information, moves, evolution chain | Needs verification |
| 5 | Favorites and client-side persistence | Needs verification |
| 6 | Testing, quality assurance, and accessibility | Needs verification |
| 7 | Performance, production readiness, and deployment preparation | Needs verification |
| 8 | Type Effectiveness Calculator | Planned / implementation needs verification |

Use these status values consistently:

- **Not started:** No meaningful implementation exists.
- **In progress:** Implementation is underway.
- **Implemented:** Code exists, but validation may be incomplete.
- **Verified:** Implementation and relevant quality checks have been reviewed successfully.
- **Blocked:** Progress depends on an unresolved issue.

Replace "Needs verification" with the appropriate status after inspecting the repository.

## 4. Core Product Scope

### Existing planned functionality

- Pokédex browsing.
- Pokémon search by name or ID.
- Type filters and pagination.
- Pokémon detail pages.
- Base stats and Pokémon metadata.
- Evolution chain exploration.
- Favorites stored locally.
- Responsive layout and light/dark themes.
- Error, loading, and empty states.

Verify each feature before treating it as implemented.

### Phase 8 — Type Effectiveness Calculator

Expected functionality:

- Select an attacking type.
- Select one or two defending types.
- Calculate type effectiveness multipliers.
- Display weaknesses, resistances, immunities, and normal effectiveness.
- Support multipliers such as `0×`, `¼×`, `½×`, `1×`, `2×`, and `4×` when applicable.
- Integrate with existing Pokémon detail pages.
- Optionally support selecting a Pokémon to populate its defending types.
- Reuse the existing API client, query cache, UI components, and design tokens.

Important scope boundary:

- This is a type effectiveness calculator, not a full battle damage simulator.
- Do not include STAB, abilities, held items, move power, or other battle mechanics in the calculation.
- Avoid maintaining a separate, unsynchronized hardcoded type chart when PokéAPI data can be used.

## 5. Architecture and Technical Decisions

Record actual implementation decisions here. Do not assume that a planned technology has already been adopted.

| Area | Current decision |
|---|---|
| Frontend framework | Verify repository |
| Language | Verify repository |
| Package manager | Verify repository |
| Styling and UI components | Verify repository |
| Routing | Verify repository |
| API client | Verify repository |
| Server-state caching | Verify repository |
| Client-state management | Verify repository |
| Testing framework | Verify repository |
| Deployment platform | Verify repository or deployment requirements |

When changing a significant decision, record the new approach and a brief rationale.

## 6. Quality Gates

Record the latest actual results.

| Check | Status | Notes |
|---|---|---|
| Lint | Not verified | Run the configured project script |
| Typecheck | Not verified | Run the configured project script |
| Unit tests | Not verified | Record test count and failures |
| Integration/component tests | Not verified | Record coverage of critical flows |
| Production build | Not verified | Record actual build result |
| Accessibility review | Not verified | Record issues found and fixed |
| API smoke test | Not verified | Optional; requires network access |
| Deployment smoke test | Not verified | Requires a deployed environment |

Do not mark a check successful based on an earlier run if relevant code has since changed.

## 7. Known Issues and Blockers

Record confirmed issues only.

For each issue, include:

- Description.
- Reproduction steps, if known.
- Impact.
- Relevant files or components.
- Current resolution status.

If no repository audit has been performed, state that issues are not yet verified rather than claiming none exist.

## 8. Implementation Log

Append a short entry after each meaningful implementation milestone.

Use this format:

### YYYY-MM-DD — Phase N: Short description

- **Status:** In progress / Implemented / Verified / Blocked.
- **Changes:** Main implementation details.
- **Tests:** Checks actually executed and their results.
- **Issues:** Known unresolved problems.
- **Next step:** The next concrete task.

Do not fabricate historical entries. Add entries only for work that has actually occurred.

## 9. Next Steps

1. Inspect the current repository and existing Git changes.
2. Verify the implementation state of Phases 1–7.
3. Confirm the actual stack, scripts, API layer, and testing framework.
4. Continue Phase 8 using the Type Effectiveness Calculator specification.
5. Add tests for single-type and dual-type calculations, including immunity and resistance combinations.
6. Run relevant quality gates and record actual results.
7. Update this document with verified progress and the next recommended task.

## 10. Rules for Maintaining This File

- Keep this document concise and current.
- Update statuses only after inspecting implementation and verification evidence.
- Record important decisions, blockers, and regressions.
- Do not duplicate the full contents of `AGENTS.md`.
- Remove obsolete tasks when they are completed or explicitly cancelled.
- Preserve historical implementation entries when they remain useful.
- Treat repository code and test results as the source of truth when this document becomes stale.
