# AGENTS.md

## Project Overview

**Pokéva** is a web-based Pokémon Pokédex and companion application powered by PokéAPI v2.

The application provides Pokémon discovery, search, filtering, pagination, detailed Pokémon information, evolution chains, favorites, and type effectiveness analysis.

Primary API: `https://pokeapi.co/api/v2`

## 1. Core Rules

- Inspect the existing codebase before making changes.
- Read this file, `project_status.md`, README, and relevant project documentation before starting a task.
- Follow the existing architecture and conventions unless there is a concrete reason to change them.
- Prefer small, incremental, maintainable changes over large rewrites.
- Implement the requested task completely, including relevant tests and documentation.
- Do not implement unrelated features or move into a future phase without explicit instructions.
- Do not claim a feature, test, or command succeeded unless it was actually verified.
- Never silently remove existing functionality.
- Never overwrite user changes or discard unrelated work.
- Do not create unnecessary abstractions, dependencies, configuration files, or documentation.
- Do not add AI-generated comments that merely restate what the code does.

## 2. Technology Stack

Use the existing repository as the source of truth.

The intended stack is:

- Frontend: React, Vite, and TypeScript.
- Runtime/package manager: Bun, if already configured.
- Styling: Tailwind CSS and the existing component/design system.
- UI components: existing shadcn/ui components where applicable.
- Routing: the routing library already configured in the project.
- Server state and API caching: TanStack Query, if already configured.
- Data source: PokéAPI v2.
- Local persistence: localStorage for client-side preferences and favorites where appropriate.
- Testing: the existing test framework; add a compatible framework only if necessary.

Do not migrate libraries or frameworks just to match this document. If the repository differs, preserve the actual implementation and document significant deviations when relevant.

## 3. Required Workflow

For every task:

1. Inspect the current repository and relevant files.
2. Read `project_status.md` and identify the current phase and scope.
3. Discover relevant installed agent skills and read their actual instructions.
4. Identify existing components, utilities, API methods, and tests that can be reused.
5. Make a brief implementation plan for tasks involving multiple files or architectural changes.
6. Implement the smallest complete solution.
7. Add or update tests for changed behavior.
8. Run relevant quality checks.
9. Review the diff for regressions, unrelated changes, and accidental secrets.
10. Update `project_status.md` when the phase status, completed work, decisions, or next steps materially change.

Do not stop after producing a plan when implementation has been requested.

## 4. Agent Skills

Discover available skills in the current environment before using them.

- Use `TasteSkill` for relevant implementation or design work if it is installed and applicable.
- Use `ui-ux-pro-max` for relevant UI/UX work if it is installed and applicable.
- Use other installed skills when they directly improve the requested task.
- Read the actual skill instructions and follow their constraints.
- Do not invent skill names, capabilities, commands, or instructions.
- If a requested skill is unavailable, continue using established best practices and mention the limitation only when relevant.

Skills complement this document; they do not override project requirements, safety constraints, or the user's explicit instructions.

## 5. Code Quality

### TypeScript and React

- Keep TypeScript strict and prefer explicit, accurate types.
- Avoid `any` and unnecessary type assertions.
- Prefer small, focused components with clear responsibilities.
- Extract shared logic when there is meaningful reuse.
- Avoid premature abstraction and excessive component fragmentation.
- Use stable React keys.
- Follow React Hooks rules.
- Clean up subscriptions, event listeners, and other resources when necessary.
- Use memoization only when justified by actual rendering or computation needs.
- Keep data fetching, domain calculations, and presentation logic appropriately separated.

### Naming and organization

- Follow existing naming conventions and folder structure.
- Use descriptive names for components, functions, variables, and types.
- Keep API types and domain models consistent.
- Avoid duplicate business logic.
- Do not introduce multiple sources of truth for the same state.

### Error handling

- Handle loading, success, empty, and error states appropriately.
- Provide useful user-facing errors without exposing unnecessary internal details.
- Do not silently convert failed requests into misleading successful results.
- Handle missing or incomplete API data safely.
- Use retry behavior selectively; avoid retrying permanent errors such as HTTP 404 unnecessarily.

## 6. API and Data Fetching

- Use the existing shared PokéAPI client and query utilities.
- Keep API calls in the established data layer rather than scattering raw `fetch` calls across components.
- Reuse existing query keys and caching conventions.
- Support request cancellation where appropriate.
- Avoid duplicate requests and unnecessary refetching.
- Never fetch the entire Pokémon catalog or every detailed resource merely to render a small page.
- Fetch secondary resources on demand where practical.
- Handle HTTP errors, network failures, and invalid responses.
- Do not assume PokéAPI is always available.
- Do not hardcode API responses or use mock data in production paths unless explicitly intended.
- Mock external API calls in automated tests.
- Do not introduce a backend proxy solely to hide the public PokéAPI URL.

## 7. UI/UX and Accessibility

- Preserve Pokéva's existing visual identity and design tokens.
- Support light and dark themes according to the existing theme implementation.
- Maintain responsive layouts for mobile, tablet, and desktop.
- Reuse existing buttons, cards, badges, selectors, dialogs, and other UI primitives.
- Use semantic HTML and accessible labels.
- Ensure keyboard navigation and visible focus states.
- Provide meaningful alternative text for informative images.
- Do not rely on color alone to communicate important information.
- Handle loading, empty, error, and unavailable-image states.
- Avoid unnecessary animations and respect reduced-motion preferences where appropriate.
- Do not redesign unrelated pages as part of a feature task.

## 8. State and Persistence

- Reuse the current state-management approach.
- Do not add a state-management library for a small isolated requirement.
- Persist only the data necessary for the intended feature.
- Version persisted data when a schema or migration strategy is warranted.
- Validate persisted data before using it.
- Handle unavailable or corrupted localStorage data gracefully.
- Avoid persisting large API responses unnecessarily.
- Ensure related pages use a consistent source of truth for shared state.

## 9. Testing and Quality Gates

Use the package manager and scripts configured in the repository.

Run the applicable checks, such as:

- Lint.
- Typecheck.
- Unit tests.
- Integration or component tests.
- Production build.

Testing principles:

- Test behavior and meaningful edge cases rather than implementation details.
- Prioritize API handling, domain calculations, persistence, routing, and critical user flows.
- Keep tests deterministic and independent of live external APIs.
- Include error, empty, invalid-input, and boundary cases where relevant.
- Fix regressions introduced by the changes.
- Report pre-existing failures separately from newly introduced failures.
- Never claim a check passed if it was not run or if it failed.

Do not add unnecessary test infrastructure when the current setup already meets the requirement.

## 10. Security and Operational Constraints

- Never commit API secrets, tokens, passwords, or private credentials.
- Do not introduce unnecessary tracking or analytics.
- Avoid unsafe HTML rendering and validate untrusted input where appropriate.
- Do not modify databases.
- Do not run Docker or Docker Compose commands.
- Do not start, stop, delete, rebuild, or modify containers.
- Do not perform destructive shell commands or overwrite unrelated files.
- Do not deploy, publish packages, push Git changes, or modify remote infrastructure unless explicitly requested.
- Do not change system configuration or install system-wide dependencies without authorization.

Read-only inspection commands and normal local development checks are acceptable when appropriate.

## 11. Dependencies and Configuration

- Prefer existing dependencies and built-in platform capabilities.
- Add a dependency only when its benefits justify its maintenance and bundle costs.
- Do not perform unrelated major-version upgrades.
- Keep environment-specific configuration out of source code.
- Update documentation and example configuration when introducing required settings.
- Never create fake credentials or pretend external services are configured.

## 12. Git and Change Management

- Inspect `git status` before making changes when Git is available.
- Preserve unrelated user modifications.
- Avoid broad formatting or mass refactoring outside the task scope.
- Review the diff before finishing.
- Do not commit or push unless explicitly requested.
- Do not reset, clean, or discard user changes.

## 13. Phase Management

- Follow the current phase in `project_status.md`.
- Complete the requested phase before starting another.
- Keep changes within the explicitly requested scope.
- Preserve compatibility with previous phases.
- Update the project status only based on verified implementation.
- If the repository contradicts the documented status, inspect the code and tests, then report the discrepancy.
- Do not mark a phase complete merely because its prompt or plan exists.

## 14. Final Report

At the end of each task, provide a concise report containing:

1. What was implemented.
2. Important files created or changed.
3. Tests and quality checks actually executed, with results.
4. Known limitations or unresolved issues.
5. Any updates made to `project_status.md`.

Be transparent about anything not verified.
