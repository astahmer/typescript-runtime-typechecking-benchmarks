# TypeScript Type-Check Performance Benchmark Results

Benchmark results comparing TypeScript type-checking performance across runtime validation libraries.

## Methodology

- **What we measure**: Time for TypeScript to type-check inferred types from validation schemas (not runtime validation speed)
- **TypeScript version**: 5.9.3
- **Node version**: LTS
- **Config**: `noEmit: true`, `skipLibCheck: true`, `strict: true`, `incremental: false`
- Each test includes a `DeepReadonly` mapped type to force full type evaluation

## Libraries Benchmarked

- **ArkType** - Runtime schema validation with type inference
- **Effect** - Runtime schema validation with type inference
- **Valibot** - Runtime schema validation with type inference
- **Zod** - Runtime schema validation with type inference

---

## Results Summary

### 1. Simple Object (S)

A flat object with 4 fields: string, email, number with constraints, and array of enum literals.


| Library     | Mean Time   | Type Instantiations   |
| ---------   | ----------- | --------------------- |
| **Valibot** | **4.62 us** | 9,082                 |
| ArkType     | 33.19 us    | 10,469                |
| Effect      | 38.37 us    | 5,464                 |
| Zod         | 84.19 us    | 1,033                 |

**Winner**: Valibot (18x faster than Zod) ⚡

---

### 2. Arrays & Tuples

Array of objects with validation + fixed-length tuple `[string, number]`.


| Library     | Mean Time   | Type Instantiations   |
| ---------   | ----------- | --------------------- |
| **Valibot** | **3.51 us** | 7,731                 |
| Effect      | 37.65 us    | 6,286                 |
| Zod         | 66.71 us    | 682                   |
| ArkType     | 88.05 us    | 10,136                |

**Winner**: Valibot (25x faster than ArkType) ⚡

---

### 3. Nested Medium Complexity

Complex nested structure with:
- Address, LineItem, Payment (discriminated union), Order schemas
- User with profile, contacts, addresses array, orders array
- ~50 total properties across 4-5 nesting levels


| Library     | Mean Time    | Type Instantiations   |
| ---------   | -----------  | --------------------- |
| **Valibot** | **15.79 us** | 14,211                |
| Effect      | 150.45 us    | 11,569                |
| Zod         | 401.22 us    | 1,403                 |
| ArkType     | 437.26 us    | 24,084                |

**Winner**: Valibot (28x faster than ArkType) ⚡

---

### 4. Recursive Structure

Tree/AST-like recursive node: `{ value: string; children?: Node[] }`.


| Library     | Mean Time          | Type Instantiations   |
| ---------   | -----------        | --------------------- |
| **Valibot** | **1.3 us**         | 8,985                 |
| Zod         | 5.14 us            | 27,032                |
| Effect      | 18.67 us           | 4,474                 |
| ArkType     | 1,280 μs (1.28 ms) | 7,913                 |

**Winner**: Valibot (985x faster than ArkType) ⚡

---

### 5. Unions & Intersections

Discriminated union with 3 variants (A, B, C), each containing:
- Shared metadata (date, tags array, flags object)
- Variant-specific fields (arrays, tuples, unions)


| Library     | Mean Time   | Type Instantiations   |
| ---------   | ----------- | --------------------- |
| **Valibot** | **10.6 us** | 11,706                |
| Effect      | 109.06 us   | 12,330                |
| Zod         | 212.81 us   | 2,539                 |
| ArkType     | 335.19 us   | 26,456                |

**Winner**: Valibot (32x faster than ArkType) ⚡

---

### 6. Stress Test

Large schema with:
- 30 number fields (with min validation)
- 30 string fields
- 20 union fields (string | number | boolean | tuple array)
- 8 nested objects with arrays and enums
- ~100+ total properties


| Library     | Mean Time          | Type Instantiations   |
| ---------   | -----------        | --------------------- |
| **Valibot** | **123.69 us**      | 24,898                |
| Effect      | 467.61 us          | 24,805                |
| ArkType     | 1,120 μs (1.12 ms) | 45,887                |
| Zod         | 2,180 μs (2.18 ms) | 3,643                 |

**Winner**: Valibot (18x faster than Zod) ⚡

---

### 7. Mega Stress Test 🔥

Extreme type complexity test with:
- Recursive tree nodes with bidirectional parent/child references
- Complex discriminated unions (3 event types with nested structures)
- Deep nesting (5+ levels)
- 3D matrix arrays
- Polymorphic records with multiple variants
- Complex tuple combinations
- Intersection-like patterns
- Conditional-like type structures


| Library     | Mean Time            | Type Instantiations   |
| ---------   | -----------          | --------------------- |
| **Valibot** | **67.06 us**         | 31,252                |
| Effect      | 826.01 us            | 44,836                |
| Zod         | 1,690 μs (1.69 ms)   | 32,455                |
| ArkType     | 15,390 μs (15.39 ms) | 94,176                |

**Winner**: Valibot (229x faster than ArkType) ⚡

---

### 8. Petstore API Schema

REST API schema definition with:
- 15+ endpoint definitions with request/response types
- Pet, Order, Customer, Review, Inventory schemas
- Pagination, validation, error handling
- Complex nested structures and unions
- ~30+ schema definitions


| Library     | Mean Time          | Type Instantiations   |
| ---------   | -----------        | --------------------- |
| **Valibot** | **204.56 us**      | 76,158                |
| Effect      | 1,670 μs (1.67 ms) | 61,999                |
| Zod         | 3,790 μs (3.79 ms) | 6,711                 |

**Winner**: Valibot (19x faster than Zod) ⚡

---

### 9. tRPC Petstore Router

Full-featured tRPC router with:
- 25+ procedures (queries and mutations)
- Pet, Order, Customer, Review, Inventory, Analytics routers
- Complex input/output validation schemas
- Mock data factories
- Discriminated unions for payments, order status
- ~40+ schema definitions with deep nesting


| Library     | Mean Time          | Type Instantiations   |
| ---------   | -----------        | --------------------- |
| **Valibot** | **662.53 us**      | 112,382               |
| Effect      | 3,690 μs (3.69 ms) | 95,452                |
| Zod         | 5,570 μs (5.57 ms) | 38,241                |

**Winner**: Valibot (8x faster than Zod) ⚡

---

## Overall Performance Summary

### Speed Rankings (by average relative performance)

1. 🥇 **Valibot** (baseline)
2. 🥈 **Effect** (6.4x slower)
3. 🥉 **Zod** (12.8x slower)
4.  **ArkType** (22.0x slower)

---

## Caveats

- Results measured on specific hardware/OS; your mileage may vary
- Type-check time is only one factor in library selection
- Runtime validation performance not measured here
- All schemas designed to be equivalent across libraries
- Some libraries may have features not fully exercised in these benchmarks

---

**Generated**: October 2025
**Benchmark Tool**: @ark/attest v0.51.0
**TypeScript**: 5.9.3
