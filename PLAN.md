# TypeScript Type-Check Performance Benchmarks for Runtime Validation Libraries

Benchmark repository plan to measure the time the TypeScript typechecker takes to check types inferred from various validation schemas (not runtime validation speed). Benchmarks will be orchestrated and reported using `@arktype/attest`.

## Goal

- Compare TypeScript type-checking performance across popular runtime validation libraries by measuring the time to type-check projects that:
  - Define schemas
  - Infer static types from those schemas
  - Exercise those types enough to force the typechecker to fully evaluate them
- Produce repeatable results across operating systems and TypeScript versions with clear methodology and automation.

## Non-goals

- Do not measure runtime validation speed (covered by moltar/typescript-runtime-type-benchmarks).
- Do not measure bundle size or runtime memory usage (optional future work).

## Key idea and constraints

- We measure “type-check time” primarily attributable to inferred types constructed from each library’s schema API (e.g., `z.infer<typeof Schema>`, `TypeOf<typeof schema>`, `Infer<typeof schema>`, etc.).
- To isolate the effect of schema-inferred types:
  - Keep benchmark files minimal and avoid unrelated generics or complex module graphs.
  - Use `skipLibCheck: true` to avoid counting diagnostics inside `node_modules`.
  - Avoid emitting JS and caches when timing (noEmit, no incremental) to make timing stable and library-comparable.
- Results can vary by TypeScript version; we’ll run a matrix across selected TS versions.

## Tooling

- Benchmark runner: `@arktype/attest` (authoritative for orchestrating and reporting; used to drive type-level benchmarks and aggregate results)
- TypeScript: matrix of stable versions (e.g., latest, latest-1, LTS used in many repos)
- Node.js: LTS (document the exact version), optionally a matrix for sensitivity
- OS: CI will run on Ubuntu; local runs may vary. Document OS and CPU for each run.

## Libraries to benchmark

Focus on popular, actively maintained libraries that infer types from schemas, plus a few notable alternatives. Each library should be pinned to a known version.

- Zod (`zod`)
- Valibot (`valibot`)
- ArkType (`arktype`)
- io-ts (`io-ts`) with `fp-ts`
- runtypes (`runtypes`)
- Superstruct (`superstruct`)
- Yup (`yup`) — known weaker inference in some cases; still widely used
- TypeBox + Ajv (`@sinclair/typebox`, `ajv`) — `Static<typeof T>` inference
- Typia (`typia`) — codegen-first; include a type-check scenario around generated or wrapper types
- Effect Schema (`@effect/schema`) — growing adoption
- spectypes (`spectypes`) — performance-focused schema library

Notes:
- Some libraries (e.g., Typia) are codegen-oriented; we will treat their “typecheck” scenario as checking the static types exposed/consumed by their API (documented per case).
- If a library can’t infer types at all from its schema API, we’ll note the limitation and skip or provide a comparable static-type scenario.

## Use cases (bench scenarios)

Define a set of escalating scenarios to exercise typical shapes and stress the type system. For each scenario, ensure a uniform data model across libraries.

1. Simple primitives
   - `string`, `number`, `boolean`
   - Optional/nullable variants
2. Simple object
   - Flat object of 5–10 fields with optional/nullable properties
   - Literal enums and unions of literals
3. Arrays and tuples
   - Array of objects
   - Fixed-length tuple with diverse members
4. Unions and intersections
   - Discriminated unions (2–5 variants)
   - Intersections of objects with overlapping keys
5. Nested/Deep object
   - 4–6 levels deep with arrays and unions inside
   - 50–150 total properties (scaled variants: S/M/L)
6. Refinements/brands
   - String pattern, number ranges, branded types
7. Recursive structures
   - Tree/AST-like recursive node
8. Real-world schemas
   - User + Address + Orders (3–6 related types)
   - Product catalog (Category -> Product -> Variant)
   - A trimmed JSON API payload with pagination and links

Scaling variants
- For scenarios 2, 5, and 8, provide sizes S/M/L to observe growth behavior.

## Measurement methodology

- Each benchmark case is a small, isolated TypeScript project to reduce noise:
  - Its own `tsconfig.json` (noEmit, strict, skipLibCheck, incremental=false)
  - A single entry file that:
    - Defines the schema(s)
    - Infers the static type(s)
    - Declares a few synthetic usages to force full evaluation (e.g., mapped types, conditional types, DeepReadonly/DeepPartial layers)
  - Minimal index-level imports to avoid unrelated declarations
- `@arktype/attest` orchestration:
  - Use Attest’s type-checking bench mode to measure TypeScript compilation/time-to-diagnostics for each case.
  - Warm-up runs before measurement; N repetitions to report mean, median, p95.
  - Optionally record process memory (RSS) for context.
- TypeScript config for timing stability:
  - `"compilerOptions": { "noEmit": true, "skipLibCheck": true, "strict": true, "composite": false, "incremental": false }`
  - If needed, force module resolution settings consistent across cases.
- Avoid unrelated ambient types to minimize pollution; lock library versions using a single top-level lockfile and per-case imports referencing the monorepo’s `node_modules`.

## Repo structure

Monorepo with per-library/per-scenario cases under a consistent layout that Attest can discover.

```
/ (repo root)
  package.json
  tsconfig.base.json
  attest.config.(ts|mjs)
  /cases
    /<library>
      /simple-primitive
        tsconfig.json
        case.attest.ts
      /simple-object-S
      /simple-object-M
      /simple-object-L
      /unions
      /nested-S
      /nested-M
      /nested-L
      /refinements
      /recursive
      /realworld-user
      /realworld-catalog-S
      /realworld-catalog-M
      /realworld-catalog-L
  /scripts
    generate-cases.ts (optional helpers)
  /docs
    methodology.md
    results.md (auto-updated by CI)
  /ci
    workflow.yml
```

- `case.attest.ts` encapsulates the schema definition, type inference, and an Attest bench that triggers and times type checking.
- `attest.config` collects and runs all cases, emits pretty and machine-readable output (JSON) for result tables.

## Example case template (conceptual)

> Note: The exact Attest API for “types-only” benchmarking may evolve. The plan assumes Attest exposes a typecheck timing primitive (e.g., `bench.types` or configuration to time `tsc` on a given file). If not available, we’ll wrap `tsc --noEmit` with Attest benches as a fallback.

```ts
// cases/zod/simple-object-S/case.attest.ts
import { z } from "zod";
import { bench } from "@arktype/attest";

// schema
const User = z.object({
  id: z.string(),
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
  roles: z.array(z.enum(["user", "admin"]))
});

// inferred type
type UserT = z.infer<typeof User>;

// synthetic usage to force evaluation
// (e.g., apply mapped types so the checker has to walk the whole structure)
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// ensure the type is instantiated
type UserReadonly = DeepReadonly<UserT>;

bench("zod/simple-object-S typecheck", async ({ types }) => {
  // concept: trigger typechecking of this file and capture time
  // Attest should measure TS program creation + diagnostics for this module.
  await types.check();
});
```

Fallback (if Attest doesn’t expose `types.check()`):
- Use an Attest bench that shells out to `tsc --noEmit -p .` for the case directory and records the elapsed time.
- Repeat N times, aggregate stats, parse `tsc` output to confirm success/fail.

## Attest configuration

- Discover all `case.attest.ts` files under `/cases/**/`.
- Global options:
  - Repetitions per case (e.g., warmup: 1–2, samples: 10)
  - Output formats: console table + JSON file in `docs/results.json`
  - Optional memory snapshots

## TS and environment matrix

- TypeScript: [latest, latest-1, an LTS baseline] (e.g., `~5.6`, `~5.5`, `~5.4`)
- Node: default LTS (document), optional Node-previous
- OS: CI on Ubuntu-latest; optionally macOS-latest for comparison

## Reporting

- Print a ranked table by median time with p95 and standard deviation.
- Group by scenario (rows per library, columns per size S/M/L).
- Emit JSON with raw samples for further analysis.
- Optionally add a small website/docs page to visualize results with charts.

## Methodology safeguards

- Pin all dependency versions.
- `skipLibCheck: true` to minimize dependency noise.
- No incremental builds; clear cache between samples.
- Run warm-ups to stabilize JIT/FS caches.
- Ensure consistent CPU scaling (CI runners) and note hardware for local runs.

## Implementation steps

1. Scaffold repo
   - Add `package.json`, `tsconfig.base.json`, `attest.config`.
   - Install `@arktype/attest`, `typescript`, libraries to benchmark.
2. Create case generator helpers (optional) to avoid duplicated boilerplate.
3. Implement base scenarios for 2–3 libraries to validate the harness.
4. Add remaining libraries and all scenarios, including S/M/L variants.
5. Add CI workflow
   - Matrix across TS versions, Node (optional), OS (Ubuntu; optional macOS)
   - Upload JSON artifacts; push a summarized table into `docs/results.md`
6. Validate stability
   - Compare variance across runs; adjust repetitions accordingly.
7. Document methodology and caveats in `docs/methodology.md`.

## Caveats and notes

- Type-level complexity often comes from conditional types and deep inference chains; small schema differences can dramatically change type-check time.
- Some libraries trade inference quality for speed; document any major typing limitations encountered.
- Ensure apples-to-apples schemas; avoid features not uniformly supported.

## Next steps

- Initialize dependencies and Attest config.
- Implement 3–4 scenarios for Zod, Valibot, ArkType to validate setup.
- Add matrix and CI; produce a first baseline report.
- Iterate on scenario sizes and add more libraries.
