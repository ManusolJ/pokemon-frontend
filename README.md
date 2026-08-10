# PokéTeam Builder - Frontend

Angular 21 single-page application for [pokemon-team-builder.com](https://pokemon-team-builder.com)

This is a competitive builder with a full reference Pokédex, a team analysis engine, community
sharing and an administration panel.

- **Live app:** https://pokemon-team-builder.com
- **Backend repository:** https://github.com/ManusolJ/pokemon-backend (API design, data
  model and deployment are documented there)

Angular 21 (standalone + Signals) · TypeScript · Tailwind CSS 4 · PrimeNG 21 ·
Deployed on Cloudflare Workers.

---

## Screenshots

| Team builder                                               | Analysis                                             |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| ![Team builder](docs/screenshots/builder.png)              | ![Analysis](docs/screenshots/analysis.png)           |
| Pokedex                                                    | Type Table                                           |
| ![Pokedex](docs/screenshots/pokedex.png)                   | ![Type Table](docs/screenshots/types.png)            |
| Team Builder (Mobile)                                      | Pokedex (Mobile)                                     |
| <center> ![Team Builder M](docs/screenshots/builder-m.png) | <center>![Pokedex M](docs/screenshots/pokedex-m.png) |

---

## Features

- **Team builder** - assemble up to six Pokémon with ability, nature, held item, Tera
  type, four moves and a full EV spread, with derived stats recalculated live.
- **Analysis view** - offensive and defensive type coverage across the whole team, role
  classification per member and aggregated team stats.
- **Pokédex** - 1,025 species, 919 moves, 311 abilities, 305 items and 25 natures, all
  paginated and filterable, plus an interactive type-effectiveness matrix.
- **Teams** - save private or public teams, browse the community catalogue, like other
  players' teams.
- **Accounts** - registration, login, password recovery and silent session renewal.
- **Admin panel** - user management, dataset synchronisation and log inspection, behind
  a role guard.
- **Responsive and accessible** - fluid grid/flex layout across Tailwind's breakpoints,
  AA minimum contrast, visible focus on every interactive control and alt text
  throughout.

---

## Architecture

```
└── 📁pokemon-frontend
    └── 📁docs
        └── 📁screenshots
            ├── analysis.png
            ├── builder-m.png
            ├── builder.png
            ├── pokedex-m.png
            ├── pokedex.png
            ├── types.png
    └── 📁public
        ├── favicon.ico
    └── 📁src
        └── 📁app
            └── 📁core
                └── 📁guards
                    ├── admin.guard.ts
                    ├── auth.guard.ts
                └── 📁interceptors
                    ├── error.interceptor.ts
                    ├── jwt.interceptor.ts
                └── 📁services
                    ├── ability.service.ts
                    ├── admin.service.ts
                    ├── auth.service.ts
                    ├── base-api.service.ts
                    ├── contact.service.ts
                    ├── item.service.ts
                    ├── move.service.ts
                    ├── nature.service.ts
                    ├── pokemon.service.ts
                    ├── species.service.ts
                    ├── team-builder-state.service.ts
                    ├── team-hydration.service.ts
                    ├── team-like.service.ts
                    ├── team.service.ts
                    ├── token.service.ts
                    ├── type-effectiveness.service.ts
                    ├── type.service.ts
                    ├── user.service.ts
            └── 📁features
                └── 📁about
                    ├── about.css
                    ├── about.html
                    ├── about.ts
                └── 📁admin
                    └── 📁components
                        └── 📁admin-logs
                            ├── admin-logs.css
                            ├── admin-logs.html
                            ├── admin-logs.ts
                        └── 📁admin-seed
                            ├── admin-seed.css
                            ├── admin-seed.html
                            ├── admin-seed.ts
                        └── 📁user-edit
                            ├── user-edit.css
                            ├── user-edit.html
                            ├── user-edit.ts
                        └── 📁user-list
                            ├── user-list.css
                            ├── user-list.html
                            ├── user-list.ts
                    └── 📁layout
                        ├── admin-layout.css
                        ├── admin-layout.html
                        ├── admin-layout.ts
                    └── 📁routes
                        ├── admin.routes.ts
                └── 📁auth
                    └── 📁components
                        └── 📁auth-card
                            ├── auth-card.css
                            ├── auth-card.html
                            ├── auth-card.ts
                        └── 📁login
                            ├── login.html
                            ├── login.ts
                        └── 📁registration
                            ├── registration.html
                            ├── registration.ts
                        └── 📁reset-password-confirmation
                            ├── reset-password-confirmation.html
                            ├── reset-password-confirmation.ts
                        └── 📁reset-password-request
                            ├── reset-password-request.html
                            ├── reset-password-request.ts
                    └── 📁layout
                        ├── auth-layout.css
                        ├── auth-layout.html
                        ├── auth-layout.ts
                    └── 📁routes
                        ├── auth.routes.ts
                    └── 📁styles
                        ├── auth-form.css
                └── 📁contact
                    ├── contact.css
                    ├── contact.html
                    ├── contact.ts
                └── 📁pokedex
                    └── 📁components
                        └── 📁detail
                            └── 📁move-detail
                                ├── move-detail.css
                                ├── move-detail.html
                                ├── move-detail.ts
                            └── 📁pokemon-detail
                                ├── pokemon-detail.css
                                ├── pokemon-detail.html
                                ├── pokemon-detail.ts
                        └── 📁list
                            └── 📁ability-list
                                ├── ability-list.css
                                ├── ability-list.html
                                ├── ability-list.ts
                            └── 📁item-list
                                ├── item-list.css
                                ├── item-list.html
                                ├── item-list.ts
                            └── 📁move-list
                                ├── move-list.css
                                ├── move-list.html
                                ├── move-list.ts
                            └── 📁nature-list
                                ├── nature-list.css
                                ├── nature-list.html
                                ├── nature-list.ts
                            └── 📁pokemon-list
                                ├── pokemon-list.css
                                ├── pokemon-list.html
                                ├── pokemon-list.ts
                        └── 📁type-chart
                            ├── type-chart.css
                            ├── type-chart.html
                            ├── type-chart.ts
                    └── 📁layout
                        ├── pokedex-layout.css
                        ├── pokedex-layout.html
                        ├── pokedex-layout.ts
                    └── 📁routes
                        ├── pokedex.routes.ts
                └── 📁profile
                    ├── profile.css
                    ├── profile.html
                    ├── profile.ts
                └── 📁team-builder
                    └── 📁components
                        └── 📁analysis-tab
                            ├── analysis-tab.css
                            ├── analysis-tab.html
                            ├── analysis-tab.ts
                        └── 📁builder-tab
                            ├── builder-tab.css
                            ├── builder-tab.html
                            ├── builder-tab.ts
                        └── 📁defensive-coverage
                            ├── defensive-coverage.css
                            ├── defensive-coverage.html
                            ├── defensive-coverage.ts
                        └── 📁offensive-coverage
                            ├── offensive-coverage.css
                            ├── offensive-coverage.html
                            ├── offensive-coverage.ts
                        └── 📁role-spread
                            ├── role-spread.css
                            ├── role-spread.html
                            ├── role-spread.ts
                        └── 📁selected-pokemon
                            ├── selected-pokemon.css
                            ├── selected-pokemon.html
                            ├── selected-pokemon.ts
                        └── 📁stat-spread
                            ├── stat-spread.css
                            ├── stat-spread.html
                            ├── stat-spread.ts
                        └── 📁team-grid
                            ├── team-grid.css
                            ├── team-grid.html
                            ├── team-grid.ts
                        └── 📁team-stats
                            ├── team-stats.css
                            ├── team-stats.html
                            ├── team-stats.ts
                    └── 📁layout
                        ├── team-builder-layout.css
                        ├── team-builder-layout.html
                        ├── team-builder-layout.ts
                    └── 📁modals
                        └── 📁ability-picker
                            ├── ability-picker.css
                            ├── ability-picker.html
                            ├── ability-picker.ts
                        └── 📁item-picker
                            ├── item-picker.css
                            ├── item-picker.html
                            ├── item-picker.ts
                        └── 📁move-picker
                            ├── move-picker.css
                            ├── move-picker.html
                            ├── move-picker.ts
                        └── 📁nature-picker
                            ├── nature-picker.css
                            ├── nature-picker.html
                            ├── nature-picker.ts
                        └── 📁pokemon-picker
                            ├── pokemon-picker.css
                            ├── pokemon-picker.html
                            ├── pokemon-picker.ts
                    └── 📁routes
                        ├── team-builder.routes.ts
                └── 📁teams
                    └── 📁components
                        └── 📁detail
                            └── 📁private-team-detail
                                ├── private-team-detail.css
                                ├── private-team-detail.html
                                ├── private-team-detail.ts
                            └── 📁public-team-detail
                                ├── public-team-detail.css
                                ├── public-team-detail.html
                                ├── public-team-detail.ts
                        └── 📁like-button
                            ├── like-button.css
                            ├── like-button.html
                            ├── like-button.ts
                        └── 📁lists
                            └── 📁private-team-list
                                ├── private-team-list.css
                                ├── private-team-list.html
                                ├── private-team-list.ts
                            └── 📁public-team-list
                                ├── public-team-list.css
                                ├── public-team-list.html
                                ├── public-team-list.ts
                        └── 📁private-team-card
                            ├── private-team-card.css
                            ├── private-team-card.html
                            ├── private-team-card.ts
                        └── 📁sprite-row
                            ├── team-sprite-row.css
                            ├── team-sprite-row.html
                            ├── team-sprite-row.ts
                        └── 📁team-card
                            ├── team-card.css
                            ├── team-card.html
                            ├── team-card.ts
                        └── 📁team-pokemon-card
                            ├── team-pokemon-card.css
                            ├── team-pokemon-card.html
                            ├── team-pokemon-card.ts
                        └── 📁visibility-badge
                            ├── visibility-badge.css
                            ├── visibility-badge.html
                            ├── visibility-badge.ts
                    └── 📁layout
                        ├── team-layout.css
                        ├── team-layout.html
                        ├── team-layout.ts
                    └── 📁routes
                        ├── teams.routes.ts
            └── 📁shared
                └── 📁components
                    └── 📁filter-sidebar
                        ├── filter-sidebar.css
                        ├── filter-sidebar.html
                        ├── filter-sidebar.ts
                    └── 📁footer
                        ├── footer.css
                        ├── footer.html
                        ├── footer.ts
                    └── 📁list-shell
                        ├── list-shell.css
                        ├── list-shell.html
                        ├── list-shell.ts
                    └── 📁modal
                        ├── modal.css
                        ├── modal.html
                        ├── modal.ts
                    └── 📁navbar
                        ├── navbar.css
                        ├── navbar.html
                        ├── navbar.ts
                    └── 📁pokemon-card
                        ├── pokemon-card.css
                        ├── pokemon-card.html
                        ├── pokemon-card.ts
                    └── 📁searchable-select
                        ├── searchable-select.css
                        ├── searchable-select.html
                        ├── searchable-select.ts
                    └── 📁tab-nav
                        ├── tab-nav.css
                        ├── tab-nav.html
                        ├── tab-nav.ts
                    └── 📁type-badge
                        ├── type-badge.css
                        ├── type-badge.html
                        ├── type-badge.ts
                └── 📁constants
                    ├── api.constants.ts
                    ├── auth.constants.ts
                    ├── effectiveness.constants.ts
                    ├── role.constants.ts
                    ├── stat.constants.ts
                    ├── teams.constants.ts
                    ├── type-colors.constants.ts
                └── 📁enums
                    ├── pokemon-types.enum.ts
                └── 📁interfaces
                    └── 📁admin
                        ├── confirm-copy.interface.ts
                        ├── confirm-request.interface.ts
                    └── 📁api
                        ├── page.interface.ts
                        ├── pageable.interface.ts
                    └── 📁auth
                        ├── jwt-payload.interface.ts
                        ├── login-request.interface.ts
                        ├── password-reset-confirmation.interface.ts
                        ├── password-reset-request.interface.ts
                        ├── refresh-token-request.interface.ts
                        ├── register-request.interface.ts
                        ├── token-response.interface.ts
                    └── 📁misc
                        ├── contact-request.interface.ts
                        ├── error-response.interface.ts
                    └── 📁pokemon
                        └── 📁ability
                            ├── ability-embed.interface.ts
                            ├── ability-filter.interface.ts
                            ├── ability-read.interface.ts
                            ├── ability-summary.interface.ts
                        └── 📁admin
                            ├── audit-log-filter.interface.ts
                            ├── audit-log-read.interface.ts
                            ├── seed-log-filter.interface.ts
                            ├── seed-log-read.interface.ts
                        └── 📁contact
                            ├── contact-request.interface.ts
                        └── 📁item
                            ├── item-filter.interface.ts
                            ├── item-read.interface.ts
                            ├── item-summary.interface.ts
                        └── 📁move
                            ├── move-embed.interface.ts
                            ├── move-filter.interface.ts
                            ├── move-read.interface.ts
                            ├── move-summary.interface.ts
                        └── 📁nature
                            ├── nature-filter.interface.ts
                            ├── nature-read.interface.ts
                        └── 📁pokemon
                            ├── pokemon-filter.interface.ts
                            ├── pokemon-read.interface.ts
                            ├── pokemon-summary.interface.ts
                            ├── species-read.interface.ts
                            ├── species-summary.interface.ts
                        └── 📁team
                            ├── team-create.interface.ts
                            ├── team-filter.interface.ts
                            ├── team-patch.interface.ts
                            ├── team-pokemon-create.interface.ts
                            ├── team-pokemon-move.interface.ts
                            ├── team-pokemon-read.interface.ts
                            ├── team-read.interface.ts
                            ├── team-summary.interface.ts
                            ├── team-update.interface.ts
                        └── 📁type
                            ├── matrix-data.interface.ts
                            ├── type-effectiveness-filter.interface.ts
                            ├── type-effectiveness-read.interface.ts
                            ├── type-filter.interface.ts
                            ├── type-read.interface.ts
                        └── 📁user
                            ├── admin-user-update.interface.ts
                            ├── password-change.interface.ts
                            ├── user-filter.interface.ts
                            ├── user-read.interface.ts
                            ├── user-summary.interface.ts
                            ├── user-update.interface.ts
                    └── 📁team-builder
                        └── 📁analysis
                            ├── attacker-row.interface.ts
                            ├── bucket-counts.interface.ts
                            ├── defender-entry.interface.ts
                            ├── effectiveness-chart-load.interface.ts
                            ├── effectiveness-chart.interface.ts
                            ├── multiplier-bucket.interface.ts
                            ├── segment-tone.interface.ts
                            ├── type-bucket-entry.interface.ts
                        └── 📁member
                            ├── persisted-state.interface.ts
                            ├── team-draft.interface.ts
                            ├── team-member.interface.ts
                        └── 📁move
                            ├── category-meta.interface.ts
                        └── 📁role
                            ├── classification-context.interface.ts
                            ├── role-group.interface.ts
                            ├── role-info.interface.ts
                            ├── role-key.interface.ts
                            ├── role-rule.interface.ts
                            ├── role-tone.interface.ts
                            ├── stat-shape.interface.ts
                        └── 📁stats
                            ├── stat-key.interface.ts
                            ├── stat-meta.interface.ts
                            ├── stat-spread.interface.ts
                            ├── stat-tone.interface.ts
                            ├── team-stat-row.interface.ts
                    └── 📁teams
                        ├── likeable-team.interface.ts
                        ├── sprite-slot.interface.ts
                    └── 📁ui
                        └── 📁about
                            ├── about-feature.interface.ts
                            ├── developer-link.interface.ts
                            ├── tech-stack-group.interface.ts
                            ├── tech-stack-item.interface.ts
                        └── 📁filter
                            ├── filter-field.interface.ts
                        └── 📁form
                            ├── form-submission-status.interface.ts
                        └── 📁generic
                            ├── nav-item.interface.ts
                            ├── searchable-option.interface.ts
                            ├── send-state.interface.ts
                        └── 📁move-detail
                            ├── category-style.interface.ts
                            ├── move-category-key.interface.ts
                            ├── move-stat-tile.interface.ts
                        └── 📁pokemon-detail
                            ├── base-stat-row.interface.ts
                            ├── gender-rate.interface.ts
                            ├── visible-move.interface.ts
                        └── 📁team
                            ├── private-team-card-action-event.interface.ts
                            ├── private-team-card-action.interface.ts
                            ├── team-like-toggle-event.interface.ts
                            ├── team-move-slot.interface.ts
                            ├── team-sort-option.interface.ts
                            ├── team-sprite-slot.interface.ts
                            ├── visibility-tab.interface.ts
                        └── 📁type-chart
                            ├── defense-profile.interface.ts
                            ├── matrix-cell.interface.ts
                            ├── matrix-row.interface.ts
                            ├── multiplier-meta.interface.ts
                            ├── profile-group.interface.ts
                └── 📁pipes
                    ├── name-normalizer.pipe.ts
                └── 📁utils
                    ├── analysis.util.ts
                    ├── format-date.util.ts
                    ├── get-type-color.util.ts
                    ├── role.util.ts
                    ├── stats.util.ts
                    ├── team.util.ts
                └── 📁validators
                    ├── password.validator.ts
            ├── app.config.ts
            ├── app.css
            ├── app.html
            ├── app.routes.ts
            ├── app.ts
        └── 📁environments
            ├── environment.development.ts
            ├── environment.ts
        ├── index.html
        ├── main.ts
        ├── styles.css
    ├── .editorconfig
    ├── .gitignore
    ├── .postcssrc.json
    ├── .prettierrc
    ├── angular.json
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.spec.json
    └── wrangler.jsonc
```

Every feature is lazy-loaded through the router, so the initial bundle carries only the
shell and the landing route.

State is handled with **Signals**. The application's state is
mostly local to a feature - the team being edited, the current filter set, the
authenticated user - without a global store. Signals gave
fine-grained reactivity with far less indirection to follow when debugging.

---

## Design decisions

### One generic HTTP layer

`BaseApiService` exposes `get`, `post`, `put`, `patch`, `delete` and paginated variants
(`getPaged`, `postPaged`), and every domain service extends it.

Eight domains each hand-rolling pagination parameters, response unwrapping and error
shapes is easy to get wrong. Centralising it means a change to the
pagination contract is a one-file change, and each domain service is left holding only
the endpoints it actually owns.

### Proactive token refresh in the interceptor

`jwtInterceptor` attaches the access token and renews it **before** it expires, rather
than reacting to a 401 and retrying.

The reactive approach works, but it means every session eventually produces a failed
request - and with a queue of parallel requests, a stampede of them. Refreshing ahead of
expiry keeps the failure path for genuine authentication failures only.

`errorInterceptor` normalises everything the API can return into a single shape, so
components never branch on transport-level details.

### The in-progress team survives a login

`TeamBuilderStateService` persists the team currently being edited to `localStorage`.

This exists because of a specific flow: the builder is fully usable while logged out, and
the save button prompts for authentication. Without persistence, signing in to save would
navigate away and destroy the exact thing the user was trying to save. Restoring from
local storage after the auth round trip makes the path work.

### Styling through tokens

The palette lives in `src/styles.css` as `--color-brand-*` custom properties consumed by
Tailwind, and PrimeNG is themed via a **custom preset** built on those same tokens.

The alternative - fighting PrimeNG's default theme with `::ng-deep` and specificity
classes - produces a stylesheet that breaks on every library upgrade. Driving both systems
from one set of variables keeps the two visually consistent and makes a palette change a
single-file edit.

### SPA routing on the edge

The app is served as static assets by a Cloudflare Worker with
`assets.not_found_handling` set to `single-page-application`, so unknown paths return
`index.html` and Angular's router resolves them client-side. Deep links work without a
server. `workers_dev` and `preview_urls` are disabled, so no unintended public URLs exist
alongside the production domain.

---

## Tech stack

| Layer       | Technology                                                      |
| ----------- | --------------------------------------------------------------- |
| Framework   | Angular 21 - standalone components, Signals, lazy-loaded routes |
| Language    | TypeScript                                                      |
| Styling     | Tailwind CSS 4 + PostCSS, custom design tokens                  |
| Components  | PrimeNG 21, PrimeIcons 7                                        |
| Auth helper | jwt-decode 4                                                    |
| Testing     | Vitest 4                                                        |
| Deployment  | Cloudflare Workers via Wrangler 4 + Workers Builds              |

---

## Running it locally

**Requirements:** Node.js

```bash
git clone https://github.com/ManusolJ/pokemon-frontend.git
cd pokemon-frontend

npm install
npm start
```

The app runs at `http://localhost:4200`.

It needs an API to talk to. Either point it at the live API, or run the
[backend](https://github.com/ManusolJ/pokemon-backend) locally with Docker Compose and
target that instead.

### Configuration

Two values are configured per environment:

| Field            | Purpose                            |
| ---------------- | ---------------------------------- |
| `apiUrl`         | Base URL of the REST API           |
| `spritesBaseUrl` | Base URL for Pokémon sprite assets |

These live in the environment source files and are swapped at build time through
Angular's file replacements - they are build-time constants, not runtime environment
variables, because a static bundle on a CDN has no runtime environment to read from.

### Scripts

```bash
npm start          # dev server with HMR
npm run build      # production build → dist/pokemon-team-builder/browser/
```

---

## Deployment

The Cloudflare Workers project is connected to this repository through **Workers Builds**.
Every push to `main` triggers the pipeline automatically: Cloudflare installs
dependencies, runs the production build and publishes the output as the worker's static
assets, following `wrangler.jsonc`.

The custom domain `pokemon-team-builder.com` is bound to the worker, which provides
global CDN distribution and automatic HTTPS certificates with no server to maintain.

---

## Project status and roadmap

Live and in use, but not finished:

- [ ] **Meaningful test coverage.** Vitest is configured; the highest-value targets are
      `BaseApiService`, the interceptors and the team-builder state service.
- [ ] **End-to-end tests** with Playwright.
- [ ] **Team comparator** - pit two public teams against each other and analyse the
      matchup.
- [ ] **Showdown import/export** in the standard team format.
- [ ] **Internationalisation** - the UI is English-only.
- [ ] **Comments on public teams.**

---

## Disclaimer

Pokémon and all related names are trademarks of Nintendo, Game Freak and The Pokémon
Company. This is a non-commercial fan project built for learning purposes and is not
affiliated with or endorsed by them. Game data comes from the community-maintained
[PokéAPI](https://pokeapi.co/).

---

## Author

**Manuel Soler Juan** - Junior full stack developer
[GitHub](https://github.com/ManusolJ) · [LinkedIn](https://linkedin.com/in/manusolerj)
