# Extract `core` and `shared/ui` Into Separate Package Repos

This workspace currently uses local TypeScript path aliases:

- `@ecommerce/core` -> `libs/core/src/index.ts`
- `@ecommerce/shared-ui` -> `libs/shared/ui/src/index.ts`

The cleanest way to split these libraries out of the Nx workspace is:

1. Create one repo for `@ecommerce/core`
2. Create one repo for `@ecommerce/shared-ui`
3. Publish them as private npm packages, or install them via local tarballs / Git during migration
4. Replace local path aliases in this app with package dependencies

## Recommended Target Layout

Create three repositories:

1. `ecommerce-app`
   This current app and feature workspace
2. `ecommerce-core`
   Shared auth, guards, interceptors, models, and service logic
3. `ecommerce-shared-ui`
   Reusable shell and page components

Keep feature libraries such as `auth`, `dashboard`, and `rxjs` in this workspace unless they truly need independent versioning and release cycles.

## Current Dependency Shape

Today these imports exist in the app workspace:

- `@ecommerce/core`
- `@ecommerce/core/guards`
- `@ecommerce/core/interceptors`
- `@ecommerce/shared-ui`

That means the extracted packages need to preserve the same public API surface, or the app will need import updates.

## Step 1: Create the `ecommerce-core` Repo

Create a new Angular library repo and move the contents of `libs/core/src` into it.

Suggested package name:

```json
{
  "name": "@ecommerce/core",
  "version": "0.1.0",
  "peerDependencies": {
    "@angular/common": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/router": "^21.0.0",
    "rxjs": "^7.8.0"
  }
}
```

Suggested public API:

```ts
export * from './lib/core.module';
export * from './lib/models/auth.model';
export * from './lib/services/auth-api.service';
export * from './lib/services/auth.facade';
export * from './lib/services/auth.service';
export * from './lib/services/token.service';
export * from './lib/guards/auth.guard';
export * from './lib/interceptors/jwt.interceptor';
```

To preserve your current imports, add secondary entry points:

- `@ecommerce/core/guards`
- `@ecommerce/core/interceptors`

Example:

`projects/core/guards/src/public-api.ts`
```ts
export * from '../../src/lib/guards/auth.guard';
```

`projects/core/interceptors/src/public-api.ts`
```ts
export * from '../../src/lib/interceptors/jwt.interceptor';
```

## Step 2: Create the `ecommerce-shared-ui` Repo

Move `libs/shared/ui/src` into its own Angular library repo.

Suggested package name:

```json
{
  "name": "@ecommerce/shared-ui",
  "version": "0.1.0",
  "peerDependencies": {
    "@angular/common": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/router": "^21.0.0",
    "@angular/material": "^21.0.0",
    "rxjs": "^7.8.0",
    "@ecommerce/core": "^0.1.0"
  }
}
```

Suggested public API:

```ts
export * from './lib/shared.module';
export * from './lib/app-shell/app-shell.component';
export * from './lib/page-shell/page-shell.component';
```

Note:

`AppShellComponent` currently depends on `AuthFacade` from `@ecommerce/core`, so `@ecommerce/shared-ui` should depend on `@ecommerce/core`.

## Step 3: Build and Publish the Packages

Prefer private npm packages if your team has a registry available.

Examples:

- GitHub Packages
- GitLab Package Registry
- Verdaccio
- Azure Artifacts
- private npm org

If you want a simple migration first, publish tarballs:

```bash
npm pack
```

Then install them in the app repo:

```bash
npm install ../ecommerce-core/ecommerce-core-0.1.0.tgz
npm install ../ecommerce-shared-ui/ecommerce-shared-ui-0.1.0.tgz
```

That is usually easier than wiring a registry on day one.

## Step 4: Update This App Workspace

In this repo:

1. Remove local path aliases for extracted libs from `tsconfig.json`
2. Add real dependencies in `package.json`
3. Keep feature libraries local
4. Verify Angular builds against installed packages instead of `libs/`

Current aliases to remove:

```json
"@ecommerce/core": ["libs/core/src/index.ts"],
"@ecommerce/core/*": ["libs/core/src/*"],
"@ecommerce/core/interceptors": ["libs/core/src/interceptors.ts"],
"@ecommerce/core/guards": ["libs/core/src/guards.ts"],
"@ecommerce/shared-ui": ["libs/shared/ui/src/index.ts"]
```

After publishing, install packages instead:

```bash
npm install @ecommerce/core @ecommerce/shared-ui
```

## Step 5: Remove the Local Libraries

Once the app builds successfully against the package versions:

1. Delete `libs/core`
2. Delete `libs/shared/ui`
3. Remove their Nx `project.json` entries from the repo by deleting the library folders
4. Re-run the app build and tests

Do not delete them until the package-based imports are verified.

## Suggested Migration Order

Use this order to reduce risk:

1. Extract `@ecommerce/core`
2. Publish and install `@ecommerce/core` back into this app
3. Verify login, auth guards, and interceptor wiring
4. Extract `@ecommerce/shared-ui`
5. Publish and install `@ecommerce/shared-ui`
6. Verify shell navigation and page shell rendering
7. Remove local copies

This order matters because `shared-ui` currently depends on `core`.

## What Changes in This Repo

Files that are directly affected here:

- `tsconfig.json`
- `package.json`
- `package-lock.json`
- imports that currently resolve through workspace aliases

Current import consumers include:

- `apps/storefront/src/app/app.config.ts`
- `apps/storefront/src/app/app.routes.ts`
- `libs/features/auth/src/lib/login/login.component.ts`
- `libs/features/dashboard/src/lib/dashboard/dashboard.component.ts`
- `libs/features/dashboard/src/lib/admin/admin.component.ts`
- `libs/features/rxjs/src/lib/rxjs/rxjs.component.ts`

## Practical Recommendation

Do not try to extract both libraries in one move.

Start with `@ecommerce/core`, because it is the lower-level dependency. After that works as an external package, move `@ecommerce/shared-ui`.

If you want to preserve the current import style with minimal code churn, make sure the new package repos expose the same entry points as the local libs do today.
