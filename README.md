# Bank Frontend Angular

Financial products management UI built with Angular 22. Connects to a local Node/Express backend that exposes a RESTful API for CRUD operations on financial products.

---

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | Angular 22 (standalone components) |
| Language | TypeScript 6 |
| Rendering | SSR via `@angular/ssr` + Express |
| State | Angular signals (`signal`, `computed`) |
| Forms | `ReactiveFormsModule` |
| HTTP | `HttpClient` (`provideHttpClient`) |
| Routing | Lazy-loaded standalone components |
| Styles | Custom CSS (no framework) |
| Tests | Vitest via Angular test runner |
| Package manager | Yarn |

---

## Architecture

Clean Architecture layers adapted for Angular, following the MVVM pattern:

```
src/app/
├── core/
│   └── constants/
│       └── api.constants.ts          # API base URL
├── features/
│   └── products/
│       ├── domain/
│       │   ├── product.model.ts      # Pure TypeScript interfaces
│       │   └── product.repository.ts # Abstract class used as DI token
│       ├── data/
│       │   └── product.service.ts    # HttpClient implementation of repository
│       ├── validators/
│       │   └── product-id.validator.ts  # Async ID validator + release date validator
│       └── presentation/
│           ├── pages/
│           │   ├── product-list/     # F1, F2, F3, F5, F6
│           │   └── product-form/     # F4, F5 (shared add/edit form)
│           └── components/
│               └── skeleton-loader/  # Shimmer loading rows
└── shared/
    └── components/
        └── header/                   # Global bank header
```

**ViewModel pattern**: Component classes hold `signal()` for mutable state and `computed()` for derived state. No external state management library.

**Repository pattern**: `IProductRepository` (abstract class) is registered as the DI token in `app.config.ts`. `ProductService` is the concrete implementation. Components inject `IProductRepository` and never reference `ProductService` directly, making the data layer swappable.

---

## Features

| ID | Description |
|----|-------------|
| F1 | List all financial products loaded from the API, with skeleton loader during fetch |
| F2 | Real-time search filtering by product name or description |
| F3 | Result count display and page size selector (5 / 10 / 20 rows) |
| F4 | Add product form with per-field validation (required, length, async ID uniqueness, release date >= today, auto-computed revision date) |
| F5 | Edit product via per-row context menu dropdown; ID field is disabled in edit mode |
| F6 | Delete product via confirmation modal triggered from the context menu |

---

## Backend dependency

The app expects a local Express backend running on port 3002:

```bash
cd ../repo-interview-main
npm install
npm run start:dev
```

The backend requires the `cors` package. If it is missing, install it before starting:

```bash
npm install cors
```

Base URL: `http://localhost:3002/bp`

Endpoints used:

| Method | Path | Purpose |
|--------|------|---------|
| GET | /products | Load all products |
| POST | /products | Create product |
| PUT | /products/:id | Update product |
| DELETE | /products/:id | Delete product |
| GET | /products/verification/:id | Async ID uniqueness check |

---

## Local development

```bash
yarn install
yarn start
# Opens at http://localhost:4200
```

The app redirects `/` to `/products` (product list). Routes:

| Path | Component |
|------|-----------|
| /products | ProductListComponent |
| /products/add | ProductFormComponent (add mode) |
| /products/edit/:id | ProductFormComponent (edit mode) |

---

## Form validation rules

| Field | Rules |
|-------|-------|
| ID | Required, 3–10 characters, must not already exist (async check against API) |
| Name | Required, 5–100 characters |
| Description | Required, 10–200 characters |
| Logo | Required (URL string) |
| Release date | Required, must be today or a future date |
| Revision date | Disabled, auto-computed as exactly one year after release date |

---

## Unit tests

```bash
ng test
# or for a single run with coverage report:
ng test --watch=false
```

Coverage is enabled by default via `@vitest/coverage-v8`. A summary is printed to the terminal after each run.

Test files are co-located with their source files as `*.spec.ts`.

| Spec file | What it covers |
|-----------|----------------|
| `product.service.spec.ts` | All HTTP methods, response mapping |
| `product-id.validator.spec.ts` | Async ID validator (taken/available/empty), release date validator |
| `product-list.component.spec.ts` | Load, filter, paginate, search, delete, error states |
| `product-form.component.spec.ts` | Add mode, edit mode, date auto-fill, validation, reset |
| `app.spec.ts` | Root component renders header and router outlet |

---

## Build

```bash
yarn build
# Output: dist/bank-frontend-angular/
```

SSR server entry: `src/server.ts` (Express). To run the production SSR build:

```bash
node dist/bank-frontend-angular/server/server.mjs
```
